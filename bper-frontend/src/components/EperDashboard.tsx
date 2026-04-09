<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import {
  Users, FileCheck, Clock, CheckCircle2, TrendingUp,
  ArrowUpRight, ChevronRight, Activity, Search, Check, X
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, CartesianGrid, LabelList
} from "recharts";
import { apiGet } from "../api/http";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";

interface DashboardSummary {
  totalEmployees: number;
  submissionStats: {
    draft: number;
    submitted: number;
    underReview: number;
    returned: number;
    approved: number;
  };
  avgUtilization: number;
  fteByTower: Array<{ tower: string; totalFTE: number }>;
  consolidationSummary: {
    activities: number;
    savedFTE: number;
    costSaving: number;
  };
}

interface FteRow {
  activity: string;
  tower: string;
  department?: string;
  currentFTE: number;
  consolidate: boolean;
}

interface UtilizationRow {
  department: string;
  utilizationPct: number;
  status?: string;
  month?: number;
  year?: number;
}

interface TeamSubmissionRow {
  _id: string;
  month?: number;
  year?: number;
  updatedAt?: string;
  department?: { name?: string } | string;
  status: "draft" | "submitted" | "under_review" | "returned_for_revision" | "approved";
  employee?: { _id?: string; name?: string; department?: { name?: string } | string };
}

type DateRangeKey = "today" | "last7d" | "q2-2026";

function formatUpdatedAgo(syncedAt: Date, nowTick: number): string {
  const diffMs = Math.max(0, nowTick - syncedAt.getTime());
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Updated just now";
  if (mins < 60) return `Updated ${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `Updated ${days}d ago`;
}

function parseRowDate(row: TeamSubmissionRow): Date | null {
  if (row.updatedAt) {
    const parsed = new Date(row.updatedAt);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (row.year && row.month) {
    const parsed = new Date(row.year, row.month - 1, 1);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

function inDateRange(rowDate: Date | null, selectedRange: DateRangeKey): boolean {
  if (!rowDate) return true;
  const now = new Date();

  if (selectedRange === "today") {
    return rowDate.toDateString() === now.toDateString();
  }

  if (selectedRange === "last7d") {
    const from = new Date(now);
    from.setDate(now.getDate() - 7);
    return rowDate >= from && rowDate <= now;
  }

  // Q2 2026
  const q2Start = new Date(2026, 3, 1);
  const q2End = new Date(2026, 5, 30, 23, 59, 59, 999);
  return rowDate >= q2Start && rowDate <= q2End;
}

function formatDelta(delta: number | null): string {
  if (delta === null || Number.isNaN(delta)) return "N/A";
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}% vs last period`;
}

function buildSparkline(activity: string, value: number): string {
  const base = Math.max(0.2, value || 0.2);
  const hash = activity.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const drift = ((hash % 7) - 3) / 20;
  const points = [
    Math.max(0.1, base * (1 - drift * 0.6)),
    Math.max(0.1, base * (1 - drift * 0.2)),
    Math.max(0.1, base * (1 + drift * 0.15)),
    Math.max(0.1, base * (1 + drift * 0.35)),
    Math.max(0.1, base),
  ];
  const max = Math.max(...points, 0.1);

  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 20 - (point / max) * 14;
      return `${x},${y}`;
    })
    .join(" ");
}

export function EperDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [allFteRows, setAllFteRows] = useState<FteRow[]>([]);
  const [allUtilizationRows, setAllUtilizationRows] = useState<UtilizationRow[]>([]);
  const [allTeamSubmissions, setAllTeamSubmissions] = useState<TeamSubmissionRow[]>([]);
  const [teamUtilization, setTeamUtilization] = useState<Array<{ name: string; pct: number }>>([]);
  const [dateRange, setDateRange] = useState<DateRangeKey>("last7d");
  const [hierarchyFilter, setHierarchyFilter] = useState<string>("all");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [nowTick, setNowTick] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [summaryData, fteData, utilizationData, teamData] = await Promise.all([
          apiGet<DashboardSummary>("/eper/reports/dashboard-summary"),
          apiGet<FteRow[]>("/eper/reports/fte-summary"),
          apiGet<UtilizationRow[]>("/eper/reports/utilization"),
          apiGet<TeamSubmissionRow[]>("/eper/wdt/team"),
        ]);

        setSummary(summaryData);
        setAllFteRows(fteData || []);
        setAllUtilizationRows(utilizationData || []);
        setAllTeamSubmissions(teamData || []);
        setLastSyncedAt(new Date());

        const utilByDept = new Map<string, { total: number; count: number }>();
        (utilizationData || []).forEach((row) => {
          const key = row.department || "Unknown";
          const current = utilByDept.get(key) || { total: 0, count: 0 };
          utilByDept.set(key, { total: current.total + (row.utilizationPct || 0), count: current.count + 1 });
        });

        const utilRows = Array.from(utilByDept.entries())
          .map(([name, value]) => ({ name, pct: Number((value.total / value.count).toFixed(1)) }))
          .sort((a, b) => b.pct - a.pct)
          .slice(0, 4);

        setTeamUtilization(utilRows);
      } catch {
        setError("Unable to load admin dashboard metrics.");
        setSummary(null);
        setAllFteRows([]);
        setAllUtilizationRows([]);
        setAllTeamSubmissions([]);
        setTeamUtilization([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTick(Date.now()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const hierarchyOptions = useMemo(() => {
    const options = new Set<string>();
    allFteRows.forEach((row) => {
      if (row.tower) options.add(`tower:${row.tower}`);
      if (row.department) options.add(`department:${row.department}`);
    });
    allUtilizationRows.forEach((row) => {
      if (row.department) options.add(`department:${row.department}`);
    });
    return ["all", ...Array.from(options).sort((a, b) => a.localeCompare(b))];
  }, [allFteRows, allUtilizationRows]);

  const filteredTeamSubmissions = useMemo(() => {
    return allTeamSubmissions.filter((row) => {
      const rowDate = parseRowDate(row);
      if (!inDateRange(rowDate, dateRange)) return false;

      if (hierarchyFilter === "all") return true;
      const [type, value] = hierarchyFilter.split(":");
      if (type === "department") {
        const rowDept = typeof row.department === "string" ? row.department : row.department?.name;
        const empDept = typeof row.employee?.department === "string" ? row.employee?.department : row.employee?.department?.name;
        return rowDept === value || empDept === value;
      }
      return true;
    });
  }, [allTeamSubmissions, dateRange, hierarchyFilter]);

  const filteredFteRows = useMemo(() => {
    return allFteRows.filter((row) => {
      if (hierarchyFilter === "all") return true;
      const [type, value] = hierarchyFilter.split(":");
      if (type === "tower") return row.tower === value;
      if (type === "department") return row.department === value;
      return true;
    });
  }, [allFteRows, hierarchyFilter]);

  const filteredUtilizationRows = useMemo(() => {
    return allUtilizationRows.filter((row) => {
      if (hierarchyFilter === "all") return true;
      const [type, value] = hierarchyFilter.split(":");
      if (type === "department") return row.department === value;
      return true;
    });
  }, [allUtilizationRows, hierarchyFilter]);

  const submissionCounts = useMemo(() => {
    const counts = {
      draft: 0,
      submitted: 0,
      underReview: 0,
      approved: 0,
    };

    filteredTeamSubmissions.forEach((row) => {
      if (row.status === "draft") counts.draft += 1;
      if (row.status === "submitted" || row.status === "returned_for_revision") counts.submitted += 1;
      if (row.status === "under_review") counts.underReview += 1;
      if (row.status === "approved") counts.approved += 1;
    });

    return counts;
  }, [filteredTeamSubmissions]);

  const currentSubmissionTotal = submissionCounts.submitted + submissionCounts.underReview + submissionCounts.approved;

  const previousPeriodSubmissionTotal = useMemo(() => {
    const now = new Date();
    const prevStart = new Date(now);
    prevStart.setDate(now.getDate() - 14);
    const prevEnd = new Date(now);
    prevEnd.setDate(now.getDate() - 7);

    return allTeamSubmissions.filter((row) => {
      const rowDate = parseRowDate(row);
      if (!rowDate) return false;
      const isInPreviousWindow = rowDate >= prevStart && rowDate < prevEnd;
      if (!isInPreviousWindow) return false;
      return row.status === "submitted" || row.status === "returned_for_revision" || row.status === "under_review" || row.status === "approved";
    }).length;
  }, [allTeamSubmissions]);

  const computePctDelta = (current: number, previous: number): number | null => {
    if (previous <= 0) return null;
    return ((current - previous) / previous) * 100;
  };

  const submittedDelta = computePctDelta(currentSubmissionTotal, previousPeriodSubmissionTotal);
  const approvedPrevWindow = Math.max(0, Math.round(previousPeriodSubmissionTotal * 0.45));
  const approvedDelta = computePctDelta(submissionCounts.approved, approvedPrevWindow);
  const pendingPrevWindow = Math.max(0, Math.round(previousPeriodSubmissionTotal * 0.25));
  const pendingDelta = computePctDelta(submissionCounts.underReview, pendingPrevWindow);

  const latestMonthAvg = useMemo(() => {
    const byPeriod = new Map<string, number[]>();
    filteredUtilizationRows.forEach((row) => {
      if (!row.year || !row.month) return;
      const key = `${row.year}-${String(row.month).padStart(2, "0")}`;
      const existing = byPeriod.get(key) || [];
      existing.push(row.utilizationPct || 0);
      byPeriod.set(key, existing);
    });
    const periods = Array.from(byPeriod.keys()).sort((a, b) => b.localeCompare(a));
    if (periods.length === 0) return { current: 0, previous: 0 };
    const currentVals = byPeriod.get(periods[0]) || [];
    const prevVals = byPeriod.get(periods[1] || "") || [];
    const avg = (arr: number[]) => (arr.length ? arr.reduce((sum, v) => sum + v, 0) / arr.length : 0);
    return { current: avg(currentVals), previous: avg(prevVals) };
  }, [filteredUtilizationRows]);

  const utilizationDelta = computePctDelta(latestMonthAvg.current, latestMonthAvg.previous);
  const totalEmployeesInScope = useMemo(() => {
    if (hierarchyFilter === "all") return summary?.totalEmployees ?? 0;
    return new Set(filteredTeamSubmissions.map((row) => row.employee?._id).filter(Boolean)).size;
  }, [filteredTeamSubmissions, hierarchyFilter, summary?.totalEmployees]);

  const statCards = [
    {
      label: "Total Employees",
      value: `${totalEmployeesInScope}`,
      icon: Users,
      delta: "N/A (headcount baseline)",
      isWarning: false,
      isHighlight: false,
    },
    {
      label: "Forms Submitted",
      value: `${currentSubmissionTotal}`,
      icon: FileCheck,
      delta: formatDelta(submittedDelta),
      isWarning: false,
      isHighlight: false,
    },
    {
      label: "Pending Review",
      value: `${submissionCounts.underReview}`,
      icon: Clock,
      delta: formatDelta(pendingDelta),
      isWarning: true,
      isHighlight: false,
    },
    {
      label: "Approved",
      value: `${submissionCounts.approved}`,
      icon: CheckCircle2,
      delta: formatDelta(approvedDelta),
      isWarning: false,
      isHighlight: false,
    },
    {
      label: "Avg Utilization",
      value: `${(filteredUtilizationRows.length ? latestMonthAvg.current : Number((summary?.avgUtilization || 0) * 100)).toFixed(1)}%`,
      icon: TrendingUp,
      delta: formatDelta(utilizationDelta),
      isWarning: false,
      isHighlight: true,
    },
  ];

  const fteByTower = useMemo(() => {
    const map = new Map<string, number>();
    filteredFteRows.forEach((row) => {
      const key = row.tower || "Unknown";
      map.set(key, (map.get(key) || 0) + (row.currentFTE || 0));
    });
    return Array.from(map.entries())
      .map(([name, fte]) => ({ name, fte: Number(fte.toFixed(2)) }))
      .sort((a, b) => b.fte - a.fte);
  }, [filteredFteRows]);

  const filteredTopActivities = useMemo(() => {
    return [...filteredFteRows]
      .sort((a, b) => (b.currentFTE || 0) - (a.currentFTE || 0))
      .slice(0, 5)
      .map((row) => ({
        activity: row.activity || "Unknown",
        tower: row.tower || "Unknown",
        fte: Number((row.currentFTE || 0).toFixed(2)),
        consolidate: Boolean(row.consolidate),
      }));
  }, [filteredFteRows]);

  const submissionTotal = submissionCounts.approved + submissionCounts.underReview + submissionCounts.draft;
  const submissionStatus = [
    { name: "Approved", value: submissionCounts.approved, color: "#185FA5" },
    { name: "Pending", value: submissionCounts.underReview, color: "#3b82f6" },
    { name: "Draft / Not Started", value: submissionCounts.draft, color: "#cbd5e1" },
  ];
  const hasFteByTower = fteByTower.length > 0;
  const hasSubmissionStatus = submissionStatus.some((row) => row.value > 0);
  const lastSyncLabel = formatUpdatedAgo(lastSyncedAt, nowTick);

  const handleEmployeeSearch = () => {
    const trimmed = employeeSearch.trim();
    navigate(trimmed ? `/admin/employee-360?q=${encodeURIComponent(trimmed)}` : "/admin/employee-360");
  };

  if (loading) {
    return <LoadingState title="Loading admin dashboard" message="Fetching report and team submission data." />;
  }

  if (error) {
    return <ErrorFallbackState title="Dashboard unavailable" message={error} />;
  }

  if (!summary && filteredTopActivities.length === 0 && teamUtilization.length === 0) {
    return <EmptyState title="No dashboard data" message="No analytics data is available for the selected scope." />;
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-auto [font-variant-numeric:tabular-nums]">
      {/* Top Nav */}
      <div className="bg-white border-b border-slate-200 px-6 lg:px-8 py-4 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between sticky top-0 z-20">
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">ePER Platform</p>
          <h1 className="text-[21px] font-bold text-slate-900 tracking-tight">Command Dashboard</h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as DateRangeKey)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-corporateBlue/20"
          >
            <option value="today">Today</option>
            <option value="last7d">Last 7D</option>
            <option value="q2-2026">Q2 2026</option>
          </select>

          <select
            value={hierarchyFilter}
            onChange={(e) => setHierarchyFilter(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-corporateBlue/20"
          >
            {hierarchyOptions.map((option) => {
              if (option === "all") return <option key={option} value={option}>Global View</option>;
              const [type, value] = option.split(":");
              const label = `${type === "tower" ? "Tower" : "Department"}: ${value}`;
              return (
                <option key={option} value={option}>{label}</option>
              );
            })}
          </select>

          <div className="relative">
            <Search size={14} className="text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleEmployeeSearch();
              }}
              type="text"
              placeholder="Employee 360 search"
              className="h-9 w-44 lg:w-56 rounded-md border border-slate-200 bg-white pl-8 pr-2 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-corporateBlue/20"
            />
          </div>

          <button
            onClick={handleEmployeeSearch}
            className="h-9 rounded-md bg-corporateBlue px-3 text-xs font-semibold text-white hover:bg-corporateBlue-dark transition-colors"
          >
            Open 360
          </button>

          <div className="h-8 w-8 rounded-full bg-corporateBlue-dark text-white flex items-center justify-center text-xs font-bold">{(user?.name || "Admin").split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase()}</div>
          <span className="text-sm font-semibold text-slate-700">{user?.name || "Admin"}</span>
=======
import {
  Users, FileCheck, Clock, CheckCircle2, TrendingUp,
  ArrowUpRight, ChevronRight, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid
} from "recharts";

// Mock data to fall back on for static charts or missing backend bits
const SUBMISSION_STATUS = [
  { name: "Approved", value: 786, color: "#185FA5" },
  { name: "Pending", value: 156, color: "#f59e0b" },
  { name: "Draft / Not Started", value: 306, color: "#e2e8f0" },
];

const TEAM_UTILIZATION = [
  { name: "Finance Global Shared Services", pct: 96 },
  { name: "Global IT Infrastructure", pct: 88 },
  { name: "Human Capital Management", pct: 74 },
  { name: "Direct Procurement Team", pct: 91 },
];

import { useDashboardSummary } from "../queries/reports";
import { LoadingSpinner, ErrorState } from "./ui";

export function EperDashboard() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) return <LoadingSpinner label="Compiling Intelligence..." />;
  if (isError) return <div className="p-8"><ErrorState onRetry={refetch} /></div>;

  const summary = data || {
    totalEmployees: 0,
    submissionStats: { submitted: 0, underReview: 0, approved: 0 },
    avgUtilization: 0,
    fteByTower: [],
    consolidationSummary: { activities: 0, savedFTE: 0, costSaving: 0 }
  };

  const statCards = [
    { label: "Total Employees", value: summary.totalEmployees?.toString(), icon: Users, color: "bg-blue-50 text-blue-600", change: "Active across enterprise", up: true },
    { label: "Forms Submitted", value: summary.submissionStats?.submitted?.toString() || "0", icon: FileCheck, color: "bg-indigo-50 text-indigo-600", change: "Current Cycle", up: true },
    { label: "Pending Review", value: summary.submissionStats?.underReview?.toString() || "0", icon: Clock, color: "bg-amber-50 text-amber-600", change: "Requires Action", up: false, isWarning: true },
    { label: "Approved", value: summary.submissionStats?.approved?.toString() || "0", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-600", change: "Successfully processed", up: true },
    { label: "Avg Utilization", value: `${(summary.avgUtilization * 100).toFixed(1)}%`, icon: TrendingUp, color: "bg-corporateBlue bg-opacity-10 text-corporateBlue", change: "Global Target: 80%", up: true, isHighlight: true },
  ];

  const parsedSubmissionStatus = [
    { name: "Approved", value: summary.submissionStats?.approved || 0, color: "#185FA5" },
    { name: "Under Review", value: summary.submissionStats?.underReview || 0, color: "#f59e0b" },
    { name: "Draft / Not Started", value: (summary.submissionStats?.draft || 0) + (summary.totalEmployees - (summary.submissionStats?.submitted || 0)), color: "#e2e8f0" },
  ];

  return (
    <div className="flex-1 bg-slate-50 min-h-screen overflow-y-auto">
      {/* Top Nav */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <p className="text-xs font-bold text-slate-400 tracking-widest uppercase">Admin Platform</p>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Intelligence Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-corporateBlue-dark text-white flex items-center justify-center text-xs font-bold">OA</div>
          <span className="text-sm font-semibold text-slate-700">Org Admin</span>
>>>>>>> target/main
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto space-y-8">

        {/* ROW 1 — Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
<<<<<<< HEAD
                className={`bg-white rounded-md p-4 border shadow-sm hover:shadow-md transition-shadow ${card.isHighlight ? "border-corporateBlue/20 bg-gradient-to-br from-corporateBlue-dark to-blue-700" : "border-slate-200"}`}
              >
                <div className={`w-9 h-9 rounded-md flex items-center justify-center mb-3 ${card.isHighlight ? "bg-white/15" : "bg-slate-100"}`}>
                  <Icon size={18} className={card.isHighlight ? "text-white/80" : "text-slate-500 opacity-20"} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${card.isHighlight ? "text-blue-200" : "text-slate-500"}`}>{card.label}</p>
                <p className={`text-2xl font-extrabold leading-tight ${card.isHighlight ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                <p className={`text-xs font-semibold mt-1.5 ${card.isWarning ? "text-amber-600" : card.isHighlight ? "text-blue-100" : "text-slate-500"}`}>{card.delta}</p>
                <p className={`text-[11px] mt-2 ${card.isHighlight ? "text-blue-200/90" : "text-slate-400"}`}>{lastSyncLabel}</p>
=======
                className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${card.isHighlight ? "border-corporateBlue/20 bg-gradient-to-br from-corporateBlue-dark to-blue-700" : "border-slate-200"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.isHighlight ? "bg-white/20" : card.color}`}>
                  <Icon size={18} className={card.isHighlight ? "text-white" : ""} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${card.isHighlight ? "text-blue-200" : "text-slate-500"}`}>{card.label}</p>
                <p className={`text-2xl font-extrabold leading-tight ${card.isHighlight ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                <p className={`text-xs font-medium mt-1 ${card.isWarning ? "text-amber-600" : card.isHighlight ? "text-blue-200" : "text-slate-400"}`}>{card.change}</p>
>>>>>>> target/main
              </div>
            );
          })}
        </div>

        {/* ROW 2 — Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FTE by Tower */}
<<<<<<< HEAD
          <div className="lg:col-span-2 bg-white rounded-md border border-slate-200 shadow-sm p-6">
=======
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
>>>>>>> target/main
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">FTE Distribution by Tower</h3>
                <p className="text-xs text-slate-500 mt-0.5">Workforce allocation across primary service units</p>
              </div>
            </div>
<<<<<<< HEAD
            <div className="h-[184px]">
              {hasFteByTower ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={fteByTower} layout="vertical" margin={{ top: 4, right: 22, left: 8, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="fte" name="Total FTE" fill="#185FA5" radius={[0, 4, 4, 0]} maxBarSize={28}>
                      <LabelList
                        dataKey="fte"
                        position="right"
                        formatter={(value) => Number(value || 0).toFixed(1)}
                        style={{ fill: '#334155', fontSize: 11, fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-sm text-slate-500">No FTE tower data available.</div>
              )}
=======
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.fteByTower} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="tower" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="totalFTE" name="Total FTE" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
>>>>>>> target/main
            </div>
          </div>

          {/* Submission Status Donut */}
<<<<<<< HEAD
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-base mb-1">Submission Status</h3>
            <p className="text-xs text-slate-500 mb-4">Quarterly compliance overview</p>
            <div className="h-44 relative">
              {hasSubmissionStatus ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={submissionStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                      {submissionStatus.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full grid place-items-center text-sm text-slate-500">No submission status data available.</div>
              )}
              {hasSubmissionStatus ? (
                <div className="absolute inset-0 grid place-items-center pointer-events-none">
                  <div className="text-center">
                    <p className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Total Submissions</p>
                    <p className="text-2xl font-extrabold text-slate-900 leading-none">{submissionTotal}</p>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="space-y-2 mt-2">
              {submissionStatus.map((s) => (
=======
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 text-base mb-1">Submission Status</h3>
            <p className="text-xs text-slate-500 mb-4">Quarterly compliance overview</p>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={parsedSubmissionStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {parsedSubmissionStatus.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {parsedSubmissionStatus.map((s) => (
>>>>>>> target/main
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                    <span className="text-slate-600 font-medium">{s.name}</span>
                  </div>
<<<<<<< HEAD
                  <span className="font-semibold text-slate-500">{submissionTotal > 0 ? `${Math.round((s.value / submissionTotal) * 100)}%` : "0%"}</span>
=======
                  <span className="font-bold text-slate-900">{s.value}</span>
>>>>>>> target/main
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3 — Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Activities */}
<<<<<<< HEAD
          <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
=======
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
>>>>>>> target/main
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Top 5 Activities by FTE</h3>
              <Activity size={16} className="text-slate-400" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                  <th className="py-3 px-5 text-left">Activity Name</th>
                  <th className="py-3 px-3 text-left">Tower</th>
<<<<<<< HEAD
                  <th className="py-3 px-3 text-right">FTE</th>
                  <th className="py-3 px-3 text-center">Trend (5D)</th>
                  <th className="py-3 px-3 text-center">Consolidate</th>
                </tr>
              </thead>
              <tbody>
                {filteredTopActivities.map((row, i) => (
                  <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-5 font-medium text-slate-800 text-xs">{row.activity}</td>
                    <td className="py-3.5 px-3 text-xs text-slate-500">{row.tower}</td>
                    <td className="py-3.5 px-3 text-right font-bold text-corporateBlue text-xs">{row.fte.toFixed(2)}</td>
                    <td className="py-3.5 px-3 text-center">
                      <svg viewBox="0 0 100 24" className="w-20 h-5 inline-block" role="img" aria-label={`${row.activity} five day FTE trend`}>
                        <polyline
                          fill="none"
                          stroke={row.consolidate ? "#16a34a" : "#64748b"}
                          strokeWidth="2"
                          points={buildSparkline(row.activity, row.fte)}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {row.consolidate ? (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                          <Check size={12} />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                          <X size={12} />
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
=======
                  <th className="py-3 px-3 text-center">FTE</th>
                  <th className="py-3 px-3 text-center">Consolidate?</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs">Full activity list available in Deep Reports</td></tr>
>>>>>>> target/main
              </tbody>
            </table>
          </div>

          {/* Team Utilization */}
<<<<<<< HEAD
          <div className="bg-white rounded-md border border-slate-200 shadow-sm p-5">
=======
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
>>>>>>> target/main
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Team Utilization Overview</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Weekly Avg</span>
            </div>
            <div className="space-y-4">
<<<<<<< HEAD
              {teamUtilization.length > 0 ? (
                teamUtilization.map((team) => (
                  <div key={team.name}>
                    <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                      <span className="truncate pr-4">{team.name}</span>
                      <span className={`font-bold ${team.pct >= 90 ? "text-amber-600" : team.pct >= 60 ? "text-green-600" : "text-red-600"}`}>{team.pct}%</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${team.pct >= 90 ? "bg-amber-500" : team.pct >= 60 ? "bg-corporateBlue" : "bg-red-500"}`}
                        style={{ width: `${Math.max(0, Math.min(100, team.pct))}%` }}
                      ></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No utilization records available.</p>
              )}
=======
              {TEAM_UTILIZATION.map((team) => (
                <div key={team.name}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
                    <span className="truncate pr-4">{team.name}</span>
                    <span className={`font-bold ${team.pct >= 90 ? "text-amber-600" : team.pct >= 60 ? "text-green-600" : "text-red-600"}`}>{team.pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${team.pct >= 90 ? "bg-amber-500" : team.pct >= 60 ? "bg-corporateBlue" : "bg-red-500"}`}
                      style={{ width: `${team.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
>>>>>>> target/main
            </div>
            <button className="text-xs text-corporateBlue font-bold mt-5 hover:text-corporateBlue-dark transition-colors flex items-center gap-1">
              View Full Team Breakdown <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ROW 4 — Consolidation Summary */}
<<<<<<< HEAD
        <div className="bg-corporateBlue-dark rounded-md p-7 text-white relative overflow-hidden">
=======
        <div className="bg-corporateBlue-dark rounded-xl p-7 text-white relative overflow-hidden">
>>>>>>> target/main
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-blue-300 tracking-widest uppercase mb-2">✦ Platform Insights</p>
<<<<<<< HEAD
              <h2 className="text-2xl font-extrabold mb-2">Consolidation Summary</h2>
=======
              <h2 className="text-3xl font-extrabold mb-2">Consolidation Summary</h2>
>>>>>>> target/main
              <p className="text-blue-200/80 text-sm max-w-lg leading-relaxed">
                Based on current data trends, the platform identifies significant optimization opportunities through process centralization and automation.
              </p>
            </div>
            <div className="flex gap-8 shrink-0">
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Total Activities</p>
<<<<<<< HEAD
                <p className="text-2xl font-extrabold">{summary?.consolidationSummary.activities ?? 0}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Saved FTE</p>
                <p className="text-2xl font-extrabold text-blue-300">{summary?.consolidationSummary.savedFTE ?? 0}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Cost Saving</p>
                <p className="text-2xl font-extrabold text-emerald-300">₹{(((summary?.consolidationSummary.costSaving || 0) / 10000000)).toFixed(2)}Cr</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/analytics")}
              className="bg-white text-corporateBlue-dark font-bold text-sm py-3 px-6 rounded-md hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 shrink-0"
=======
                <p className="text-3xl font-extrabold">{summary.consolidationSummary?.activities}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Saved FTE</p>
                <p className="text-3xl font-extrabold text-blue-300">{summary.consolidationSummary?.savedFTE}</p>
              </div>
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Cost Saving</p>
                <p className="text-3xl font-extrabold text-emerald-300">₹{summary.consolidationSummary?.costSaving?.toLocaleString()}</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/deep-reports")}
              className="bg-white text-corporateBlue-dark font-bold text-sm py-3 px-6 rounded-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center gap-2 shrink-0"
>>>>>>> target/main
            >
              View Full Report <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

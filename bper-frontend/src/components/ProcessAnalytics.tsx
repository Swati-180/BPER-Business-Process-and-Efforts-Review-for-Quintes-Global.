<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Download, Calendar, ArrowUpRight, Users, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from "recharts";
import { apiGet } from "../api/http";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";

interface FteRow {
  department: string;
  tower: string;
  process: string;
  activity: string;
  currentFTE: number;
  consolidate: boolean;
  totalScore: number;
}

interface DashboardSummary {
  submissionStats: {
    draft: number;
    submitted: number;
    underReview: number;
    returned: number;
    approved: number;
  };
  avgUtilization: number;
}

interface FteConsolidationSummary {
  totalFTEOnConsolidatable: number;
  estimatedSavedFTE: number;
  estimatedAnnualSaving: number;
}

const safeNumber = (value: unknown, fallback = 0): number => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export function ProcessAnalytics() {
  const [fteSummary, setFteSummary] = useState<FteRow[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [consolidationSummary, setConsolidationSummary] = useState<FteConsolidationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [fteData, dashData, consolidationData] = await Promise.all([
          apiGet<FteRow[]>("/eper/reports/fte-summary"),
          apiGet<DashboardSummary>("/eper/reports/dashboard-summary"),
          apiGet<FteConsolidationSummary>("/eper/reports/fte-consolidation-summary"),
        ]);

        setFteSummary(Array.isArray(fteData) ? fteData : []);
        setDashboardSummary(dashData || null);
        setConsolidationSummary(consolidationData || null);
      } catch {
        setError("Unable to load analytics reports.");
        setFteSummary([]);
        setDashboardSummary(null);
        setConsolidationSummary(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const totals = useMemo(() => {
    const total = fteSummary.length;
    const consolidatable = fteSummary.filter((row) => row.consolidate).length;
    const notConsolidatable = total - consolidatable;
    return { total, consolidatable, notConsolidatable };
  }, [fteSummary]);

  const chartData = useMemo(() => {
    const bucket = new Map<string, { consolidated: number; notConsolidated: number }>();

    fteSummary.forEach((row) => {
      const name = (row.department || "Unknown").trim() || "Unknown";
      const current = bucket.get(name) || { consolidated: 0, notConsolidated: 0 };
      if (row.consolidate) current.consolidated += 1;
      else current.notConsolidated += 1;
      bucket.set(name, current);
    });

    return Array.from(bucket.entries()).map(([name, value]) => ({
      name,
      consolidated: safeNumber(value.consolidated),
      notConsolidated: safeNumber(value.notConsolidated),
    }));
  }, [fteSummary]);

  const tableData = useMemo(() => {
    return fteSummary.slice(0, 25).map((row, idx) => ({
      id: idx + 1,
      majorPath: row.process || "Unknown",
      subtitle: row.activity || "Unknown",
      process: row.activity || "Unknown",
      dept: row.department || "Unknown",
      type: row.consolidate ? "Consolidatable" : "Non-Consolidatable",
      score: safeNumber(row.totalScore),
      consolidate: row.consolidate ? "YES" : "NO",
      fte: safeNumber(row.currentFTE).toFixed(2),
    }));
  }, [fteSummary]);

  const maturity = useMemo(() => {
    const stats = dashboardSummary?.submissionStats;
    const totalSub = stats
      ? safeNumber(stats.draft) + safeNumber(stats.submitted) + safeNumber(stats.underReview) + safeNumber(stats.returned) + safeNumber(stats.approved)
      : 0;
    const inFlow = stats ? safeNumber(stats.submitted) + safeNumber(stats.underReview) + safeNumber(stats.returned) + safeNumber(stats.approved) : 0;
    const transactional = totalSub > 0 ? (inFlow / totalSub) * 100 : 0;

    const functional = safeNumber(dashboardSummary?.avgUtilization) * 100;

    const highScoreCount = fteSummary.filter((row) => safeNumber(row.totalScore) >= 8).length;
    const analytics = fteSummary.length > 0 ? (highScoreCount / fteSummary.length) * 100 : 0;

    return {
      transactional: Math.max(0, Math.min(100, transactional)),
      functional: Math.max(0, Math.min(100, functional)),
      analytics: Math.max(0, Math.min(100, analytics)),
    };
  }, [dashboardSummary, fteSummary]);

  const annualSavingLakhs = ((safeNumber(consolidationSummary?.estimatedAnnualSaving) / 100000) || 0).toFixed(0);
  const hasChartData = chartData.length > 0;
  const hasTableData = tableData.length > 0;

  if (loading) {
    return <LoadingState title="Loading analytics" message="Preparing process and consolidation reports." />;
  }

  if (error) {
    return <ErrorFallbackState title="Analytics unavailable" message={error} />;
  }

  if (!hasChartData && !hasTableData) {
    return <EmptyState title="No analytics data" message="No report data is available to render process analytics." />;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen overflow-auto">
=======
import { Download, Calendar, ArrowUpRight, Minus, ChevronDown, Users, IndianRupee } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const CHART_DATA = [
  { name: 'F&A', consolidated: 42, notConsolidated: 8 },
  { name: 'HR', consolidated: 28, notConsolidated: 21 },
  { name: 'SCM', consolidated: 38, notConsolidated: 15 },
  { name: 'Logistics', consolidated: 26, notConsolidated: 23 },
];

const TABLE_DATA = [
  { id: 1, majorPath: 'Order-to-Cash', subtitle: 'Invoice Generation', process: 'Automated Billing', dept: 'F&A', type: 'Transactional', score: 9.4, consolidate: 'YES', fte: 12.5 },
  { id: 2, majorPath: 'Talent Acquisition', subtitle: 'Candidate Screening', process: 'Interview Scheduling', dept: 'HR', type: 'Functional', score: 7.2, consolidate: 'YES', fte: 4.2 },
  { id: 3, majorPath: 'Inventory Mgmt', subtitle: 'Stock Auditing', process: 'Cycle Counting', dept: 'SCM', type: 'Analytics', score: 4.8, consolidate: 'NO', fte: 8.0 },
  { id: 4, majorPath: 'Fleet Operations', subtitle: 'Route Planning', process: 'Dynamic Dispatch', dept: 'Logistics', type: 'Transactional', score: 8.1, consolidate: 'YES', fte: 2.1 },
];

// FTE savings data (would be fetched from /api/eper/reports/fte-consolidation-summary)
const FTE_SAVINGS = {
  currentFTE: 209,
  estimatedPost: 142,
  savedFTE: 67,
  avgSalaryPerFTE: 600000,
};
const annualSavingLakhs = ((FTE_SAVINGS.savedFTE * FTE_SAVINGS.avgSalaryPerFTE) / 100000).toFixed(0);

export function ProcessAnalytics() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen overflow-y-auto">
      {/* Top Header */}
>>>>>>> target/main
      <div className="bg-white border-b border-slate-200 px-8 py-6 w-full flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Process Analytics</h1>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
<<<<<<< HEAD
            BPER <span className="mx-2 text-slate-300">›</span> Admin Console <span className="mx-2 text-slate-300">›</span> <span className="text-corporateBlue">Analytics Overview</span>
=======
            Sovereign Ledger <span className="mx-2 text-slate-300">›</span> Admin Console <span className="mx-2 text-slate-300">›</span> <span className="text-corporateBlue">Analytics Overview</span>
>>>>>>> target/main
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg shadow-sm transition-colors">
            <Calendar size={16} className="text-slate-500" />
<<<<<<< HEAD
            Latest Data
=======
            Last 30 Days
>>>>>>> target/main
          </button>
          <button className="bg-corporateBlue hover:bg-corporateBlue-dark text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export Data
          </button>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full space-y-8">
<<<<<<< HEAD
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard label="Total Processes" value={String(totals.total)} accent="blue" />
          <MetricCard label="Consolidated" value={String(totals.consolidatable)} accent="indigo" />
          <MetricCard label="Not Consolidated" value={String(totals.notConsolidatable)} accent="slate" />
          <MetricCard
            label="Consolidation Rate"
            value={`${totals.total > 0 ? ((totals.consolidatable / totals.total) * 100).toFixed(1) : "0.0"}%`}
            accent="amber"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
=======
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-corporateBlue"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <div className="w-4 h-4 text-corporateBlue flex grid grid-cols-2 gap-[1px]">
                  <div className="bg-current rounded-[2px]"></div><div className="bg-current rounded-[2px] opacity-40"></div>
                  <div className="bg-current rounded-[2px] opacity-40"></div><div className="bg-current rounded-[2px]"></div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">
                <ArrowUpRight size={12} /> +12%
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Total Processes</p>
            <h3 className="text-3xl font-extrabold text-slate-900">124</h3>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-corporateBlue/80"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <div className="w-4 h-4 bg-corporateBlue/80 rounded" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">
                <ArrowUpRight size={12} /> +8
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Consolidated</p>
            <h3 className="text-3xl font-extrabold text-slate-900">86</h3>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200"></div>
            <div className="flex justify-between items-start mb-4">
               <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <div className="w-4 h-4 bg-slate-300 rounded line-through border border-white"></div>
              </div>
              <div className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded text-xs font-bold">
                <Minus size={12} /> Neutral
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Not Consolidated</p>
            <h3 className="text-3xl font-extrabold text-slate-900">38</h3>
          </div>

          {/* Card 4 */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="flex justify-between items-start mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent revolve"></div>
              </div>
              <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">
                <ArrowUpRight size={12} /> +2.4%
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Consolidation Rate</p>
            <h3 className="text-3xl font-extrabold text-slate-900 text-corporateBlue">69.3%</h3>
          </div>
        </div>

        {/* FTE & Cost Savings Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* FTE Savings Card */}
>>>>>>> target/main
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500"></div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">FTE Savings</p>
                <p className="text-xs text-slate-400">Headcount Optimization</p>
              </div>
            </div>
            <div className="space-y-3">
<<<<<<< HEAD
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Current FTE</span>
                <span className="font-semibold text-slate-800">{safeNumber(consolidationSummary?.totalFTEOnConsolidatable).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estimated Post</span>
                <span className="font-semibold text-slate-800">{(safeNumber(consolidationSummary?.totalFTEOnConsolidatable) - safeNumber(consolidationSummary?.estimatedSavedFTE)).toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Saved FTE</span>
                <span className="text-xl font-extrabold text-blue-600">{safeNumber(consolidationSummary?.estimatedSavedFTE).toFixed(2)}</span>
=======
              {[
                { label: "Current FTE", value: FTE_SAVINGS.currentFTE, bold: false },
                { label: "Estimated Post", value: FTE_SAVINGS.estimatedPost, bold: false },
              ].map(r => (
                <div key={r.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{r.label}</span>
                  <span className="font-semibold text-slate-800">{r.value}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between">
                <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Saved FTE</span>
                <span className="text-xl font-extrabold text-blue-600">{FTE_SAVINGS.savedFTE}</span>
>>>>>>> target/main
              </div>
            </div>
          </div>

<<<<<<< HEAD
=======
          {/* Cost Savings Card */}
>>>>>>> target/main
          <div className="bg-white p-6 rounded-xl border border-amber-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <IndianRupee size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Cost Savings</p>
                <p className="text-xs text-slate-400">Annual Projection</p>
              </div>
            </div>
            <p className="text-4xl font-extrabold text-amber-600 mb-1">₹{annualSavingLakhs}L</p>
            <p className="text-xs text-slate-400 mb-4">Est. Annual Savings</p>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
<<<<<<< HEAD
              <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.min(100, Math.max(0, totals.total > 0 ? (totals.consolidatable / totals.total) * 100 : 0))}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Based on consolidation ratio</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
=======
              <div className="h-full bg-amber-500 rounded-full w-3/4"></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">75% Target</p>
          </div>
        </div>

        {/* Charts & Maturity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
>>>>>>> target/main
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">Departmental Breakdown</h3>
<<<<<<< HEAD
                <p className="text-sm text-slate-500">Consolidation status by business units</p>
=======
                <p className="text-sm text-slate-500">Consolidation status by core business units</p>
>>>>>>> target/main
              </div>
            </div>

            <div className="h-72 w-full">
<<<<<<< HEAD
              {hasChartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barGap={8}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 12, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={false} />
                    <Tooltip cursor={{ fill: "#f8fafc" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" formatter={(value) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{value}</span>} />
                    <Bar dataKey="consolidated" name="Consolidated" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="notConsolidated" name="Not Consolidated" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmptyState text="No departmental data available for chart." />
              )}
            </div>
          </div>

          <div className="bg-corporateBlue-dark rounded-xl shadow-xl border border-corporateBlue-dark overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
              <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Process Maturity</h3>
              <p className="text-sm text-blue-200/80 mb-8 max-w-[200px] leading-relaxed">Derived from live reporting health and scoring.</p>

              <MaturityBar label="Transactional" pct={maturity.transactional} tone="blue" />
              <MaturityBar label="Functional" pct={maturity.functional} tone="amber" />
              <MaturityBar label="Analytics" pct={maturity.analytics} tone="green" />
            </div>

            <div className="bg-slate-900/40 p-6 border-t border-white/5">
              <p className="text-xs text-blue-200/70 italic leading-relaxed">
                Metrics update from /api/eper/reports/dashboard-summary and /api/eper/reports/fte-summary.
=======
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: -20, bottom: 5 }} barGap={8}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={false} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{value}</span>}
                  />
                  <Bar dataKey="consolidated" name="Consolidated" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="notConsolidated" name="Not Consolidated" fill="#e2e8f0" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Maturity Metric */}
          <div className="bg-corporateBlue-dark rounded-xl shadow-xl border border-corporateBlue-dark overflow-hidden flex flex-col">
            <div className="p-8 flex-1">
               <h3 className="text-lg font-bold text-white mb-2 tracking-tight">Process Maturity</h3>
               <p className="text-sm text-blue-200/80 mb-8 max-w-[200px] leading-relaxed">Real-time health of the ledger ecosystem.</p>

               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
                     <span>Transactional</span>
                     <span className="text-white">88%</span>
                   </div>
                   <div className="h-1.5 w-full bg-blue-900/50 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-400 rounded-full w-[88%]"></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
                     <span>Functional</span>
                     <span className="text-white">64%</span>
                   </div>
                   <div className="h-1.5 w-full bg-blue-900/50 rounded-full overflow-hidden">
                     <div className="h-full bg-amber-400 rounded-full w-[64%]"></div>
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
                     <span>Analytics</span>
                     <span className="text-white">42%</span>
                   </div>
                   <div className="h-1.5 w-full bg-blue-900/50 rounded-full overflow-hidden">
                     <div className="h-full bg-green-400 rounded-full w-[42%]"></div>
                   </div>
                 </div>
               </div>
            </div>
            
            <div className="bg-slate-900/40 p-6 border-t border-white/5">
              <p className="text-xs text-blue-200/70 italic leading-relaxed">
                "Transactional processes are leading the consolidation curve with near-total automation achieved this quarter."
>>>>>>> target/main
              </p>
            </div>
          </div>
        </div>

<<<<<<< HEAD
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-end flex-wrap gap-4">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Process Library</h3>
              <p className="text-sm text-slate-500">Inventory with live FTE and consolidation scoring</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100">
                  <th className="py-4 px-6 min-w-[200px]">Major Process</th>
                  <th className="py-4 px-6 min-w-[200px]">Process</th>
                  <th className="py-4 px-6 min-w-[120px]">Department</th>
                  <th className="py-4 px-6 min-w-[150px]">Type</th>
                  <th className="py-4 px-6 text-center">FTE</th>
                  <th className="py-4 px-6">Score</th>
                  <th className="py-4 px-6">Consolidate</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {hasTableData ? (
                  tableData.map((row) => (
=======
        {/* Searchable Process Library */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-end flex-wrap gap-4">
             <div>
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Process Library</h3>
               <p className="text-sm text-slate-500">Comprehensive inventory and scoring matrix</p>
             </div>
             
             <div className="flex gap-3">
               <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg">
                 ALL DEPARTMENTS <ChevronDown size={14} />
               </button>
               <button className="flex items-center gap-2 bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest py-2 px-4 rounded-lg">
                 SORT BY: SCORE <ChevronDown size={14} />
               </button>
             </div>
           </div>

           <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100">
                    <th className="py-4 px-6 min-w-[200px]">MAJOR PROCESS</th>
                    <th className="py-4 px-6 min-w-[200px]">PROCESS</th>
                    <th className="py-4 px-6 min-w-[120px]">DEPARTMENT</th>
                    <th className="py-4 px-6 min-w-[150px]">TYPE</th>
                    <th className="py-4 px-6 text-center">FTE</th>
                    <th className="py-4 px-6">SCORE</th>
                    <th className="py-4 px-6">CONSOLIDATE</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {TABLE_DATA.map((row) => (
>>>>>>> target/main
                    <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="py-5 px-6">
                        <p className="font-bold text-slate-900">{row.majorPath}</p>
                        <p className="text-xs text-slate-400">{row.subtitle}</p>
                      </td>
                      <td className="py-5 px-6 font-medium text-slate-600">{row.process}</td>
                      <td className="py-5 px-6">
<<<<<<< HEAD
                        <span className="text-xs font-bold tracking-wider text-blue-600">{row.dept}</span>
                      </td>
                      <td className="py-5 px-6 text-slate-600">{row.type}</td>
                      <td className="py-5 px-6 text-center font-extrabold text-corporateBlue">{row.fte}</td>
                      <td className="py-5 px-6 font-extrabold text-slate-900">{row.score.toFixed(1)}</td>
                      <td className="py-5 px-6">
                        <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold tracking-widest ${row.consolidate === "YES" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                          {row.consolidate}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">No process records available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 flex items-center justify-between text-xs text-slate-500 font-medium">
            <p>Showing {tableData.length} of {tableData.length} processes</p>
            <span className="font-bold text-slate-400">Live</span>
          </div>
        </div>
=======
                        <span className={`text-xs font-bold tracking-wider \${
                          row.dept === 'F&A' ? 'text-blue-600' :
                          row.dept === 'HR' ? 'text-purple-600' :
                          row.dept === 'SCM' ? 'text-amber-600' :
                          'text-emerald-600'
                        }`}>{row.dept}</span>
                      </td>
                      <td className="py-5 px-6 text-slate-600 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full \${
                          row.type === 'Transactional' ? 'bg-blue-500' :
                          row.type === 'Functional' ? 'bg-amber-500' : 'bg-green-500'
                        }`}></div>
                        {row.type}
                      </td>
                      <td className="py-5 px-6 text-center font-extrabold text-corporateBlue">{row.fte}</td>
                      <td className="py-5 px-6 font-extrabold text-slate-900">{row.score}</td>
                      <td className="py-5 px-6">
                         <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold tracking-widest \${
                           row.consolidate === 'YES' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                         }`}>
                           {row.consolidate}
                         </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
             </table>
           </div>
           
           {/* Pagination footer (Visual Only) */}
           <div className="px-6 py-4 flex items-center justify-between text-xs text-slate-500 font-medium">
             <p>Showing 4 of 124 processes</p>
             <div className="flex gap-1 font-bold">
               <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50">&lt;</button>
               <button className="w-8 h-8 flex items-center justify-center rounded bg-corporateBlue text-white shadow-sm">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 text-slate-600">2</button>
               <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-50 text-slate-600">3</button>
               <button className="w-8 h-8 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-50">&gt;</button>
             </div>
           </div>
        </div>

>>>>>>> target/main
      </div>
    </div>
  );
}
<<<<<<< HEAD

function MetricCard({ label, value, accent }: { label: string; value: string; accent: "blue" | "indigo" | "slate" | "amber" }) {
  const accentMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    indigo: "bg-indigo-50 text-indigo-600",
    slate: "bg-slate-100 text-slate-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-4 ${accentMap[accent]}`}>
        <ArrowUpRight size={14} />
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
    </div>
  );
}

function MaturityBar({ label, pct, tone }: { label: string; pct: number; tone: "blue" | "amber" | "green" }) {
  const barColor = tone === "blue" ? "bg-blue-400" : tone === "amber" ? "bg-amber-400" : "bg-green-400";
  const safePct = Math.max(0, Math.min(100, safeNumber(pct)));

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-blue-200 mb-2">
        <span>{label}</span>
        <span className="text-white">{safePct.toFixed(0)}%</span>
      </div>
      <div className="h-1.5 w-full bg-blue-900/50 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${safePct}%` }}></div>
      </div>
    </div>
  );
}

function ChartEmptyState({ text }: { text: string }) {
  return <div className="h-full w-full grid place-items-center text-sm text-slate-500">{text}</div>;
}
=======
>>>>>>> target/main

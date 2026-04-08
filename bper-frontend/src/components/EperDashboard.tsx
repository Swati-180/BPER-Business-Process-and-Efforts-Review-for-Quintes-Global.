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
                className={`bg-white rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow ${card.isHighlight ? "border-corporateBlue/20 bg-gradient-to-br from-corporateBlue-dark to-blue-700" : "border-slate-200"}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${card.isHighlight ? "bg-white/20" : card.color}`}>
                  <Icon size={18} className={card.isHighlight ? "text-white" : ""} />
                </div>
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${card.isHighlight ? "text-blue-200" : "text-slate-500"}`}>{card.label}</p>
                <p className={`text-2xl font-extrabold leading-tight ${card.isHighlight ? "text-white" : "text-slate-900"}`}>{card.value}</p>
                <p className={`text-xs font-medium mt-1 ${card.isWarning ? "text-amber-600" : card.isHighlight ? "text-blue-200" : "text-slate-400"}`}>{card.change}</p>
              </div>
            );
          })}
        </div>

        {/* ROW 2 — Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FTE by Tower */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">FTE Distribution by Tower</h3>
                <p className="text-xs text-slate-500 mt-0.5">Workforce allocation across primary service units</p>
              </div>
            </div>
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
            </div>
          </div>

          {/* Submission Status Donut */}
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
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }}></div>
                    <span className="text-slate-600 font-medium">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 3 — Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top 5 Activities */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900">Top 5 Activities by FTE</h3>
              <Activity size={16} className="text-slate-400" />
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                  <th className="py-3 px-5 text-left">Activity Name</th>
                  <th className="py-3 px-3 text-left">Tower</th>
                  <th className="py-3 px-3 text-center">FTE</th>
                  <th className="py-3 px-3 text-center">Consolidate?</th>
                </tr>
              </thead>
              <tbody>
                <tr><td colSpan={4} className="py-8 text-center text-slate-400 text-xs">Full activity list available in Deep Reports</td></tr>
              </tbody>
            </table>
          </div>

          {/* Team Utilization */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900">Team Utilization Overview</h3>
              <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">Weekly Avg</span>
            </div>
            <div className="space-y-4">
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
            </div>
            <button className="text-xs text-corporateBlue font-bold mt-5 hover:text-corporateBlue-dark transition-colors flex items-center gap-1">
              View Full Team Breakdown <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* ROW 4 — Consolidation Summary */}
        <div className="bg-corporateBlue-dark rounded-xl p-7 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative">
            <div className="flex-1">
              <p className="text-[10px] font-extrabold text-blue-300 tracking-widest uppercase mb-2">✦ Platform Insights</p>
              <h2 className="text-3xl font-extrabold mb-2">Consolidation Summary</h2>
              <p className="text-blue-200/80 text-sm max-w-lg leading-relaxed">
                Based on current data trends, the platform identifies significant optimization opportunities through process centralization and automation.
              </p>
            </div>
            <div className="flex gap-8 shrink-0">
              <div>
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-1">Total Activities</p>
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
            >
              View Full Report <ArrowUpRight size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

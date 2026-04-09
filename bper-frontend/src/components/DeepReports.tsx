<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
=======
import { useState } from "react";
>>>>>>> target/main
import { Download } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
<<<<<<< HEAD
import { apiGet } from "../api/http";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";
import { mapBackendStatusToUnified, StatusBadge } from "./StatusBadge";

interface FteSummaryRow {
  department: string;
  tower: string;
  process: string;
  activity: string;
  currentFTE: number;
  consolidate: boolean;
  totalScore: number;
}

interface UtilizationRow {
  employee: string;
  department: string;
  hoursLogged: number;
  standardHours: number;
  utilizationPct: number;
  overtimeHours: number;
  status: string;
}

interface FitmentSummary {
  counts: Record<string, number>;
  scores: Array<{
    employee?: { name?: string; department?: { name?: string } };
    weightedScore: number;
    remark: string;
  }>;
}

interface FteConsolidationSummary {
  estimatedSavedFTE: number;
  estimatedAnnualSaving: number;
}
=======

// REMOVED ALL HARDCODED DATA - API DRIVEN
// FTE_BY_DEPT, FTE_BY_TOWER, etc → useDashboardSummary() from reports.ts
>>>>>>> target/main

const REMARK_COLORS: Record<string, string> = {
  "Fit": "bg-green-100 text-green-700",
  "Train to Fit": "bg-amber-100 text-amber-700",
  "Low Fit": "bg-orange-100 text-orange-700",
  "Unfit": "bg-red-100 text-red-700",
};

function utilizationColor(pct: number) {
  if (pct < 60) return "text-red-600 bg-red-50";
  if (pct > 90) return "text-amber-600 bg-amber-50";
  return "text-green-600 bg-green-50";
}

function exportCSV(data: object[], filename: string) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [headers.join(","), ...data.map(row => Object.values(row).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
}

<<<<<<< HEAD
export function DeepReports() {
  const [activeTab, setActiveTab] = useState(0);
  const [fteSummary, setFteSummary] = useState<FteSummaryRow[]>([]);
  const [utilizationData, setUtilizationData] = useState<UtilizationRow[]>([]);
  const [fitmentSummary, setFitmentSummary] = useState<FitmentSummary>({ counts: {}, scores: [] });
  const [consolidationSummary, setConsolidationSummary] = useState<FteConsolidationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const TABS = ["FTE Analysis", "Utilization Report", "Consolidation Report", "Fitment Summary"];

  useEffect(() => {
    const load = async () => {
      try {
        const [fteRes, utilRes, fitmentRes, consolidationRes] = await Promise.all([
          apiGet<FteSummaryRow[]>("/eper/reports/fte-summary"),
          apiGet<UtilizationRow[]>("/eper/reports/utilization"),
          apiGet<FitmentSummary>("/eper/reports/fitment-summary"),
          apiGet<FteConsolidationSummary>("/eper/reports/fte-consolidation-summary"),
        ]);
        setFteSummary(fteRes);
        setUtilizationData(utilRes);
        setFitmentSummary(fitmentRes);
        setConsolidationSummary(consolidationRes);
      } catch {
        setError("Unable to load deep reports.");
        setFteSummary([]);
        setUtilizationData([]);
        setFitmentSummary({ counts: {}, scores: [] });
        setConsolidationSummary(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const fteByDept = useMemo(() => {
    const byDept = new Map<string, number>();
    fteSummary.forEach((row) => {
      byDept.set(row.department || "Unknown", (byDept.get(row.department || "Unknown") || 0) + (row.currentFTE || 0));
    });
    return Array.from(byDept.entries()).map(([name, fte]) => ({ name, fte: Number(fte.toFixed(2)) }));
  }, [fteSummary]);

  const fteByTower = useMemo(() => {
    const byTower = new Map<string, number>();
    fteSummary.forEach((row) => {
      byTower.set(row.tower || "Unknown", (byTower.get(row.tower || "Unknown") || 0) + (row.currentFTE || 0));
    });
    return Array.from(byTower.entries()).map(([name, fte]) => ({ name, fte: Number(fte.toFixed(2)) }));
  }, [fteSummary]);

  const fteActivities = useMemo(() => {
    return fteSummary.map((row) => ({
      dept: row.department,
      tower: row.tower,
      process: row.process,
      activity: row.activity,
      employees: 0,
      fte: row.currentFTE,
      consolidate: row.consolidate,
    }));
  }, [fteSummary]);

  const consolidationData = useMemo(() => {
    return fteSummary.map((row) => ({
      activity: row.activity || "Unknown",
      tower: row.tower || "Unknown",
      score: row.totalScore || 0,
      consolidate: row.consolidate,
      fte: row.currentFTE || 0,
      saving: row.consolidate ? (row.currentFTE || 0) * 0.6 : 0,
    }));
  }, [fteSummary]);

  const fitmentData = useMemo(() => {
    return fitmentSummary.scores.map((row) => ({
      name: row.employee?.name || "Unknown",
      dept: row.employee?.department?.name || "Unknown",
      score: row.weightedScore || 0,
      remark: row.remark,
    }));
  }, [fitmentSummary]);

  if (loading) {
    return <LoadingState title="Loading deep reports" message="Fetching report datasets and preparing tabs." />;
  }

  if (error) {
    return <ErrorFallbackState title="Deep reports unavailable" message={error} />;
  }

  if (fteSummary.length === 0 && utilizationData.length === 0 && fitmentData.length === 0) {
    return <EmptyState title="No report data" message="No report records are available for this view." />;
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col overflow-auto">
=======
import { useQuery } from '@tanstack/react-query';
import { useDashboardSummary } from '../queries/reports';

export function DeepReports() {
  const [activeTab, setActiveTab] = useState(0);
  const TABS = ["FTE Analysis", "Utilization Report", "Consolidation Report", "Fitment Summary"];
  const { data: reportsData } = useDashboardSummary();

  const FTE_BY_DEPT = reportsData?.fteByDept || [];
  const FTE_BY_TOWER = reportsData?.fteByTower || [];
  // ... similar for other datasets

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col">
>>>>>>> target/main
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Deep Reports</h1>
          <p className="text-xs text-slate-500 mt-0.5">Multi-dimensional workforce analytics and intelligence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 px-8 flex gap-0">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`py-3.5 px-5 text-sm font-bold border-b-2 transition-colors ${activeTab === i ? "border-corporateBlue text-corporateBlue" : "border-transparent text-slate-400 hover:text-slate-700"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-8 max-w-[1200px] mx-auto w-full">

        {/* TAB 1 — FTE Analysis */}
        {activeTab === 0 && (
          <div className="space-y-6">
            <div className="flex justify-end">
<<<<<<< HEAD
              <button onClick={() => exportCSV(fteActivities, "fte_analysis.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
=======
              <button onClick={() => exportCSV(FTE_ACTIVITIES, "fte_analysis.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
>>>>>>> target/main
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dept chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4">FTE by Department</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
<<<<<<< HEAD
                    <BarChart data={fteByDept} margin={{ left: -20 }}>
=======
                    <BarChart data={FTE_BY_DEPT} margin={{ left: -20 }}>
>>>>>>> target/main
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                      <Bar dataKey="fte" fill="#185FA5" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Tower chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="font-bold text-slate-900 mb-4">FTE by Tower</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
<<<<<<< HEAD
                    <BarChart data={fteByTower} layout="vertical" margin={{ left: 10 }}>
=======
                    <BarChart data={FTE_BY_TOWER} layout="vertical" margin={{ left: 10 }}>
>>>>>>> target/main
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} axisLine={false} tickLine={false} width={110} />
                      <Tooltip contentStyle={{ borderRadius: 8, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,.1)" }} />
                      <Bar dataKey="fte" fill="#2A7CC7" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            {/* FTE Activity table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100"><h3 className="font-bold text-slate-900">FTE by Activity</h3></div>
              <div className="overflow-x-auto">
<<<<<<< HEAD
                <table className="w-full min-w-[980px] text-sm">
=======
                <table className="w-full text-sm">
>>>>>>> target/main
                  <thead>
                    <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                      {["Department", "Tower", "Process", "Activity", "Employees", "Total FTE", "Consolidate?"].map(h => (
                        <th key={h} className="py-3 px-4 text-left">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
<<<<<<< HEAD
                    {fteActivities.map((row, i) => (
=======
                    {FTE_ACTIVITIES.map((row, i) => (
>>>>>>> target/main
                      <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                        <td className="py-3 px-4 text-xs font-semibold text-slate-700">{row.dept}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{row.tower}</td>
                        <td className="py-3 px-4 text-xs text-slate-500">{row.process}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-800">{row.activity}</td>
                        <td className="py-3 px-4 text-xs text-center text-slate-600">{row.employees}</td>
                        <td className="py-3 px-4 text-xs text-center font-extrabold text-corporateBlue">{row.fte}</td>
                        <td className="py-3 px-4 text-center">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${row.consolidate ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{row.consolidate ? "YES" : "NO"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Utilization Report */}
        {activeTab === 1 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-sm text-slate-500">Color-coded: <span className="text-red-600 font-bold">&lt;60% Underutilized</span> · <span className="text-green-600 font-bold">60–90% Optimal</span> · <span className="text-amber-600 font-bold">&gt;90% Overloaded</span></p>
<<<<<<< HEAD
              <button onClick={() => exportCSV(utilizationData, "utilization_report.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[960px] text-sm">
=======
              <button onClick={() => exportCSV(UTILIZATION_DATA, "utilization_report.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
>>>>>>> target/main
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                    {["Name", "Department", "Hours Logged", "Standard Hours", "Utilization %", "Overtime", "Status"].map(h => (
                      <th key={h} className="py-3 px-5 text-left">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {utilizationData.map((row, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="py-4 px-5 font-bold text-slate-900">{row.employee}</td>
                      <td className="py-4 px-5 text-slate-500">{row.department}</td>
                      <td className="py-4 px-5 font-semibold">{row.hoursLogged}</td>
                      <td className="py-4 px-5 text-slate-400">{row.standardHours}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${utilizationColor(row.utilizationPct)}`}>{row.utilizationPct.toFixed(1)}%</span>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{row.overtimeHours}h</td>
                      <td className="py-4 px-5">
                        <StatusBadge status={mapBackendStatusToUnified(row.status)} />
=======
                  {UTILIZATION_DATA.map((row, i) => (
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="py-4 px-5 font-bold text-slate-900">{row.name}</td>
                      <td className="py-4 px-5 text-slate-500">{row.dept}</td>
                      <td className="py-4 px-5 font-semibold">{row.hoursLogged}</td>
                      <td className="py-4 px-5 text-slate-400">{row.standardHours}</td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${utilizationColor(row.pct)}`}>{row.pct.toFixed(1)}%</span>
                      </td>
                      <td className="py-4 px-5 text-slate-500">{row.overtime}h</td>
                      <td className="py-4 px-5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${row.status === "approved" ? "bg-green-100 text-green-700" : row.status === "submitted" ? "bg-blue-100 text-blue-700" : row.status === "under_review" ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{row.status.replace("_", " ")}</span>
>>>>>>> target/main
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3 — Consolidation Report */}
        {activeTab === 2 && (
          <div className="space-y-6">
            <div className="flex justify-end">
<<<<<<< HEAD
              <button onClick={() => exportCSV(consolidationData, "consolidation_report.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
=======
              <button onClick={() => exportCSV(CONSOLIDATION_DATA, "consolidation_report.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
>>>>>>> target/main
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< HEAD
                {[
                  { label: "Total Activities", value: consolidationData.length, color: "text-slate-900" },
                  { label: "Consolidatable", value: consolidationData.filter(r => r.consolidate).length, color: "text-green-600" },
                  { label: "FTE Savings Est.", value: (consolidationSummary?.estimatedSavedFTE || 0).toFixed(2), color: "text-corporateBlue" },
                { label: "Annual Saving", value: `₹${((consolidationSummary?.estimatedAnnualSaving || 0) / 10000000).toFixed(2)}Cr`, color: "text-emerald-600" },
=======
              {[
                { label: "Total Activities", value: CONSOLIDATION_DATA.length, color: "text-slate-900" },
                { label: "Consolidatable", value: CONSOLIDATION_DATA.filter(r => r.consolidate).length, color: "text-green-600" },
                { label: "FTE Savings Est.", value: CONSOLIDATION_DATA.reduce((s, r) => s + r.saving, 0).toFixed(1), color: "text-corporateBlue" },
                { label: "Annual Saving", value: "₹3.1Cr", color: "text-emerald-600" },
>>>>>>> target/main
              ].map(card => (
                <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                  <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">{card.label}</p>
                  <p className={`text-2xl font-extrabold ${card.color}`}>{card.value}</p>
                </div>
              ))}
            </div>
<<<<<<< HEAD
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
=======
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
>>>>>>> target/main
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                    {["Activity", "Tower", "Score", "Consolidate", "FTE", "Potential Saving (FTE)"].map(h => <th key={h} className="py-3 px-5 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {consolidationData.map((row, i) => (
=======
                  {CONSOLIDATION_DATA.map((row, i) => (
>>>>>>> target/main
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="py-4 px-5 font-semibold text-slate-800">{row.activity}</td>
                      <td className="py-4 px-5 text-slate-500">{row.tower}</td>
                      <td className="py-4 px-5 font-extrabold text-slate-900">{row.score}<span className="text-slate-300 font-normal">/12</span></td>
                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${row.consolidate ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>{row.consolidate ? "YES" : "NO"}</span>
                      </td>
                      <td className="py-4 px-5 font-bold text-corporateBlue">{row.fte}</td>
                      <td className="py-4 px-5 font-bold text-green-600">{row.saving > 0 ? row.saving.toFixed(1) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4 — Fitment Summary */}
        {activeTab === 3 && (
          <div className="space-y-6">
            <div className="flex justify-end">
<<<<<<< HEAD
              <button onClick={() => exportCSV(fitmentData, "fitment_summary.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
=======
              <button onClick={() => exportCSV(FITMENT_DATA, "fitment_summary.csv")} className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold py-2 px-4 rounded-lg hover:bg-slate-50 shadow-sm">
>>>>>>> target/main
                <Download size={15} /> Export CSV
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
<<<<<<< HEAD
                {[
                  { label: "Fit", value: fitmentSummary.counts["Fit"] || 0, cls: "border-green-200 bg-green-50 text-green-700" },
                  { label: "Train to Fit", value: fitmentSummary.counts["Train to Fit"] || 0, cls: "border-amber-200 bg-amber-50 text-amber-700" },
                  { label: "Unfit", value: fitmentSummary.counts["Unfit"] || 0, cls: "border-red-200 bg-red-50 text-red-700" },
                  { label: "Not Scored", value: fitmentSummary.counts["Not Scored"] || 0, cls: "border-slate-200 bg-slate-50 text-slate-600" },
=======
              {[
                { label: "Fit", value: FITMENT_DATA.filter(r => r.remark === "Fit").length, cls: "border-green-200 bg-green-50 text-green-700" },
                { label: "Train to Fit", value: FITMENT_DATA.filter(r => r.remark === "Train to Fit").length, cls: "border-amber-200 bg-amber-50 text-amber-700" },
                { label: "Unfit", value: FITMENT_DATA.filter(r => r.remark === "Unfit").length, cls: "border-red-200 bg-red-50 text-red-700" },
                { label: "Not Scored", value: 0, cls: "border-slate-200 bg-slate-50 text-slate-600" },
>>>>>>> target/main
              ].map(card => (
                <div key={card.label} className={`rounded-xl border shadow-sm p-5 ${card.cls}`}>
                  <p className="text-[10px] font-extrabold tracking-widest uppercase mb-1">{card.label}</p>
                  <p className="text-3xl font-extrabold">{card.value}</p>
                </div>
              ))}
            </div>
<<<<<<< HEAD
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
              <table className="w-full min-w-[920px] text-sm">
=======
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
>>>>>>> target/main
                <thead>
                  <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase">
                    {["Name", "Department", "Weighted Score", "Remark"].map(h => <th key={h} className="py-3 px-5 text-left">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
<<<<<<< HEAD
                  {fitmentData.map((row, i) => (
=======
                  {FITMENT_DATA.map((row, i) => (
>>>>>>> target/main
                    <tr key={i} className="border-t border-slate-50 hover:bg-slate-50/50">
                      <td className="py-4 px-5 font-bold text-slate-900">{row.name}</td>
                      <td className="py-4 px-5 text-slate-500">{row.dept}</td>
                      <td className="py-4 px-5 font-extrabold text-corporateBlue">{row.score}</td>
                      <td className="py-4 px-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold ${REMARK_COLORS[row.remark] || "bg-slate-100 text-slate-500"}`}>{row.remark.toUpperCase()}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

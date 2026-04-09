<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Search, Save, RotateCcw } from "lucide-react";
import { apiGet, apiPost } from "../api/http";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";
=======
import { useState } from "react";
import { Search, Save, RotateCcw } from "lucide-react";
>>>>>>> target/main

type Remark = "Fit" | "Train to Fit" | "Low Fit" | "Unfit" | "Not Scored";

interface Employee {
  id: string;
  name: string;
  initials: string;
  department: string;
  grade: string;
  remark?: Remark;
}

<<<<<<< HEAD
=======
const EMPLOYEES: Employee[] = [
  { id: "e1", name: "Jameson D.", initials: "JD", department: "Operations", grade: "L3", remark: "Fit" },
  { id: "e2", name: "Amara K.", initials: "AK", department: "Finance", grade: "L5", remark: "Train to Fit" },
  { id: "e3", name: "Ricardo V.", initials: "RV", department: "Technology", grade: "L4", remark: "Unfit" },
  { id: "e4", name: "Sarah L.", initials: "SL", department: "Operations", grade: "L2", remark: undefined },
  { id: "e5", name: "Marcus P.", initials: "MP", department: "Finance", grade: "L3", remark: "Fit" },
];

>>>>>>> target/main
interface Param {
  key: string;
  label: string;
  description: string;
  weightage: number;
  options: { label: string; value: number }[];
}

const PARAMS: Param[] = [
  { key: "pmsRating", label: "PMS Rating", description: "Last annual performance rating score.", weightage: 0.05,
    options: [{ label: "Outstanding (20)", value: 20 }, { label: "Exceeds Expectations (15)", value: 15 }, { label: "Meets Expectations (10)", value: 10 }, { label: "Below Expectations (5)", value: 5 }] },
  { key: "complexityOfWork", label: "Complexity of Work", description: "Nature and difficulty of current role activities.", weightage: 0.10,
    options: [{ label: "Very High – Strategic (20)", value: 20 }, { label: "High – Analytical (15)", value: 15 }, { label: "Medium – Procedural (10)", value: 10 }, { label: "Low – Transactional (5)", value: 5 }] },
  { key: "changeReadiness", label: "Change Readiness", description: "Ability to adapt to organizational changes.", weightage: 0.10,
    options: [{ label: "Highly Adaptable (20)", value: 20 }, { label: "Adaptable (15)", value: 15 }, { label: "Somewhat Adaptable (10)", value: 10 }, { label: "Resistant (5)", value: 5 }] },
  { key: "serviceOrientation", label: "Service & Customer Orientation", description: "Focus on client satisfaction and service quality.", weightage: 0.10,
    options: [{ label: "Exceptional (20)", value: 20 }, { label: "Strong (15)", value: 15 }, { label: "Moderate (10)", value: 10 }, { label: "Low (5)", value: 5 }] },
  { key: "teamPlayer", label: "Team Player & Collaboration", description: "Ability to work cooperatively with peers.", weightage: 0.08,
    options: [{ label: "Highly Collaborative (20)", value: 20 }, { label: "Collaborative (15)", value: 15 }, { label: "Independent (10)", value: 10 }, { label: "Non-collaborative (5)", value: 5 }] },
  { key: "locationPreference", label: "Location Preference", description: "Flexibility on work location or relocation.", weightage: 0.05,
    options: [{ label: "Fully Flexible (20)", value: 20 }, { label: "Flexible with conditions (15)", value: 15 }, { label: "Prefers current location (10)", value: 10 }, { label: "Not willing to relocate (5)", value: 5 }] },
  { key: "qualifications", label: "Additional Qualifications", description: "Certifications, degrees beyond base requirement.", weightage: 0.09,
    options: [{ label: "Multiple Advanced (20)", value: 20 }, { label: "One Advanced (15)", value: 15 }, { label: "Basic Certification (10)", value: 10 }, { label: "None (5)", value: 5 }] },
  { key: "expCurrentRole", label: "Experience in Current Role", description: "Number of years in present function.", weightage: 0.10,
    options: [{ label: "> 5 Years (20)", value: 20 }, { label: "3–5 Years (15)", value: 15 }, { label: "1–3 Years (10)", value: 10 }, { label: "< 1 Year (5)", value: 5 }] },
  { key: "totalExperience", label: "Total Work Experience", description: "Overall career tenure across all roles.", weightage: 0.06,
    options: [{ label: "> 15 Years (20)", value: 20 }, { label: "8–15 Years (15)", value: 15 }, { label: "3–8 Years (10)", value: 10 }, { label: "< 3 Years (5)", value: 5 }] },
  { key: "currentCtc", label: "Current CTC", description: "Current cost-to-company relative to band.", weightage: 0.05,
    options: [{ label: "Above Band – Strategic hire (20)", value: 20 }, { label: "Within Band (15)", value: 15 }, { label: "Below Band (10)", value: 10 }, { label: "Significantly Below (5)", value: 5 }] },
  { key: "multiplexer", label: "Multiplexer", description: "Ability to handle multiple roles or functions.", weightage: 0.07,
    options: [{ label: "Handles 3+ roles (20)", value: 20 }, { label: "Handles 2 roles (15)", value: 15 }, { label: "Single role capable (10)", value: 10 }, { label: "Specialized only (5)", value: 5 }] },
  { key: "communicativeness", label: "Communicativeness", description: "Clarity and effectiveness of communication.", weightage: 0.07,
    options: [{ label: "Executive level (20)", value: 20 }, { label: "Strong (15)", value: 15 }, { label: "Moderate (10)", value: 10 }, { label: "Needs development (5)", value: 5 }] },
  { key: "selfMotivated", label: "Self Motivated", description: "Initiative and drive without external prompting.", weightage: 0.08,
    options: [{ label: "Highly self-driven (20)", value: 20 }, { label: "Proactive (15)", value: 15 }, { label: "Responds when prompted (10)", value: 10 }, { label: "Requires supervision (5)", value: 5 }] },
];

function getRemark(score: number): { remark: Remark; color: string; bg: string } {
  if (score < 10) return { remark: "Unfit", color: "text-red-700", bg: "bg-red-100" };
  if (score < 14) return { remark: "Low Fit", color: "text-orange-700", bg: "bg-orange-100" };
  if (score < 17) return { remark: "Train to Fit", color: "text-amber-700", bg: "bg-amber-100" };
  return { remark: "Fit", color: "text-green-700", bg: "bg-green-100" };
}

const REMARK_BADGE: Record<string, string> = {
  "Fit": "bg-green-100 text-green-700",
  "Train to Fit": "bg-amber-100 text-amber-700",
  "Low Fit": "bg-orange-100 text-orange-700",
  "Unfit": "bg-red-100 text-red-700",
};

export function FitmentScoring() {
<<<<<<< HEAD
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<Array<{
          employee?: { _id: string; name: string; grade?: string; department?: { name?: string } | string };
          remark?: Remark;
        }>>("/eper/fitment/team");

        const mapped = data
          .filter((row) => row.employee?._id)
          .map((row) => {
            const name = row.employee?.name || "Unknown";
            return {
              id: row.employee?._id || "",
              name,
              initials: name.split(" ").map((part) => part[0] || "").join("").slice(0, 2).toUpperCase() || "NA",
              department: typeof row.employee?.department === "string" ? row.employee?.department : row.employee?.department?.name || "Unknown",
              grade: row.employee?.grade || "",
              remark: row.remark,
            };
          });

        setEmployees(mapped);
        setSelectedEmp(mapped[0] || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load fitment team data.");
        setEmployees([]);
        setSelectedEmp(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filteredEmps = useMemo(
    () => employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase())),
    [employees, search]
  );
=======
  const [selectedEmp, setSelectedEmp] = useState<Employee>(EMPLOYEES[0]);
  const [search, setSearch] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState(false);

  const filteredEmps = EMPLOYEES.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.department.toLowerCase().includes(search.toLowerCase()));
>>>>>>> target/main

  const weightedScore = PARAMS.reduce((sum, p) => sum + (scores[p.key] || 0) * p.weightage, 0);
  const maxPossible = 20.0;
  const { remark, color, bg } = getRemark(weightedScore);
  const progressPct = Math.min(100, (weightedScore / maxPossible) * 100);

  const handleClear = () => setScores({});
<<<<<<< HEAD
  const handleSave = async () => {
    if (!selectedEmp) return;
    const parameters = PARAMS.reduce((acc, param) => ({ ...acc, [param.key]: scores[param.key] || 0 }), {});
    await apiPost("/eper/fitment/score", { employeeId: selectedEmp.id, parameters });
=======
  const handleSave = () => {
>>>>>>> target/main
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

<<<<<<< HEAD
  if (loading) {
    return <LoadingState title="Loading fitment scoring" message="Fetching team members for fitment assessment." />;
  }

  if (error) {
    return <ErrorFallbackState title="Fitment scoring unavailable" message={error} />;
  }

  if (!selectedEmp) {
    return <EmptyState title="No fitment team data" message="There are no team members available for fitment scoring." />;
  }

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col overflow-auto">
=======
  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col">
>>>>>>> target/main
      {/* Top */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Fitment Assessment</h1>
          <p className="text-xs text-slate-500 mt-0.5">Personnel evaluation for high-performance alignment.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-corporateBlue-dark text-white flex items-center justify-center text-xs font-bold">MS</div>
          <span className="text-sm font-semibold text-slate-700">Marcus Sterling</span>
        </div>
      </div>

<<<<<<< HEAD
      <div className="flex flex-1 overflow-auto">
=======
      <div className="flex flex-1 overflow-hidden">
>>>>>>> target/main
        {/* LEFT — Employee Selector */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-slate-100">
            <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-3">Active Selection</p>
            {/* Selected Employee Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-corporateBlue text-white flex items-center justify-center text-sm font-extrabold">{selectedEmp.initials}</div>
                <div>
                  <p className="font-extrabold text-slate-900 text-sm">{selectedEmp.name}</p>
                  <p className="text-xs text-blue-600 font-semibold">{selectedEmp.department}</p>
                </div>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <span>GRADE: <span className="text-slate-800">{selectedEmp.grade}</span></span>
              </div>
            </div>

            {/* Search */}
            <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">Recently Scored</p>
            <div className="relative mb-3">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 w-full bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:border-corporateBlue" />
            </div>
          </div>

          {/* Employee list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {filteredEmps.map(emp => (
              <button key={emp.id} onClick={() => { setSelectedEmp(emp); setScores({}); }}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${selectedEmp.id === emp.id ? "bg-blue-50 border border-blue-200" : "hover:bg-slate-50 border border-transparent"}`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{emp.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{emp.name}</p>
                  <p className="text-[10px] text-slate-400">{emp.department} · {emp.grade}</p>
                </div>
                {emp.remark && (
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full whitespace-nowrap ${REMARK_BADGE[emp.remark] || "bg-slate-100 text-slate-500"}`}>{emp.remark.toUpperCase()}</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — Scoring Form */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 max-w-3xl mx-auto pb-32">
            {/* Live Score Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 flex items-center gap-6">
              <div className="flex-1">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-1">Live Assessment Score</p>
                <p className="text-4xl font-extrabold text-corporateBlue-dark">{weightedScore.toFixed(1)} <span className="text-lg text-slate-400 font-semibold">/ {maxPossible.toFixed(1)} max</span></p>
                <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${remark === "Fit" ? "bg-green-500" : remark === "Train to Fit" ? "bg-amber-500" : remark === "Low Fit" ? "bg-orange-500" : "bg-red-500"}`}
                    style={{ width: `${progressPct}%` }}
                  ></div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">Status Indicator</p>
                <span className={`px-5 py-2 rounded-lg font-extrabold text-sm ${bg} ${color}`}>{remark.toUpperCase()}</span>
              </div>
            </div>

            {/* Parameter grid */}
            <h3 className="text-sm font-extrabold text-slate-700 tracking-widest uppercase mb-4">Performance Alignment Matrix</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {PARAMS.map(p => (
                <div key={p.key} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-slate-900">{p.label}</p>
                    <span className="text-[10px] text-slate-400 font-bold">W: {(p.weightage * 100).toFixed(0)}%</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">{p.description}</p>
                  <div className="flex items-center gap-3">
                    <select
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      value={scores[p.key] || ""}
                      onChange={e => setScores({ ...scores, [p.key]: Number(e.target.value) })}
                    >
                      <option value="">Select...</option>
                      {p.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    {scores[p.key] ? (
                      <div className="text-center w-10">
                        <p className="text-base font-extrabold text-corporateBlue">{scores[p.key]}</p>
                        <p className="text-[9px] text-slate-400">PTS</p>
                      </div>
                    ) : (
                      <div className="w-10 text-center text-slate-300 text-lg">—</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Qualitative Remarks */}
            <div className="mt-5 bg-white rounded-xl border border-slate-200 p-5">
              <label className="text-xs font-bold text-slate-600 block mb-2">Qualitative Remarks & Context</label>
              <textarea className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue resize-none h-20 placeholder-slate-300" placeholder="Provide supporting evidence for scoring decisions..." />
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-slate-200 px-8 py-3.5 z-10 flex justify-between items-center">
            <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">ePER Platform · The Sovereign Ledger · Institutional Control</p>
            <div className="flex gap-3">
              <button onClick={handleClear} className="text-slate-600 text-sm font-bold py-2.5 px-5 rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                <RotateCcw size={14} /> Clear Form
              </button>
              <button onClick={handleSave} className={`text-white text-sm font-bold py-2.5 px-6 rounded-lg shadow-sm flex items-center gap-2 transition-all ${saved ? "bg-green-600" : "bg-corporateBlue hover:bg-corporateBlue-dark"}`}>
                <Save size={14} /> {saved ? "Saved!" : "Save Score"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

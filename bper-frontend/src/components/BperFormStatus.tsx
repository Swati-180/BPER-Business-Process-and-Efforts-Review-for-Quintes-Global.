<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, PencilLine, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api/http";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";

interface MySubmission {
  _id: string;
  submittedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  status: "draft" | "submitted" | "under_review" | "returned_for_revision" | "approved";
  revisionNote?: string;
}

type TimelineState = "done" | "current" | "pending";

type TimelineStep = {
  key: string;
  label: string;
  dateText: string;
  state: TimelineState;
};

type CompactStatusMeta = {
  label: string;
  dotClass: string;
  progressClass: string;
  progressPct: number;
};

export function BperFormStatus() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [query, setQuery] = useState("");
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<MySubmission[]>("/eper/wdt/my-submissions");
        setSubmissions(data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load form status.");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return submissions;

    return submissions.filter((row) => {
      const formId = formatFormId(row._id).toLowerCase();
      const status = formatStatus(row.status).toLowerCase();
      const comments = (row.revisionNote || "").toLowerCase();
      const date = formatDate(row.submittedAt || row.createdAt || row.updatedAt).toLowerCase();
      return formId.includes(q) || status.includes(q) || comments.includes(q) || date.includes(q);
    });
  }, [submissions, query]);

  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedSubmissionId("");
      return;
    }

    const selectedStillVisible = filtered.some((row) => row._id === selectedSubmissionId);
    if (!selectedStillVisible) {
      setSelectedSubmissionId(filtered[0]._id);
    }
  }, [filtered, selectedSubmissionId]);

  const selectedSubmission = useMemo(() => {
    if (!filtered.length) return null;
    return filtered.find((row) => row._id === selectedSubmissionId) || filtered[0];
  }, [filtered, selectedSubmissionId]);

  const timeline = useMemo(() => buildTimeline(selectedSubmission), [selectedSubmission]);
  const actionableCount = submissions.filter((row) => row.status === "draft" || row.status === "returned_for_revision").length;

  if (loading) {
    return <LoadingState title="Loading form status" message="Fetching your submission timeline." />;
  }

  if (error) {
    return <ErrorFallbackState title="Could not load status" message={error} />;
  }

  if (submissions.length === 0) {
    return (
      <EmptyState
        title="No submissions yet"
        message="You haven't submitted any forms for this period yet. Start your first BPER form to see tracking, timeline, and revision history."
      />
    );
  }

  return (
    <div className="min-h-full bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 pb-12">
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[24px] font-bold text-slate-900 tracking-tight">BPER Form Status</h1>
              {actionableCount > 0 && (
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700">
                  <AlertTriangle size={14} className="text-amber-600" />
                  {actionableCount} form{actionableCount === 1 ? "" : "s"} require{actionableCount === 1 ? "s" : ""} attention
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-1">Track the selected submission, review its timeline, and act on any requested changes.</p>
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Click a row to update the timeline</p>
        </div>

        <section className="bg-white border border-slate-200 rounded-lg p-4 md:p-5 mb-4 shadow-none">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-slate-500">Timeline Reference</h2>
              <p className="text-xs text-slate-500 mt-1">This reflects the currently selected record.</p>
            </div>
            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {selectedSubmission ? formatFormId(selectedSubmission._id) : "No record selected"}
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row md:items-start">
            {timeline.map((step, index) => (
              <div key={step.key} className="flex-1 flex flex-col md:flex-row md:items-start gap-2 md:gap-3">
                <div className="flex md:flex-col items-center md:items-center gap-2 md:gap-0 shrink-0">
                  <div
                    className={`relative h-4 w-4 rounded-full border-2 ${step.state === "done" ? "bg-corporateBlue border-corporateBlue" : step.state === "current" ? "bg-white border-corporateBlue" : "bg-white border-slate-300"}`}
                  >
                    {step.state === "current" && <span className="absolute inset-[-4px] rounded-full border border-corporateBlue/40 animate-pulse" aria-hidden="true" />}
                  </div>
                  {index < timeline.length - 1 && <div className="md:hidden h-6 w-px bg-slate-200" aria-hidden="true" />}
                </div>

                <div className="min-w-0 pb-4 md:pb-0 md:pr-4">
                  <p className={`text-sm font-semibold ${step.state === "current" ? "text-slate-900" : "text-slate-700"}`}>{step.label}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{step.dateText}</p>
                </div>

                {index < timeline.length - 1 && <div className="hidden md:block flex-1 h-px bg-slate-200 mt-2.5" aria-hidden="true" />}
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-lg shadow-none overflow-hidden">
          <div className="px-4 md:px-6 py-4 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Submission Records</h2>
              <p className="text-sm text-slate-500">Reference ID, status, progress, comments, and the next action.</p>
            </div>
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search records"
                className="w-full pl-10 pr-3 py-2.5 rounded-md border border-slate-200 bg-white text-sm outline-none focus:border-corporateBlue"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[14px] font-semibold text-slate-500">
                  <th className="py-3 px-4 md:px-6">Reference ID</th>
                  <th className="py-3 px-4 md:px-6">Date</th>
                  <th className="py-3 px-4 md:px-6">Status</th>
                  <th className="py-3 px-4 md:px-6">Progress</th>
                  <th className="py-3 px-4 md:px-6">Comments</th>
                  <th className="py-3 px-4 md:px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const isSelected = row._id === selectedSubmission?._id;
                  const statusMeta = getCompactStatus(row.status);
                  const isActionable = row.status === "draft" || row.status === "returned_for_revision";

                  return (
                    <tr
                      key={row._id}
                      className={`border-b border-slate-200 last:border-0 cursor-pointer transition-colors ${isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"}`}
                      onClick={() => setSelectedSubmissionId(row._id)}
                      role="button"
                      tabIndex={0}
                      aria-selected={isSelected}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedSubmissionId(row._id);
                        }
                      }}
                    >
                      <td className="py-3 px-4 md:px-6 font-medium text-blue-700">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedSubmissionId(row._id);
                          }}
                          className="hover:underline"
                        >
                          {formatFormId(row._id)}
                        </button>
                      </td>
                      <td className="py-3 px-4 md:px-6 text-[13px] text-slate-700">{formatDate(row.submittedAt || row.createdAt || row.updatedAt)}</td>
                      <td className="py-3 px-4 md:px-6">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
                          <span className={`h-2 w-2 rounded-full ${statusMeta.dotClass}`} />
                          <span>{statusMeta.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 md:px-6">
                        <div className="w-28">
                          <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
                            <div className={`h-full rounded-full ${statusMeta.progressClass}`} style={{ width: `${statusMeta.progressPct}%` }} />
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">{statusMeta.progressPct}%</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 md:px-6 text-[13px] text-slate-600">{row.revisionNote?.trim() || <span className="text-slate-400">No comments yet</span>}</td>
                      <td className="py-3 px-4 md:px-6 text-right">
                        {isActionable ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              navigate("/form", { state: { resumeSubmissionId: row._id } });
                            }}
                            className="text-sm font-semibold text-corporateBlue hover:text-corporateBlue-dark inline-flex items-center gap-2"
                          >
                            Review & Edit <PencilLine size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedSubmissionId(row._id);
                            }}
                            className="text-sm font-semibold text-slate-500 hover:text-corporateBlue"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">No submissions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
=======
import { Search, Bell, HelpCircle, Info, Filter, MoreVertical, Download, Eye, HelpCircle as HelpIcon, BookOpen, Plus, Check } from "lucide-react";

export function BperFormStatus() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen overflow-hidden relative font-sans">
      
      {/* Top Navbar */}
      <div className="h-20 bg-white px-8 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-12">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">BPER Platform</h1>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="pl-10 pr-4 py-2 w-full bg-slate-100 border-none rounded-full text-sm text-slate-700 outline-none focus:ring-2 focus:ring-corporateBlue/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="flex text-sm font-semibold gap-8 h-20 items-end">
             <button className="text-corporateBlue border-b-2 border-corporateBlue pb-6">Employee Portal</button>
             <button className="text-slate-400 hover:text-slate-600 transition-colors pb-6">Admin Console</button>
          </div>
          
          <div className="flex items-center gap-4 text-slate-500 border-l border-slate-200 pl-6">
            <button className="hover:text-slate-800 transition-colors relative">
              <div className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 border border-white"></div>
              <Bell size={18} />
            </button>
            <button className="hover:text-slate-800 transition-colors">
              <HelpCircle size={18} />
            </button>
            <div className="flex items-center gap-3 pl-2 ml-4 border-l border-slate-100">
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900 leading-tight">Sarah Jenkins</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Senior Analyst</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
                <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah&backgroundColor=f1f5f9" alt="Sarah Profile" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 max-w-6xl mx-auto w-full overflow-y-auto">
        
        {/* Header */}
        <div className="mb-10 w-3/4">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">BPER Form Status</h2>
          <p className="text-slate-600">Track the real-time progress of your Business Process & Efforts Review submissions. Our automated sovereign ledger ensures precision in workforce intelligence.</p>
        </div>

        {/* Progress Tracker Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-10 mb-12 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1 bg-corporateBlue"></div>
          
          <div className="flex justify-between items-center mb-10 w-5/6 mx-auto relative pt-4">
             {/* Background Line */}
             <div className="absolute top-6 left-10 right-10 h-0.5 bg-slate-100 z-0"></div>
             
             {/* Step 1: Submitted */}
             <div className="relative z-10 flex flex-col items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-corporateBlue text-white flex items-center justify-center shadow-md">
                 <Check strokeWidth={3} size={20} />
               </div>
               <div className="text-center">
                 <p className="text-sm font-bold text-slate-900 mb-0.5">Submitted</p>
                 <p className="text-[10px] font-bold text-slate-500 text-center uppercase tracking-widest">Oct 12, 2025</p>
               </div>
             </div>

             {/* Step 2: Under Review */}
             <div className="relative z-10 flex flex-col items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-white border-[3px] border-corporateBlue flex items-center justify-center shadow-md shadow-blue-100">
                 <div className="w-3 h-3 rounded-full bg-corporateBlue"></div>
               </div>
               <div className="text-center">
                 <p className="text-sm font-bold text-corporateBlue mb-0.5">Under Review</p>
                 <p className="text-[10px] font-bold text-corporateBlue uppercase tracking-widest">IN PROGRESS</p>
               </div>
             </div>

             {/* Step 3: End state placeholders */}
             <div className="relative z-10 flex flex-col items-center gap-3 lg:flex-row lg:items-start lg:gap-8 bg-white px-4">
               <div className="flex flex-col items-center gap-3 opacity-40">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                 </div>
                 <p className="text-sm font-bold text-slate-400">Approved</p>
               </div>
               <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest self-center pt-2">OR</div>
               <div className="flex flex-col items-center gap-3 opacity-40">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-200 flex items-center justify-center">
                   <div className="w-3 h-3 rounded-full bg-slate-200"></div>
                 </div>
                 <p className="text-sm font-bold text-slate-400">Returned</p>
               </div>
             </div>
          </div>

          <div className="bg-slate-50/80 rounded-lg p-5 flex items-start gap-4 border border-slate-100 mx-auto w-11/12 shadow-inner">
            <div className="bg-blue-100 text-corporateBlue p-1.5 rounded-full mt-0.5 shrink-0">
              <Info size={16} strokeWidth={3} />
            </div>
            <div>
              <p className="text-sm font-extrabold text-corporateBlue-dark mb-1">Current Progress</p>
              <p className="text-sm text-slate-600">Your submission for <span className="font-bold text-slate-800">Q3 2025</span> is currently being audited by the Central Operations Team. Feedback is expected within 48 business hours.</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="mb-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Form Submission History</h3>
              <p className="text-sm text-slate-500">A consolidated log of all past and current BPER submissions.</p>
            </div>
            <button className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2">
              <Filter size={16} /> Filter View
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-slate-50">
                    <th className="py-4 px-6 w-1/6">FORM ID</th>
                    <th className="py-4 px-6 w-32">PERIOD</th>
                    <th className="py-4 px-6 w-32">SUBMITTED DATE</th>
                    <th className="py-4 px-6 w-40">STATUS</th>
                    <th className="py-4 px-6 w-1/3">REVIEWER COMMENTS</th>
                    <th className="py-4 px-6 text-right w-32">ACTION</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {/* Row 1 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-6 px-6 font-bold text-corporateBlue text-sm">#BPER-<br/>2026-<br/>Q1-882</td>
                    <td className="py-6 px-6 text-slate-900 font-bold">Q1<br/>2026</td>
                    <td className="py-6 px-6 text-slate-500">Oct 12,<br/>2025</td>
                    <td className="py-6 px-6">
                      <span className="bg-[#fcf3e3] text-amber-800 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-[#f5dab0] uppercase tracking-widest whitespace-nowrap shadow-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full mr-2"></span>UNDER<br/>REVIEW
                      </span>
                    </td>
                    <td className="py-6 px-6 text-slate-500 italic">Initial review started by Regional Ops...</td>
                    <td className="py-6 px-6 text-right">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors p-2">
                        <MoreVertical size={20} />
                      </button>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-6 px-6 font-bold text-corporateBlue text-sm">#BPER-<br/>2025-<br/>Q4-712</td>
                    <td className="py-6 px-6 text-slate-900 font-bold">Q4<br/>2025</td>
                    <td className="py-6 px-6 text-slate-500">Jul 20,<br/>2025</td>
                    <td className="py-6 px-6">
                      <span className="bg-red-50 text-red-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-red-200 uppercase tracking-widest whitespace-nowrap shadow-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></span>RETURNED
                      </span>
                    </td>
                    <td className="py-6 px-6 text-slate-700 font-medium leading-relaxed">Section 3.2 data mismatch. Please re-verify the efficiency ratios for the APAC sector.</td>
                    <td className="py-6 px-6 text-right">
                      <button className="bg-red-700 hover:bg-red-800 text-white text-xs font-bold py-2 px-4 rounded shadow-sm transition-colors border border-red-800">
                        Revise
                      </button>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="py-6 px-6 font-bold text-corporateBlue text-sm">#BPER-<br/>2025-<br/>Q3-441</td>
                    <td className="py-6 px-6 text-slate-900 font-bold">Q3<br/>2025</td>
                    <td className="py-6 px-6 text-slate-500">Apr 15,<br/>2025</td>
                    <td className="py-6 px-6">
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-emerald-200 uppercase tracking-widest whitespace-nowrap shadow-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>APPROVED
                      </span>
                    </td>
                    <td className="py-6 px-6 text-slate-700 font-medium">Compliance verified. Performance targets met.</td>
                    <td className="py-6 px-6 text-right">
                      <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded shadow-sm transition-colors flex items-center gap-1.5 ml-auto">
                        <Download size={14} /> PDF
                      </button>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="border-b border-white hover:bg-slate-50/50">
                    <td className="py-6 px-6 font-bold text-corporateBlue text-sm">#BPER-<br/>2025-<br/>Q2-109</td>
                    <td className="py-6 px-6 text-slate-900 font-bold">Q2<br/>2025</td>
                    <td className="py-6 px-6 text-slate-500">Jan 10,<br/>2025</td>
                    <td className="py-6 px-6">
                      <span className="bg-slate-100 text-slate-500 text-[10px] font-extrabold px-3 py-1.5 rounded-full border border-slate-200 uppercase tracking-widest whitespace-nowrap shadow-sm">
                        <span className="inline-block w-1.5 h-1.5 bg-corporateBlue rounded-full mr-2"></span>SUBMITTED
                      </span>
                    </td>
                    <td className="py-6 px-6 text-slate-400">—</td>
                    <td className="py-6 px-6 text-right">
                      <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold py-2 px-3 rounded shadow-sm transition-colors flex items-center gap-1.5 ml-auto">
                        <Eye size={14} /> View
                      </button>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 border-t border-slate-100 p-4 px-6 flex justify-between items-center text-xs font-bold text-slate-500">
              <p>Showing 4 of 12 historical submissions</p>
              <div className="flex gap-4">
                <button className="hover:text-corporateBlue transition-colors">Previous</button>
                <div className="flex gap-3">
                  <button className="text-corporateBlue font-extrabold">1</button>
                  <button className="hover:text-corporateBlue transition-colors">2</button>
                  <button className="hover:text-corporateBlue transition-colors">3</button>
                </div>
                <button className="hover:text-corporateBlue transition-colors">Next</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Card Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-blue-50 text-corporateBlue flex items-center justify-center mb-4">
                <HelpIcon size={20} strokeWidth={2.5} />
              </div>
              <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-2">Need Clarification?</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Contact your regional reviewer directly for detailed feedback on returned forms.
              </p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm flex flex-col justify-between">
            <div>
               <div className="w-10 h-10 rounded-full bg-blue-50 text-corporateBlue flex items-center justify-center mb-4">
                 <BookOpen size={20} strokeWidth={2.5} />
               </div>
               <h4 className="text-lg font-bold text-slate-900 tracking-tight mb-2">BPER Guidelines</h4>
               <p className="text-sm text-slate-600 leading-relaxed">
                 Review the latest 2026 workforce intelligence reporting standards in the portal docs.
               </p>
            </div>
          </div>

          <div className="bg-corporateBlue-dark rounded-xl p-8 shadow-lg flex justify-between items-center text-white border border-blue-900 border-opacity-50">
            <div>
              <h4 className="text-lg font-bold tracking-tight mb-2">New Submission</h4>
              <p className="text-sm font-medium text-blue-200/80 leading-relaxed w-3/4">
                Ready to submit for the next period?
              </p>
            </div>
            <button className="w-14 h-14 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-lg transition-colors border border-blue-400/30 flex-shrink-0 relative">
               <Plus size={24} strokeWidth={3} className="text-white relative z-10" />
            </button>
          </div>
        </div>

>>>>>>> target/main
      </div>
    </div>
  );
}
<<<<<<< HEAD

function buildTimeline(selectedSubmission: MySubmission | null): TimelineStep[] {
  const status = selectedSubmission?.status || "draft";
  const submittedAt = formatDate(selectedSubmission?.submittedAt || selectedSubmission?.createdAt || selectedSubmission?.updatedAt);
  const reviewAt = status === "under_review" || status === "returned_for_revision" || status === "approved"
    ? formatDate(selectedSubmission?.updatedAt || selectedSubmission?.submittedAt || selectedSubmission?.createdAt)
    : "Pending";
  const decisionAt = status === "approved" || status === "returned_for_revision"
    ? formatDate(selectedSubmission?.updatedAt || selectedSubmission?.submittedAt || selectedSubmission?.createdAt)
    : "Pending";

  return [
    {
      key: "submitted",
      label: "Submitted",
      dateText: submittedAt,
      state: status === "draft" ? "current" : "done",
    },
    {
      key: "review",
      label: "Under Review",
      dateText: reviewAt,
      state: status === "under_review" ? "current" : status === "returned_for_revision" || status === "approved" ? "done" : status === "submitted" ? "current" : "pending",
    },
    {
      key: "decision",
      label: "Final Decision",
      dateText: decisionAt,
      state: status === "approved" || status === "returned_for_revision" ? "current" : "pending",
    },
  ];
}

function getCompactStatus(status: MySubmission["status"] | string): CompactStatusMeta {
  if (status === "approved") {
    return { label: "Final Approval Granted", dotClass: "bg-emerald-500", progressClass: "bg-emerald-500", progressPct: 100 };
  }
  if (status === "returned_for_revision") {
    return { label: "Returned for Revision", dotClass: "bg-rose-500", progressClass: "bg-sky-500", progressPct: 85 };
  }
  if (status === "under_review") {
    return { label: "Under Review", dotClass: "bg-amber-500", progressClass: "bg-sky-500", progressPct: 70 };
  }
  if (status === "submitted") {
    return { label: "Submitted", dotClass: "bg-sky-500", progressClass: "bg-sky-500", progressPct: 55 };
  }
  return { label: "Draft", dotClass: "bg-slate-400", progressClass: "bg-slate-400", progressPct: 25 };
}

function formatStatus(status: MySubmission["status"]): string {
  if (status === "draft") return "Draft";
  if (status === "submitted") return "Submitted";
  if (status === "under_review") return "Under Review";
  if (status === "returned_for_revision") return "Returned for Revision";
  if (status === "approved") return "Final Approval Granted";
  return "Draft";
}

function formatDate(value?: string): string {
  if (!value) return "Pending";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Pending";
  return date.toLocaleDateString([], { year: "numeric", month: "short", day: "2-digit" });
}

function formatFormId(id: string): string {
  return `#${id.slice(-6).toUpperCase()}`;
}
=======
>>>>>>> target/main

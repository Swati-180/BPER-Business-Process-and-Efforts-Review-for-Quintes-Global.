import { useState, useEffect } from "react";
import { Flag, Check, ChevronRight, Bell, Download, Printer } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTeamSubmissions, useApproveSubmission, useReturnSubmission, useFlagActivities, useGrantEdit } from "../queries/form";
import toast from "react-hot-toast";

type SubmissionStatus = "draft" | "submitted" | "under_review" | "returned_for_revision" | "approved";

const STATUS_BADGE: Record<SubmissionStatus, { label: string; cls: string }> = {
  draft: { label: "DRAFT", cls: "bg-slate-100 text-slate-700 border border-slate-200" },
  under_review: { label: "UNDER REVIEW", cls: "bg-amber-100 text-amber-700 border border-amber-200" },
  submitted: { label: "SUBMITTED", cls: "bg-blue-100 text-blue-700 border border-blue-200" },
  returned_for_revision: { label: "RETURNED", cls: "bg-red-100 text-red-700 border border-red-200" },
  approved: { label: "APPROVED", cls: "bg-green-100 text-green-700 border border-green-200" }
};

export function WdtReview() {
  const { user } = useAuth();
  const { data: teamSubmissions, isLoading } = useTeamSubmissions();
  
  const approveMutation = useApproveSubmission();
  const returnMutation = useReturnSubmission();
  const flagMutation = useFlagActivities();
  const grantEditMutation = useGrantEdit();

  const [activeId, setActiveId] = useState<string>("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [flaggingIdx, setFlaggingIdx] = useState<number | null>(null);
  const [flagText, setFlagText] = useState("");

  const submissions = teamSubmissions || [];

  useEffect(() => {
    if (!activeId && submissions.length > 0) {
      setActiveId(submissions[0]._id);
    }
  }, [submissions, activeId]);

  const active = submissions.find((s: any) => s._id === activeId);
  const pendingEditRequests = active?.activities?.filter((a: any) => a.editPermissionRequested && !a.editPermissionGranted).length || 0;

  const handleApprove = () => {
    approveMutation.mutate(active._id, {
      onSuccess: () => {
        toast.success("Submission approved!");
        setShowApproveModal(false);
      }
    });
  };

  const handleReturn = () => {
    const reason = window.prompt("Reason for return:");
    if (reason) {
      returnMutation.mutate({ id: active._id, revisionNote: reason }, {
        onSuccess: () => toast.success("Returned for revision")
      });
    }
  };

  const handleSaveFlag = (idx: number) => {
    if (!flagText.trim()) return;
    flagMutation.mutate({ id: active._id, flags: [{ activityIndex: idx, flagComment: flagText }] }, {
      onSuccess: () => {
        setFlaggingIdx(null);
        setFlagText("");
        toast.success("Flag saved");
      }
    });
  };

  const handleGrantEdit = (idx: number, granted: boolean) => {
    grantEditMutation.mutate({ id: active._id, activityIndex: idx, granted }, {
      onSuccess: () => toast.success("Permission updated")
    });
  };

  const getInitials = (name: string) => name ? name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : '??';

  if (isLoading) return <div className="flex-1 min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium">Loading submissions...</div>;

  return (
    <div className="flex-1 bg-slate-50 min-h-screen flex flex-col">
      {/* Approve Confirmation Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-2">Approve Submission?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">This will mark <strong>{active?.employee?.name}</strong>'s WDT submission as approved. This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-50">Cancel</button>
              <button onClick={handleApprove} className="flex-1 bg-corporateBlue text-white font-bold py-3 rounded-xl hover:bg-corporateBlue-dark shadow-sm">Confirm Approve</button>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Review Queue</h1>
          <span className="text-xs text-slate-400 font-semibold">Global Operations Tower</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative text-slate-500 hover:text-slate-800">
            <Bell size={20} />
            {pendingEditRequests > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">{pendingEditRequests}</span>
            )}
          </button>
          <div className="w-9 h-9 rounded-full bg-corporateBlue-dark text-white flex items-center justify-center text-xs font-bold">{getInitials(user?.name || '')}</div>
          <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel — Queue */}
        <div className="w-72 bg-white border-r border-slate-200 flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="flex border-b border-slate-200 px-4 pt-3">
            <button className="flex-1 text-sm font-bold text-corporateBlue border-b-2 border-corporateBlue pb-2.5">
              Pending ({submissions.filter((s:any) => s.status !== "approved" && s.status !== "draft").length})
            </button>
            <button className="flex-1 text-sm font-medium text-slate-400 pb-2.5">History</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {submissions.map((sub: any) => (
              <button
                key={sub._id}
                onClick={() => setActiveId(sub._id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${activeId === sub._id ? "border-corporateBlue/30 bg-blue-50/40 shadow-sm" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shrink-0">{getInitials(sub.employee?.name)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{sub.employee?.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{sub.department?.name || "Corporate"}</p>
                  </div>
                  {(sub.status === "under_review" || sub.status === "submitted") && <ChevronRight size={16} className="text-corporateBlue shrink-0" />}
                </div>
                <div className={`inline-flex items-center gap-1.5 text-[9px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-widest ${STATUS_BADGE[sub.status as SubmissionStatus]?.cls}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                  {STATUS_BADGE[sub.status as SubmissionStatus]?.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel — Detail */}
        <div className="flex-1 overflow-y-auto">
          {active ? (
          <>
          <div className="p-8 max-w-3xl mx-auto pb-32">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-corporateBlue">WDT Detailed Analysis</h2>
                <p className="text-sm text-slate-500 mt-0.5">Employee: {active.employee?.name} · {active.month} {active.year}</p>
              </div>
              <div className="flex gap-2">
                <button className="border border-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-50"><Printer size={16} /></button>
                <button className="border border-slate-200 text-slate-500 p-2 rounded-lg hover:bg-slate-50"><Download size={16} /></button>
              </div>
            </div>

            {/* Edit requests banner */}
            {pendingEditRequests > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-5 flex items-center gap-3 text-sm">
                <Bell size={16} className="text-amber-600 shrink-0" />
                <span className="font-semibold text-amber-800">{pendingEditRequests} edit request{pendingEditRequests > 1 ? "s" : ""} pending review — see rows below.</span>
              </div>
            )}

            {/* Activity rows */}
            <div className="space-y-4">
              {active.activities?.map((act: any, idx: number) => (
                <div key={idx} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${act.flaggedForRevision ? "border-red-200" : "border-slate-200"}`}>
                  <div className="px-5 py-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-extrabold text-corporateBlue mb-1">{act.activity?.name || "Custom Activity"}</p>
                      <p className="text-sm text-slate-600 leading-relaxed">{act.customName || "No description provided."}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-lg font-extrabold text-slate-900">{Number(act.hours).toFixed(1)}</span>
                      {act.flaggedForRevision ? (
                        <span className="w-8 h-8 flex items-center justify-center text-red-500"><Flag size={18} fill="currentColor" /></span>
                      ) : (
                        <button
                          onClick={() => { setFlaggingIdx(idx); setFlagText(""); }}
                          className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-red-400 transition-colors"
                        >
                          <Flag size={18} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Edit permission request */}
                  {act.editPermissionRequested && !act.editPermissionGranted && (
                    <div className="bg-amber-50 border-t border-amber-200 px-5 py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-[10px] font-extrabold text-amber-700 tracking-widest uppercase mb-0.5">Edit Permission Requested</p>
                        <p className="text-xs text-slate-600">Reason: {act.editPermissionReason}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleGrantEdit(idx, false)} className="text-xs font-bold text-slate-600 border border-slate-300 py-1.5 px-3 rounded-lg hover:bg-slate-50">Deny</button>
                        <button onClick={() => handleGrantEdit(idx, true)} className="text-xs font-bold text-white bg-corporateBlue-dark py-1.5 px-3 rounded-lg hover:bg-corporateBlue">Grant Edit Access</button>
                      </div>
                    </div>
                  )}
                  {act.editPermissionGranted && (
                    <div className="bg-green-50 border-t border-green-200 px-5 py-2">
                      <p className="text-xs font-bold text-green-700">✓ Edit access granted for this row.</p>
                    </div>
                  )}

                  {/* Flag form */}
                  {flaggingIdx === idx && (
                    <div className="bg-red-50 border-t border-red-200 p-5">
                      <p className="text-[10px] font-extrabold text-red-700 tracking-widest uppercase mb-2">Supervisor Revision Request</p>
                      <textarea
                        className="w-full bg-white border border-red-200 rounded-lg p-3 text-sm text-slate-700 outline-none focus:border-red-400 resize-none h-20"
                        placeholder="Please clarify if this coordination included the weekend surge shift..."
                        value={flagText}
                        onChange={e => setFlagText(e.target.value)}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button onClick={() => setFlaggingIdx(null)} className="text-xs font-bold text-slate-500 hover:text-slate-700">Discard</button>
                        <button onClick={() => handleSaveFlag(idx)} className="text-xs font-bold bg-red-600 text-white py-1.5 px-4 rounded-lg hover:bg-red-700">Save Flag</button>
                      </div>
                    </div>
                  )}

                  {/* Existing flag comment */}
                  {act.flaggedForRevision && act.flagComment && flaggingIdx !== idx && (
                    <div className="bg-red-50 border-t border-red-200 px-5 py-3">
                      <p className="text-[10px] font-extrabold text-red-700 tracking-widest uppercase mb-1">Flagged</p>
                      <p className="text-xs text-slate-600">{act.flagComment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Self-Assessment */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-slate-200 p-5">
                <p className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-2">Self-Assessment Narrative</p>
                <p className="text-sm text-slate-600 leading-relaxed">{active.selfNarrative}</p>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 mb-2">📎</div>
                <p className="text-xs text-slate-400">No additional documents attached.</p>
              </div>
            </div>
          </div>

          {/* Sticky Footer */}
          <div className="fixed bottom-0 right-0 left-72 bg-white border-t border-slate-200 px-8 py-4 z-10">
            <div className="flex items-center justify-between max-w-3xl mx-auto">
              <div className="flex gap-8 text-xs">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">Total Hours</p>
                  <p className="text-xl font-extrabold text-slate-900">
                    {(active.activities?.reduce((acc: number, a: any) => acc + (a.hours || 0), 0) || 0).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">Flags Raised</p>
                  <p className="text-xl font-extrabold text-red-600">
                    {active.activities?.filter((a: any) => a.flaggedForRevision)?.length?.toString().padStart(2, '0') || '00'}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="grid grid-cols-4 gap-4 text-center mr-6 border-r border-slate-200 pr-6">
                  {[["AVG TURNAROUND", "14.2 Hours"], ["SUBMISSION RATE", "92%"], ["FLAG FREQUENCY", "0.8"], ["TEAM COMPLIANCE", "Level 4"]].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[8px] font-extrabold text-slate-400 tracking-widest uppercase">{label}</p>
                      <p className={`text-sm font-extrabold ${label === "FLAG FREQUENCY" ? "text-red-600" : label === "TEAM COMPLIANCE" ? "text-green-600" : "text-slate-900"}`}>{val}</p>
                    </div>
                  ))}
                </div>
                {["submitted", "under_review"].includes(active.status) && (
                  <>
                    <button onClick={handleReturn} className="border border-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl hover:bg-slate-50 text-sm">
                      Return for Revision
                    </button>
                    <button onClick={() => setShowApproveModal(true)} className="bg-corporateBlue-dark hover:bg-corporateBlue text-white font-bold py-3 px-6 rounded-xl shadow-sm text-sm flex items-center gap-2">
                      <Check size={16} /> Approve Submission
                    </button>
                  </>
                )}
                {active.status === "approved" && (
                  <span className="bg-green-100 text-green-700 font-bold py-3 px-6 rounded-xl text-sm flex items-center gap-2">
                    <Check size={16} /> Approved
                  </span>
                )}
              </div>
            </div>
          </div>
          </>
          ) : (
             <div className="p-8 text-center text-slate-500 mt-20">Select a submission from the queue to review.</div>
          )}
        </div>
      </div>
    </div>
  );
}

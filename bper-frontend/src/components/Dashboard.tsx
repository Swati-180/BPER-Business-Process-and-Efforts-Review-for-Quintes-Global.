<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { 
  ClipboardList, 
  ArrowRight, 
  PencilLine,
  BookOpenCheck,
  HelpCircle,
  LineChart,
  ExternalLink 
} from "lucide-react";
import { apiGet } from "../api/http";
import type { SubmissionWindow } from "../types/submissionWindow";
import { formatCountdown } from "../types/submissionWindow";
import { Link, useLocation } from "react-router-dom";
import { ErrorFallbackState, LoadingState } from "./PageStates";
import { useAuth } from "../auth/AuthProvider";

interface MySubmission {
  _id: string;
  month: number;
  year: number;
  status: string;
  submittedAt?: string;
  updatedAt?: string;
  totalHoursLogged?: number;
}

type DashboardLifecycle = "not_started" | "in_progress" | "submitted" | "returned" | "approved";

function mapToLifecycle(status?: string): DashboardLifecycle {
  if (!status) return "not_started";
  if (status === "approved") return "approved";
  if (status === "submitted") return "submitted";
  if (status === "returned_for_revision") return "returned";
  return "in_progress";
}

function statusMeta(status: DashboardLifecycle): { label: string; badgeClass: string; progress: number; actionable: boolean } {
  if (status === "approved") {
    return { label: "Approved", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300", progress: 100, actionable: false };
  }
  if (status === "submitted") {
    return { label: "Submitted", badgeClass: "bg-blue-100 text-blue-900 border-blue-300", progress: 90, actionable: false };
  }
  if (status === "returned") {
    return { label: "Returned", badgeClass: "bg-rose-100 text-rose-800 border-rose-300", progress: 70, actionable: true };
  }
  if (status === "in_progress") {
    return { label: "In Progress", badgeClass: "bg-blue-100 text-blue-900 border-blue-300", progress: 60, actionable: true };
  }
  return { label: "Not Started", badgeClass: "bg-slate-100 text-slate-800 border-slate-300", progress: 0, actionable: true };
}

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const [submissions, setSubmissions] = useState<MySubmission[]>([]);
  const [submissionWindow, setSubmissionWindow] = useState<SubmissionWindow | null>(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string>("");
  const [remainingMs, setRemainingMs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const recordId = useMemo(() => new URLSearchParams(location.search).get("record"), [location.search]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiGet<MySubmission[]>("/eper/wdt/my");
        setSubmissions(data.slice(0, 5));
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load dashboard activity.");
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  useEffect(() => {
    const loadWindow = async () => {
      try {
        const data = await apiGet<SubmissionWindow>("/admin/submission-window");
        setSubmissionWindow(data);
        setRemainingMs(data.remainingMs);
      } catch {
        setSubmissionWindow(null);
        setRemainingMs(0);
      }
    };

    void loadWindow();
  }, []);

  useEffect(() => {
    if (!submissionWindow?.isOpen) return;
    const timer = window.setInterval(() => {
      setRemainingMs((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [submissionWindow?.isOpen]);

  useEffect(() => {
    if (!recordId) return;
    const matched = submissions.find((item) => item._id === recordId);
    if (matched) {
      setSelectedSubmissionId(matched._id);
    }
  }, [recordId, submissions]);

  const countdown = formatCountdown(remainingMs);
  const deadlineText = submissionWindow?.closeAt
    ? new Date(submissionWindow.closeAt).toLocaleDateString([], {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
    : "Not configured";
  const latest = submissions[0];
  const lifecycle = mapToLifecycle(latest?.status);
  const lifecycleMeta = statusMeta(lifecycle);
  const isBehindSchedule = lifecycle === "not_started" && submissionWindow?.isOpen && countdown.days <= 2;
  const statusBadge = isBehindSchedule
    ? { label: "At Risk", badgeClass: "bg-amber-100 text-amber-900 border-amber-300", actionable: true }
    : lifecycleMeta;
  const isStarted = lifecycle !== "not_started";
  const periodText = latest ? `Month ${latest.month}, ${latest.year}` : "Current period";
  const ctaText = isStarted ? "Resume Form" : "Start Form";
  const lastSavedText = latest?.updatedAt || latest?.submittedAt ? formatRelativeTime(latest?.updatedAt || latest?.submittedAt) : "Not saved yet";
  const selectedSubmission = useMemo(
    () => submissions.find((item) => item._id === selectedSubmissionId) || latest || null,
    [submissions, selectedSubmissionId, latest]
  );

  const totalWindowMs = submissionWindow?.closeAt && submissionWindow?.openAt
    ? Math.max(1, new Date(submissionWindow.closeAt).getTime() - new Date(submissionWindow.openAt).getTime())
    : 1;
  const elapsedMs = submissionWindow?.closeAt ? Math.max(0, totalWindowMs - remainingMs) : 0;
  const progressPct = Math.min(100, Math.max(0, (elapsedMs / totalWindowMs) * 100));
  const ringRadius = 48;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference - (progressPct / 100) * ringCircumference;
  const totalWindowDays = Math.max(1, Math.ceil(totalWindowMs / (24 * 3600 * 1000)));
  const elapsedDays = Math.min(totalWindowDays, Math.floor(elapsedMs / (24 * 3600 * 1000)) + 1);

  const sparklineSeries = useMemo(() => {
    const values = submissions.slice(0, 7).reverse().map((item) => item.totalHoursLogged || 0);
    if (values.length < 3 || values.every((value) => value === 0)) {
      return null;
    }

    const max = Math.max(1, ...values);
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1 || 1)) * 100;
        const y = 32 - (value / max) * 24;
        return `${x},${y}`;
      })
      .join(" ");
  }, [submissions]);

  const placeholderSparkline = "0,20 16,16 32,18 48,14 64,17 80,13 100,16";

  const currentHours = latest?.totalHoursLogged || 0;
  const previousHours = submissions[1]?.totalHoursLogged || 0;
  const hourDeltaPct = previousHours > 0 ? ((currentHours - previousHours) / previousHours) * 100 : 0;

  const welcomeName = user?.name?.split(" ")?.[0] || "there";
  const openTone = submissionWindow?.isOpen
    ? `Hi ${welcomeName}, you're ${Math.round(progressPct)}% through this period. Just ${countdown.days} day${countdown.days === 1 ? "" : "s"} left to finalize your metrics.`
    : `Hi ${welcomeName}, the submission window is currently closed. You can still review previous cycles below.`;

  if (loading) {
    return <LoadingState title="Loading dashboard" message="Fetching latest submission activity." />;
  }

  if (error) {
    return <ErrorFallbackState title="Dashboard unavailable" message={error} />;
  }

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 pb-12 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-6">
        <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-1.5">
          Sovereign Ledger / Overview
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-[24px] sm:text-[24px] font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            Deadline: {deadlineText}
          </span>
        </div>
        <p className="text-slate-600 text-sm sm:text-base max-w-3xl leading-relaxed">
          {openTone}
=======
import { 
  ClipboardList, 
  ArrowRight, 
  Eye,
  HelpCircle,
  ExternalLink,
  Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useMySubmissions } from "../queries/form";
import { SubmissionTimer } from "./SubmissionTimer";
import { LoadingSpinner, ErrorState } from "./ui";

export function Dashboard() {
  const { data: submissions, isLoading, isError, refetch } = useMySubmissions();
  const navigate = useNavigate();

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const currentSubmission = submissions?.[0]; // Assuming ordered by latest
  const statusStr = currentSubmission?.status === 'submitted' ? 'Submitted' 
                  : currentSubmission?.status === 'under_review' ? 'Under Review'
                  : currentSubmission?.status === 'approved' ? 'Approved'
                  : currentSubmission?.status === 'returned_for_revision' ? 'Returned'
                  : 'Not Started';

  const isComplete = ['submitted', 'under_review', 'approved'].includes(currentSubmission?.status);

  return (
    <main className="flex-1 p-8 pb-12 max-w-6xl mx-auto w-full">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-2">
          Sovereign Ledger / Overview
        </p>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Dashboard
        </h1>
        <p className="text-slate-600 text-lg max-w-3xl leading-relaxed">
          Welcome back. Your current reporting cycle ends in two weeks. Ensure all 
          productivity metrics are documented before the deadline.
>>>>>>> target/main
        </p>
      </div>

      {/* Highlight Cards Row */}
<<<<<<< HEAD
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        {/* Status Card */}
        <div className="bg-white rounded-xl p-5 lg:p-6 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col min-h-[320px]">
          <div className="flex justify-between items-start mb-5">
            <span className={`inline-flex items-center text-[11px] font-bold px-3 py-1 rounded-md uppercase tracking-[0.14em] border ${statusBadge.badgeClass}`}>
              {statusBadge.label}
            </span>
            <div className="bg-slate-50 text-corporateBlue p-3 rounded-lg border border-slate-200">
              <ClipboardList size={22} strokeWidth={2} />
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1.5">BPER Form Status</h3>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400 mb-6">Current Period: {periodText}</p>
          
          <div className="mt-auto flex flex-col gap-4 items-start">
            <div className="w-full">
              <div className="text-3xl font-extrabold text-slate-900 leading-none mb-1.5">{isStarted ? "In Progress" : "Not Started"}</div>
              <p className="text-sm text-slate-500 max-w-none sm:max-w-[34ch]">
                {isStarted ? `Continue and finalize your current cycle submission. Last saved: ${lastSavedText}.` : isBehindSchedule ? "You are approaching the deadline without a draft saved." : "Required efforts are pending submission."}
              </p>
            </div>
            <Link
              to="/form"
              autoFocus
              className="w-full sm:w-auto shrink-0 bg-corporateBlue hover:bg-corporateBlue-light text-white font-medium py-3 px-5 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm whitespace-nowrap"
            >
              {ctaText}
              <ArrowRight size={18} strokeWidth={2} />
            </Link>
=======
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Status Card */}
        <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <span className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {statusStr}
            </span>
            <div className="bg-slate-50 text-corporateBlue p-3 rounded-lg shadow-sm border border-slate-100">
              <ClipboardList size={24} />
            </div>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-1">BPER Form Status</h3>
          <p className="text-sm text-slate-500 mb-8">Latest Entry</p>
          
          <div className="mt-auto flex items-end justify-between">
            <div>
              <div className="text-5xl font-extrabold text-slate-900 leading-none mb-2">{statusStr === 'Not Started' ? 'Draft' : 'Saved'}</div>
              <p className="text-sm text-slate-500">{isComplete ? 'Submission successfully recorded.' : 'Required efforts are pending submission.'}</p>
            </div>
            {!isComplete && (
              <button onClick={() => navigate('/wizard')} className="bg-corporateBlue hover:bg-corporateBlue-light text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                Start<br/>Form
                <ArrowRight size={18} />
              </button>
            )}
            {isComplete && (
               <button onClick={() => navigate('/bper-status')} className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
                View<br/>Status
                <ArrowRight size={18} />
              </button>
            )}
>>>>>>> target/main
          </div>
        </div>

        {/* Countdown Card */}
<<<<<<< HEAD
        <div className="bg-white rounded-xl p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[320px]">
          <h3 className="text-sm font-bold text-slate-700 tracking-widest uppercase mb-6">Submission Countdown</h3>

          <div className="relative w-32 h-32 mb-5 flex flex-col items-center justify-center">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90" aria-hidden="true">
              <circle cx="60" cy="60" r={ringRadius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
              <circle
                cx="60"
                cy="60"
                r={ringRadius}
                stroke="#1d4ed8"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-slate-900 leading-none font-mono">{countdown.days}</span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase mt-1">Days Left</span>
            </div>
          </div>

          <p className="text-sm font-semibold text-slate-700 mb-1">Day {elapsedDays} of {totalWindowDays}</p>
          <p className="text-xs text-slate-500">{countdown.hours}h {countdown.minutes}m remaining</p>
        </div>

        {/* Insights Card */}
        <div className="bg-white rounded-xl p-5 lg:p-6 shadow-sm text-slate-900 flex flex-col relative overflow-hidden min-h-[320px] border border-slate-200">
          <h3 className="text-sm font-bold text-corporateBlue tracking-widest uppercase mb-5 z-10 inline-flex items-center gap-2">
            <LineChart size={16} strokeWidth={2} /> My Insights
          </h3>

          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Hours logged this period</p>
            <p className="text-[28px] font-extrabold text-slate-900 font-mono leading-none mt-2">{currentHours.toFixed(1)}h</p>
            <p className={`text-xs font-semibold mt-2 ${hourDeltaPct >= 0 ? "text-emerald-700" : "text-amber-700"}`}>
              {previousHours > 0 ? `${hourDeltaPct >= 0 ? "+" : ""}${hourDeltaPct.toFixed(1)}% vs previous period` : "No prior period data yet"}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-3 mb-auto">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">Recent Trend</p>
            {sparklineSeries ? (
              <svg viewBox="0 0 100 40" className="w-full h-16" role="img" aria-label="Hours logged trend line">
                <polyline
                  fill="none"
                  stroke="#1d4ed8"
                  strokeWidth="2.2"
                  points={sparklineSeries}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <div>
                <svg viewBox="0 0 100 40" className="w-full h-16" aria-hidden="true">
                  <polyline
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="2"
                    points={placeholderSparkline}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="3 3"
                  />
                </svg>
                <p className="text-[11px] text-slate-500 mt-1">Complete 3 cycles to unlock trend analysis.</p>
              </div>
            )}
          </div>

          <Link to="/form-status" className="inline-flex items-center gap-2 text-corporateBlue font-semibold hover:text-corporateBlue-dark transition-colors z-10 group mt-5">
            View Full History
            <span className="transform group-hover:translate-x-1 transition-transform">
              <ArrowRight size={16} strokeWidth={2} />
            </span>
          </Link>
=======
        <SubmissionTimer />

        {/* Compliance Card */}
        <div className="bg-corporateBlue-dark rounded-xl p-8 shadow-md text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <h3 className="text-sm font-bold text-slate-300 tracking-widest uppercase mb-6 z-10">Compliance</h3>
          
          <p className="text-lg text-slate-200 font-medium leading-relaxed mb-auto z-10">
            View previous historical reports and benchmarks.
          </p>
          
          <a href="#" className="inline-flex items-center gap-2 text-white font-semibold hover:text-slate-300 transition-colors z-10 group">
            Access History 
            <span className="transform group-hover:translate-x-1 transition-transform">
              <ArrowRight size={16} />
            </span>
          </a>
>>>>>>> target/main
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-12">
<<<<<<< HEAD
        <div className="flex items-end justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1.5">Recent Activity</h2>
            <p className="text-slate-500 text-sm">Audit trail for your BPER submissions</p>
          </div>
          <Link to="/form-status" className="text-sm font-bold text-corporateBlue hover:text-corporateBlue-dark transition-colors">
            View Full Audit Log
          </Link>
        </div>

        <div className="w-full">
          {submissions.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
              <p className="text-slate-700 font-semibold mb-2">You haven't submitted any forms for {new Date().getFullYear()} yet.</p>
              <p className="text-slate-500 mb-4">Let's get started.</p>
              <Link to="/form" className="inline-flex items-center gap-2 bg-corporateBlue hover:bg-corporateBlue-light text-white font-medium py-2.5 px-4 rounded-lg transition-colors">
                Start Form <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[14px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 pb-3">Reference ID</th>
                  <th className="px-6 pb-3">Cycle Period</th>
                  <th className="px-6 pb-3">Status</th>
                  <th className="px-6 pb-3">Progress</th>
                  <th className="px-6 pb-3">Last Modified</th>
                  <th className="px-6 pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm text-slate-700">
                {submissions.map((row) => {
                  const rowStatus = mapToLifecycle(row.status);
                  const rowMeta = statusMeta(rowStatus);
                  return (
                    <tr key={row._id} className={`bg-white border border-slate-200 rounded-lg group ${row._id === selectedSubmission?._id ? "ring-1 ring-inset ring-blue-200" : ""}`}>
                      <td className="px-6 py-4 font-semibold rounded-l-lg">
                        <Link to={`/form-status?record=${row._id}`} className="text-blue-700 hover:text-blue-900 hover:underline">
                          #{row._id.slice(-6).toUpperCase()}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600">Month {row.month}, {row.year}</td>
                      <td className="px-6 py-4">
                        <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-700">
                          <span className={`h-2 w-2 rounded-full ${rowMeta.badgeClass.includes("emerald") ? "bg-emerald-500" : rowMeta.badgeClass.includes("rose") ? "bg-rose-500" : rowMeta.badgeClass.includes("blue") ? "bg-blue-500" : rowMeta.badgeClass.includes("amber") ? "bg-amber-500" : "bg-slate-400"}`} />
                          <span>{rowMeta.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 align-top">
                        <div className="w-28">
                          <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rowMeta.progress}%` }}></div>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1 leading-tight">{rowMeta.progress}% complete</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{row.submittedAt ? new Date(row.submittedAt).toLocaleDateString() : "-"}</td>
                      <td className="px-6 py-4 rounded-r-lg text-right">
                        <Link
                          to={rowMeta.actionable ? "/form" : "/form-status"}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200 bg-white px-3 py-1.5 rounded-md hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          {rowMeta.actionable ? "Review & Edit" : "View"}
                          {rowMeta.actionable ? <PencilLine size={14} /> : null}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
=======
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Recent Activity</h2>
            <p className="text-slate-500">Audit trail for your BPER submissions</p>
          </div>
          <a href="#" className="text-sm font-bold text-corporateBlue hover:text-corporateBlue-dark transition-colors">
            View Full Audit Log
          </a>
        </div>

        <div className="w-full">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                <th className="px-6 pb-3">Reference ID</th>
                <th className="px-6 pb-3">Cycle Period</th>
                <th className="px-6 pb-3">Status</th>
                <th className="px-6 pb-3">Last Modified</th>
                <th className="px-6 pb-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm text-slate-700">
              {submissions?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions?.map((sub: any) => (
                  <tr key={sub._id} className="bg-white shadow-sm border border-slate-100 rounded-lg group">
                    <td className="px-6 py-5 font-bold text-slate-900 rounded-l-lg">#{sub._id.slice(-6).toUpperCase()}</td>
                    <td className="px-6 py-5 text-slate-600">{sub.month} {sub.year}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                        {sub.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-slate-600">{new Date(sub.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-5 rounded-r-lg text-center">
                      <Link to={`/bper-status?id=${sub._id}`} className="text-slate-400 hover:text-corporateBlue transition-colors inline-block" title="View">
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
>>>>>>> target/main
        </div>
      </div>

      {/* Bottom Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
        <div className="bg-slate-50/80 rounded-xl p-8 border border-slate-200 flex gap-6 items-center flex-col sm:flex-row text-center sm:text-left transition-colors hover:bg-slate-50">
<<<<<<< HEAD
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-slate-200">
            <BookOpenCheck size={42} strokeWidth={2} className="text-corporateBlue" />
=======
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 shadow-inner flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/50 border border-slate-200/50">
            <div className="w-16 h-16 bg-white/60 shadow-sm border border-white/80 transform rotate-12 rounded backdrop-blur-sm -mb-8 mr-2"></div>
            <div className="w-12 h-20 bg-slate-100/80 shadow-md border border-white/80 absolute z-10 rounded backdrop-blur-md"></div>
>>>>>>> target/main
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 block">Guidance & Policy</h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Review the updated 2026 Business Process & Effort Reporting guidelines to ensure accurate data entry.
            </p>
<<<<<<< HEAD
            <Link to="/profile" className="inline-flex items-center gap-1.5 text-sm font-bold text-corporateBlue hover:text-corporateBlue-dark transition-colors">
              Read Policy <ExternalLink size={14} />
            </Link>
=======
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-bold text-corporateBlue hover:text-corporateBlue-dark transition-colors">
              Read Policy <ExternalLink size={14} />
            </a>
>>>>>>> target/main
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-8 border border-slate-200 flex gap-6 items-center flex-col sm:flex-row text-center sm:text-left transition-colors hover:bg-slate-50">
           <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-slate-100">
            <div className="w-12 h-12 bg-corporateBlue-dark rounded-full flex items-center justify-center text-white">
<<<<<<< HEAD
              <HelpCircle size={28} strokeWidth={2} />
=======
              <HelpCircle size={28} />
>>>>>>> target/main
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 block">Need Assistance?</h3>
            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Our support team is available 24/7 for technical queries regarding the BPER submission portal.
            </p>
            <button className="bg-white border text-sm border-slate-200 text-slate-700 font-bold py-2.5 px-6 rounded-md hover:bg-slate-50 transition-colors shadow-sm">
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
        <p>© 2026 QG TOOLS • INSTITUTIONAL INTERNAL SYSTEM</p>
        <div className="flex gap-6 mt-4 md:mt-0">
<<<<<<< HEAD
          <Link to="/profile" className="hover:text-slate-600 transition-colors">Privacy Policy</Link>
          <Link to="/form-status" className="hover:text-slate-600 transition-colors">System Status</Link>
=======
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">System Status</a>
>>>>>>> target/main
          <span>v2.4.1-Stable</span>
        </div>
      </div>
    </main>
  );
}
<<<<<<< HEAD

function formatRelativeTime(value?: string) {
  if (!value) return "Not saved yet";
  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "just now";

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
=======
>>>>>>> target/main

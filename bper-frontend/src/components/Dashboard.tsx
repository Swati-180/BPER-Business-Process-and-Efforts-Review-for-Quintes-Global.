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
        </p>
      </div>

      {/* Highlight Cards Row */}
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
          </div>
        </div>

        {/* Countdown Card */}
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
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-12">
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
        </div>
      </div>

      {/* Bottom Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-16">
        <div className="bg-slate-50/80 rounded-xl p-8 border border-slate-200 flex gap-6 items-center flex-col sm:flex-row text-center sm:text-left transition-colors hover:bg-slate-50">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 shadow-inner flex-shrink-0 flex items-center justify-center overflow-hidden bg-white/50 border border-slate-200/50">
            <div className="w-16 h-16 bg-white/60 shadow-sm border border-white/80 transform rotate-12 rounded backdrop-blur-sm -mb-8 mr-2"></div>
            <div className="w-12 h-20 bg-slate-100/80 shadow-md border border-white/80 absolute z-10 rounded backdrop-blur-md"></div>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-3 block">Guidance & Policy</h3>
            <p className="text-sm text-slate-600 mb-5 leading-relaxed">
              Review the updated 2026 Business Process & Effort Reporting guidelines to ensure accurate data entry.
            </p>
            <a href="#" className="inline-flex items-center gap-1.5 text-sm font-bold text-corporateBlue hover:text-corporateBlue-dark transition-colors">
              Read Policy <ExternalLink size={14} />
            </a>
          </div>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-8 border border-slate-200 flex gap-6 items-center flex-col sm:flex-row text-center sm:text-left transition-colors hover:bg-slate-50">
           <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-white shadow-sm flex-shrink-0 flex items-center justify-center border border-slate-100">
            <div className="w-12 h-12 bg-corporateBlue-dark rounded-full flex items-center justify-center text-white">
              <HelpCircle size={28} />
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
          <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-slate-600 transition-colors">System Status</a>
          <span>v2.4.1-Stable</span>
        </div>
      </div>
    </main>
  );
}

import { useSubmissionWindow } from '../queries/settings';

export function SubmissionTimer() {
  const { data, isLoading, isError } = useSubmissionWindow();

  if (isLoading || isError || !data) return null;

  const { isOpen, deadline } = data;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  if (!isOpen) {
    return (
      <div className="bg-white rounded-xl p-8 border border-red-200 shadow-sm flex flex-col items-center justify-center text-center">
        <h3 className="text-sm font-bold text-red-600 tracking-widest uppercase mb-4">Submissions Closed</h3>
        <p className="text-slate-600 text-sm mb-4">The submission window has ended.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
      <h3 className="text-sm font-bold text-amber-600 tracking-widest uppercase mb-8">Q1 2026 Countdown</h3>
      
      <div className="relative w-32 h-32 mb-6 flex flex-col items-center justify-center">
        <div className="absolute inset-0 border-4 border-amber-600 rounded-2xl rotate-45 transform scale-90 opacity-90 transition-transform hover:scale-100 duration-500"></div>
        <div className="absolute inset-0 bg-amber-50 rounded-2xl rotate-45 transform scale-[0.85] -z-10"></div>
        <span className="text-5xl font-extrabold text-slate-900 z-10 relative">{daysRemaining}</span>
      </div>
      
      <p className="text-2xl font-bold text-slate-900 mb-2">Days Remaining</p>
      <p className="text-sm text-slate-500">Submission Deadline:<br/>{deadlineDate.toLocaleDateString()}</p>
    </div>
  );
}

<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Send, Save, CheckCircle2, Info, Edit3, ArrowLeft } from "lucide-react";
import { apiGet } from "../../api/http";
=======
import { Send, Save, CheckCircle2, Info } from "lucide-react";
import { useFormContext } from "react-hook-form";
>>>>>>> target/main

interface StepProps {
  onPrev: () => void;
  onSubmit: () => void;
<<<<<<< HEAD
  onSaveDraft: () => void;
  onEditSection: (section: "core" | "support") => void;
  submitDisabled?: boolean;
}

export function Step3({ onPrev, onSubmit, onSaveDraft, onEditSection, submitDisabled = false }: StepProps) {
  const [activities, setActivities] = useState<Array<{ activity?: { name?: string }; customText?: string; totalHoursMonth?: number; isCustom?: boolean }>>([]);
  const [latestSubmissionId, setLatestSubmissionId] = useState<string>("");
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const submissions = await apiGet<Array<{ _id?: string; activities?: Array<{ activity?: { name?: string }; customText?: string; totalHoursMonth?: number; isCustom?: boolean }> }>>("/eper/wdt/my");
        setActivities(submissions[0]?.activities || []);
        setLatestSubmissionId(submissions[0]?._id || "");
      } catch {
        setActivities([]);
        setLatestSubmissionId("");
      }
    };

    void load();
  }, []);

  const totalHours = useMemo(() => activities.reduce((sum, row) => sum + (row.totalHoursMonth || 0), 0), [activities]);
  const totalFte = useMemo(() => totalHours / 160, [totalHours]);
  const coreActivities = useMemo(() => activities.filter((row) => !row.isCustom), [activities]);
  const supportActivities = useMemo(() => activities.filter((row) => row.isCustom), [activities]);
  const coreHours = useMemo(() => coreActivities.reduce((sum, row) => sum + (row.totalHoursMonth || 0), 0), [coreActivities]);
  const supportHours = useMemo(() => supportActivities.reduce((sum, row) => sum + (row.totalHoursMonth || 0), 0), [supportActivities]);
  const draftLabel = latestSubmissionId ? `#${latestSubmissionId.slice(-8).toUpperCase()}` : "-";

  return (
    <div className="bg-white rounded-b-md border-x border-b border-slate-200 shadow-sm font-sans flex flex-col min-h-[600px] relative">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex-1 p-8 sm:p-10 lg:border-r lg:border-slate-200">
          <div className="mb-8 max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500 mb-2">Audit summary</p>
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Comprehensive Summary</h2>
            <p className="text-sm text-slate-500 leading-relaxed">Review all process metrics before final submission to the ledger.</p>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 bg-slate-50 px-3 py-2 border-l-2 border-corporateBlue">
              <h3 className="text-[11px] font-semibold text-slate-700 tracking-[0.2em] uppercase">Core Activities</h3>
              <button
                onClick={() => onEditSection("core")}
                className="text-[11px] font-semibold text-corporateBlue hover:text-corporateBlue-dark inline-flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em] border-b border-slate-100">
                  <th className="pb-2">Sub-Process</th>
                  <th className="pb-2 text-right">FTE Count</th>
                  <th className="pb-2 text-right">Allocated Hours</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {coreActivities.slice(0, 5).map((row, idx) => (
                  <tr key={`${row.activity?.name || row.customText || "row"}-${idx}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 text-slate-700 font-medium">{row.activity?.name || row.customText || "Activity"}</td>
                    <td className="py-2.5 text-right text-slate-500 tabular-nums">-</td>
                    <td className="py-2.5 text-right font-medium text-slate-900 tabular-nums">{Number(row.totalHoursMonth || 0).toFixed(1)}</td>
                  </tr>
                ))}
                {coreActivities.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">No core activities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-3 bg-slate-50 px-3 py-2 border-l-2 border-slate-400">
              <h3 className="text-[11px] font-semibold text-slate-700 tracking-[0.2em] uppercase">Support Activities</h3>
              <button
                onClick={() => onEditSection("support")}
                className="text-[11px] font-semibold text-corporateBlue hover:text-corporateBlue-dark inline-flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-semibold text-slate-500 uppercase tracking-[0.18em] border-b border-slate-100">
                  <th className="pb-2">Sub-Process</th>
                  <th className="pb-2 text-right">FTE Count</th>
                  <th className="pb-2 text-right">Allocated Hours</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {supportActivities.slice(0, 5).map((row, idx) => (
                  <tr key={`${row.activity?.name || row.customText || "row2"}-${idx}`} className="border-b border-slate-100 last:border-0">
                    <td className="py-2.5 text-slate-700 font-medium">{row.activity?.name || row.customText || "Activity"}</td>
                    <td className="py-2.5 text-right text-slate-500 tabular-nums">-</td>
                    <td className="py-2.5 text-right font-medium text-slate-900 tabular-nums">{Number(row.totalHoursMonth || 0).toFixed(1)}</td>
                  </tr>
                ))}
                {supportActivities.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-slate-500">No support activities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full bg-slate-50/60 p-8 sm:p-10 flex flex-col gap-6">
          <div className="bg-corporateBlue-dark rounded-md shadow-lg overflow-hidden relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>

            <div className="px-8 pt-8 pb-6 border-b border-white/10 relative">
              <p className="text-[11px] font-semibold text-slate-300 tracking-[0.2em] uppercase mb-4 flex items-center gap-2">
                Calculated Total <Info size={14} className="opacity-50" />
              </p>
              <h1 className="text-5xl font-light text-white mb-2 tracking-tight tabular-nums">{totalHours.toFixed(1)}</h1>
              <p className="text-sm text-slate-300">Aggregate allocated hours</p>
            </div>

            <div className="px-8 py-5 bg-corporateBlue relative flex justify-between items-center">
              <div>
                <p className="text-[10px] font-semibold text-slate-200 tracking-[0.2em] uppercase mb-1">Total FTE Equivalent</p>
                <p className="text-xl font-medium text-white tabular-nums">{totalFte.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-slate-200 tracking-[0.2em] uppercase mb-1">Consistency</p>
                <div className="flex items-center gap-1.5 text-white bg-white/15 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <CheckCircle2 size={12} /> Verified
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-md p-6 shadow-sm">
            <h4 className="text-[11px] font-semibold text-slate-500 tracking-[0.2em] uppercase mb-4">Metric Breakdown</h4>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Core Processes</span>
                <span className="font-medium text-slate-900 tabular-nums">{coreHours.toFixed(1)}h</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Support Functions</span>
                <span className="font-medium text-slate-900 tabular-nums">{supportHours.toFixed(1)}h</span>
              </div>
              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-600 font-semibold">Draft ID</span>
                <span className="text-xs font-semibold text-corporateBlue bg-blue-50 px-2 py-1 rounded-md tabular-nums">{draftLabel}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {submitDisabled && <p className="text-sm text-red-600 font-semibold text-center">Submissions are closed</p>}
            {!submitDisabled && !isCertified && (
              <p className="text-sm text-amber-700 font-semibold text-center">Please certify the declaration before submitting.</p>
            )}
            <button
              onClick={onPrev}
              className="w-full bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={16} /> Back to Process Details
            </button>
            <button
              onClick={onSubmit}
              disabled={submitDisabled || !isCertified}
              className="w-full bg-corporateBlue hover:bg-corporateBlue-dark disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-md transition-colors flex items-center justify-center gap-3 shadow-md"
            >
              <Send size={18} /> Submit BPER Form
            </button>
            <button
              onClick={onSaveDraft}
              className="w-full bg-transparent border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold py-4 px-6 rounded-md transition-colors flex items-center justify-center gap-3"
            >
              <Save size={18} /> Save as Draft
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 sm:px-10 pb-10">
        <div className="mx-auto max-w-2xl bg-slate-50 border border-slate-200 rounded-md p-5 sm:p-6 flex gap-4 items-start justify-center">
          <div className="flex-shrink-0 mt-1">
            <input
              type="checkbox"
              checked={isCertified}
              onChange={(e) => setIsCertified(e.target.checked)}
              className="w-5 h-5 accent-corporateBlue border-slate-300 rounded focus:ring-corporateBlue cursor-pointer"
            />
          </div>
          <div className="max-w-xl">
            <h4 className="text-sm font-semibold text-slate-900 mb-1 cursor-pointer select-none">I certify these details are accurate</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
=======
}

export function Step3({ onPrev, onSubmit }: StepProps) {
  const { watch } = useFormContext();
  const processRows = watch("processRows") || [];
  const miscRows = watch("miscRows") || [];

  const groupedProcesses = processRows.reduce((acc: any, row: any) => {
    if (row.majorProcess && row.majorProcess !== 'Select...') {
      if (!acc[row.majorProcess]) acc[row.majorProcess] = [];
      acc[row.majorProcess].push(row);
    }
    return acc;
  }, {});

  const totalProcessHours = processRows.reduce((acc: number, r: any) => acc + (Number(r.hrs) || 0), 0);
  const totalMiscHours = miscRows.reduce((acc: number, r: any) => acc + (Number(r.hrs) || 0), 0);
  const totalHours = totalProcessHours + totalMiscHours;
  const totalFte = totalHours / 160;
  return (
    <div className="bg-white rounded-b-xl border-x border-b border-slate-200 shadow-sm font-sans flex flex-col md:flex-row min-h-[600px] relative">
      
      {/* Toast Notification (Mocked) */}
      <div className="absolute top-4 right-4 bg-green-50 border border-green-200 shadow-lg rounded-lg p-4 flex gap-4 z-50 w-80 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="mt-0.5"><div className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center"><CheckCircle2 size={16}/></div></div>
        <div>
          <h4 className="text-sm font-bold text-green-900">Progress Saved</h4>
          <p className="text-xs text-green-700 mt-1">Last auto-save at 14:32:01</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 border-r border-slate-200">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Comprehensive Summary</h2>
          <p className="text-slate-500">
            Review all process metrics before final submission to the ledger.
          </p>
        </div>

        {/* Map Grouped Processes */}
        {Object.entries(groupedProcesses).map(([majorProcess, rows]: [string, any]) => (
          <div key={majorProcess} className="mb-8">
            <h3 className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-4 bg-slate-50 p-2 border-l-2 border-corporateBlue">
              Major Process: {majorProcess}
            </h3>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-2">Sub-Process</th>
                  <th className="pb-2 text-right">FTE Count</th>
                  <th className="pb-2 text-right">Allocated Hours</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {rows.map((r: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-4 text-slate-700 font-medium">{r.subProcess}</td>
                    <td className="py-4 text-right text-slate-500">{(Number(r.hrs) / 160).toFixed(2)}</td>
                    <td className="py-4 text-right font-bold text-corporateBlue">{Number(r.hrs).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
        {miscRows.filter((r: any) => r.description).length > 0 && (
          <div className="mb-8">
            <h3 className="text-xs font-bold text-corporateBlue tracking-widest uppercase mb-4 bg-slate-50 p-2 border-l-2 border-corporateBlue">
              Miscellaneous Activities
            </h3>
            <table className="w-full text-left">
              <tbody className="text-sm">
                {miscRows.filter((r: any) => r.description).map((r: any, idx: number) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-4 text-slate-700 font-medium">{r.description}</td>
                    <td className="py-4 text-right text-slate-500">{(Number(r.hrs) / 160).toFixed(2)}</td>
                    <td className="py-4 text-right font-bold text-corporateBlue">{Number(r.hrs).toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Certification Checkbox */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex gap-4 items-start">
          <div className="flex-shrink-0 mt-1">
             <input type="checkbox" className="w-5 h-5 accent-corporateBlue border-slate-300 rounded focus:ring-corporateBlue cursor-pointer" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 mb-1 cursor-pointer select-none">I certify these details are accurate</h4>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md">
>>>>>>> target/main
              By checking this box, I confirm that the hours and FTE allocations reported above accurately reflect the institutional intelligence records for the current fiscal period.
            </p>
          </div>
        </div>
      </div>
<<<<<<< HEAD
=======

      {/* Right Sidebar Area */}
      <div className="w-full md:w-96 bg-slate-50/50 p-10 flex flex-col">
        
        {/* Main Metric Card */}
        <div className="bg-corporateBlue-dark rounded-xl shadow-lg overflow-hidden relative mb-6">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl pointer-events-none"></div>
          
          <div className="px-8 pt-8 pb-6 border-b border-white/10 relative">
            <p className="text-xs font-bold text-slate-300 tracking-widest uppercase mb-4 flex items-center gap-2">
              Calculated Total <Info size={14} className="opacity-50" />
            </p>
            <h1 className="text-5xl font-extrabold text-white mb-2 tracking-tight">{totalHours.toFixed(1)}</h1>
            <p className="text-sm text-slate-300">Aggregate Allocated Hours</p>
          </div>

          <div className="px-8 py-5 bg-corporateBlue relative flex justify-between items-center">
             <div>
               <p className="text-[10px] font-bold text-slate-200 tracking-widest uppercase mb-1">Total FTE Equivalent</p>
               <p className="text-xl font-bold text-white">{totalFte.toFixed(2)}</p>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold text-slate-200 tracking-widest uppercase mb-1">Consistency</p>
                <div className="flex items-center gap-1.5 text-white bg-white/20 px-2 py-0.5 rounded text-xs font-bold">
                  <CheckCircle2 size={12} /> Verified
                </div>
             </div>
          </div>
        </div>

        {/* Metric Breakdown */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-auto shadow-sm">
          <h4 className="text-xs font-bold text-slate-500 tracking-widest uppercase mb-4">Metric Breakdown</h4>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Core Processes</span>
              <span className="font-bold text-slate-900">{totalProcessHours.toFixed(1)}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Miscellaneous Activities</span>
              <span className="font-bold text-slate-900">{totalMiscHours.toFixed(1)}h</span>
            </div>
            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-slate-600 font-bold">Draft ID</span>
              <span className="text-xs font-bold text-corporateBlue bg-blue-50 px-2 py-1 rounded">#DRAFT-{new Date().getFullYear()}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 mt-8">
          <button 
            type="button"
            onClick={onSubmit}
            className="w-full bg-corporateBlue-dark hover:bg-corporateBlue text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3 shadow-md"
          >
            <Send size={18} /> Submit BPER Form
          </button>
          <button type="button" onClick={onPrev} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3">
             Review Changes
          </button>
        </div>

      </div>
>>>>>>> target/main
    </div>
  );
}

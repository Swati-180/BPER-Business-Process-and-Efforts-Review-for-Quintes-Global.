import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Plus, Trash2, Box, Settings2, HelpCircle, Sparkles, X } from "lucide-react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useFormContext, useFieldArray } from "react-hook-form";

interface StepProps {
  onNext: () => void;
  onPrev: () => void;
}

export function Step2({ onNext, onPrev }: StepProps) {
  const { user } = useAuth();
  const { control, register, setValue, watch } = useFormContext();

  const { fields: processRows, append: appendProcess, remove: removeProcess } = useFieldArray({
    control,
    name: "processRows"
  });

  const { fields: miscRows, append: appendMisc, remove: removeMisc } = useFieldArray({
    control,
    name: "miscRows"
  });

  const [standardHours, setStandardHours] = useState<number>(160);
  const [isEditingStd, setIsEditingStd] = useState(false);

  useEffect(() => {
    // Optionally fetch std hours here
  }, []);

  const watchProcessRows = watch("processRows", []);
  const watchMiscRows = watch("miscRows", []);

  const totalProcessHours = watchProcessRows.reduce((acc: number, row: any) => acc + (Number(row.hrs) || 0), 0);
  const totalMiscHours = watchMiscRows.reduce((acc: number, row: any) => acc + (Number(row.hrs) || 0), 0);
  const aggregateMonthlyEffort = totalProcessHours + totalMiscHours;
  const utilization = standardHours > 0 ? (aggregateMonthlyEffort / standardHours) * 100 : 0;

  const addProcessRow = () => {
    appendProcess({ majorProcess: 'Select...', process: 'Select...', subProcess: 'Select...', frequency: 'Daily', vol: 0, hrs: 0, appUsed: '' });
  };

  const addMiscRow = () => {
    appendMisc({ description: '', hrs: 0, isMapping: false, aiSuggestion: null });
  };

  const mapActivityWithAI = async (index: number, description: string) => {
    if (!description.trim() || !user?.department?._id) return;
    
    setValue(`miscRows.${index}.isMapping`, true);
    try {
      const res = await axios.post("/api/eper/ai/map-activity", {
        customText: description,
        departmentId: user?.department?._id
      });
      setValue(`miscRows.${index}.aiSuggestion`, res.data);
    } catch (err) {
      console.error("AI mapping error");
    } finally {
      setValue(`miscRows.${index}.isMapping`, false);
    }
  };

  const acceptAiSuggestion = (index: number, matchedName: string) => {
    const desc = watchMiscRows[index].description;
    setValue(`miscRows.${index}.description`, `[AI Mapped: ${matchedName}] - ${desc}`);
    setValue(`miscRows.${index}.aiSuggestion`, null);
  };

  return (
    <div className="bg-white rounded-b-xl border-x border-b border-slate-200 shadow-sm font-sans flex flex-col">
      <div className="p-10 flex-1">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Process Inventory</h2>
          <p className="text-slate-500">Specify operational workflows, monthly volumes, and time requirements for each process.</p>
        </div>

        {/* Process Table */}
        <div className="w-full mb-6">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b-2 border-slate-100">
                <th className="pb-4 px-3 w-[15%]">MAJOR PROCESS</th>
                <th className="pb-4 px-3 w-[15%]">PROCESS</th>
                <th className="pb-4 px-3 w-[15%]">SUB PROCESS</th>
                <th className="pb-4 px-3 w-32">FREQUENCY</th>
                <th className="pb-4 px-3 text-center w-24">VOL/MO</th>
                <th className="pb-4 px-3 text-center w-24">HRS/MO</th>
                <th className="pb-4 px-3 w-40">APP USED</th>
                <th className="pb-4 pr-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {processRows.map((row, index) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0">
                  <td className="py-4 px-2">
                      <SelectField name={`processRows.${index}.majorProcess`} label="Major Process" options={departments} />
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.process`)}
                    >
                      <option>Select...</option>
                      <option>Underwriting</option>
                      <option>Inbound Querie</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.subProcess`)}
                    >
                      <option>Select...</option>
                      <option>Risk Assessmen</option>
                      <option>Technical Help</option>
                    </select>
                  </td>
                  <td className="py-4 px-2">
                    <select 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                      {...register(`processRows.${index}.frequency`)}
                    >
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </td>
                  <td className="py-4 px-2 text-center">
                      <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-center text-sm text-slate-700 outline-none focus:border-corporateBlue [&:invalid]:border-red-300 [&:invalid]:bg-red-50" 
                      {...register(`processRows.${index}.vol`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-4 px-2 text-center">
                      <input 
                      type="number" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-center text-sm font-bold text-corporateBlue outline-none focus:border-corporateBlue [&:invalid]:border-red-300 [&:invalid]:bg-red-50" 
                      {...register(`processRows.${index}.hrs`, { valueAsNumber: true })}
                    />
                  </td>
                  <td className="py-4 px-2">
                    <input 
                      type="text" 
                      className="w-full bg-slate-50 border border-slate-200 rounded p-3 text-sm text-slate-700 outline-none focus:border-corporateBlue" 
                      placeholder="e.g. Workday"
                      {...register(`processRows.${index}.appUsed`)}
                    />
                  </td>
                  <td className="py-4 pl-2 text-right">
                    <button onClick={() => removeProcess(index)} className="text-slate-400 hover:text-red-500 transition-colors p-1">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button */}
        <div className="flex justify-center mb-10">
          <button 
            onClick={addProcessRow}
            className="text-corporateBlue font-bold text-sm bg-blue-50 border border-dashed border-blue-200 py-3 px-8 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add New Process Row
          </button>
        </div>

        {/* Miscellaneous Tasks Section */}
        <div className="bg-slate-50 p-8 rounded-xl border border-slate-100 mb-4">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-corporateBlue"><Box size={20} className="fill-corporateBlue/20" /></div>
            <h3 className="text-sm font-extrabold text-slate-900 tracking-widest uppercase">Miscellaneous Activities</h3>
          </div>
          
          <div className="w-full mb-6">
            <div className="flex text-[10px] font-extrabold text-slate-400 tracking-widest uppercase mb-3 px-2">
              <div className="flex-1">Activity Description</div>
              <div className="w-48 text-center pr-12">Time Taken (Hrs/Month)</div>
            </div>
            
            <div className="space-y-3">
              {miscRows.map((row, index) => {
                const currentRow = watchMiscRows[index] || {};
                return (
                  <div key={row.id} className="flex flex-col gap-2 mb-4">
                    <div className="flex gap-4 items-start">
                      <div className="flex-1 relative">
                        <textarea 
                            className="w-full bg-white border border-slate-200 rounded-lg p-4 text-sm text-slate-700 outline-none focus:border-corporateBlue resize-none shadow-sm h-16"
                            placeholder="Ad-hoc meetings, administrative filing, or unique seasonal tasks... (Click outside to AI Map)"
                            {...register(`miscRows.${index}.description`)}
                            onBlur={(e) => mapActivityWithAI(index, e.target.value)}
                        ></textarea>
                        {currentRow.isMapping && (
                          <div className="absolute top-4 right-4 text-corporateBlue bg-blue-50 px-2 py-1 rounded animate-pulse flex items-center gap-1 text-xs font-bold">
                            <Sparkles size={14} /> Analyzing...
                          </div>
                        )}
                      </div>
                      <div className="w-48 flex items-start gap-4">
                        <div className="relative w-full">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-corporateBlue opacity-50">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            </div>
                            <input 
                              type="number" 
                              className="w-full bg-white border border-slate-200 rounded-lg p-4 pl-12 text-lg font-bold text-slate-900 outline-none focus:border-corporateBlue shadow-sm h-16" 
                              {...register(`miscRows.${index}.hrs`, { valueAsNumber: true })}
                            />
                        </div>
                        <button onClick={() => removeMisc(index)} className="text-slate-400 hover:text-red-500 transition-colors mt-5 p-1 shrink-0">
                            <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                    {/* AI Suggestion UI */}
                    {currentRow.aiSuggestion && currentRow.aiSuggestion.matchedActivity && (
                      <div className="ml-1 flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-3 rounded-lg mr-[14rem]">
                        <Sparkles size={16} className="text-indigo-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-indigo-900">AI Suggested Mapping:</span>
                            <span className="text-sm font-semibold text-indigo-700">{currentRow.aiSuggestion.matchedActivity.name}</span>
                            {currentRow.aiSuggestion.confidence === 'high' && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold uppercase">High Match</span>}
                            {currentRow.aiSuggestion.confidence === 'medium' && <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold uppercase">Med Match</span>}
                            {currentRow.aiSuggestion.confidence === 'low' && <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Low Match</span>}
                          </div>
                          <p className="text-xs text-indigo-600 mb-2">{currentRow.aiSuggestion.reason}</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => acceptAiSuggestion(index, currentRow.aiSuggestion!.matchedActivity!.name)} className="text-xs font-bold bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition">Accept Suggestion</button>
                            <button onClick={() => setValue(`miscRows.${index}.aiSuggestion`, null)} className="text-xs font-bold text-indigo-600 bg-white border border-indigo-200 px-3 py-1.5 rounded hover:bg-indigo-50 transition">Dismiss</button>
                          </div>
                        </div>
                      </div>
                    )}
                    {currentRow.aiSuggestion && !currentRow.aiSuggestion.matchedActivity && (
                      <div className="ml-1 flex items-center gap-2 text-xs font-medium text-slate-500 mr-[14rem] px-3 py-1">
                        <Sparkles size={12} /> No strong AI matches found in standard inventory.
                        <button onClick={() => setValue(`miscRows.${index}.aiSuggestion`, null)} className="ml-2 hover:text-slate-700"><X size={12}/></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
             onClick={addMiscRow}
             className="text-corporateBlue hover:text-corporateBlue-dark transition-colors font-bold text-sm flex items-center gap-1.5 px-2"
          >
             <Plus size={16} strokeWidth={3} /> Add Miscellaneous Activity
          </button>
        </div>

      </div>

      {/* Modern Calculation Footer Anchor */}
      <div className="bg-white border-t border-slate-200 p-6 px-10 flex items-center justify-between rounded-b-xl shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex items-center gap-8 border-r border-slate-200 pr-8">
          <div>
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Total Monthly Effort</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-corporateBlue leading-none">{aggregateMonthlyEffort.toFixed(2)}</span>
              <span className="text-sm font-bold text-slate-500 mb-0.5">hrs / month</span>
            </div>
          </div>
        </div>

        <div className="flex-1 px-8 flex items-center gap-6">
           <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full inline-flex items-center gap-2">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-extrabold uppercase tracking-widest">Live Calculation Active</span>
           </div>

           <div className="flex flex-col items-center border-l border-slate-100 pl-6">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em] mb-1">Utilization Score</p>
              <div className={`text-xl font-black ${utilization > 100 ? 'text-amber-500' : utilization > 80 ? 'text-emerald-600' : 'text-slate-400'}`}>
                {utilization.toFixed(1)}%
              </div>
           </div>

           <div className="flex flex-col items-start border-l border-slate-100 pl-6 group relative">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.15em]">Standard Hours</p>
                <HelpCircle size={10} className="text-slate-300" />
              </div>
              <div className="flex items-center gap-2">
                {isEditingStd ? (
                  <input 
                    type="number"
                    autoFocus
                    className="w-16 bg-slate-50 border border-slate-300 rounded text-sm font-bold text-slate-900 px-1 py-0.5 outline-none focus:border-corporateBlue"
                    value={standardHours}
                    onChange={(e) => setStandardHours(Number(e.target.value))}
                    onBlur={() => setIsEditingStd(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingStd(false)}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-600">{standardHours} hrs</span>
                    <button 
                      onClick={() => setIsEditingStd(true)}
                      className="text-slate-300 hover:text-corporateBlue transition-colors"
                      title="Edit Standard Hours (Admin Only)"
                    >
                      <Settings2 size={12} />
                    </button>
                  </div>
                )}
              </div>
           </div>
        </div>

        <div className="flex items-center gap-6">
          <button 
            onClick={onPrev}
            className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </button>
          <button 
            onClick={onNext}
            className="bg-corporateBlue hover:bg-corporateBlue-dark text-white font-bold py-3.5 px-8 rounded-lg shadow-md transition-colors flex items-center gap-2"
          >
            Next: Review & Submit <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

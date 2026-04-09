<<<<<<< HEAD
import { useEffect, useMemo, useState } from "react";
import { Search, MapPin, Hash, Bell, Clock, ChevronDown, CheckCircle2 } from "lucide-react";
import { apiGet } from "../api/http";
import { EmptyState, ErrorFallbackState, LoadingState } from "./PageStates";

interface MeData {
  _id: string;
  name: string;
  grade?: string;
  department?: { name?: string } | string;
}

interface MySubmission {
  _id: string;
  status: string;
  activities?: Array<{
    activity?: { name?: string };
    customText?: string;
    totalHoursMonth?: number;
  }>;
}

export function Employee360() {
  const [me, setMe] = useState<MeData | null>(null);
  const [latestSubmission, setLatestSubmission] = useState<MySubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [meData, mySubs] = await Promise.all([
          apiGet<MeData>("/auth/me"),
          apiGet<MySubmission[]>("/eper/wdt/my"),
        ]);
        setMe(meData);
        setLatestSubmission(mySubs[0] || null);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Unable to load employee 360 data.");
        setMe(null);
        setLatestSubmission(null);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const totalHours = useMemo(() => (latestSubmission?.activities || []).reduce((sum, row) => sum + (row.totalHoursMonth || 0), 0), [latestSubmission]);

  if (loading) {
    return <LoadingState title="Loading Employee 360" message="Fetching employee profile and submission metrics." />;
  }

  if (error) {
    return <ErrorFallbackState title="Employee 360 unavailable" message={error} />;
  }

  if (!me) {
    return <EmptyState title="No employee data" message="Employee profile details are not available." />;
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen overflow-auto">
=======
import { Search, MapPin, Hash, Bell, Clock, ChevronDown, CheckCircle2 } from "lucide-react";

export function Employee360() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen overflow-y-auto">
>>>>>>> target/main
      {/* Local Top Nav */}
      <div className="bg-white border-b border-slate-200 px-8 py-4 w-full flex items-center justify-between sticky top-0 z-20">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Global View Search..." 
            className="pl-10 pr-4 py-2 w-full bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-corporateBlue/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-12">
           <div className="flex text-sm font-semibold text-slate-500 gap-6">
             <button className="hover:text-slate-900 transition-colors">Global View</button>
             <button className="hover:text-slate-900 transition-colors">Departmental</button>
             <button className="text-corporateBlue border-b-2 border-corporateBlue pb-6 relative top-[17px]">Individual</button>
           </div>
           
           <div className="flex items-center gap-4">
             <button className="bg-corporateBlue hover:bg-corporateBlue-dark text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
               Export Report <ChevronDown size={14} />
             </button>
             
             <div className="flex items-center gap-4 text-slate-500 border-l border-r border-slate-200 px-4 h-8">
               <button className="hover:text-slate-800 transition-colors relative"><Bell size={18} /></button>
               <button className="hover:text-slate-800 transition-colors"><Clock size={18} /></button>
             </div>
             
             <div className="flex items-center gap-3 pl-2">
               <div className="text-right hidden sm:block">
<<<<<<< HEAD
                 <p className="text-sm font-semibold text-slate-900 leading-tight">{me?.name || "User"}</p>
=======
                 <p className="text-sm font-semibold text-slate-900 leading-tight">Marcus Thorne</p>
>>>>>>> target/main
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">System Administrator</p>
               </div>
               <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 cursor-pointer">
                 <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Marcus&backgroundColor=f1f5f9" alt="Admin avatar" />
               </div>
             </div>
           </div>
        </div>
      </div>

      <div className="p-8 max-w-[1200px] mx-auto w-full space-y-6">
        
        {/* Header Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-2xl bg-teal-100 overflow-hidden border-4 border-white shadow-md shadow-slate-200 shrink-0">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Dominic&style=circle&backgroundColor=b6e3f4" alt="Dominic Sterling" className="w-full h-full object-cover scale-110" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
<<<<<<< HEAD
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{me?.name || "Employee"}</h1>
=======
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dominic S. Sterling</h1>
>>>>>>> target/main
                <span className="bg-emerald-50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest border border-emerald-100">ACTIVE</span>
              </div>
              <p className="text-slate-500 font-medium mb-3">Senior Financial Analyst — APAC Operations</p>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
<<<<<<< HEAD
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Hash size={14} /> {me?._id?.slice(-8).toUpperCase() || "-"}</div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><MapPin size={14} /> {typeof me?.department === "string" ? me?.department : me?.department?.name || "N/A"}</div>
=======
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Hash size={14} /> EMP-20941</div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><MapPin size={14} /> Singapore Hub</div>
>>>>>>> target/main
              </div>
            </div>
          </div>
          
          <div className="flex gap-10 border-l border-slate-100 pl-10">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Efficiency Rating</p>
              <div className="flex items-baseline gap-2 justify-end">
<<<<<<< HEAD
                <h2 className="text-3xl font-black text-slate-900">{Math.min(100, Math.max(0, (totalHours / 160) * 100)).toFixed(1)}%</h2>
=======
                <h2 className="text-3xl font-black text-slate-900">94.2%</h2>
>>>>>>> target/main
                <span className="text-xs font-bold text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">↑2.4</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 text-right">Last Evaluation</p>
              <h2 className="text-xl font-bold text-slate-700 mt-1.5">14 Oct 2023</h2>
            </div>
          </div>
        </div>

        {/* BPER Summary Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
           <div className="p-6 border-b border-slate-100 flex justify-between items-start">
             <div>
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">BPER Summary</h3>
               <p className="text-sm text-slate-500">Business Process Execution Record for current fiscal cycle</p>
             </div>
             <div className="flex items-center gap-2 text-sm">
               <span className="text-slate-500">Latest Submission:</span>
               <span className="bg-emerald-50 text-emerald-700 py-1 px-3 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                 <CheckCircle2 size={14} /> Approved
               </span>
             </div>
           </div>

           <table className="w-full text-left">
             <thead>
               <tr className="bg-slate-50 text-[10px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100">
                 <th className="py-4 px-6 w-1/4">MAJOR PROCESS</th>
                 <th className="py-4 px-6 w-1/4">PROCESS</th>
                 <th className="py-4 px-6 w-1/3">SUB PROCESS</th>
                 <th className="py-4 px-6 text-right">WEEKLY HOURS</th>
               </tr>
             </thead>
             <tbody className="text-sm">
<<<<<<< HEAD
               {(latestSubmission?.activities || []).map((row, idx) => (
                 <tr key={`${row.activity?.name || row.customText || "row"}-${idx}`} className="border-b border-slate-100">
                   <td className="py-5 px-6 font-bold text-corporateBlue">Operational</td>
                   <td className="py-5 px-6 text-slate-700 font-medium">{row.activity?.name || row.customText || "Custom Activity"}</td>
                   <td className="py-5 px-6 text-slate-500 italic">Activity from latest submission</td>
                   <td className="py-5 px-6 text-right font-extrabold text-slate-900">{Number(row.totalHoursMonth || 0).toFixed(1)}</td>
                 </tr>
               ))}
=======
               <tr className="border-b border-slate-100">
                 <td className="py-5 px-6 font-bold text-corporateBlue">Financial Reporting</td>
                 <td className="py-5 px-6 text-slate-700 font-medium">Quarterly Consolidation</td>
                 <td className="py-5 px-6 text-slate-500 italic">Inter-company reconciliations</td>
                 <td className="py-5 px-6 text-right font-extrabold text-slate-900">18.5</td>
               </tr>
               <tr className="border-b border-slate-100">
                 <td className="py-5 px-6 font-bold text-corporateBlue">Financial Reporting</td>
                 <td className="py-5 px-6 text-slate-700 font-medium">Regulatory Filing</td>
                 <td className="py-5 px-6 text-slate-500 italic">MAS compliance audit trail</td>
                 <td className="py-5 px-6 text-right font-extrabold text-slate-900">12.0</td>
               </tr>
               <tr className="border-b border-white">
                 <td className="py-5 px-6 font-bold text-corporateBlue">Business Planning</td>
                 <td className="py-5 px-6 text-slate-700 font-medium">Budget Forecasting</td>
                 <td className="py-5 px-6 text-slate-500 italic">Variance analysis modeling</td>
                 <td className="py-5 px-6 text-right font-extrabold text-slate-900">9.5</td>
               </tr>
>>>>>>> target/main
             </tbody>
             <tfoot>
               <tr className="bg-blue-50/50 border-t border-slate-100">
                 <td colSpan={3} className="py-4 px-6 text-right text-xs font-bold text-corporateBlue tracking-widest uppercase">Total Weekly Hours</td>
<<<<<<< HEAD
                 <td className="py-4 px-6 text-right text-lg font-black text-corporateBlue">{totalHours.toFixed(1)}</td>
=======
                 <td className="py-4 px-6 text-right text-lg font-black text-corporateBlue">40.0</td>
>>>>>>> target/main
               </tr>
             </tfoot>
           </table>
        </div>

        {/* 2-Column Details Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          
          {/* Fitment Profile (Left Column, spanned 4) */}
          <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/30 rounded-t-2xl">
               <div>
                 <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">Fitment Profile</h3>
                 <p className="text-sm text-slate-500">Mechanical fitment & competency mapping score</p>
               </div>
               <div className="flex gap-4 border-l border-slate-200 pl-4 items-center">
                 <div className="text-right">
                   <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Weighted Score</p>
                   <p className="text-xl font-black text-corporateBlue leading-none">88.5 <span className="text-xs text-slate-400 font-normal">/100</span></p>
                 </div>
                 <div className="bg-blue-100 text-corporateBlue font-extrabold text-xs px-3 py-1.5 rounded uppercase tracking-widest">FIT</div>
               </div>
            </div>

<<<<<<< HEAD
            <div className="flex-1 overflow-auto">
=======
            <div className="flex-1 overflow-x-auto">
>>>>>>> target/main
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-slate-50">
                    <th className="py-3 px-6">PARAMETER</th>
                    <th className="py-3 px-6">RESPONSE</th>
                    <th className="py-3 px-6 text-center">SCORE</th>
                    <th className="py-3 px-6 text-right">WEIGHTED</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium">
                  {/* Parameter rows */}
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Technical Proficiency</td>
                    <td className="py-3.5 px-6 text-slate-500">Expert (ERP/SQL)</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">5/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">15.0</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Industry Domain Knowledge</td>
                    <td className="py-3.5 px-6 text-slate-500">8+ Years Sectoral</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">5/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">12.5</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Role Stability</td>
                    <td className="py-3.5 px-6 text-slate-500">Low Volatility</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">4/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">10.0</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Leadership Potential</td>
                    <td className="py-3.5 px-6 text-slate-500">High Potential</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">4/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">8.0</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Process Adherence</td>
                    <td className="py-3.5 px-6 text-slate-500">Consistent</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">5/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">7.5</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Learning Agility</td>
                    <td className="py-3.5 px-6 text-slate-500">Quick Learner</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">4/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">6.0</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Stakeholder Mgmt</td>
                    <td className="py-3.5 px-6 text-slate-500">Direct Client Exp</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">4/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">6.0</td>
                  </tr>
                  <tr className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3.5 px-6 text-slate-900">Digital Readiness</td>
                    <td className="py-3.5 px-6 text-slate-500">Automation Ready</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">5/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">5.0</td>
                  </tr>
                  <tr className="border-b border-transparent">
                    <td className="py-3.5 px-6 text-slate-900">Cultural Alignment</td>
                    <td className="py-3.5 px-6 text-slate-500">Strong</td>
                    <td className="py-3.5 px-6 text-center text-emerald-600 font-bold text-xs">5/5</td>
                    <td className="py-3.5 px-6 text-right text-corporateBlue font-bold">5.0</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Process Risk (Right Column, spanned 3) */}
          <div className="lg:col-span-3 space-y-4">
             <div className="mb-6">
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">Process Risk</h3>
               <p className="text-sm text-slate-500">Automation & consolidation feasibility</p>
             </div>

             {/* High Risk Card */}
             <div className="bg-[#fcf3e3] border border-[#f5dab0] rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                 <h4 className="text-[15px] font-bold text-amber-900 w-3/4 leading-snug">Inter-company reconciliations</h4>
                 <span className="bg-amber-900 text-amber-100 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest whitespace-nowrap">High<br/>Risk</span>
               </div>
               <div className="flex justify-between items-end mb-4 border-b border-amber-900/10 pb-4">
                 <div>
                   <p className="text-[9px] font-bold text-amber-800/60 uppercase tracking-widest mb-1">Score</p>
                   <p className="text-2xl font-black text-amber-900 leading-none">92%</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-bold text-amber-800/60 uppercase tracking-widest mb-1">Consolidate</p>
                   <p className="text-2xl font-black text-amber-900 leading-none">Y</p>
                 </div>
               </div>
               <p className="text-xs text-amber-900/80 italic leading-relaxed">
                 Process shows 80%+ repetitiveness and high digital footprint. Recommended for immediate RPA migration.
               </p>
             </div>

             {/* Standard Card 1 */}
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                 <h4 className="text-[15px] font-bold text-slate-900">Regulatory Filing</h4>
                 <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">Standard</span>
               </div>
               <div className="flex justify-between items-end mb-4 border-b border-slate-100 pb-4">
                 <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                   <p className="text-2xl font-black text-slate-900 leading-none">44%</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Consolidate</p>
                   <p className="text-2xl font-black text-slate-900 leading-none">N</p>
                 </div>
               </div>
               <p className="text-xs text-slate-500 italic leading-relaxed">
                 High complexity and manual oversight required by MAS regulations. Not feasible for consolidation.
               </p>
             </div>

             {/* Standard Card 2 */}
             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                 <h4 className="text-[15px] font-bold text-slate-900">Budget Forecasting</h4>
                 <span className="bg-slate-100 text-slate-500 border border-slate-200 text-[9px] font-bold px-2 py-1 rounded uppercase tracking-widest">Standard</span>
               </div>
               <div className="flex justify-between items-end">
                 <div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Score</p>
                   <p className="text-2xl font-black text-slate-900 leading-none">58%</p>
                 </div>
                 <div className="text-right">
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Consolidate</p>
                   <p className="text-2xl font-black text-slate-900 leading-none">N</p>
                 </div>
               </div>
             </div>

             {/* Dark Insight Card */}
             <div className="bg-[#103a6a] rounded-2xl p-6 text-white shadow-xl isolate relative overflow-hidden mt-6 border border-blue-900">
               <div className="absolute -bottom-6 -right-6 text-blue-500/20 opacity-50 scale-150 pointer-events-none">
                 <Search size={100} strokeWidth={1} />
               </div>
               <h4 className="text-lg font-bold mb-3 flex items-center gap-2">Risk Insight</h4>
               <p className="text-sm text-blue-100/80 leading-relaxed mb-6 block relative z-10">
                 Dominic spends 46% of his time on tasks identified as "Consolidatable". This suggests a high potential for role evolution or transition to strategic tasks.
               </p>
               <button className="text-[10px] font-bold uppercase tracking-widest bg-blue-900/50 hover:bg-blue-800 text-blue-200 py-2.5 px-4 rounded transition-colors relative z-10 w-full text-center border border-blue-400/20 shadow-sm">
                 Full Library Look-up
               </button>
             </div>

          </div>
        </div>

      </div>
    </div>
  );
}

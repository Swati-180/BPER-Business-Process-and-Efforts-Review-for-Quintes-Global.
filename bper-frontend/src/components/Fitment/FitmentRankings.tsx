import { Bell, Download, Settings, Navigation } from "lucide-react";
import type { ViewType } from "./FitmentMain";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface FitmentRankingsProps {
  onSwitchView: (v: ViewType) => void;
  activeView: ViewType;
}

const HISTOGRAM_DATA = [
  { range: '0-10', count: 5 },
  { range: '11-20', count: 12 },
  { range: '21-30', count: 25 },
  { range: '31-50', count: 68 },
  { range: '51-75', count: 148 },
  { range: '76-85', count: 85 },
  { range: '86-95', count: 42 },
  { range: '96-100', count: 18 },
];

const EMPLOYEES = [
  { id: 1, name: 'Jonathan Doe', client: 'Global Tech Corp', band: 'L7 • Executive', score: 94.2, status: 'FIT', date: 'Oct 24, 2023', init: 'JD' },
  { id: 2, name: 'Maria Sanchez', client: 'FinEdge Banking', band: 'L5 • Senior Mgmt', score: 78.5, status: 'PARTIAL', date: 'Oct 22, 2023', init: 'MS' },
  { id: 3, name: 'Robert King', client: 'MediCare Systems', band: 'L3 • Professional', score: 42.1, status: 'NOT FIT', date: 'Oct 20, 2023', init: 'RK' },
  { id: 4, name: 'Linda White', client: 'Global Tech Corp', band: 'L8 • Executive', score: 89.9, status: 'FIT', date: 'Oct 19, 2023', init: 'LW' },
];

export function FitmentRankings({ onSwitchView, activeView }: FitmentRankingsProps) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      {/* Top Navbar */}
      <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20 w-full">
        <div className="flex items-center gap-10">
          <h2 className="text-xl font-bold text-corporateBlue tracking-tight">Fitment Rankings</h2>
          
          <nav className="hidden lg:flex gap-6 mt-1">
            <a href="#" className="text-sm font-semibold text-corporateBlue border-b-2 border-corporateBlue pb-6 relative top-3">Overview</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 pb-6 relative top-3 transition-colors">Client Benchmarks</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-slate-900 pb-6 relative top-3 transition-colors">Scoring Logic</a>
          </nav>
        </div>

        <div className="flex items-center gap-6">
           <div className="bg-slate-100 p-1 rounded-full flex gap-1 mr-4">
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'scorer' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => onSwitchView('scorer')}
            >
              Scorer View
            </button>
            <button 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${activeView === 'rankings' ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => onSwitchView('rankings')}
            >
              Rankings
            </button>
          </div>

          <button className="bg-corporateBlue hover:bg-corporateBlue-dark text-white text-sm font-bold py-2 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-sm">
            <Download size={16} /> Export to Excel
          </button>

          <div className="flex items-center gap-4 text-slate-500 border-l border-slate-200 pl-6">
            <button className="hover:text-slate-800 transition-colors relative"><Bell size={20} /></button>
            <button className="hover:text-slate-800 transition-colors"><Settings size={20} /></button>
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 border-2 border-white shadow-sm cursor-pointer">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f1f5f9" alt="User avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Refine Results Menu */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-900 tracking-widest uppercase mb-6 flex items-center gap-2">
                <Navigation size={16} className="text-slate-400"/> Refine Results
              </h3>
              
              <div className="space-y-6 flex-1">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block">Client</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:border-corporateBlue text-sm font-medium text-slate-700">
                    <option>All Strategic Clients</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-2 block">Job Band</label>
                  <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg outline-none focus:border-corporateBlue text-sm font-medium text-slate-700">
                    <option>All Levels (L1-L9)</option>
                  </select>
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-3 block">Remark Status</label>
                   <div className="flex gap-2">
                    <button className="flex-1 bg-green-50 border-2 border-green-200 text-green-700 text-xs font-bold py-2 rounded-lg tracking-wider">FIT</button>
                    <button className="flex-1 bg-amber-50 border-2 border-amber-200 text-amber-700 text-xs font-bold py-2 rounded-lg tracking-wider opacity-60">PARTIAL</button>
                    <button className="flex-1 bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold py-2 rounded-lg tracking-wider opacity-60">NOT FIT</button>
                   </div>
                </div>
              </div>
            </div>

            {/* Score Distribution Histogram */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
               <div className="flex justify-between items-start mb-8">
                 <div>
                   <h3 className="text-lg font-bold text-slate-900 mb-1 tracking-tight">SCORE DISTRIBUTION</h3>
                   <p className="text-sm text-slate-500">Employee concentration across fitment ranges</p>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                   <div className="w-3 h-3 rounded-full bg-corporateBlue"></div> Employee Count
                 </div>
               </div>

               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={HISTOGRAM_DATA} margin={{ top: 20, right: 0, left: -25, bottom: 0 }}>
                      <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={false} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {HISTOGRAM_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.count === 148 ? '#185FA5' : '#e2e8f0'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
               </div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 pb-4">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
               <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">Employee Fitment Rankings</h3>
               <div className="text-xs font-bold bg-white border border-slate-200 text-slate-500 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
                 <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Scores weighted against 12 organizational KPIs
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                    <tr className="text-xs font-bold text-slate-400 tracking-widest uppercase border-b border-slate-100 bg-white">
                      <th className="py-4 px-6 font-bold text-slate-900 flex items-center gap-1 cursor-pointer">EMPLOYEE NAME <span className="text-[8px]">▼</span></th>
                      <th className="py-4 px-6">CLIENT</th>
                      <th className="py-4 px-6">BAND</th>
                      <th className="py-4 px-6 flex items-center gap-1 cursor-pointer">WEIGHTED SCORE <span className="text-[8px]">▼</span></th>
                      <th className="py-4 px-6">REMARK BADGE</th>
                      <th className="py-4 px-6">SCORED ON</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                     {EMPLOYEES.map((emp) => (
                       <tr key={emp.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                         <td className="py-5 px-6">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-blue-100 text-corporateBlue flex items-center justify-center font-bold text-xs">{emp.init}</div>
                             <span className="font-bold text-slate-900">{emp.name}</span>
                           </div>
                         </td>
                         <td className="py-5 px-6 text-slate-600">{emp.client}</td>
                         <td className="py-5 px-6 text-slate-600">{emp.band}</td>
                         <td className="py-5 px-6 text-slate-600">
                           <div className="flex items-center gap-4">
                             <span className="font-extrabold text-slate-900 w-10">{emp.score}</span>
                             <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full rounded-full ${emp.status === 'FIT' ? 'bg-corporateBlue' : emp.status === 'PARTIAL' ? 'bg-amber-600' : 'bg-red-500'}`} 
                                  style={{ width: `${emp.score}%` }}
                                ></div>
                             </div>
                           </div>
                         </td>
                         <td className="py-5 px-6">
                           <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold tracking-wider ${
                             emp.status === 'FIT' ? 'bg-green-50 text-green-700' : 
                             emp.status === 'PARTIAL' ? 'bg-amber-100/50 text-amber-700' : 
                             'bg-red-50 text-red-700'
                           }`}>
                             {emp.status}
                           </span>
                         </td>
                         <td className="py-5 px-6 text-slate-500">{emp.date}</td>
                       </tr>
                     ))}
                  </tbody>
               </table>
             </div>

             <div className="px-6 pt-4 flex items-center justify-between text-xs text-slate-400 font-medium">
               <p>Showing 4 of 422 results</p>
               <div className="flex gap-1 font-bold">
                 <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100">&lt;</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded bg-corporateBlue text-white shadow-sm">1</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600">2</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600">3</button>
                 <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-slate-100">&gt;</button>
               </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

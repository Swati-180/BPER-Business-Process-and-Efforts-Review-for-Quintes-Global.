import { useState } from "react";
import { Search, Bell, RotateCcw, Bookmark } from "lucide-react";
import type { ViewType } from "./FitmentMain";

interface FitmentFormProps {
  onSwitchView: (v: ViewType) => void;
  activeView: ViewType;
}

const PARAMS = [
  { id: '1', name: 'PMS Rating', icon: '⭐' },
  { id: '2', name: 'Complexity of Work', icon: '⚙️' },
  { id: '3', name: 'Tech Savviness', icon: '💻' },
  { id: '4', name: 'SLA Compliance', icon: '⏱️' },
  { id: '5', name: 'Process Understanding', icon: '🧩' },
  { id: '6', name: 'Cultural Alignment', icon: '👥' },
  { id: '7', name: 'Communication Clarity', icon: '💬' },
  { id: '8', name: 'Adaptability Rate', icon: '🔄' },
  { id: '9', name: 'Leadership Quotient', icon: '👑' },
  { id: '10', name: 'Client Empathy', icon: '🤝' },
  { id: '11', name: 'Quantitative Skill', icon: '📊' },
  { id: '12', name: 'Domain Tenure', icon: '📅' },
  { id: '13', name: 'Error Mitigation', icon: '🛡️' },
  { id: '14', name: 'Peer Evaluation', icon: '👏' },
];

export function FitmentForm({ onSwitchView, activeView }: FitmentFormProps) {
  // State for parameters
  const [weights, setWeights] = useState<Record<string, number>>(() => 
    PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: 0.8 }), {})
  );
  
  const [scores, setScores] = useState<Record<string, number>>(() => 
    PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: 70 }), {})
  );

  // Calculate live score
  let totalWeight = 0;
  let weightedSum = 0;
  PARAMS.forEach(p => {
    const w = weights[p.id] || 0;
    const s = scores[p.id] || 0;
    weightedSum += (s * w);
    totalWeight += w;
  });

  const finalScore = totalWeight > 0 ? (weightedSum / totalWeight).toFixed(1) : "0.0";
  const numericScore = parseFloat(finalScore);

  let remark = "Partial Fit";
  let remarkColor = "text-amber-700";
  let remarkBg = "bg-amber-100";
  let remarkDot = "bg-amber-600";

  if (numericScore > 85) {
    remark = "Fit";
    remarkColor = "text-green-700";
    remarkBg = "bg-green-100";
    remarkDot = "bg-green-600";
  } else if (numericScore < 60) {
    remark = "Not Fit";
    remarkColor = "text-red-700";
    remarkBg = "bg-red-100";
    remarkDot = "bg-red-600";
  }

  const handleReset = () => {
    setScores(PARAMS.reduce((acc, p) => ({ ...acc, [p.id]: 70 }), {}));
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 relative min-h-screen">
      {/* Top Navbar */}
      <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-8">
          <h2 className="text-xl font-bold text-corporateBlue tracking-tight">Fitment Scorer</h2>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search parameters..." 
              className="pl-10 pr-4 py-2 w-72 bg-slate-100 border-transparent rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-corporateBlue/20 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="bg-slate-100 p-1 rounded-full flex gap-1">
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

          <div className="flex items-center gap-4 text-slate-500 border-l border-slate-200 pl-6">
            <button className="hover:text-slate-800 transition-colors relative">
              <div className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 border border-white"></div>
              <Bell size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200 border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow">
              <img src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f1f5f9" alt="User avatar" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Workforce Registry */}
        <div className="w-80 bg-slate-100 border-r border-slate-200 flex flex-col h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="p-6 pb-2 sticky top-0 bg-slate-100/90 backdrop-blur z-10">
            <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4">Workforce Registry</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text" 
                placeholder="Filter by name or client..." 
                className="pl-9 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-corporateBlue/20 shadow-sm"
              />
            </div>
          </div>
          
          <div className="p-4 space-y-2">
            {/* Active User */}
            <div className="bg-white p-4 rounded-xl border border-corporateBlue/20 shadow-sm cursor-pointer ring-1 ring-corporateBlue">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-corporateBlue flex items-center justify-center font-bold text-sm">JD</div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Jameson D.</h4>
                  <p className="text-xs text-slate-500">Global Logistics Corp</p>
                </div>
              </div>
            </div>

            {/* Inactive Users */}
            {[
              { in: 'AK', name: 'Amara K.', client: 'Vertex Solutions', color: 'bg-slate-200 text-slate-600' },
              { in: 'RV', name: 'Ricardo V.', client: 'Skyline Heavy Industries', color: 'bg-slate-200 text-slate-600' },
              { in: 'SL', name: 'Sarah L.', client: 'FinTech Hub', color: 'bg-slate-200 text-slate-600' },
              { in: 'MP', name: 'Marcus P.', client: 'Global Logistics Corp', color: 'bg-slate-200 text-slate-600' },
              { in: 'EN', name: 'Elena N.', client: 'Global Logistics Corp', color: 'bg-slate-200 text-slate-600' },
            ].map(u => (
              <div key={u.in} className="bg-transparent hover:bg-slate-200/50 p-4 rounded-xl cursor-pointer transition-colors border border-transparent">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${u.color}`}>{u.in}</div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700">{u.name}</h4>
                    <p className="text-xs text-slate-500">{u.client}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-10 h-[calc(100vh-5rem)] overflow-y-auto relative">
          
          <div className="max-w-4xl mx-auto pb-32">
            <div className="mb-8 pr-64">
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-blue-100 text-corporateBlue text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">Scoring Active</span>
                <span className="text-sm text-slate-500">ID: BPER-2024-8842</span>
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight">Institutional Fitment<br/>Scoring</h1>
              <p className="text-slate-600 leading-relaxed text-lg max-w-xl">
                Evaluate candidates based on standard BPER operational parameters. Weighted scores are calculated in real-time for immediate institutional calibration.
              </p>
            </div>

            {/* The 14 parameter grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
              {PARAMS.map((p) => (
                <div key={p.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="text-slate-400">{p.icon}</span> {p.name}
                  </h3>
                  
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 block">Response</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue appearance-none"
                        value={scores[p.id]}
                        onChange={(e) => setScores({...scores, [p.id]: Number(e.target.value)})}
                      >
                        <option value="90">Exceptional (90+)</option>
                        <option value="75">Meets Expectations (75)</option>
                        <option value="60">Needs Improvement (60)</option>
                        <option value="40">Unsatisfactory (40)</option>
                      </select>
                    </div>
                    <div className="w-24">
                      <label className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-2 block">Weight</label>
                      <input 
                        type="number" 
                        step="0.1" 
                        min="0.1" 
                        max="2.0"
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-700 outline-none focus:border-corporateBlue font-semibold text-center"
                        value={weights[p.id]}
                        onChange={(e) => setWeights({...weights, [p.id]: Number(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Floating Right Score Panel */}
        <div className="absolute top-10 right-10 z-10 w-72 pointer-events-none">
          <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200 border border-slate-100 flex flex-col items-center justify-center pointer-events-auto">
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-4 text-center">Current Weighted<br/>Score</p>
            <h2 className="text-6xl font-extrabold text-corporateBlue-dark mb-4 tracking-tighter">{finalScore}</h2>
            <div className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-bold ${remarkBg} ${remarkColor} border-current/20`}>
              <div className={`w-2 h-2 rounded-full ${remarkDot}`}></div> {remark}
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="absolute bottom-10 right-10 left-[360px] bg-white rounded-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 p-4 px-8 flex items-center justify-between z-10">
          <div className="flex gap-8 text-xs font-bold text-slate-600">
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500"></div> Fit (&gt;85)</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-600"></div> Partial (60-85)</div>
             <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"></div> Not Fit (&lt;60)</div>
          </div>
          <div className="flex items-center gap-4">
             <button 
                onClick={handleReset}
                className="text-corporateBlue hover:text-corporateBlue-dark font-bold text-sm px-4 flex items-center gap-2 transition-colors"
                type="button"
             >
               <RotateCcw size={16} /> Reset Values
             </button>
             <button className="bg-corporateBlue hover:bg-corporateBlue-dark text-white font-bold py-3.5 px-8 rounded-xl shadow-md transition-all hover:shadow-lg flex items-center gap-2">
               <Bookmark size={18} fill="currentColor" /> Save Fitment Score
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

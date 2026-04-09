import { Bell, HelpCircle } from "lucide-react";

export function TopNav() {
  return (
    <div className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 w-full">
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sovereign Ledger</h2>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 text-slate-500 pr-6 border-r border-slate-200">
          <button className="hover:text-slate-800 transition-colors relative">
            <div className="w-2 h-2 rounded-full bg-red-500 absolute top-0 right-0 border border-white"></div>
            <Bell size={20} />
          </button>
          <button className="hover:text-slate-800 transition-colors bg-slate-500 text-white rounded-full p-0.5">
            <HelpCircle size={18} />
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 leading-tight">Alex Thompson</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Strategic Lead</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-200">
            <img 
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=f1f5f9" 
              alt="User avatar" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

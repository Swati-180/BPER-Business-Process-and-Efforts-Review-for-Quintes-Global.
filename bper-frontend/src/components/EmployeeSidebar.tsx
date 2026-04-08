import { 
  Home, 
  FileText, 
  History, 
  BarChart2, 
  PieChart, 
  Settings, 
  ShieldAlert, 
  LogOut 
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function EmployeeSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const activePage = location.pathname.split('/').pop();

  return (
    <div className="w-64 bg-corporateBlue-dark min-h-screen flex flex-col fixed left-0 top-0 text-slate-300 z-50">
      {/* Brand Header */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-white p-2 text-corporateBlue-dark rounded shrink-0 font-bold text-lg w-10 h-10 flex items-center justify-center shadow">
            <Home size={20} />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight tracking-wide">
              QG Tools
            </h1>
            <p className="text-[8px] text-slate-400 font-bold tracking-widest uppercase mt-0.5">
              Business Process &<br/>Efforts
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => navigate("/dashboard")}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-sm ${
                activePage === "dashboard"
                  ? "bg-corporateBlue text-white border-l-0 rounded-r-full font-bold ml-0 mr-4"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <Home size={18} />
              Dashboard
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/wizard")}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-sm ${
                activePage === "wizard" || activePage === "bper-status"
                  ? "bg-corporateBlue text-white border-l-0 rounded-r-full font-bold ml-0 mr-4 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <FileText size={18} />
              BPER Form
            </button>
          </li>
          <li>
             <button
              onClick={() => navigate("/bper-status")}
              className={`w-full flex items-center gap-3 px-6 py-3 transition-colors text-sm ${
                activePage === "bper-status"
                  ? "bg-corporateBlue text-white border-l-0 rounded-r-full font-bold ml-0 mr-4 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-white/5 font-medium"
              }`}
            >
              <History size={18} />
              History
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <BarChart2 size={18} />
              Team Analytics
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <PieChart size={18} />
              Reports
            </button>
          </li>
          <li>
            <button
              className="w-full flex items-center gap-3 px-6 py-3 text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium"
            >
              <Settings size={18} />
              Settings
            </button>
          </li>
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-6 space-y-1 mb-2 border-t border-white/10 mt-auto pt-6">
        {user?.role === 'admin' && (
          <button 
            onClick={() => navigate("/client-manager/dashboard")}
            className="w-full flex items-center gap-3 py-2 px-1 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ShieldAlert size={18} />
            Admin Console
          </button>
        )}
        <button onClick={logout} className="w-full flex items-center gap-3 py-2 px-1 text-slate-400 hover:text-white transition-colors text-sm font-medium">
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}

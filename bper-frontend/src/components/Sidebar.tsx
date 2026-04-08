
import {
  LayoutDashboard,
  ClipboardList,
  BarChart2,
  HelpCircle,
  LogOut,
  Users,
  LineChart,
  BookOpen,
  ChevronRight,
  Target
} from "lucide-react";

import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const NAV_ITEMS = [
  { key: "eperDashboard", label: "ePER Dashboard", icon: LayoutDashboard, path: "dashboard" },
  { key: "analytics", label: "Process Analytics", icon: BarChart2, path: "analytics" },
  { key: "employee360", label: "Employee 360", icon: Users, path: "employee360" },
  { key: "wdtReview", label: "WDT Review", icon: Target, path: "wdt-review" },
  { key: "sixbySixScoring", label: "6x6 Scoring", icon: BarChart2, path: "sixbysix" },
  { key: "fitmentScoring", label: "Fitment Scoring", icon: LineChart, path: "fitment" },
  { key: "deepReports", label: "Deep Reports", icon: BookOpen, path: "reports" },
];

const ADMIN_ITEMS = [
  { key: "users", label: "Admin: Users", icon: Users, path: "users" },
];

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  
  const activePageMap: Record<string, string> = {
    'dashboard': 'eperDashboard',
    'analytics': 'sixbySixScoring',
    'users': 'users'
  };
  
  const currentPath = location.pathname.split('/').pop() || '';
  const activePage = activePageMap[currentPath] || currentPath;

  return (
    <div className="w-64 bg-corporateBlue-dark min-h-screen flex flex-col fixed left-0 top-0 text-slate-300 z-50">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-blue-500 p-2 rounded text-white shrink-0 font-bold text-lg w-10 h-10 flex items-center justify-center shadow">
            e
          </div>
          <div>
            <h1 className="text-white font-bold text-base leading-tight tracking-wide">
              ePER Platform
            </h1>
            <p className="text-[9px] text-slate-400 font-bold tracking-[0.15em] uppercase mt-0.5">
              Sovereign Ledger · QG Tools
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <p className="text-[9px] font-bold text-slate-500 tracking-[0.15em] uppercase px-6 mb-2">
          Main
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map(({ key, label, icon: Icon, path }) => (
            <li key={key}>
              <button
                onClick={() => navigate(`/client-manager/${path}`)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all duration-150 text-sm group ${
                  activePage === key
                    ? "bg-blue-600/30 text-white border-l-2 border-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5 font-medium border-l-2 border-transparent"
                }`}
              >
                <Icon size={16} className={activePage === key ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                {label}
                {activePage === key && <ChevronRight size={14} className="ml-auto text-blue-400" />}
              </button>
            </li>
          ))}
        </ul>

        <p className="text-[9px] font-bold text-slate-500 tracking-[0.15em] uppercase px-6 mt-5 mb-2">
          Admin
        </p>
        <ul className="space-y-0.5">
          {ADMIN_ITEMS.map(({ key, label, icon: Icon, path }) => (
            <li key={key}>
              <button
                onClick={() => navigate(`/client-manager/${path}`)}
                className={`w-full flex items-center gap-3 px-5 py-2.5 transition-all duration-150 text-sm group ${
                  activePage === key
                    ? "bg-blue-600/30 text-white border-l-2 border-blue-400 font-semibold"
                    : "text-slate-400 hover:text-white hover:bg-white/5 font-medium border-l-2 border-transparent"
                }`}
              >
                <Icon size={16} className={activePage === key ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300"} />
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-0.5">
        <button className="w-full flex items-center gap-3 py-2 px-2 text-slate-400 hover:text-white transition-colors text-sm font-medium rounded hover:bg-white/5">
          <HelpCircle size={16} />
          Help Center
        </button>
        <button onClick={logout} className="w-full flex items-center gap-3 py-2 px-2 text-slate-400 hover:text-white transition-colors text-sm font-medium rounded hover:bg-white/5">
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
}

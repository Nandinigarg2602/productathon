import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, FileText, BarChart3, Shield } from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, en: "Dashboard", hi: "डैशबोर्ड" },
  { to: "/leads", icon: Users, en: "Warm Entities", hi: "वार्म एंटिटीज" },
  { to: "/lead/1", icon: FileText, en: "Battle Card", hi: "बैटल कार्ड" },
  { to: "/analytics", icon: BarChart3, en: "Analytics", hi: "विश्लेषण" },
];

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-20 bg-gradient-to-b from-[#0c2340] to-[#0a1d33] flex flex-col items-center py-6 shadow-2xl border-r border-white/5">
        <div className="flex items-center gap-1 mb-10">
          <Shield className="text-[#e31837]" size={28} strokeWidth={2.5} />
          <span className="text-white font-bold text-sm tracking-tight">SENTINEL</span>
        </div>
        {navItems.map(({ to, icon: Icon, en, hi }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-3 px-4 rounded-xl mb-1 transition-all duration-200 ${
                isActive ? "bg-[#e31837] text-white shadow-lg shadow-[#e31837]/30" : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
          >
            <Icon size={24} />
            <span className="text-xs font-medium">{en}</span>
          </NavLink>
        ))}
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50">
        <Outlet />
      </main>
    </div>
  );
}

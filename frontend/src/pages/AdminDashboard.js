import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Settings, 
  Database, 
  Users, 
  ArrowRight,
  ShieldCheck,
  LayoutGrid
} from "lucide-react";

function AdminDashboard() {
  const navigate = useNavigate();

  const adminActions = [
    {
      title: "Add Question",
      desc: "Create new coding challenges for the platform.",
      icon: <Plus size={20} className="text-indigo-400" />,
      path: "/admin/add"
    },
    {
      title: "Manage Content",
      desc: "Update or remove existing coding problems.",
      icon: <Database size={20} className="text-indigo-400" />,
      path: "/questions"
    },
    {
      title: "Manage Users",
      desc: "See who is using the site and change their access.",
      icon: <Users size={20} className="text-indigo-400" />,
      path: "/admin/users"
    }
  ];

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <ShieldCheck className="text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Admin Panel</h1>
            <p className="text-[11px] text-white/50 font-medium mt-0.5">Site settings and lessons.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {adminActions.map((action, i) => (
            <div
              key={i}
              className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 cursor-pointer hover:bg-[#18181b]/70 hover:border-white/15 transition-all group flex flex-col justify-between shadow-lg shadow-black/25"
              onClick={() => navigate(action.path)}
            >
              <div>
                <div className="mb-4 bg-white/5 w-10 h-10 rounded-xl border border-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  {action.icon}
                </div>
                <h2 className="text-base font-bold text-white mb-1">{action.title}</h2>
                <p className="text-white/45 text-xs font-semibold leading-relaxed mt-0.5">{action.desc}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-bold text-indigo-400">
                <span>Open Module</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg shadow-black/25">
          <div className="flex items-center gap-4 text-center sm:text-left flex-col sm:flex-row">
            <div className="p-3 bg-white/5 rounded-xl border border-white/5 shrink-0">
              <LayoutGrid className="text-white/20" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">System Logs & Governance</h3>
              <p className="text-xs text-white/45 font-semibold mt-0.5">All administrative actions are tracked for security auditing.</p>
            </div>
          </div>
          <button 
            onClick={() => navigate("/admin/governance")}
            className="bg-white hover:bg-slate-100 text-black font-semibold h-10 px-5 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shrink-0"
          >
            <Settings size={14} />
            Governance Settings
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
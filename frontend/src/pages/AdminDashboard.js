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
      icon: <Plus size={24} className="text-indigo-600" />,
      path: "/admin/add"
    },
    {
      title: "Manage Content",
      desc: "Update or remove existing coding problems.",
      icon: <Database size={24} className="text-indigo-600" />,
      path: "/questions"
    },
    {
      title: "Manage Users",
      desc: "See who is using the site and change their access.",
      icon: <Users size={24} className="text-indigo-600" />,
      path: "/admin/users"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="text-white" size={28} />
            </div>
            <div>
                <h1 className="text-4xl font-bold text-slate-900 mb-1">Admin Panel</h1>
                <p className="text-slate-500 font-medium">Site settings and lessons.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {adminActions.map((action, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-3xl p-8 cursor-pointer hover:border-indigo-400 transition-all group flex flex-col justify-between h-full shadow-sm"
              onClick={() => navigate(action.path)}
            >
              <div>
                <div className="mb-6 bg-slate-50 w-14 h-14 rounded-2xl border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {action.icon}
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{action.title}</h2>
                <p className="text-slate-500 font-medium text-sm leading-relaxed">{action.desc}</p>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-600">
                 <span>Open Module</span>
                 <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="flex items-center gap-6">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <LayoutGrid className="text-slate-300" size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">System Logs</h3>
                    <p className="text-sm text-slate-500 font-medium">All administrative actions are tracked for security auditing.</p>
                </div>
            </div>
            <button 
                onClick={() => navigate("/admin/governance")}
                className="bg-slate-900 text-white font-bold py-3 px-8 rounded-xl text-sm hover:bg-black transition-all flex items-center gap-2"
            >
                <Settings size={16} />
                General Settings
            </button>
        </div>
      </div>
    </div>
  );
}


export default AdminDashboard;
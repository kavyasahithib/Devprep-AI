import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LogOut,
  ChevronRight,
  History,
  Trophy,
  User,
  LayoutDashboard,
  Code2,
  Settings,
  BrainCircuit,
  Bug,
  FileSearch,
  Layout,
  ShieldCheck,
  Terminal,
  Users,
  Radio,
  Lock
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user?.role || 'user';

  const menuItems = [
    { name: 'Home', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { name: 'Lessons', icon: <Code2 size={18} />, path: '/questions' },
    { name: 'Practice Interview', icon: <BrainCircuit size={18} />, path: '/interview' }, 
    { name: 'Fix Code Bugs', icon: <Bug size={18} />, path: '/debug' },
    { name: 'Learn Code', icon: <FileSearch size={18} />, path: '/explain' },
    { name: 'Design Apps', icon: <Layout size={18} />, path: '/system-design' },
    { name: 'My Work', icon: <History size={18} />, path: '/submissions' },
    { name: 'Leaderboard', icon: <Trophy size={18} />, path: '/leaderboard' },
    { name: 'Profile', icon: <User size={18} />, path: '/profile' },
  ];

  if (role === 'admin') {
    menuItems.push({ name: 'System Status', icon: <ShieldCheck size={18} />, path: '/verified-status' });
    menuItems.push({ name: 'Admin Panel', icon: <Settings size={18} />, path: '/admin' });
  }

  const logout = async () => {
    try {
      const API = require("../services/api").default;
      await API.post('/auth/logout');
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token'); 
      localStorage.removeItem('refreshToken');
      navigate('/');
    }
  };

  return (
    <div className="w-60 h-screen bg-[#0c0d12]/95 border-r border-white/5 flex flex-col hidden md:flex sticky top-0 shadow-xl selection:bg-indigo-500/30">
      {/* Brand Header */}
      <div className="h-[56px] px-5 flex items-center space-x-2.5 group cursor-pointer border-b border-white/5 shrink-0" onClick={() => navigate('/dashboard')}>
        <div className="w-8 h-8 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 group-hover:bg-indigo-600 group-hover:border-indigo-500/20">
          <Code2 className="text-indigo-400 group-hover:text-white" size={18} />
        </div>
        <span className="text-sm font-bold text-white tracking-tight leading-none">DevPrep AI</span>
      </div>

      {/* Navigation Area */}
      <nav className="flex-1 px-3 pt-3 pb-3 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all duration-200 group relative cursor-pointer ${
                isActive 
                  ? 'bg-indigo-600/90 text-white shadow-md' 
                  : 'text-white/45 hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${isActive ? 'text-white' : 'text-white/30 group-hover:text-indigo-400'} transition-colors`}>
                  {item.icon}
                </div>
                <span className="font-bold text-sm tracking-wide">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-white/40" />}
            </button>
          );
        })}
      </nav>

      {/* Footer Section */}
      <div className="p-3 border-t border-white/5 shrink-0 bg-[#090a0f]/50">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-2.5 px-3 py-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all duration-200 font-semibold text-xs cursor-pointer"
        >
          <LogOut size={14} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

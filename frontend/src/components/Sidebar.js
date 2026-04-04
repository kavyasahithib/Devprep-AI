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
  Layout
} from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = localStorage.getItem('role');

  const menuItems = [
    { name: 'Home', icon: <LayoutDashboard size={20} />, path: '/dashboard' },
    { name: 'Lessons', icon: <Code2 size={20} />, path: '/questions' },
    { name: 'Practice Interview', icon: <BrainCircuit size={20} />, path: '/interview' }, 
    { name: 'Fix Code Bugs', icon: <Bug size={20} />, path: '/debug' },
    { name: 'Learn Code', icon: <FileSearch size={20} />, path: '/explain' },
    { name: 'Design Apps', icon: <Layout size={20} />, path: '/system-design' },
    { name: 'My Work', icon: <History size={20} />, path: '/submissions' },
    { name: 'Leaderboard', icon: <Trophy size={20} />, path: '/leaderboard' },
    { name: 'Profile', icon: <User size={20} />, path: '/profile' },
  ];

  if (role === 'admin') {
    menuItems.push({ name: 'Admin Panel', icon: <Settings size={20} />, path: '/admin' });
  }

  const logout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex sticky top-0 shadow-lg">
      <div className="p-6 flex items-center space-x-3 group cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:bg-indigo-500 transition-all duration-300">
          <Code2 className="text-white" size={24} />
        </div>
        <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight">DevPrep AI</span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Mastery Platform</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-4 ml-4">Main Menu</div>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'} transition-colors`}>
                    {item.icon}
                </div>
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-white/50" />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all duration-200 font-medium text-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;


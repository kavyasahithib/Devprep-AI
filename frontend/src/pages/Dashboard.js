import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { 
  Trophy, 
  Target, 
  Zap, 
  TrendingUp, 
  BrainCircuit,
  ArrowRight,
  BookOpen,
  Bug
} from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [stats, setStats] = useState({
    totalSolved: 0,
    accuracy: 0,
    streak: 0,
    recentSubmissions: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [subRes, dailyRes] = await Promise.all([
          API.get('/submissions/my-submissions'),
          API.get('/questions/daily')
        ]);

        const submissions = subRes.data;
        const accepted = submissions.filter(s => s.status === 'Accepted');
        
        const accuracy = submissions.length > 0 
          ? Math.round((accepted.length / submissions.length) * 100) 
          : 0;

        setStats({
          totalSolved: accepted.length,
          accuracy: accuracy,
          streak: 3, 
          recentSubmissions: submissions.slice(0, 4), // Keep it compact (max 4)
          dailyQuestion: dailyRes.data
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-5 bg-[#090a0f] min-h-screen text-white relative font-sans overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Home</h1>
          <p className="text-[11px] text-white/50 font-medium">Welcome back, {user?.name || 'Developer'}!</p>
        </div>
      </div>

      {/* Main Grid: Left Panel (2/3) and Right Panel (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* Left Column (Main Widgets) */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Stats Bar (Sleek Horizontal stack) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Finished', value: stats.totalSolved, icon: <Trophy size={16} className="text-amber-400" /> },
              { label: 'Accuracy', value: `${stats.accuracy}%`, icon: <Target size={16} className="text-indigo-400" /> },
              { label: 'Day Streak', value: `${stats.streak} Days`, icon: <Zap size={16} className="text-orange-400" /> },
              { label: 'Global Rank', value: '#1,240', icon: <TrendingUp size={16} className="text-emerald-400" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-[#18181b]/50 border border-white/5 p-4 rounded-xl flex items-center space-x-3.5 shadow-lg shadow-black/25">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5 shrink-0">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-base font-bold text-white leading-tight">{stat.value}</div>
                  <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Daily Challenge Banner (Compact design) */}
          {stats.dailyQuestion && (
            <div 
              className="bg-indigo-600/90 border border-indigo-400/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer group shadow-lg shadow-indigo-600/10 hover:bg-indigo-600 transition-all duration-200"
              onClick={() => navigate(`/editor/${stats.dailyQuestion._id}`)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/15 shrink-0">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100/80">Daily Challenge</span>
                    <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/20 text-white">
                      {stats.dailyQuestion.difficulty}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white">{stats.dailyQuestion.title}</h2>
                  <p className="text-indigo-100/70 text-xs mt-0.5 max-w-md line-clamp-1">{stats.dailyQuestion.description}</p>
                </div>
              </div>
              <button className="bg-white text-indigo-600 font-bold text-xs py-2 px-4 rounded-lg transition-all flex items-center space-x-1.5 shadow-md shrink-0">
                <span>Solve Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Practice Modes (Double Cards) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mode 1 */}
            <div 
              className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden cursor-pointer group hover:bg-[#18181b]/80 transition-all"
              onClick={() => navigate("/interview")}
            >
              <div className="space-y-3 relative z-10">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                  <BrainCircuit size={18} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Practice Interview</h2>
                  <p className="text-white/45 text-[11px] font-medium mt-0.5">Conduct interactive mock technical interviews with our AI.</p>
                </div>
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-xs">
                  <span>Start Practice</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Mode 2 */}
            <div 
              className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden cursor-pointer group hover:bg-[#18181b]/80 transition-all"
              onClick={() => navigate("/debug")}
            >
              <div className="space-y-3 relative z-10">
                <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                  <Bug size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Fix Code Bugs</h2>
                  <p className="text-white/45 text-[11px] font-medium mt-0.5">Identify and fix subtle semantic compiler bugs.</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs">
                  <span>Start Debugging</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Practice Topics Section (Compact Inline Grid) */}
          <div className="space-y-2">
            <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest ml-1">Practice Topics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {['Arrays', 'Strings', 'Dynamic Programming', 'Graphs'].map((topic, i) => (
                <button 
                  key={i}
                  onClick={() => navigate('/questions')}
                  className="flex items-center space-x-2.5 p-3 bg-[#18181b]/40 border border-white/5 rounded-xl hover:bg-[#18181b]/60 transition-all text-left shadow-sm group cursor-pointer"
                >
                  <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-indigo-500/10 transition-colors shrink-0">
                    <BookOpen size={14} className="text-white/40 group-hover:text-indigo-400" />
                  </div>
                  <span className="font-bold text-white/80 text-xs shrink-0">{topic}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Sidebars / Coaching) */}
        <div className="space-y-5">
          
          {/* AI COACH WIDGET */}
          <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl relative overflow-hidden shadow-lg shadow-black/25">
            <div className="absolute -top-6 -right-6 opacity-[0.02] pointer-events-none">
              <BrainCircuit size={100} className="text-white" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-xs font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center space-x-1.5">
                <BrainCircuit className="text-indigo-400" size={14} />
                <span>AI Study Buddy</span>
              </h2>
              <p className="text-white/90 text-sm font-semibold mb-4 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
                "You've been doing great with **Arrays**! Try focusing on **Dynamic Programming** next to boost your score for top companies."
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => navigate('/questions')}
                  className="bg-white hover:bg-slate-100 text-black font-bold py-2 px-4 rounded-lg transition-all flex items-center space-x-1.5 text-xs cursor-pointer"
                >
                  <span>View Topics</span>
                  <ArrowRight size={14} />
                </button>
                <button 
                  onClick={() => navigate('/profile')}
                  className="bg-white/5 hover:bg-white/10 text-white/85 font-bold py-2 px-4 rounded-lg border border-white/15 transition-all text-xs cursor-pointer"
                >
                  Profile
                </button>
              </div>
            </div>
          </div>

          {/* RECENT SUBMISSIONS FEED */}
          <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl shadow-lg shadow-black/25 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-xs uppercase tracking-widest text-white/50">Your Latest Work</h2>
              <button 
                onClick={() => navigate('/submissions')}
                className="text-[10px] text-indigo-400 font-bold hover:text-indigo-300 hover:underline cursor-pointer"
              >See All</button>
            </div>
            <div className="space-y-2 flex-1">
              {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((sub, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                    <div className="flex items-center space-x-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${sub.status === 'Accepted' ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-rose-400 shadow-sm shadow-rose-400/50'}`}></div>
                      <span className="text-[10px] font-bold text-white/80">Submission #{sub._id.slice(-4)}</span>
                    </div>
                    <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      sub.status === 'Accepted' ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/10' : 'text-rose-400 bg-rose-500/10 border border-rose-500/10'
                    }`}>
                      {sub.status === 'Accepted' ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-6 flex flex-col items-center justify-center text-white/20 text-xs text-center border border-dashed border-white/5 rounded-xl">
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Dashboard;
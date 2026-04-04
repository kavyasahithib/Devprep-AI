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

const Dashboard = () => {
  const navigate = useNavigate();
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
        const token = localStorage.getItem('token');
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
          recentSubmissions: submissions.slice(0, 5),
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
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Home</h1>
          <p className="text-slate-500 font-medium">See how much you've learned today!</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center space-x-2 shadow-sm">
          <TrendingUp size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-slate-700">Level: Advanced</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Finished', value: stats.totalSolved, icon: <Trophy size={20} className="text-amber-500" /> },
          { label: 'Accuracy', value: `${stats.accuracy}%`, icon: <Target size={20} className="text-indigo-600" /> },
          { label: 'Day Streak', value: `${stats.streak} Days`, icon: <Zap size={20} className="text-orange-500" /> },
          { label: 'Global Rank', value: '#1,240', icon: <TrendingUp size={20} className="text-emerald-500" /> },
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-slate-50">
                {stat.icon}
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Challenge */}
      {stats.dailyQuestion && (
        <div 
            className="bg-indigo-600 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8 cursor-pointer group shadow-lg shadow-indigo-200"
            onClick={() => navigate(`/editor/${stats.dailyQuestion._id}`)}
        >
            <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                    <Zap size={32} className="text-white" />
                </div>
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">Daily Challenge</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-white/20 text-white">
                            {stats.dailyQuestion.difficulty}
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-white">{stats.dailyQuestion.title}</h2>
                    <p className="text-indigo-100/80 text-sm mt-1 max-w-lg line-clamp-1">{stats.dailyQuestion.description}</p>
                </div>
            </div>
            <button className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-xl transition-all flex items-center space-x-2 shadow-md hover:bg-indigo-50">
                <span>Solve Now</span>
                <ArrowRight size={18} />
            </button>
        </div>
      )}

      {/* Practice Modes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
            className="bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden group cursor-pointer shadow-sm hover:border-indigo-500/50 transition-all"
            onClick={() => navigate("/interview")}
        >
            <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <BrainCircuit size={24} className="text-indigo-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Practice Interview</h2>
                    <p className="text-slate-500 text-sm mt-1">Talk to our AI to practice for interviews.</p>
                </div>
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                    <span>Start Practice</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>

        <div 
            className="bg-white border border-slate-200 p-8 rounded-3xl relative overflow-hidden group cursor-pointer shadow-sm hover:border-indigo-500/50 transition-all"
            onClick={() => navigate("/debug")}
        >
            <div className="relative z-10 space-y-4">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center">
                    <Bug size={24} className="text-slate-900" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Fix Code Bugs</h2>
                    <p className="text-slate-500 text-sm mt-1">Find and fix mistakes in broken code.</p>
                </div>
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <span>Start Debugging</span>
                    <ArrowRight size={16} />
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI COACH */}
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.05]">
            <BrainCircuit size={160} className="text-indigo-600" />
          </div>
          
          <div className="relative z-10">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <BrainCircuit className="text-indigo-600" size={20} />
              <span>AI Study Buddy</span>
            </h2>
            <p className="text-slate-700 text-xl font-semibold mb-6 max-w-2xl leading-snug">
              "You've been doing great with **Arrays**! Try focusing on **Dynamic Programming** next to boost your score for top companies."
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => navigate('/questions')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center space-x-2 text-sm"
              >
                <span>View Topics</span>
                <ArrowRight size={18} />
              </button>
              <button 
                onClick={() => navigate('/profile')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all border border-slate-200 text-sm"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-bold text-slate-900">Your Latest Work</h2>
            <button 
                onClick={() => navigate('/submissions')}
                className="text-xs text-indigo-600 font-bold hover:underline"
            >See All</button>
          </div>
          <div className="space-y-3 flex-1">
            {stats.recentSubmissions.length > 0 ? (
                stats.recentSubmissions.map((sub, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                        <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${sub.status === 'Accepted' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                            <span className="text-xs font-bold text-slate-700">Submission #{sub._id.slice(-4)}</span>
                        </div>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            sub.status === 'Accepted' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}>
                            {sub.status === 'Accepted' ? 'Passed' : 'Failed'}
                        </span>
                    </div>
                ))
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm text-center">
                    <p>No recent activity</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* TOPICS */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Practice Topics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Arrays', 'Strings', 'Dynamic Programming', 'Graphs'].map((topic, i) => (
            <button 
                key={i}
                onClick={() => navigate('/questions')}
                className="flex items-center space-x-3 p-4 bg-white border border-slate-200 rounded-2xl hover:border-indigo-500/50 transition-all text-left shadow-sm group"
            >
                <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-indigo-50 transition-colors">
                    <BookOpen size={18} className="text-slate-600 group-hover:text-indigo-600" />
                </div>
                <span className="font-bold text-slate-700 text-sm">{topic}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
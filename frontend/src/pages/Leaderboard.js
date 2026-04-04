import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
  Trophy, 
  User, 
  Crown, 
  Medal,
  TrendingUp,
  Loader2
} from "lucide-react";

function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/leaderboard");
        const sorted = (res.data || []).sort((a,b) => b.solved - a.solved);
        setUsers(sorted);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="text-amber-500" size={24} />;
    if (index === 1) return <Medal className="text-slate-400" size={22} />;
    if (index === 2) return <Medal className="text-amber-800" size={20} />;
    return <span className="text-slate-400 font-bold">{index + 1}</span>;
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-1 flex items-center gap-3">
            <Trophy className="text-amber-500" size={36} />
            Leaderboard
          </h1>
          <p className="text-slate-500 font-medium">Rankings of top performing developers on the platform.</p>
        </div>
        <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl flex items-center gap-3 shadow-sm">
            <TrendingUp size={18} className="text-indigo-600" />
            <span className="text-sm font-bold text-slate-700">Live Updates</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 pt-8">
        {users.slice(0, 3).map((user, i) => (
            <div 
                key={i}
                className={`relative flex flex-col items-center p-10 rounded-3xl border shadow-sm transition-transform hover:scale-[1.02] ${
                    i === 0 ? 'bg-white border-indigo-200 ring-4 ring-indigo-50 order-1 md:order-2 scale-110 z-10' :
                    i === 1 ? 'bg-white order-2 md:order-1 mt-4' :
                    'bg-white order-3 mt-8'
                }`}
            >
                <div className="mb-6 relative">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${
                        i === 0 ? 'border-amber-400' : 'border-slate-200'
                    } bg-slate-50`}>
                        <User size={32} className="text-slate-300" />
                    </div>
                    <div className="absolute -top-2 -right-2 bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                        {getRankIcon(i)}
                    </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-1">{user.user}</h3>
                <div className="px-4 py-1 bg-indigo-50 rounded-full text-indigo-600 text-xs font-bold">{user.solved} Solved</div>
            </div>
        ))}
      </div>

      {/* Full Leaderboard List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="grid grid-cols-12 px-8 py-4 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <div className="col-span-2">Rank</div>
            <div className="col-span-6">Developer</div>
            <div className="col-span-4 text-right">Problems Solved</div>
        </div>
        
        <div className="divide-y divide-slate-100">
            {users.map((user, index) => (
                <div 
                    key={index}
                    className="grid grid-cols-12 px-8 py-5 items-center hover:bg-slate-50 transition-colors group"
                >
                    <div className="col-span-2">
                        <span className={`text-sm font-bold ${index < 3 ? 'text-indigo-600' : 'text-slate-400'}`}>
                            #{index + 1}
                        </span>
                    </div>
                    <div className="col-span-6 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                            <User size={18} className="text-slate-400" />
                        </div>
                        <span className="text-base font-bold text-slate-900">{user.user}</span>
                    </div>
                    <div className="col-span-4 text-right">
                        <span className="text-lg font-bold text-slate-900">{user.solved}</span>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}


export default Leaderboard;
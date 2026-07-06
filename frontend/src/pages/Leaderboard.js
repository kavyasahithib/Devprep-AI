import React, { useEffect, useState } from "react";
import API from "../services/api";
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
        const res = await API.get("/leaderboard");
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
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  const getRankIcon = (index) => {
    if (index === 0) return <Crown className="text-amber-400" size={20} />;
    if (index === 1) return <Medal className="text-slate-300" size={18} />;
    if (index === 2) return <Medal className="text-amber-700" size={16} />;
    return <span className="text-white/30 font-bold text-xs">{index + 1}</span>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-[#090a0f] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            Leaderboard
          </h1>
          <p className="text-[11px] text-white/50 font-medium mt-0.5">Rankings of top performing developers on the platform.</p>
        </div>
        <div className="bg-[#18181b]/50 border border-white/5 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-sm shrink-0">
          <TrendingUp size={14} className="text-indigo-400" />
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">Live Updates</span>
        </div>
      </div>

      {/* Top 3 Podium */}
      {users.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10 mb-8 pt-4">
          {users.slice(0, 3).map((user, i) => (
            <div 
              key={i}
              className={`relative flex flex-col items-center p-6 rounded-2xl border shadow-lg transition-all ${
                i === 0 ? 'bg-[#1b1b24]/60 border-indigo-500/30 ring-2 ring-indigo-500/10 order-1 sm:order-2 sm:scale-105 z-10' :
                i === 1 ? 'bg-[#18181b]/40 border-white/5 order-2 sm:order-1 sm:mt-4' :
                'bg-[#18181b]/40 border-white/5 order-3 sm:mt-6'
              }`}
            >
              <div className="mb-4 relative shrink-0">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                  i === 0 ? 'border-amber-400 shadow-lg shadow-amber-400/10' : 'border-white/10'
                } bg-white/5`}>
                  <User size={24} className="text-white/30" />
                </div>
                <div className="absolute -top-1.5 -right-1.5 bg-[#18181b] p-1 rounded-full border border-white/10 shadow-md">
                  {getRankIcon(i)}
                </div>
              </div>
              <h3 className="text-base font-bold text-white mb-1.5 text-center truncate max-w-[150px]">{user.user}</h3>
              <div className="px-3 py-0.5 bg-indigo-500/10 border border-indigo-500/10 rounded-full text-indigo-400 text-[10px] font-bold">
                {user.solved} Solved
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Leaderboard List */}
      <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl overflow-hidden shadow-lg shadow-black/25 relative z-10">
        <div className="grid grid-cols-12 px-6 py-3 bg-white/[0.02] text-[9px] font-bold text-white/35 uppercase tracking-wider border-b border-white/5">
          <div className="col-span-2">Rank</div>
          <div className="col-span-7">Developer</div>
          <div className="col-span-3 text-right">Solved</div>
        </div>
        
        <div className="divide-y divide-white/5">
          {users.map((user, index) => (
            <div 
              key={index}
              className="grid grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors group"
            >
              <div className="col-span-2">
                <span className={`text-xs font-bold ${index < 3 ? 'text-indigo-400 font-extrabold' : 'text-white/40'}`}>
                  #{index + 1}
                </span>
              </div>
              <div className="col-span-7 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                  <User size={16} className="text-white/30" />
                </div>
                <span className="text-xs font-bold text-white/95 truncate max-w-[200px]">{user.user}</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm font-bold text-white/90">{user.solved}</span>
              </div>
            </div>
          ))}

          {users.length === 0 && (
            <div className="text-center py-10 text-white/20 text-xs">
              No developers on the leaderboard yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;
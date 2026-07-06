import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Calendar, 
  Brain, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Activity, 
  Cpu, 
  Database,
  Terminal,
  Code2,
  AlertTriangle,
  FileCode,
  BookOpen
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import API from "../services/api";

function UserStats() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSubmissionId, setActiveSubmissionId] = useState(null);

  useEffect(() => {
    const fetchUserStatsAndSubmissions = async () => {
      try {
        const [statsRes, subRes] = await Promise.all([
          API.get(`/users/${id}/stats`),
          API.get(`/users/${id}/submissions`)
        ]);
        setStats(statsRes.data);
        setSubmissions(subRes.data);
      } catch (error) {
        console.error("Failed to fetch user stats and submissions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserStatsAndSubmissions();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#090a0f] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#090a0f] text-white gap-4">
        <AlertTriangle className="text-amber-500" size={48} />
        <h2 className="text-xl font-bold">User Not Found</h2>
        <button 
          onClick={() => navigate("/admin/users")} 
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold uppercase transition-all"
        >
          Back to User Management
        </button>
      </div>
    );
  }

  const {
    user,
    solvedCount,
    totalSubmissions,
    difficultyStats,
    topicStats,
    timeComplexityStats,
    spaceComplexityStats,
    languageStats,
    activityTimeline,
    coachAnalysis
  } = stats;

  // Format Difficulty Data for Pie Chart
  const difficultyData = [
    { name: "Easy", value: difficultyStats.Easy || 0, color: "#10b981" },
    { name: "Medium", value: difficultyStats.Medium || 0, color: "#f59e0b" },
    { name: "Hard", value: difficultyStats.Hard || 0, color: "#ef4444" }
  ].filter(d => d.value > 0);

  // Format Complexities Data for Bar Charts
  const timeComplexityData = Object.entries(timeComplexityStats).map(([key, val]) => ({
    complexity: key,
    count: val
  }));

  const spaceComplexityData = Object.entries(spaceComplexityStats).map(([key, val]) => ({
    complexity: key,
    count: val
  }));

  // Format Topic Data for Radar Chart
  const topicData = Object.entries(topicStats).map(([key, val]) => ({
    subject: key,
    count: val,
    fullMark: Math.max(...Object.values(topicStats), 5)
  }));

  // Format Activity Data for Timeline Chart
  const activityData = activityTimeline.map(item => ({
    date: item._id,
    count: item.count
  }));

  // Fill in empty dates for activity line if it's sparse
  if (activityData.length === 1) {
    // Add dummy start point for nicer visual rendering of a single point line
    const prevDate = new Date(activityData[0].date);
    prevDate.setDate(prevDate.getDate() - 1);
    activityData.unshift({
      date: prevDate.toISOString().split('T')[0],
      count: 0
    });
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glowing accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        
        {/* Back navigation link */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/admin/users")}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Back to User Management</span>
          </button>
        </div>

        {/* Profile Card Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-lg shadow-black/25">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/5 shrink-0">
                <User className="text-indigo-400 animate-pulse" size={28} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold tracking-tight text-white/95">{user.name || "Unnamed User"}</h1>
                  <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    user.role === 'admin' 
                      ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' 
                      : 'bg-white/5 border-white/10 text-white/50'
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-[11px] text-white/40 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Mail size={12} className="text-white/20" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} className="text-white/20" />
                    Joined: {new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 self-stretch md:self-auto justify-end">
              {Object.keys(languageStats).length > 0 && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-right flex flex-col justify-center shrink-0">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">Languages Used</span>
                  <div className="flex gap-1.5 mt-1 justify-end">
                    {Object.entries(languageStats).map(([lang, count]) => (
                      <span key={lang} className="text-[8px] font-bold uppercase text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/15">
                        {lang} ({count})
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {user.college && (
                <div className="bg-white/[0.02] border border-white/5 rounded-xl px-4 py-2 text-right flex flex-col justify-center shrink-0">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">Institution</span>
                  <span className="text-xs font-bold text-white/80">{user.college}</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Metrics Widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/25 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
              <div className="flex items-center justify-between text-indigo-400 mb-2">
                <CheckCircle2 size={16} />
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">Total Solved</span>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-white/95">{solvedCount}</div>
                <p className="text-[9px] text-white/40 font-semibold mt-0.5">Accepted coding challenges</p>
              </div>
            </div>

            <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-lg shadow-black/25 relative overflow-hidden group hover:border-white/10 transition-all">
              <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="flex items-center justify-between text-emerald-400 mb-2">
                <Activity size={16} />
                <span className="text-[8px] font-bold uppercase tracking-wider text-white/30">Submissions</span>
              </div>
              <div>
                <div className="text-2xl font-black tracking-tight text-white/95">{totalSubmissions}</div>
                <p className="text-[9px] text-white/40 font-semibold mt-0.5">Attempted compilation runs</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts & Visualization Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Solve Rate Difficulty Doughnut */}
          <div className="lg:col-span-4 bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Activity className="text-indigo-400" size={14} /> Difficulty Breakdown
              </h2>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Categorization of successfully passed problems.</p>
            </div>
            
            <div className="h-[180px] w-full relative flex items-center justify-center">
              {difficultyData.length === 0 ? (
                <div className="text-white/20 italic text-[11px] font-bold text-center">No successful submissions to chart.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={difficultyData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {difficultyData.length > 0 && (
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-black text-white">{solvedCount}</span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-white/30">SOLVED</span>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-4 text-[9px] font-bold uppercase tracking-wider bg-white/[0.01] border border-white/5 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-emerald-500 block"></span>
                <span className="text-emerald-400">Easy ({difficultyStats.Easy || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-amber-500 block"></span>
                <span className="text-amber-400">Med ({difficultyStats.Medium || 0})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded bg-rose-500 block"></span>
                <span className="text-rose-400">Hard ({difficultyStats.Hard || 0})</span>
              </div>
            </div>
          </div>

          {/* Complexity Distribution Bar Charts */}
          <div className="lg:col-span-8 bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Cpu className="text-emerald-400" size={14} /> Solution Complexity Profiles
              </h2>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Big-O profiles extracted from correct submissions.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Time Complexity Chart */}
              <div>
                <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 text-center">Time Complexity Distribution</h3>
                <div className="h-[140px] w-full">
                  {timeComplexityData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/20 italic text-[10px]">No complexity data.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeComplexityData} margin={{ left: -30, right: 10 }}>
                        <XAxis dataKey="complexity" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} />
                        <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]}>
                          {timeComplexityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#6366f1" : "#4f46e5"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Space Complexity Chart */}
              <div>
                <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-2 text-center">Space Complexity Distribution</h3>
                <div className="h-[140px] w-full">
                  {spaceComplexityData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-white/20 italic text-[10px]">No complexity data.</div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spaceComplexityData} margin={{ left: -30, right: 10 }}>
                        <XAxis dataKey="complexity" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} />
                        <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 9 }} tickLine={false} allowDecimals={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                          itemStyle={{ fontSize: "11px" }}
                        />
                        <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]}>
                          {spaceComplexityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? "#10b981" : "#059669"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Second Row: Topic Proficiencies & Activity Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Radar Topic Mastery */}
          <div className="lg:col-span-5 bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Database className="text-indigo-400" size={14} /> Algorithmic Topic Focus
              </h2>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Analysis of tag solved distribution.</p>
            </div>

            <div className="h-[200px] w-full flex items-center justify-center">
              {topicData.length === 0 ? (
                <div className="text-white/20 italic text-[11px] font-bold text-center">No tag data available.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={topicData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 8, fontWeight: 700 }}
                    />
                    <PolarRadiusAxis domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar
                      name="Solved"
                      dataKey="count"
                      stroke="#818cf8"
                      fill="#818cf8"
                      fillOpacity={0.25}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity Timeline graph */}
          <div className="lg:col-span-7 bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col justify-between gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 flex items-center gap-2">
                <Terminal className="text-indigo-400" size={14} /> Submission Activity Graph
              </h2>
              <p className="text-[10px] text-white/35 font-medium mt-0.5">Attempt frequency timeline for the past 30 days.</p>
            </div>

            <div className="h-[200px] w-full">
              {activityData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-white/20 italic text-[11px] font-bold">No submissions logged in the past 30 days.</div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={activityData} margin={{ left: -25, right: 10 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.03)" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#475569" 
                      tick={{ fill: "#94a3b8", fontSize: 8 }} 
                      tickFormatter={(tick) => new Date(tick).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      tickLine={false}
                    />
                    <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 8 }} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      itemStyle={{ color: "#fff", fontSize: "11px", fontWeight: "bold" }}
                      labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="#4f46e5" 
                      strokeWidth={2}
                      dot={{ r: 3, stroke: '#818cf8', strokeWidth: 1, fill: '#090a0f' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* AI Performance Coach Section */}
        <div className="bg-[#18181b]/50 border border-indigo-500/10 rounded-2xl p-6 shadow-lg shadow-black/25 space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500/10 border border-indigo-500/20 rounded-xl flex items-center justify-center">
              <Brain className="text-indigo-400" size={16} />
            </div>
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/90">AI Engineering Coach Report</h2>
              <p className="text-[9px] text-white/40 font-medium">Automatic performance profiling and actionable guidance.</p>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 rounded-xl p-4 text-xs leading-relaxed text-white/80 select-text max-h-[300px] overflow-y-auto whitespace-pre-wrap font-sans">
            {coachAnalysis ? (
              coachAnalysis
            ) : (
              <div className="text-white/30 italic text-center py-6">Generating profile evaluations require active coding solutions. Solve some lessons to unlock.</div>
            )}
          </div>
        </div>

        {/* User Submissions History Records */}
        <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl shadow-lg shadow-black/25 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <Code2 className="text-indigo-400" size={16} />
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/90">Submission Records</h3>
            </div>
            <span className="text-[9px] font-bold text-white/40 bg-white/5 px-2.5 py-1 rounded-lg">
              {submissions.length} Records Found
            </span>
          </div>

          {/* Submissions Table List */}
          <div className="divide-y divide-white/5">
            {submissions.length === 0 ? (
              <div className="py-12 text-center">
                <FileCode size={32} className="mx-auto text-white/10 mb-3" />
                <p className="text-white/35 font-bold uppercase tracking-wider text-[10px]">No submissions recorded</p>
              </div>
            ) : (
              submissions.map((sub) => {
                const isActive = activeSubmissionId === sub._id;
                return (
                  <div key={sub._id} className="transition-all hover:bg-white/[0.01]">
                    {/* Collapsed view summary line */}
                    <div 
                      onClick={() => setActiveSubmissionId(isActive ? null : sub._id)}
                      className="grid grid-cols-1 md:grid-cols-12 px-6 py-3.5 items-center gap-3 md:gap-0 cursor-pointer select-none"
                    >
                      <div className="col-span-3 flex items-center gap-3">
                        {sub.status === "Accepted" ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <XCircle size={16} className="text-rose-400 shrink-0" />
                        )}
                        <div>
                          <div className="font-bold text-xs text-white/95 hover:text-indigo-400 transition-colors">
                            {sub.questionId?.title || "Custom Code"}
                          </div>
                          <div className="text-[9px] text-white/30 font-medium mt-0.5">
                            {new Date(sub.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                          </div>
                        </div>
                      </div>

                      <div className="col-span-2">
                        {sub.questionId?.difficulty && (
                          <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                            sub.questionId.difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10" :
                            sub.questionId.difficulty === "Medium" ? "text-amber-400 bg-amber-500/10 border border-amber-500/10" :
                            "text-rose-400 bg-rose-500/10 border border-rose-500/10"
                          }`}>
                            {sub.questionId.difficulty}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2">
                        <span className="text-[9px] font-bold font-mono text-white/60 bg-white/5 border border-white/10 px-2 py-0.5 rounded uppercase tracking-wider">
                          {sub.language}
                        </span>
                      </div>

                      <div className="col-span-3 text-[10px] text-white/60 font-semibold flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Cpu size={12} className="text-white/20" /> Time: {sub.timeComplexity || "O(?)"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Database size={12} className="text-white/20" /> Space: {sub.spaceComplexity || "O(?)"}
                        </span>
                      </div>

                      <div className="col-span-2 flex justify-end">
                        {sub.plagiarismScore > 0 && (
                          <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded border mr-2 flex items-center gap-1 ${
                            sub.plagiarismScore > 35 
                              ? 'bg-rose-500/10 border-rose-500/25 text-rose-400' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            Copied: {sub.plagiarismScore}%
                          </span>
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300">
                          {isActive ? "Collapse" : "Inspect"}
                        </span>
                      </div>
                    </div>

                    {/* Expanded inspection details */}
                    {isActive && (
                      <div className="px-6 pb-6 border-t border-white/[0.03] pt-4 bg-white/[0.01] grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn">
                        
                        {/* Left Side: Code Block */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-white/40 flex items-center gap-1.5">
                              <FileCode size={12} className="text-white/20" /> Candidate Solution
                            </span>
                          </div>
                          <div className="bg-[#0c0d12] border border-white/5 rounded-xl p-4 overflow-x-auto max-h-[300px] overflow-y-auto">
                            <pre className="text-[11px] font-mono text-indigo-200/90 whitespace-pre leading-relaxed select-text">
                              <code>{sub.code}</code>
                            </pre>
                          </div>
                        </div>

                        {/* Right Side: AI Feedback/Diagnoses */}
                        <div className="space-y-4 flex flex-col justify-between">
                          <div className="space-y-3">
                            {/* Complexity breakdown */}
                            {sub.complexityAnalysis && (
                              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                                  <Cpu size={12} /> Complexity Diagnosis
                                </span>
                                <div className="text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap select-text">
                                  {sub.complexityAnalysis}
                                </div>
                              </div>
                            )}

                            {/* Reviews */}
                            {sub.aiReview && (
                              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                                  <Brain size={12} /> AI Code Review Summary
                                </span>
                                <div className="text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap select-text max-h-[160px] overflow-y-auto">
                                  {sub.aiReview}
                                </div>
                              </div>
                            )}

                            {/* Explanations */}
                            {sub.aiExplanation && (
                              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-3.5 space-y-1.5">
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                                  <BookOpen size={12} /> Sequential Logic Explanation
                                </span>
                                <div className="text-[11px] leading-relaxed text-white/70 whitespace-pre-wrap select-text max-h-[160px] overflow-y-auto">
                                  {sub.aiExplanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserStats;

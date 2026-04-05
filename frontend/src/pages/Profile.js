import React, { useEffect, useState } from "react";
import API from "../services/api";
import { motion } from "framer-motion";
import { 
  User, 
  Mail, 
  GitBranch as Github, 
  BrainCircuit, 
  BarChart3, 
  CheckCircle2,
  Loader2
} from "lucide-react";
import SkillsRadar from "../components/SkillsRadar";
import ActivityHeatmap from "../components/ActivityHeatmap";


function Profile() {
  const [profile, setProfile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profRes, activityRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/submissions/activity")
        ]);
        setProfile(profRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await API.get("/submissions/analyze");
      setAiAnalysis(res.data);
    } catch (error) {
      console.error("Error running AI analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGithubSync = async () => {
    if (!profile.githubToken) {
      alert("Please connect GitHub first.");
      return;
    }
    setSyncing(true);
    try {
      const subRes = await API.get("/submissions/my-submissions");
      const latestAccepted = subRes.data.find(s => s.status === "Accepted");
      if (!latestAccepted) {
        alert("No accepted solutions found to sync!");
        return;
      }
      
      const res = await API.post(`/submissions/sync/${latestAccepted._id}`);
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="text-center">
          <p className="text-slate-900 text-lg font-bold">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      {/* Header Profile Card */}
      <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
            <User size={64} className="text-slate-400" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold text-slate-900 mb-1">{profile.name}</h1>
          <div className="flex items-center justify-center md:justify-start space-x-4 text-slate-500 mb-6 font-medium text-sm">
            <div className="flex items-center space-x-1.5">
                <Mail size={16} />
                <span>{profile.email}</span>
            </div>
            <span className="text-slate-200">|</span>
            <span className="text-indigo-600 font-bold">Senior Developer</span>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
            <button 
                onClick={runAiAnalysis}
                disabled={analyzing}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2.5 px-6 rounded-xl transition-all flex items-center space-x-2 shadow-md"
            >
                {analyzing ? <Loader2 className="animate-spin" size={20} /> : <BrainCircuit size={20} />}
                <span>AI Performance Review</span>
            </button>
            <button 
                onClick={() => {
                    if (profile.githubToken) {
                        handleGithubSync();
                    } else {
                        window.location.href = "http://localhost:5000/api/users/github/auth";
                    }
                }}
                disabled={syncing}
                className={`font-bold py-2.5 px-6 rounded-xl transition-all flex items-center space-x-2 border shadow-sm ${
                    profile.githubToken ? "bg-white hover:bg-slate-50 text-slate-700 border-slate-200" : "bg-slate-900 text-white hover:bg-black border-transparent"
                }`}
            >
                {syncing ? <Loader2 className="animate-spin" size={20} /> : <Github size={20} />}
                <span>{profile.githubToken ? "Sync Solutions" : "Connect GitHub"}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stats & Radar Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Skills Matrix</h3>
            <SkillsRadar data={aiAnalysis?.stats?.topics ? Object.entries(aiAnalysis.stats.topics).map(([k, v]) => ({ subject: k, A: Math.min(100, v * 20), fullMark: 100 })) : []} />
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Achievements</h3>
            <div className="space-y-3">
              {['Early Adopter', 'Problem Solver', 'Consistency King'].map((badge) => (
                <div key={badge} className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <CheckCircle2 className="text-emerald-500" size={18} />
                  <span className="text-sm font-semibold text-slate-700">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights & Heatmap Column */}
        <div className="md:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
                <div className="flex items-center space-x-2 mb-8">
                    <BrainCircuit className="text-indigo-600" size={24} />
                    <h2 className="text-2xl font-bold text-slate-900">Learning Insights</h2>
                </div>

                {aiAnalysis ? (
                    <div className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap mb-8">
                        {aiAnalysis.analysis}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 mb-8">
                        <BarChart3 className="mx-auto text-slate-300 mb-4" size={48} />
                        <p className="text-slate-500 font-bold">No active analysis. Click Review above to start.</p>
                    </div>
                )}

                <div className="pt-8 border-t border-slate-100">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">Submission Activity</h3>
                    <ActivityHeatmap data={activity} />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}


export default Profile;
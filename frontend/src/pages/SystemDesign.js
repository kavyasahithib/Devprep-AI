import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Layout, 
  Database, 
  Globe, 
  Shield, 
  Cpu, 
  ChevronLeft,
  BrainCircuit,
  Zap,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../services/api";

function SystemDesign() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(null);
  const [thoughtProcess, setThoughtProcess] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { id: "twitter", title: "Design Twitter (Timeline & Feed)", icon: <Globe size={16} />, detail: "Scalability, fan-out, eventual consistency." },
    { id: "rate-limiter", title: "Design a Global Rate Limiter", icon: <Shield size={16} />, detail: "Distributed locking, token bucket algorithm." },
    { id: "url-shortener", title: "Design TinyURL", icon: <Database size={16} />, detail: "Key generation, hashing, redirection." }
  ];

  const handleEvaluate = async () => {
    if (!thoughtProcess.trim()) return;
    setLoading(true);
    try {
      const res = await API.post("/submissions/system-design", { 
        topic: activeTopic.title, 
        thoughtProcess 
      });
      setEvaluation(res.data.explanation);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#090a0f] flex flex-col overflow-hidden font-sans text-white">
      {/* Header */}
      <header className="h-14 bg-[#18181b]/60 border-b border-white/10 flex items-center justify-between px-6 shadow-sm z-20 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-1.5 bg-white/5 border border-white/15 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Layout size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">System Design</h1>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Draft and analyze architectural solutions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-6 gap-6">
        {/* Left: Scenarios */}
        <div className="w-[320px] space-y-4 shrink-0 overflow-y-auto custom-scrollbar">
          <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Case Selection</h3>
          <div className="space-y-3">
            {scenarios.map(s => (
              <div 
                key={s.id}
                onClick={() => {
                  setActiveTopic(s);
                  setThoughtProcess("");
                  setEvaluation("");
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer group ${
                  activeTopic?.id === s.id 
                    ? "bg-[#1b1b24]/60 border-indigo-500/30 shadow-lg" 
                    : "bg-[#18181b]/40 border-white/5 hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-3 mb-2.5">
                  <div className={`p-2 rounded-lg transition-all ${
                    activeTopic?.id === s.id ? "bg-indigo-600 text-white" : "bg-white/5 text-indigo-400"
                  }`}>
                    {s.icon}
                  </div>
                  <span className="font-bold text-xs tracking-tight text-white/95">{s.title}</span>
                </div>
                <p className={`text-[10px] font-semibold leading-relaxed ${
                  activeTopic?.id === s.id ? "text-white/60" : "text-white/40"
                }`}>{s.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Thought Input & Evaluation */}
        <div className="flex-1 bg-[#18181b]/40 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden flex flex-col">
          {!activeTopic ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <Cpu size={64} className="mb-4 text-white/10" />
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Select a case to begin</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">{activeTopic.title}</h2>
                  <p className="text-[10px] text-white/40 font-medium mt-0.5">Submit your architectural reasoning for AI analysis</p>
                </div>
                <button 
                  onClick={handleEvaluate}
                  disabled={loading || !thoughtProcess.trim()}
                  className="bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-9 px-5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md cursor-pointer shrink-0"
                >
                  {loading ? <Loader2 className="animate-spin text-black" size={14} /> : <Zap size={14} />}
                  <span>Analyze Design</span>
                </button>
              </div>

              <div className="flex-1 flex flex-col sm:flex-row overflow-hidden p-6 gap-6">
                <textarea 
                  value={thoughtProcess}
                  onChange={(e) => setThoughtProcess(e.target.value)}
                  placeholder="Describe your architecture strategy... (e.g. database choices, caching keys, API endpoints, read/write optimization)"
                  className="flex-1 h-full bg-white/[0.02] border border-white/10 rounded-xl p-4 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 text-white font-semibold text-xs resize-none placeholder:text-white/20 leading-relaxed"
                />

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {evaluation ? (
                      <motion.div 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-[#1b1b24]/60 p-5 rounded-xl border border-indigo-500/20 text-white/90 font-semibold text-xs leading-relaxed"
                      >
                        <h4 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Analysis Results</h4>
                        <div className="space-y-3.5">
                          {evaluation.split('\n').map((line, i) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      </motion.div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12">
                        <BrainCircuit size={40} className="mb-3 text-white/10" />
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Awaiting Solution Submission</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default SystemDesign;

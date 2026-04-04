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
import axios from "axios";

function SystemDesign() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(null);
  const [thoughtProcess, setThoughtProcess] = useState("");
  const [evaluation, setEvaluation] = useState("");
  const [loading, setLoading] = useState(false);

  const scenarios = [
    { id: "twitter", title: "Design Twitter (Timeline & Feed)", icon: <Globe />, detail: "Scalability, fan-out, eventual consistency." },
    { id: "rate-limiter", title: "Design a Global Rate Limiter", icon: <Shield />, detail: "Distributed locking, token bucket algorithm." },
    { id: "url-shortener", title: "Design TinyURL", icon: <Database />, detail: "Key generation, hashing, redirection." }
  ];

  const handleEvaluate = async () => {
    if (!thoughtProcess.trim()) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/submissions/explanation", {
        code: `Topic: ${activeTopic.title}\n\nCandidate Thought Process:\n${thoughtProcess}`,
        language: 'text'
      }, {
        headers: { Authorization: "Bearer " + token }
      });
      setEvaluation(res.data.explanation);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shadow-sm z-20">
        <div className="flex items-center space-x-8">
          <button onClick={() => navigate(-1)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all">
            <ChevronLeft size={24} />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-900 rounded-2xl">
                <Layout size={24} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">System Design</h1>
              <p className="text-xs text-slate-500 font-medium">Draft and analyze architectural solutions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden p-8 gap-8">
        {/* Left: Scenarios */}
        <div className="w-[400px] space-y-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Case Selection</h3>
            <div className="space-y-4">
                {scenarios.map(s => (
                    <div 
                        key={s.id}
                        onClick={() => setActiveTopic(s)}
                        className={`p-6 rounded-[2rem] border transition-all cursor-pointer group ${
                            activeTopic?.id === s.id 
                                ? "bg-slate-900 border-slate-900 shadow-xl text-white" 
                                : "bg-white border-slate-200 hover:border-indigo-400 text-slate-900"
                        }`}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-3 rounded-xl transition-all ${
                                activeTopic?.id === s.id ? "bg-indigo-600 text-white" : "bg-slate-50 text-indigo-600"
                            }`}>
                                {s.icon}
                            </div>
                            <span className="font-bold text-sm tracking-tight">{s.title}</span>
                        </div>
                        <p className={`text-xs font-medium leading-relaxed ${
                            activeTopic?.id === s.id ? "text-slate-400" : "text-slate-500"
                        }`}>{s.detail}</p>
                    </div>
                ))}
            </div>
        </div>

        {/* Right: Thought Input & Evaluation */}
        <div className="flex-1 bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col">
            {!activeTopic ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 p-20 grayscale">
                    <Cpu size={120} className="mb-10 text-slate-300" />
                    <p className="text-sm font-bold uppercase tracking-widest">Select a case to begin</p>
                </div>
            ) : (
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="p-10 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{activeTopic.title}</h2>
                            <p className="text-xs font-medium text-slate-500 mt-1">Submit your architectural reasoning for AI analysis</p>
                        </div>
                        <button 
                            onClick={handleEvaluate}
                            disabled={loading || !thoughtProcess.trim()}
                            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-900 transition-all flex items-center gap-3"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
                            <span>Analyze Design</span>
                        </button>
                    </div>

                    <div className="flex-1 flex overflow-hidden p-10 gap-10">
                        <textarea 
                            value={thoughtProcess}
                            onChange={(e) => setThoughtProcess(e.target.value)}
                            placeholder="Describe your architecture strategy... (e.g. storage layer, caching, load balancing)"
                            className="flex-1 h-full bg-slate-50 border border-slate-200 rounded-[2rem] p-8 outline-none focus:border-indigo-400 transition-all text-slate-900 font-medium text-sm resize-none"
                        />

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {evaluation ? (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="bg-white p-10 rounded-[2rem] border border-slate-100 shadow-sm text-slate-900 font-medium text-sm leading-relaxed"
                                    >
                                        <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-6 border-b border-slate-100 pb-2">Analysis Results</h4>
                                        <div className="space-y-4">
                                            {evaluation.split('\n').map((line, i) => (
                                                <p key={i}>{line}</p>
                                            ))}
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-center opacity-20 py-20 grayscale">
                                        <BrainCircuit size={64} className="mb-6" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting Solution Submission</p>
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

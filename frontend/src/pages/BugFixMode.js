import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Editor } from "@monaco-editor/react";
import { 
  Bug, 
  ChevronLeft, 
  Loader2, 
  BrainCircuit,
  RotateCcw,
  MessageSquare,
  Zap
} from "lucide-react";

function BugFixMode() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [buggyCode, setBuggyCode] = useState("");
  const [fixedCode, setFixedCode] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const fetchBuggyCode = async () => {
      try {
        let activeId = id;
        
        if (!activeId || activeId === ":id") {
            const qRes = await API.get("/questions/daily");
            if (qRes.data && qRes.data._id) {
                activeId = qRes.data._id;
            } else {
                const allRes = await API.get("/questions");
                if (allRes.data && allRes.data.length > 0) {
                    activeId = allRes.data[0]._id;
                }
            }
        }

        if (!activeId) throw new Error("No questions available");

        const res = await API.get(`/debug/${activeId}`);
        setQuestion(res.data.question);
        setBuggyCode(res.data.buggyCode);
        setFixedCode(res.data.buggyCode);
      } catch (error) {
        console.error("Failed to fetch buggy code:", error);
        const errorMsg = error.response?.data?.message || error.message;
        alert(`Bug Fixer failed: ${errorMsg}. Returning to dashboard.`);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchBuggyCode();
  }, [id, navigate]);

  const handleSubmit = async () => {
    setAnalyzing(true);
    try {
      const res = await API.post(`/debug/${question._id}/analyze`, {
        buggyCode,
        fixedCode,
        language: 'javascript'
      });
      setAnalysis(res.data.analysis);
      setCompleted(true);
    } catch (error) {
      console.error("Analysis Error:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFixedCode(buggyCode);
    setAnalysis("");
    setCompleted(false);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#090a0f] flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <div className="text-white/40 text-xs font-bold tracking-widest uppercase">Loading Challenge...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#090a0f] flex flex-col overflow-hidden font-sans text-white">
      {/* Header Bar */}
      <header className="h-14 bg-[#18181b]/60 border-b border-white/10 flex items-center justify-between px-6 shadow-sm z-20 backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="p-1.5 bg-white/5 border border-white/15 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-rose-500/10 rounded-lg">
              <Bug size={16} className="text-rose-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Bug Fixer</h1>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Target: {question?.title}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button 
            onClick={handleReset}
            className="p-2 text-white/40 hover:text-rose-400 transition-all cursor-pointer"
            title="Reset Code"
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={handleSubmit}
            disabled={analyzing || completed}
            className="bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-9 px-5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
          >
            {analyzing ? <Loader2 className="animate-spin text-black" size={14} /> : <Zap size={14} />}
            <span>{analyzing ? "Analyzing..." : "Verify Fix"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Description & Feedback */}
        <div className="w-[450px] border-r border-white/5 flex flex-col bg-[#18181b]/40 backdrop-blur-xl shadow-lg z-10 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <section className="space-y-2.5">
              <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Objective</h3>
              <p className="text-xs font-semibold text-white/80 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                {question?.description}
              </p>
            </section>

            {completed ? (
              <section className="space-y-3">
                <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                  <BrainCircuit size={14} className="text-indigo-400" />
                  AI Analysis
                </h3>
                <div className="bg-[#1b1b24]/60 p-4 rounded-xl border border-indigo-500/20 text-white/90 font-semibold text-xs leading-relaxed whitespace-pre-wrap">
                  {analysis}
                </div>
              </section>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white/[0.01] rounded-2xl border border-dashed border-white/10">
                <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquare size={20} className="text-white/20" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">Awaiting Fix</p>
                  <p className="text-white/40 text-[10px] font-semibold max-w-[200px] leading-relaxed">The code contains a subtle bug. Find it and click Verify Fix.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          <div className="h-9 bg-[#252525] border-b border-white/5 flex items-center px-6 gap-2">
            <span className="text-[9px] font-bold text-white/45 uppercase tracking-widest">source.js</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={fixedCode}
              onChange={(v) => setFixedCode(v || "")}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                padding: { top: 16 },
                lineNumbers: "on",
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default BugFixMode;

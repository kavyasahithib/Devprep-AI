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
            // Fetch daily or first available question
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
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="text-slate-900 font-bold tracking-wider">Loading Challenge...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-20">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-50 rounded-xl">
                <Bug size={20} className="text-rose-500" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Bug Fixer</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Target: {question?.title}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button 
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-rose-500 transition-all"
            title="Reset Code"
          >
            <RotateCcw size={18} />
          </button>
          <button 
            onClick={handleSubmit}
            disabled={analyzing || completed}
            className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
            <span>{analyzing ? "Analyzing..." : "Verify Fix"}</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Description & Feedback */}
        <div className="w-[480px] border-r border-slate-200 flex flex-col bg-white shadow-sm z-10 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            <section className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Objective</h3>
                <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {question?.description}
                </p>
            </section>

            {completed ? (
                <section className="space-y-6">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <BrainCircuit size={18} className="text-indigo-600" />
                        AI Analysis
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                        {analysis}
                    </div>
                </section>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <MessageSquare size={28} className="text-slate-300" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Awaiting Fix</p>
                        <p className="text-slate-400 text-[11px] font-medium max-w-[200px] leading-relaxed">The code contains a subtle bug. Find it and click Verify Fix.</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden">
          <div className="h-10 bg-[#252525] border-b border-white/5 flex items-center px-6 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">source.js</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={fixedCode}
              onChange={(v) => setFixedCode(v || "")}
              options={{
                fontSize: 15,
                minimap: { enabled: false },
                padding: { top: 20 },
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

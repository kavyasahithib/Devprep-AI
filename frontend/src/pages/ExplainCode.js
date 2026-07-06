import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { Editor } from "@monaco-editor/react";
import { 
  FileSearch, 
  BrainCircuit, 
  Loader2, 
  ChevronLeft, 
  Sparkles,
  MessageSquare
} from "lucide-react";

function ExplainCode() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const handleExplain = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    try {
      const res = await API.post("/submissions/explanation", { code, language: 'javascript' });
      setExplanation(res.data.explanation);
    } catch (error) {
      console.error("Explanation Error:", error);
      alert("Failed to analyze code. Please ensure it's valid syntax.");
    } finally {
      setAnalyzing(false);
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
              <FileSearch size={16} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-none">Code Explainer</h1>
              <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Line-by-line Analysis</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleExplain}
          disabled={analyzing || !code.trim()}
          className="bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-9 px-5 rounded-lg transition-all text-xs flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          {analyzing ? <Loader2 className="animate-spin text-black" size={14} /> : <Sparkles size={14} />}
          <span>{analyzing ? "Analyzing..." : "Explain Code"}</span>
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Input Pane */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative border-r border-white/5">
          <div className="h-9 bg-[#252525] border-b border-white/5 flex items-center px-6 gap-2">
            <span className="text-[9px] font-bold text-white/45 uppercase tracking-widest">editor.js</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v || "")}
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

        {/* Right: Explanation Pane */}
        <div className="w-[450px] flex flex-col bg-[#18181b]/40 backdrop-blur-xl border-l border-white/5 shadow-lg z-10 overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-6">
            <h3 className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <BrainCircuit size={14} className="text-indigo-400" />
              AI Explanation
            </h3>

            {explanation ? (
              <div className="bg-[#1b1b24]/60 p-4 rounded-xl border border-indigo-500/20 text-white/90 font-semibold text-xs leading-relaxed whitespace-pre-wrap">
                {explanation}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 bg-white/[0.01] rounded-2xl border border-dashed border-white/10 p-6">
                <div className="w-10 h-10 bg-white/5 border border-white/5 rounded-xl flex items-center justify-center shadow-md">
                  <MessageSquare size={20} className="text-white/20" />
                </div>
                <div className="w-full">
                  <p className="text-xs font-bold text-white/80 mb-1">Ready for analysis</p>
                  <p className="text-white/40 text-[10px] font-semibold max-w-[200px] leading-relaxed mx-auto mb-4">
                    {code.trim() ? "Your code is ready. Click below to generate a detailed breakdown." : "Paste your code in the editor to get a detailed line-by-line breakdown."}
                  </p>
                  
                  {code.trim() && (
                    <button 
                      onClick={handleExplain}
                      disabled={analyzing}
                      className="bg-white hover:bg-slate-100 text-black font-semibold h-9 px-4 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 mx-auto w-full max-w-[150px] cursor-pointer"
                    >
                      {analyzing ? <Loader2 className="animate-spin text-black" size={14} /> : <Sparkles size={14} />}
                      <span>{analyzing ? "Analyzing..." : "Explain Code"}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default ExplainCode;

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
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-20">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 rounded-xl">
                <FileSearch size={20} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">Code Explainer</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Line-by-line Analysis</p>
            </div>
          </div>
        </div>

        <button 
          onClick={handleExplain}
          disabled={analyzing || !code.trim()}
          className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          <span>{analyzing ? "Analyzing..." : "Explain Code"}</span>
        </button>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Left: Input Pane */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative border-r border-white/5">
          <div className="h-10 bg-[#252525] border-b border-white/5 flex items-center px-6 gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-70">editor.js</span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v || "")}
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

        {/* Right: Explanation Pane */}
        <div className="w-[500px] flex flex-col bg-white shadow-xl z-10 overflow-y-auto custom-scrollbar">
          <div className="p-8 space-y-8">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit size={18} className="text-indigo-600" />
                AI Explanation
            </h3>

            {explanation ? (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-slate-700 font-medium text-sm leading-relaxed whitespace-pre-wrap">
                    {explanation}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100 p-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <MessageSquare size={32} className="text-slate-300" />
                    </div>
                    <div className="w-full">
                        <p className="text-sm font-bold text-slate-600 mb-2">Ready for analysis</p>
                        <p className="text-slate-400 text-[11px] font-medium max-w-[250px] leading-relaxed mx-auto mb-6">
                            {code.trim() ? "Your code is ready. Click below to generate a detailed breakdown." : "Paste your code in the editor to get a detailed line-by-line breakdown."}
                        </p>
                        
                        {code.trim() && (
                            <button 
                                onClick={handleExplain}
                                disabled={analyzing}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-[200px]"
                            >
                                {analyzing ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
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

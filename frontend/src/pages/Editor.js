import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import API from "../services/api";
import { Editor, DiffEditor } from "@monaco-editor/react";
import {
  Play,
  Send,
  Code2,
  MessageSquare,
  Lightbulb,
  History,
  ChevronDown,
  BrainCircuit,
  Maximize2,
  Settings,
  ChevronLeft,
  ChevronRight,
  Database,
  Cpu,
  Plus,
  X,
  FileCode,
  Zap,
  Command,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initVimMode } from 'monaco-vim';

const codeTemplates = {
  javascript: `function solution() {\n  // Type your code here\n}`,
  python: `def solution():\n    # Type your code here\n    pass`,
  java: `public class Main {\n    public static void main(String[] args) {\n        // Type your code here\n    }\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Type your code here\n    return 0;\n}`
};

function CodeEditor() {
  const { id } = useParams();

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [isCustom, setIsCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [hints, setHints] = useState([]);
  const [review, setReview] = useState("");
  const [explanation, setExplanation] = useState("");
  const [complexity, setComplexity] = useState("");
  const [submissions, setSubmissions] = useState([]);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [isComparing, setIsComparing] = useState(false);
  const [loadingHints, setLoadingHints] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [testResults, setTestResults] = useState(null);
  const [vimEnabled, setVimEnabled] = useState(false);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [consoleHeight, setConsoleHeight] = useState(256);
  const [isResizing, setIsResizing] = useState(false);
  const isResizingRef = useRef(false);
  const editorRef = useRef(null);
  const vimModeRef = useRef(null);
  const statusNodeRef = useRef(null);

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const templates = Object.values(codeTemplates);
    if (!code.trim() || templates.some(t => t.trim() === code.trim())) {
      setCode(codeTemplates[newLang] || "");
    }
  };

  const toggleConsole = () => {
    if (consoleHeight > 40) {
      setConsoleHeight(40);
    } else {
      setConsoleHeight(256);
    }
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions = [
          {
            label: 'clg',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Console Log',
            insertText: 'console.log(${1:obj});',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'tryc',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Try Catch Block',
            insertText: 'try {\n\t$1\n} catch (error) {\n\tconsole.error(error);\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
          {
            label: 'fn',
            kind: monaco.languages.CompletionItemKind.Snippet,
            documentation: 'Function Template',
            insertText: 'function ${1:name}(${2:params}) {\n\t$0\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range: range,
          },
        ];
        return { suggestions: suggestions };
      },
    });

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (formatOnSave) {
        editor.getAction('editor.action.formatDocument').run();
      }
    });

    if (!statusNodeRef.current) {
        statusNodeRef.current = document.createElement('div');
        statusNodeRef.current.className = 'vim-status-bar absolute bottom-0 right-0 bg-[#252525] text-xs px-2 py-1 text-slate-400 z-50 rounded-tl-lg border-t border-l border-white/10';
        editor.getDomNode()?.parentElement?.appendChild(statusNodeRef.current);
    }
  };

  useEffect(() => {
    if (editorRef.current && vimEnabled) {
      vimModeRef.current = initVimMode(editorRef.current, statusNodeRef.current);
    } else {
      if (vimModeRef.current) {
        vimModeRef.current.dispose();
      }
    }
  }, [vimEnabled]);

  const startResizing = useCallback((e) => {
    e.preventDefault(); 
    isResizingRef.current = true;
    setIsResizing(true);
  }, []);

  const resize = useCallback((e) => {
    if (isResizingRef.current) {
      requestAnimationFrame(() => {
          let newH = window.innerHeight - e.clientY;
          if (newH >= window.innerHeight - 200) newH = window.innerHeight - 200;
          if (newH < 40) newH = 40;
          setConsoleHeight(newH);
      });
    }
  }, []);

  const stopResizing = useCallback(() => {
    isResizingRef.current = false;
    setIsResizing(false);
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [resize, stopResizing]);

  useEffect(() => {
    const fetchQuestionDetails = async () => {
      try {
        const [qRes, subRes] = await Promise.all([
          API.get(`/questions/${id}`),
          API.get("/submissions/my-submissions")
        ]);
        setQuestion(qRes.data);
        setCode(qRes.data.template || codeTemplates.javascript);
        
        const filtered = subRes.data.filter(s => s.questionId?._id === id);
        setSubmissions(filtered);
      } catch (error) {
        console.error(error);
      }
    };
    fetchQuestionDetails();
  }, [id]);

  const getHints = async () => {
    setLoadingHints(true);
    try {
      const res = await API.get(`/questions/${id}/hints`);
      setHints(res.data.hints);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHints(false);
    }
  };

  const handleRun = async () => {
    setOutput("// Running tests...");
    setTestResults(null);
    setConsoleHeight(256); // expand console panel to view outputs
    try {
      const res = await API.post(`/submissions/run`, {
        code,
        language,
        customInput: isCustom ? customInput : ""
      });
      const runResult = res.data.result;
      const stdout = runResult?.stdout || "";
      const stderr = runResult?.stderr || "";
      const compile = runResult?.compile_output || "";
      const statusDesc = runResult?.status?.description || "";

      if (stderr || compile) {
        setOutput(`Error: ${stderr || compile}`);
      } else {
        setOutput(stdout || `Executed successfully: ${statusDesc}`);
      }
    } catch (error) {
      setOutput(error.response?.data?.message || "Compilation error");
    }
  };

  const handleSubmit = async () => {
    setOutput("// Evaluating solution...");
    setTestResults(null);
    setConsoleHeight(256);
    setLoadingAI(true);
    setActiveTab("ai-feedback"); // Switch tab to AI diagnosis
    try {
      const res = await API.post(`/submissions/submit`, {
        questionId: id,
        code,
        language
      });
      setTestResults(res.data.testResults);
      setReview(res.data.review || "Code successfully submitted");
      setExplanation(res.data.explanation || "Evaluation passed");
      setComplexity(res.data.complexity || "Time: O(N) | Space: O(1)");
      
      const subRes = await API.get("/submissions/my-submissions");
      const filtered = subRes.data.filter(s => s.questionId?._id === id);
      setSubmissions(filtered);
    } catch (error) {
      setOutput(error.response?.data?.message || "Submission error");
      setReview("Analysis failed. Please fix syntax bugs and try again.");
    } finally {
      setLoadingAI(false);
    }
  };

  if (!question) {
    return (
      <div className="h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#090a0f] flex flex-col font-sans text-white overflow-hidden selection:bg-indigo-500/30">
      {/* Header Area */}
      <header className="h-14 bg-[#18181b]/60 border-b border-white/10 flex items-center justify-between px-6 shadow-sm z-20 backdrop-blur-xl shrink-0">
        <div className="flex items-center space-x-4">
          <Link to="/questions" className="p-1.5 bg-white/5 border border-white/15 rounded-lg text-white/70 hover:text-white transition-all">
            <ChevronLeft size={16} />
          </Link>
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
              <Code2 size={16} className="text-indigo-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight leading-none">Coding Workspace</span>
          </div>
        </div>

        <div className="flex items-center space-x-3.5">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="bg-white/5 border border-white/10 text-white font-bold text-xs py-1.5 px-3 rounded-lg outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="javascript" className="bg-[#18181b] text-white">JavaScript</option>
            <option value="python" className="bg-[#18181b] text-white">Python</option>
            <option value="java" className="bg-[#18181b] text-white">Java</option>
            <option value="cpp" className="bg-[#18181b] text-white">C++</option>
          </select>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={handleRun}
              className="bg-white/5 hover:bg-white/10 text-white border border-white/10 font-bold text-xs h-9 px-4 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Play size={12} />
              <span>Run Code</span>
            </button>
            <button
              onClick={handleSubmit}
              className="bg-white hover:bg-slate-100 text-black font-semibold h-9 px-4 rounded-lg transition-all text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-black/25"
            >
              <Send size={12} />
              <span>Submit Solution</span>
            </button>
          </div>

          <div className="h-6 w-px bg-white/10 mx-1"></div>
          
          {/* Editor Settings */}
          <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-xl border border-white/10">
            <button 
                onClick={() => setVimEnabled(!vimEnabled)}
                className={`p-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${vimEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:bg-white/5'}`}
                title="Toggle Vim Mode"
            >
                <Command size={12} />
                <span className="text-[8px] font-bold">VIM</span>
            </button>
            <div className="w-px h-3 bg-white/10 mx-1"></div>
            <button 
                onClick={() => setFormatOnSave(!formatOnSave)}
                className={`p-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${formatOnSave ? 'bg-indigo-600 text-white shadow-sm' : 'text-white/40 hover:bg-white/5'}`}
                title="Auto-format on Save (Ctrl+S)"
            >
                <Zap size={12} />
                <span className="text-[8px] font-bold">FORMAT</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content Panel */}
        <div className="w-[420px] border-r border-white/5 flex flex-col bg-[#18181b]/40 backdrop-blur-xl z-10 shadow-sm shrink-0">
          <div className="flex bg-white/5 p-1 m-4 rounded-xl border border-white/5 shrink-0">
            {[
              { id: "description", icon: <MessageSquare size={12} />, label: "Problem" },
              { id: "hints", icon: <Lightbulb size={12} />, label: "Hints" },
              { id: "ai-feedback", icon: <BrainCircuit size={12} />, label: "AI Diagnosis" },
              { id: "history", icon: <History size={12} />, label: "History" },
              { id: "visualizer", icon: <Settings size={12} />, label: "Debug" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center space-y-0.5 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                  activeTab === tab.id ? "bg-white/10 text-indigo-400 shadow-sm" : "text-white/50 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="min-h-full"
              >
                {activeTab === "description" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h1 className="text-lg font-bold text-white tracking-tight">{question.title}</h1>
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        question.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/10' :
                        question.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/10' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/10'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                    <div className="text-white/80 leading-relaxed font-semibold text-xs border-l-2 border-indigo-500 pl-4 py-1">
                      {question.description}
                    </div>

                    <div className="space-y-3 pt-4 mt-4 border-t border-white/5">
                      <h3 className="text-[10px] font-bold text-white/40 uppercase flex items-center gap-1.5 tracking-wider">
                        <Database size={14} className="text-indigo-400" />
                        <span>Example Cases</span>
                      </h3>
                      <div className="space-y-2.5">
                        {question.testCases?.slice(0, 2).map((tc, i) => (
                          <div key={i} className="p-3.5 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
                            <div className="flex justify-between text-[9px] font-bold text-white/30 uppercase tracking-widest">
                              <span>Input</span>
                              <span>Example {i + 1}</span>
                            </div>
                            <code className="text-white/85 text-xs block font-mono bg-white/5 p-2 rounded-lg border border-white/5">{tc.input}</code>
                            <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest pt-1">Expected Output</div>
                            <code className="text-indigo-400 text-xs block font-bold font-mono">{tc.output}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "hints" && (
                  <div className="space-y-6">
                    <h2 className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Problem Hints</h2>
                    {hints.length > 0 ? (
                      <div className="space-y-3">
                        {hints.map((hint, i) => (
                          <div
                            key={i}
                            className="p-4 bg-[#18181b]/60 border border-white/5 rounded-xl relative overflow-hidden group shadow-md"
                          >
                            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase mb-1.5 block tracking-wider">Hint {i + 1}</span>
                            <p className="text-white/80 text-xs font-semibold leading-relaxed">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
                        <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center border border-white/5">
                          <Lightbulb className="text-white/20" size={24} />
                        </div>
                        <button onClick={getHints} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-bold text-xs tracking-wider shadow-md transition-all cursor-pointer">
                          {loadingHints ? "Thinking..." : "Reveal Hints"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "ai-feedback" && (
                  <div className="space-y-6">
                    <h2 className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">AI Analysis</h2>
                    {loadingAI ? (
                      <div className="space-y-4 py-8">
                        <div className="animate-pulse bg-white/5 h-24 rounded-xl"></div>
                        <div className="animate-pulse bg-white/5 h-32 rounded-xl"></div>
                      </div>
                    ) : (
                      testResults ? (
                        <div className="space-y-4">
                          <div className="bg-[#1b1b24]/60 border border-indigo-500/20 p-5 rounded-xl shadow-lg">
                            <h3 className="text-[9px] font-bold text-indigo-400 uppercase mb-4 flex items-center gap-1.5 tracking-wider">
                              <Cpu size={12} />
                              Code Review
                            </h3>
                            <p className="text-white/80 whitespace-pre-wrap leading-relaxed font-semibold text-xs">{review}</p>
                          </div>
                          <div className="bg-[#18181b]/60 border border-white/5 p-5 rounded-xl shadow-md">
                            <h3 className="text-[9px] font-bold text-emerald-400 uppercase mb-4 tracking-wider">Technical Feedback</h3>
                            <p className="text-white/80 whitespace-pre-wrap leading-relaxed font-semibold text-xs">{explanation}</p>
                          </div>
                          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Maximize2 size={14} className="text-amber-400" />
                              <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">Complexity</span>
                            </div>
                            <p className="text-amber-400 font-bold text-xs tracking-tight">{complexity}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-20 text-white/30 font-bold uppercase tracking-widest text-[9px]">
                          Submit your code for AI diagnosis.
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-6">
                    <h2 className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Past Submissions</h2>
                    <div className="space-y-3">
                      {submissions.length === 0 ? (
                        <div className="text-center py-20 bg-transparent rounded-xl border border-dashed border-white/10">
                          <History size={36} className="mx-auto text-white/15 mb-3" />
                          <p className="text-white/30 font-bold uppercase tracking-widest text-[9px]">No Records</p>
                        </div>
                      ) : (
                        submissions.map((s, idx) => (
                          <div 
                            key={s._id} 
                            onClick={() => {
                              setSelectedSubmission(s);
                              setIsComparing(true);
                            }}
                            className="bg-white/[0.02] border border-white/5 rounded-xl p-4 hover:border-white/10 transition-all cursor-pointer group shadow-md"
                          >
                            <div className="flex items-center justify-between mb-3">
                               <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider">Attempt #{submissions.length - idx}</span>
                               <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${s.status === "Accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-rose-500/10 text-rose-400 border border-rose-500/10"}`}>
                                 {s.status}
                               </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <FileCode size={13} className="text-indigo-400" />
                                    <span className="text-[10px] font-bold text-white/70">{s.language}</span>
                                </div>
                                <span className="text-[9px] text-white/40 font-bold uppercase">{new Date(s.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "visualizer" && (
                  <div className="space-y-6 h-full flex flex-col">
                    <h2 className="text-[9px] font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Execution Trace</h2>
                    <div className="flex-1 bg-[#18181b]/20 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center text-center space-y-4">
                        <BrainCircuit size={48} className="text-white/15" />
                        <div>
                            <p className="text-white/80 font-bold uppercase tracking-widest text-xs mb-1">Debug Environment</p>
                            <p className="text-white/40 text-[10px] font-semibold leading-relaxed max-w-[200px]">Execution Tracing and memory mapping coming soon in the next version.</p>
                        </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Monaco Editor + Dynamic Console */}
        <div className={`flex-1 flex flex-col bg-slate-950 overflow-hidden relative select-none`}>
          <div className={`flex-1 overflow-hidden relative ${isResizing ? 'pointer-events-none' : ''}`}>
            {isComparing && (
              <div className="absolute top-4 right-6 z-30 flex items-center gap-3">
                 <div className="px-4 py-2 bg-[#18181b] border border-white/10 rounded-xl shadow-2xl flex items-center gap-4">
                    <div className="flex items-center gap-2 text-white">
                        <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Compare Mode</span>
                    </div>
                    <button 
                      onClick={() => setIsComparing(false)}
                      className="text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                 </div>
              </div>
            )}
            {isComparing ? (
              <DiffEditor
                height="100%"
                theme="vs-dark"
                original={selectedSubmission?.code || ""}
                modified={code}
                language={language}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  renderSideBySide: true,
                  readOnly: true,
                  fontFamily: "'Fira Code', monospace",
                  padding: { top: 16 }
                }}
              />
            ) : (
              <Editor
                height="100%"
                theme="vs-dark"
                language={language}
                value={code}
                onChange={(value) => setCode(value || "")}
                onMount={handleEditorDidMount}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  lineNumbers: "on",
                  padding: { top: 16, left: 16 },
                  fontFamily: "'Fira Code', monospace",
                  fontLigatures: true,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                }}
              />
            )}
          </div>

          <div
            style={{ height: `${consoleHeight}px` }}
            className={`flex flex-col bg-[#0c0d12]/95 border-t border-white/10 relative ${!isResizing ? "transition-all duration-300 ease-in-out" : ""}`}
          >
            <div 
              className="absolute top-0 left-0 right-0 h-1 cursor-row-resize z-50 hover:bg-[#4338ca] transition-colors"
              onMouseDown={startResizing}
            />
            <div className="h-9 px-6 flex items-center justify-between border-b border-white/5 bg-[#18181b]/80 shrink-0">
              <div className="flex items-center space-x-8 h-full">
                <button 
                  onClick={() => setIsCustom(false)}
                  className={`flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider transition-all h-full relative cursor-pointer ${!isCustom ? "text-indigo-400" : "text-white/40"}`}
                >
                  <History size={12} />
                  <span>Test Results</span>
                  {!isCustom && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />}
                </button>
                <button 
                  onClick={() => setIsCustom(true)}
                  className={`flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider transition-all h-full relative cursor-pointer ${isCustom ? "text-indigo-400" : "text-white/40"}`}
                >
                  <Plus size={12} />
                  <span>Custom Input</span>
                  {isCustom && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-indigo-500" />}
                </button>
              </div>
              <button onClick={toggleConsole} className="p-1 hover:bg-white/5 rounded-md transition-all cursor-pointer">
                <ChevronDown className={`text-white/35 transform transition-transform duration-300 ${consoleHeight > 40 ? "rotate-0" : "rotate-180"}`} size={16} />
              </button>
            </div>

            <div className="flex-1 p-5 overflow-y-auto font-mono text-xs custom-scrollbar bg-[#0c0d12]/50">
              {isCustom ? (
                <div className="h-full flex flex-col space-y-3">
                  <div className="text-[9px] font-bold text-white/35 uppercase tracking-widest flex items-center gap-1.5">
                    <Database size={12} className="text-indigo-400" />
                    Standard Input (stdin)
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter input for your solution..."
                    className="flex-1 bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white font-bold placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 font-mono text-xs resize-none"
                  />
                </div>
              ) : testResults ? (
                <div className="space-y-2">
                  {testResults.map((res, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] border border-white/5 font-mono shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${res.status === "Passed" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/10" : "bg-rose-500/10 text-rose-400 border border-rose-500/10"}`}>
                          Case #{i + 1}
                        </div>
                        <div className="text-white/40 text-[9px] font-bold uppercase">
                          Input: <span className="text-white/80 font-semibold">{res.input}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-white/40 text-[9px] font-bold uppercase">Expected: {res.expected || res.output}</span>
                        <div className="h-3 w-px bg-white/10"></div>
                        <span className={`font-bold text-[10px] uppercase tracking-widest ${res.status === "Passed" ? "text-emerald-400" : "text-rose-400"}`}>
                          {res.status === "Passed" ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-white/20 font-bold uppercase tracking-widest text-[9px]">
                    {output || "// Awaiting command..."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CodeEditor;
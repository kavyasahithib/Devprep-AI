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
  ChevronRight,
  Database,
  Cpu,
  Plus,
  X,
  FileCode,
  Terminal,
  Zap,
  Command
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { initVimMode } from 'monaco-vim';

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
  const [consoleOpen, setConsoleOpen] = useState(true);
  const [testResults, setTestResults] = useState(null);
  const [vimEnabled, setVimEnabled] = useState(false);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const editorRef = useRef(null);
  const vimModeRef = useRef(null);
  const statusNodeRef = useRef(null);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    // Register Custom Snippets (JavaScript)
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

    // Add Auto-Format Action (Ctrl+S)
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (formatOnSave) {
        editor.getAction('editor.action.formatDocument').run();
      }
    });

    // Setup Vim Mode Status Bar (Optional UI enrichment)
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

  const getTemplates = (funcName) => ({
    javascript: `// JavaScript Solution\nfunction ${funcName}(nums, target) {\n    \n}`,
    python: `# Python Solution\ndef ${funcName}(nums, target):\n    pass`,
    cpp: `// C++ Solution\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nvector<int> ${funcName}(vector<int>& nums, int target) {\n    \n}`,
    c: `// C Solution\n#include <stdio.h>\n\nvoid ${funcName}() {\n    \n}`,
    java: `// Java Solution\nimport java.util.*;\n\npublic class Solution {\n    public int[] ${funcName}(int[] nums, int target) {\n        return new int[]{};\n    }\n}`
  });

  useEffect(() => {
    const savedCode = localStorage.getItem(`devprep_code_${id}_${language}`);
    if (savedCode) {
      setCode(savedCode);
    } else if (question) {
      const templates = getTemplates(question.functionName || "solution");
      setCode(templates[language]);
    }
  }, [id, language, question]);

  useEffect(() => {
    if (code) {
      localStorage.setItem(`devprep_code_${id}_${language}`, code);
    }
  }, [code, id, language]);

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await API.get("/questions");
        const found = res.data.find((q) => q._id === id);
        if (found) {
          setQuestion(found);
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      }
    };
    fetchQuestion();
  }, [id]);

  const getHints = async () => {
    if (!question) return;
    setLoadingHints(true);
    try {
      const res = await API.get(`/submissions/hints/${id}`);
      setHints(res.data.hints);
      setActiveTab("hints");
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingHints(false);
    }
  };

  const runCodeTask = async () => {
    setConsoleOpen(true);
    setOutput("Running...");
    setTestResults(null);
    try {
      const res = await API.post("/submissions/run",
        { 
          code, 
          language,
          customInput: isCustom ? customInput : ""
        }
      );
      const result = res.data.result;
      if (!result) {
        setOutput("Execution failed. Service might be busy.");
        return;
      }
      setOutput(
        (result.stdout || "") + (result.stderr || "") +
        (result.compile_output || "") + (result.message || "") +
        (result.status?.description || "")
      );
    } catch (error) {
      console.error(error);
      setOutput("Error: " + (error.response?.data?.message || error.message));
    }
  };

  const fetchSubmissions = useCallback(async () => {
    try {
      const res = await API.get("/submissions");
      const filtered = res.data.filter(s => s.questionId?._id === id || s.questionId === id);
      setSubmissions(filtered.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (error) {
      console.error("Error fetching submissions:", error);
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchSubmissions();
    }
  }, [activeTab, fetchSubmissions]);

  const submitCodeTask = async () => {
    setConsoleOpen(true);
    setOutput("Submitting...");
    setTestResults(null);
    setLoadingAI(true);
    setReview("");
    setExplanation("");
    setComplexity("");

    try {
      const response = await fetch(`http://localhost:5000/api/submissions/submit`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Support secure cookies
        body: JSON.stringify({ questionId: id, code, language, stream: true })
      });

      if (!response.ok) throw new Error("Submission failed");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      setActiveTab("ai-feedback");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunkText = decoder.decode(value, { stream: true });
        const lines = chunkText.split('\n');

        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.substring(6).trim());
                    
                    if (data.testResults) {
                        setTestResults(data.testResults);
                        const allPassed = data.testResults.every(r => r.status === "Passed");
                        setOutput(allPassed ? "🎯 All test cases passed!" : "❌ Some test cases failed.");
                    }

                    if (data.section === 'review' && data.chunk) {
                        setReview(prev => prev + data.chunk);
                    } else if (data.section === 'explanation' && data.chunk) {
                        setExplanation(prev => prev + data.chunk);
                    } else if (data.section === 'complexity' && data.chunk) {
                        setComplexity(prev => prev + data.chunk);
                    }

                    if (data.done) {
                        setLoadingAI(false);
                    }
                } catch (e) {
                    // Ignore parsing errors for partial/malformed chunks
                }
            }
        }
      }
    } catch (error) {
      console.error("Submission error:", error);
      setOutput("Error: " + error.message);
      setLoadingAI(false);
    }
  };

  if (!question) return (
    <div className="h-screen bg-slate-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      {/* GLOBAL HEADER */}
      <header className="h-16 border-b border-slate-200 flex items-center justify-between px-8 bg-white z-20 shadow-sm">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-indigo-700 transition-all">
              <Code2 size={22} className="text-white" />
            </div>
            <span className="font-bold text-slate-900 tracking-tight text-xl">DevPrep AI</span>
          </Link>
          <div className="h-6 w-px bg-slate-200 mx-2"></div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Problems</span>
            <ChevronRight size={14} className="text-slate-300" />
            <span className="text-indigo-600 truncate max-w-[200px]">{question.title}</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <select
              value={language}
              onChange={(e) => {
                const newLang = e.target.value;
                setLanguage(newLang);
                if (question) {
                  const templates = getTemplates(question.functionName || "solution");
                  setCode(templates[newLang]);
                }
              }}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider py-2.5 pl-6 pr-12 rounded-xl outline-none focus:border-indigo-500 cursor-pointer transition-all"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="c">C</option>
              <option value="java">Java</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runCodeTask}
              className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-sm"
            >
              <Play size={14} className="text-indigo-600 fill-indigo-600" />
              <span>Run Code</span>
            </button>
            <button
              onClick={submitCodeTask}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-8 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 shadow-md"
            >
              <Send size={14} />
              <span>Submit Solution</span>
            </button>
          </div>

          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          
          {/* Editor Settings */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200 mr-2">
            <button 
                onClick={() => setVimEnabled(!vimEnabled)}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${vimEnabled ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Vim Mode"
            >
                <Command size={14} />
                <span className="text-[10px] font-bold">VIM</span>
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button 
                onClick={() => setFormatOnSave(!formatOnSave)}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${formatOnSave ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Auto-format on Save (Ctrl+S)"
            >
                <Zap size={14} />
                <span className="text-[10px] font-bold">FORMAT</span>
            </button>
          </div>

          <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Main Split Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Content Panel */}
        <div className="w-[500px] border-r border-slate-200 flex flex-col bg-white z-10 shadow-sm">
          <div className="flex bg-slate-100 p-1.5 m-6 rounded-2xl border border-slate-200">
            {[
              { id: "description", icon: <MessageSquare size={14} />, label: "Problem" },
              { id: "hints", icon: <Lightbulb size={14} />, label: "Hints" },
              { id: "ai-feedback", icon: <BrainCircuit size={14} />, label: "AI Diagnosis" },
              { id: "history", icon: <History size={14} />, label: "History" },
              { id: "visualizer", icon: <Settings size={14} />, label: "Debug" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center justify-center space-y-1 py-3 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all ${
                  activeTab === tab.id ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {activeTab === "description" && (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{question.title}</h1>
                      <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        question.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-700' :
                        question.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        {question.difficulty}
                      </span>
                    </div>
                    <div className="text-slate-600 leading-relaxed font-medium text-lg border-l-4 border-indigo-100 pl-6 py-2">
                      {question.description}
                    </div>

                    <div className="space-y-6 pt-8 mt-8 border-t border-slate-100">
                      <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2 tracking-widest">
                        <Database size={16} className="text-indigo-600" />
                        <span>Example Cases</span>
                      </h3>
                      <div className="space-y-4">
                        {question.testCases?.slice(0, 2).map((tc, i) => (
                          <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4">
                            <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              <span>Input</span>
                              <span>Example {i + 1}</span>
                            </div>
                            <code className="text-slate-900 text-sm block font-mono bg-white p-4 rounded-xl border border-slate-100">{tc.input}</code>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">Expected Output</div>
                            <code className="text-indigo-600 text-sm block font-bold font-mono">{tc.expected}</code>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "hints" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Problem Hints</h2>
                    {hints.length > 0 ? (
                      <div className="space-y-4">
                        {hints.map((hint, i) => (
                          <div
                            key={i}
                            className="p-6 bg-white border border-slate-200 rounded-3xl relative overflow-hidden group shadow-sm"
                          >
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                            <span className="text-[10px] font-bold text-indigo-600 uppercase mb-2 block tracking-widest">Hint {i + 1}</span>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed">{hint}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center border border-slate-100">
                          <Lightbulb className="text-slate-300" size={40} />
                        </div>
                        <button onClick={getHints} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-sm tracking-wide shadow-md hover:bg-slate-900 transition-all">
                          {loadingHints ? "Thinking..." : "Reveal Hint"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "ai-feedback" && (
                  <div className="space-y-8">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">AI Analysis</h2>
                    {loadingAI ? (
                      <div className="space-y-6 py-10">
                        <div className="animate-pulse bg-slate-50 h-32 rounded-3xl"></div>
                        <div className="animate-pulse bg-slate-50 h-48 rounded-3xl"></div>
                      </div>
                    ) : (
                      testResults ? (
                        <div className="space-y-6">
                          <div className="bg-slate-900 p-8 rounded-[2rem] text-white relative overflow-hidden shadow-xl">
                            <h3 className="text-xs font-bold text-indigo-400 uppercase mb-6 flex items-center gap-2 tracking-widest">
                              <Cpu size={14} />
                              Code Review
                            </h3>
                            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed font-medium">{review}</p>
                          </div>
                          <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                            <h3 className="text-xs font-bold text-emerald-600 uppercase mb-6 tracking-widest">Technical Feedback</h3>
                            <p className="text-slate-600 whitespace-pre-wrap leading-relaxed font-medium">{explanation}</p>
                          </div>
                          <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100">
                            <h3 className="text-xs font-bold text-amber-700 uppercase mb-4 flex items-center gap-2 tracking-widest">
                              <Maximize2 size={16} />
                              Complexity Analysis
                            </h3>
                            <p className="text-slate-900 font-bold text-xl tracking-tight">{complexity}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-32 text-slate-400 font-bold uppercase tracking-widest text-xs">
                          Submit your code for AI diagnosis.
                        </div>
                      )
                    )}
                  </div>
                )}

                {activeTab === "history" && (
                  <div className="space-y-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Past Submissions</h2>
                    <div className="space-y-4">
                      {submissions.length === 0 ? (
                        <div className="text-center py-32 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                          <History size={48} className="mx-auto text-slate-200 mb-4" />
                          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No Records</p>
                        </div>
                      ) : (
                        submissions.map((s, idx) => (
                          <div 
                            key={s._id} 
                            onClick={() => {
                              setSelectedSubmission(s);
                              setIsComparing(true);
                            }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 hover:border-indigo-400 transition-all cursor-pointer group shadow-sm"
                          >
                            <div className="flex items-center justify-between mb-4">
                               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attempt #{submissions.length - idx}</span>
                               <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${s.status === "Accepted" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                                 {s.status}
                               </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileCode size={16} className="text-indigo-600" />
                                    <span className="text-xs font-bold text-slate-900">{s.language}</span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{new Date(s.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "visualizer" && (
                  <div className="space-y-8 h-full flex flex-col">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Execution Trace</h2>
                    <div className="flex-1 bg-slate-50 border border-slate-200 rounded-[2.5rem] p-12 flex flex-col items-center justify-center text-center space-y-6">
                        <BrainCircuit size={80} className="text-slate-200" />
                        <div>
                            <p className="text-slate-900 font-bold uppercase tracking-widest text-sm mb-2">Debug Environment</p>
                            <p className="text-slate-400 text-xs font-medium leading-relaxed max-w-[280px]">Execution Tracing and memory mapping coming soon in the next version.</p>
                        </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Monaco Editor + Dynamic Console */}
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative">
            {isComparing && (
              <div className="absolute top-6 right-10 z-30 flex items-center gap-4">
                 <div className="px-6 py-3 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl flex items-center gap-6">
                    <div className="flex items-center gap-3 text-white">
                        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500"></div>
                        <span className="text-xs font-bold uppercase tracking-widest">Compare Mode</span>
                    </div>
                    <button 
                      onClick={() => setIsComparing(false)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      <X size={18} />
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
                  padding: { top: 20 }
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
                  padding: { top: 20, left: 20 },
                  fontFamily: "'Fira Code', monospace",
                  fontLigatures: true,
                  cursorSmoothCaretAnimation: "on",
                  smoothScrolling: true,
                }}
              />
            )}
          </div>

          <div
            className={`border-t border-slate-800 flex flex-col transition-all duration-300 ease-in-out bg-white ${consoleOpen ? "h-72" : "h-12"}`}
          >
            <div className="h-12 px-8 flex items-center justify-between border-b border-slate-100 bg-slate-50">
              <div className="flex items-center space-x-10 h-full">
                <button 
                  onClick={() => setIsCustom(false)}
                  className={`flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider transition-all h-full relative ${!isCustom ? "text-indigo-600" : "text-slate-400"}`}
                >
                  <History size={14} />
                  <span>Test Results</span>
                  {!isCustom && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
                <button 
                  onClick={() => setIsCustom(true)}
                  className={`flex items-center space-x-2 text-[11px] font-bold uppercase tracking-wider transition-all h-full relative ${isCustom ? "text-indigo-600" : "text-slate-400"}`}
                >
                  <Plus size={14} />
                  <span>Custom Input</span>
                  {isCustom && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
              </div>
              <button onClick={() => setConsoleOpen(!consoleOpen)} className="p-2 hover:bg-slate-200 rounded-lg transition-all">
                <ChevronDown className={`text-slate-400 transform transition-transform duration-300 ${consoleOpen ? "rotate-0" : "rotate-180"}`} size={18} />
              </button>
            </div>

            <div className="flex-1 p-8 overflow-y-auto font-mono text-sm custom-scrollbar bg-white">
              {isCustom ? (
                <div className="h-full flex flex-col space-y-4">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Database size={14} className="text-indigo-600" />
                    Standard Input (stdin)
                  </div>
                  <textarea
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter input for your solution..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-6 text-slate-900 font-bold placeholder-slate-300 outline-none focus:border-indigo-400 transition-all font-mono text-xs resize-none"
                  />
                </div>
              ) : testResults ? (
                <div className="space-y-3">
                  {testResults.map((res, i) => (
                    <div 
                      key={i} 
                      className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 font-mono shadow-sm"
                    >
                      <div className="flex items-center space-x-6">
                        <div className={`text-[10px] px-3 py-1 rounded-full font-bold uppercase ${res.status === "Passed" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                          Case #{i + 1}
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase">
                          Input: <span className="text-slate-900">{res.input}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-slate-400 text-[10px] font-bold uppercase">Expected: {res.expected}</span>
                        <div className="h-4 w-px bg-slate-200"></div>
                        <span className={`font-bold text-xs uppercase tracking-widest ${res.status === "Passed" ? "text-emerald-600" : "text-rose-600"}`}>
                          {res.status === "Passed" ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-slate-300 font-bold uppercase tracking-widest text-[11px]">
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
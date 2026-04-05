import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { Editor } from "@monaco-editor/react";
import { 
  Send, 
  Code2, 
  ChevronRight, 
  MessageSquare, 
  Play, 
  Settings, 
  Zap, 
  Command,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Timer,
  BrainCircuit,
  FileCode
} from "lucide-react";
import { initVimMode } from 'monaco-vim';
import { io } from "socket.io-client";

function MockInterview() {
  const { id } = useParams(); // Question ID
  const navigate = useNavigate();
  const [interview, setInterview] = useState(null);
  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [vimEnabled, setVimEnabled] = useState(false);
  const [formatOnSave, setFormatOnSave] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const socketRef = useRef(null);
  const editorRef = useRef(null);
  const vimModeRef = useRef(null);
  const chatEndRef = useRef(null);
  const statusNodeRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    socketRef.current.on("connect", () => {
      if (interview?._id) {
        socketRef.current.emit("join-interview", interview._id);
      }
    });

    socketRef.current.on("user-typing", ({ role }) => {
        // Optional: show typing indicator for interviewer or candidate
        console.log(`${role} is typing...`);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [interview?._id]);

  // Speech Recognition (STT) Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setMessage(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const speakText = (text) => {
    if (!voiceMode) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

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

    // Add Auto-Format Action
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      if (formatOnSave) {
        editor.getAction('editor.action.formatDocument').run();
      }
    });

    // Setup Vim Mode Status Bar (Optional UI enrichment)
    if (!statusNodeRef.current) {
        statusNodeRef.current = document.createElement('div');
        statusNodeRef.current.className = 'vim-status-bar absolute bottom-0 right-0 bg-[#252525] text-xs px-2 py-1 text-slate-400 z-50';
        editor.getDomNode().parentElement.appendChild(statusNodeRef.current);
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

  useEffect(() => {
    const initInterview = async () => {
      try {
        const token = localStorage.getItem("token");
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
        
        // 1. Fetch Question
        const qRes = await API.get(`/questions/${activeId}`);
        setQuestion(qRes.data);
        
        // 2. Start Interview Session
        const intRes = await API.post("/interview/start", { questionId: activeId });
        setInterview(intRes.data);
        
        // 3. Set Code Template
        const templates = {
          javascript: `function solution() {\n  // Type your code here\n}`
        };
        setCode(templates.javascript);

      } catch (error) {
        console.error("Failed to start interview:", error);
        const errorMsg = error.response?.data?.message || error.message;
        alert(`Could not start interview session: ${errorMsg}`);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    initInterview();
  }, [id, navigate]);

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0 || completed) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timeLeft, completed]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [interview?.chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || sending) return;
    setSending(true);
    const userMsg = message;
    setMessage("");

    // Add user message to UI immediately
    setInterview(prev => ({
        ...prev,
        chatHistory: [...prev.chatHistory, { role: "user", content: userMsg }]
    }));

    // Emit typing event
    socketRef.current?.emit("typing", { interviewId: interview._id, role: "candidate" });

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/interview/${interview._id}/turn`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include', // Support secure cookies
        body: JSON.stringify({ message: userMsg, code, stream: true })
      });

      if (!response.ok) throw new Error("Network response was not ok");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentAssistantMessage = "";

      // Add a placeholder for the assistant message
      setInterview(prev => ({
          ...prev,
          chatHistory: [...prev.chatHistory, { role: "interviewer", content: "" }]
      }));

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
            if (line.startsWith('data: ')) {
                try {
                    const data = JSON.parse(line.slice(6));
                    if (data.chunk) {
                        currentAssistantMessage += data.chunk;
                        // Update the last message in history iteratively
                        setInterview(prev => {
                            const newHistory = [...prev.chatHistory];
                            newHistory[newHistory.length - 1].content = currentAssistantMessage;
                            return { ...prev, chatHistory: newHistory };
                        });
                    }
                    if (data.done) {
                        setInterview(data.interview);
                        // Speak if voice mode is on
                        speakText(currentAssistantMessage);
                    }
                } catch (e) {
                    // Ignore parse errors for incomplete JSON chunks
                }
            }
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFinish = async () => {
    if (window.confirm("Are you sure you want to end this interview?")) {
      setLoading(true);
      try {
        const res = await API.post(`/interview/${interview._id}/complete`, { code });
        setInterview(res.data);
        setCompleted(true);
      } catch (error) {
        console.error("Finish Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
        <div className="text-slate-900 font-bold tracking-wider">Starting Interview Session...</div>
      </div>
    );
  }

  if (completed) {
    const feedback = interview.feedback;
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center p-8 overflow-y-auto">
        <div className="max-w-4xl w-full bg-white rounded-3xl p-12 shadow-xl border border-slate-200 space-y-10">
            <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-emerald-500" />
                </div>
                <h1 className="text-4xl font-bold text-slate-900">Interview Complete</h1>
                <p className="text-slate-500 font-medium">Your performance has been evaluated by our AI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-50 p-8 rounded-3xl text-center border border-slate-200">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Total Score</div>
                    <div className="text-6xl font-bold text-indigo-600">{feedback.score}</div>
                </div>
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white border-l-4 border-emerald-500 p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Technical Feedback</h3>
                        <p className="text-slate-700 font-medium text-sm">{feedback.technical}</p>
                    </div>
                    <div className="bg-white border-l-4 border-amber-500 p-6 rounded-2xl shadow-sm border border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Behavioral Feedback</h3>
                        <p className="text-slate-700 font-medium text-sm">{feedback.behavioral}</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button 
                    onClick={() => navigate("/dashboard")}
                    className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2"
                >
                    <span>Return to Dashboard</span>
                    <ArrowRight size={20} />
                </button>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex flex-col overflow-hidden font-sans text-slate-900">
      {/* Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-20">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-600 transition-all">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{question?.title}</h1>
            <div className="flex items-center space-x-2 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Interview in Progress</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          {/* Editor Settings */}
          <div className="flex items-center gap-1 bg-slate-50 px-2 py-1.5 rounded-xl border border-slate-200 mr-2">
            <button 
                onClick={() => setVoiceMode(!voiceMode)}
                className={`p-1.5 rounded-lg transition-all flex items-center gap-1 ${voiceMode ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                title="Toggle Voice Mode (AI will speak)"
            >
                {voiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <span className="text-[10px] font-bold">VOICE</span>
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
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

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
            <Timer size={18} className={timeLeft < 300 ? "text-rose-500 animate-pulse" : "text-indigo-600"} />
            <span className={`text-lg font-bold tabular-nums ${timeLeft < 300 ? "text-rose-600" : "text-slate-900"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={handleFinish}
            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-700 transition-all"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Main Split Interface */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left: Chat Pane */}
        <div className="w-[450px] border-r border-slate-200 flex flex-col bg-white shadow-sm z-10">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <BrainCircuit size={18} className="text-indigo-600" />
              </div>
              <span className="text-xs font-bold text-slate-900 tracking-wide">AI Interviewer</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {interview?.chatHistory.map((h, i) => (
              <div 
                key={i}
                className={`flex gap-3 ${h.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  h.role === "interviewer" 
                    ? "bg-indigo-600 shadow-md" 
                    : "bg-emerald-600 shadow-md"
                } ${h.role === "interviewer" && isSpeaking ? "animate-pulse ring-4 ring-indigo-200" : ""}`}>
                  {h.role === "interviewer" ? <Cpu size={16} className="text-white" /> : <div className="text-[10px] font-bold text-white uppercase">Me</div>}
                </div>
                <div className={`max-w-[85%] p-4 rounded-2xl shadow-sm relative ${
                  h.role === 'interviewer' 
                    ? 'bg-slate-100 border border-slate-200 text-slate-800' 
                    : 'bg-indigo-600 text-white'
                }`}>
                  <p className="text-sm font-medium leading-relaxed">{h.content}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-6 border-t border-slate-200 bg-white">
          <div className="flex items-center space-x-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-indigo-400 transition-all shadow-inner">
            <button
                onClick={toggleListening}
                className={`p-3 rounded-xl transition-all ${isListening ? 'bg-rose-100 text-rose-600 animate-pulse' : 'text-slate-400 hover:bg-slate-200'}`}
                title={isListening ? "Listening..." : "Voice Input"}
            >
                {isListening ? <Mic size={20} /> : <Mic size={20} />}
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening to your voice..." : "Type or speak your message..."}
              className="flex-1 bg-transparent border-none outline-none py-3 text-sm font-medium placeholder-slate-400"
            />
            <button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-all shadow-md active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
          {isSpeaking && (
            <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-indigo-600 uppercase tracking-widest animate-pulse">
                <Radio size={12} />
                <span>AI Interviewer is speaking...</span>
            </div>
          )}
        </div>
      </div>

        {/* Right: Code Editor Pane */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] overflow-hidden relative">
          <div className="h-10 bg-[#252525] border-b border-white/5 flex items-center px-6">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <FileCode size={12} />
              solution.js
            </span>
          </div>
          <div className="flex-1">
            <Editor
              height="100%"
              theme="vs-dark"
              language="javascript"
              value={code}
              onChange={(v) => setCode(v || "")}
              onMount={handleEditorDidMount}
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


export default MockInterview;

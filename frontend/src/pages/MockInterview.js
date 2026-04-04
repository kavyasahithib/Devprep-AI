import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Editor } from "@monaco-editor/react";
import { 
  Timer, 
  Send, 
  ChevronLeft, 
  BrainCircuit, 
  Loader2, 
  CheckCircle2,
  FileCode,
  ArrowRight
} from "lucide-react";

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
  const [completed, setCompleted] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const initInterview = async () => {
      try {
        const token = localStorage.getItem("token");
        let activeId = id;

        if (!activeId || activeId === ":id") {
            // Fetch daily or first available question
            const qRes = await axios.get("http://localhost:5000/api/questions/daily");
            if (qRes.data && qRes.data._id) {
                activeId = qRes.data._id;
            } else {
                const allRes = await axios.get("http://localhost:5000/api/questions");
                if (allRes.data && allRes.data.length > 0) {
                    activeId = allRes.data[0]._id;
                }
            }
        }

        if (!activeId) throw new Error("No questions available");
        
        // 1. Fetch Question
        const qRes = await axios.get(`http://localhost:5000/api/questions/${activeId}`);
        setQuestion(qRes.data);
        
        // 2. Start Interview Session
        const intRes = await axios.post("http://localhost:5000/api/interview/start", { questionId: activeId }, {
          headers: { Authorization: "Bearer " + token }
        });
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

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:5000/api/interview/${interview._id}/turn`, {
        message: userMsg,
        code
      }, {
        headers: { Authorization: "Bearer " + token }
      });
      setInterview(res.data);
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
        const token = localStorage.getItem("token");
        const res = await axios.post(`http://localhost:5000/api/interview/${interview._id}/complete`, { code }, {
          headers: { Authorization: "Bearer " + token }
        });
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
                className={`flex ${h.role === 'interviewer' ? 'justify-start' : 'justify-end'}`}
              >
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

          <div className="p-4 bg-white border-t border-slate-100 flex items-end gap-2">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              placeholder="Type your response..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all resize-none"
              rows={2}
            />
            <button 
              onClick={handleSend}
              disabled={sending || !message.trim()}
              className="p-3.5 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              <Send size={18} />
            </button>
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

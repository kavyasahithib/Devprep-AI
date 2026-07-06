import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import RobotAvatar from "../components/RobotAvatar";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  BrainCircuit, 
  Timer, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  ArrowRight, 
  User,
  Pause,
  Loader2
} from "lucide-react";

const INTERVIEW_TOPICS = [
  {
    id: "python",
    title: "Python Engineering",
    desc: "OOP paradigms, memory handling, generators, list comprehensions, decorators, and GIL details.",
    icon: "🐍",
    color: "from-blue-500/10 to-amber-500/10 border-blue-500/20 text-blue-400"
  },
  {
    id: "javascript",
    title: "JavaScript & Frontend",
    desc: "Closures, event loops, promises, React reconciliation engine, rendering performance, and hooks.",
    icon: "🌐",
    color: "from-yellow-500/10 to-amber-600/10 border-yellow-500/20 text-yellow-400"
  },
  {
    id: "sql",
    title: "Databases & SQL",
    desc: "Normalization, ACID parameters, query optimizations, indexes, NoSQL vs relational design.",
    icon: "🗄️",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400"
  },
  {
    id: "system-design",
    title: "System Design",
    desc: "Scalability patterns, caching layers, load balancers, sharding, and latency optimization.",
    icon: "🏗️",
    color: "from-purple-500/10 to-indigo-500/10 border-purple-500/20 text-purple-400"
  },
  {
    id: "behavioral",
    title: "Behavioral & HR",
    desc: "STAR method behavioral questions, conflict resolution, leadership principles, and cultural fit.",
    icon: "🤝",
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/20 text-rose-400"
  }
];

function MockInterview() {
  const navigate = useNavigate();
  
  // Selection vs Interview State
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);

  // Core session states
  const [interview, setInterview] = useState(null);
  const [timeLeft, setTimeLeft] = useState(2700); // 45 minutes
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Audio & Voice control states
  const [voiceMode, setVoiceMode] = useState(true);
  const [autoListen, setAutoListen] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");

  const recognitionRef = useRef(null);
  const startListeningTimeoutRef = useRef(null);
  const silenceTimeoutRef = useRef(null);
  const accumulatedSpeechRef = useRef("");
  const handleSendRef = useRef(null);
  
  // Synchronized refs for speech synthesizers
  const interviewRef = useRef(null);
  const autoListenRef = useRef(true);
  const completedRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isListeningRef = useRef(false);

  useEffect(() => {
    interviewRef.current = interview;
  }, [interview]);

  useEffect(() => {
    autoListenRef.current = autoListen;
  }, [autoListen]);

  useEffect(() => {
    completedRef.current = completed;
  }, [completed]);

  // Speech Recognition (STT) Initialization
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setTranscribedText("");
        accumulatedSpeechRef.current = "";
      };

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText + " ";
          } else {
            interimTranscript += transcriptText;
          }
        }

        if (finalTranscript) {
          accumulatedSpeechRef.current += finalTranscript;
        }

        const fullSpeech = (accumulatedSpeechRef.current + interimTranscript).trim();
        setTranscribedText(fullSpeech);

        // Reset silence detection timeout
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }

        // Wait 3.5 seconds of complete silence before submitting the turn
        silenceTimeoutRef.current = setTimeout(() => {
          const finalAnswer = (accumulatedSpeechRef.current + interimTranscript).trim();
          if (finalAnswer.length > 2) {
            stopListening();
            handleSendRef.current?.(finalAnswer);
          }
        }, 3500);
      };

      recognitionRef.current.onerror = (e) => {
        console.error("Speech Recognition Error:", e);
        if (e.error === 'no-speech') {
          return; // Ignore transient no-speech triggers to keep mic alive
        }
        setIsListening(false);
        isListeningRef.current = false;
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        isListeningRef.current = false;
        
        // If recognition stops but there is remaining text, submit it
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
        }
        
        const finalAnswer = accumulatedSpeechRef.current.trim();
        if (finalAnswer.length > 2 && !isSpeakingRef.current) {
          handleSendRef.current?.(finalAnswer);
        }
      };
    }

    return () => {
      window.speechSynthesis.cancel();
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (startListeningTimeoutRef.current) {
        clearTimeout(startListeningTimeoutRef.current);
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, []);

  // Timer logic
  useEffect(() => {
    if (!interviewStarted || timeLeft <= 0 || completed) return;
    const interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [interviewStarted, timeLeft, completed]);

  const startListening = () => {
    if (isListeningRef.current || isSpeakingRef.current || completedRef.current) return;
    
    if (startListeningTimeoutRef.current) {
      clearTimeout(startListeningTimeoutRef.current);
    }
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }

    try {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      isSpeakingRef.current = false;

      if (recognitionRef.current) {
        recognitionRef.current.start();
      }
    } catch (err) {
      console.warn("STT Start failure:", err.message);
    }
  };

  const stopListening = () => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
    }
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      isListeningRef.current = false;
    } catch (err) {
      console.warn("STT Stop failure:", err.message);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const speakText = (text) => {
    if (!voiceMode) return;
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose premium english speaking voice
    const voices = window.speechSynthesis.getVoices();
    const premiumVoice = voices.find(v => v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural")));
    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      stopListening();
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      
      // Auto-Listen loop trigger: listen immediately after speech ends
      if (voiceMode && autoListenRef.current && !completedRef.current) {
        startListeningTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 400);
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleInterrupt = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    startListening();
  };

  // Start Topic Board Interview
  const handleInitiateBoard = async (topicId) => {
    setLoading(true);
    const selected = INTERVIEW_TOPICS.find(t => t.id === topicId);
    setSelectedTopic(selected);
    
    try {
      const res = await API.post("/interview/start", { topic: selected.title });
      setInterview(res.data);
      setInterviewStarted(true);

      // Trigger initial speaking greeting
      const initialMsg = res.data.chatHistory?.[0]?.content;
      if (initialMsg) {
        setTimeout(() => {
          speakText(initialMsg);
        }, 1000);
      }
    } catch (error) {
      console.error("Failed to start topic interview:", error);
      alert("Failed to initialize oral interview board. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit voice response to AI
  const handleSend = async (userMsg) => {
    const currentInterview = interviewRef.current;
    if (!currentInterview) {
      console.warn("No active interview session found in ref.");
      return;
    }
    if (!userMsg.trim() || sending || completedRef.current) return;
    setSending(true);
    
    stopListening();
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    isSpeakingRef.current = false;

    // Note: User responses are saved in backend database session history

    try {
      const res = await API.post(`/interview/${currentInterview._id}/turn`, {
        message: userMsg,
        code: "", // Voice only, no code submissions
        stream: false
      });

      const updated = res.data;
      setInterview(updated);

      const history = updated.chatHistory;
      const lastMsg = history[history.length - 1];
      if (lastMsg && lastMsg.role === "interviewer") {
        speakText(lastMsg.content);
      }
    } catch (error) {
      console.error("Turn process error:", error);
      const errMsg = error.response?.data?.message || error.message;
      alert(`Failed to reach interview board: ${errMsg}`);
    } finally {
      setSending(false);
    }
  };

  // Synchronize handleSend callback on every render
  handleSendRef.current = handleSend;

  // Complete & Evaluate Oral Board
  const handleFinish = async () => {
    const currentInterview = interviewRef.current;
    if (!currentInterview) return;
    if (!window.confirm("Are you sure you want to end this interview board and receive your scorecard?")) return;
    
    window.speechSynthesis.cancel();
    stopListening();
    setLoading(true);

    try {
      const res = await API.post(`/interview/${currentInterview._id}/complete`, { code: "" });
      setInterview(res.data);
      setCompleted(true);
    } catch (error) {
      console.error("Completion evaluation error:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Loader view
  if (loading) {
    return (
      <div className="h-screen bg-[#090a0f] flex flex-col items-center justify-center space-y-4 text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <div className="text-white/40 text-xs font-bold tracking-widest uppercase">Syncing Cyber Interview Board...</div>
      </div>
    );
  }

  // Topic Selection Screen
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden flex flex-col justify-center items-center">
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-4xl w-full relative z-10 space-y-8">
          
          <div className="text-center space-y-2.5">
            <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BrainCircuit className="text-indigo-400" size={24} />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white/95">Voice-to-Voice AI Interview Board</h1>
            <p className="text-xs text-white/45 font-medium max-w-lg mx-auto">
              Simulate professional tech recruiter and behavioral interviews. Experience hands-free voice dialogs. No typing, just natural conversation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INTERVIEW_TOPICS.map((topic) => (
              <div 
                key={topic.id}
                onClick={() => handleInitiateBoard(topic.id)}
                className={`group bg-[#18181b]/50 border rounded-2xl p-5 hover:border-white/15 hover:bg-[#1f1f23]/60 transition-all cursor-pointer shadow-lg shadow-black/25 flex flex-col justify-between h-48 bg-gradient-to-br ${topic.color}`}
              >
                <div>
                  <div className="text-2xl mb-3 select-none">{topic.icon}</div>
                  <h3 className="font-extrabold text-sm text-white/90 group-hover:text-indigo-400 transition-colors">
                    {topic.title}
                  </h3>
                  <p className="text-[10px] text-white/45 font-medium mt-1.5 leading-relaxed">
                    {topic.desc}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest text-indigo-400 group-hover:text-indigo-300 mt-4">
                  <span>Enter Room</span>
                  <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // Evaluation Screen (Completed)
  if (completed) {
    const feedback = interview.feedback || {};
    return (
      <div className="h-screen bg-[#090a0f] flex items-center justify-center p-6 overflow-y-auto text-white">
        <div className="max-w-3xl w-full bg-[#18181b]/60 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-500/20">
              <CheckCircle2 size={28} className="text-emerald-400" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Interview Board Complete</h1>
            <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">Topic: {selectedTopic.title}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-2xl text-center border border-white/5 shadow-md flex flex-col justify-center">
              <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-1.5">Evaluated Score</div>
              <div className="text-5xl font-black text-indigo-400">{feedback.score || 70}</div>
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[#18181b]/60 border border-white/5 p-4 rounded-xl">
                <h3 className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <Cpu size={12} /> Technical Proficiency
                </h3>
                <p className="text-white/70 font-semibold text-xs leading-relaxed">{feedback.technical || "Evaluation metrics processed."}</p>
              </div>
              <div className="bg-[#18181b]/60 border border-white/5 p-4 rounded-xl">
                <h3 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                  <User size={12} /> Communication & Behavioral
                </h3>
                <p className="text-white/70 font-semibold text-xs leading-relaxed">{feedback.behavioral || "Communication assessments finalized."}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-2">
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-white hover:bg-slate-100 text-black font-semibold h-10 px-8 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-black/25"
            >
              <span>Return to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const interviewerCount = interview?.chatHistory ? interview.chatHistory.filter(h => h.role === "interviewer").length : 0;
  const isSessionFinished = interviewerCount >= 6;

  // Live Holographic Voice Board Screen
  return (
    <div className="h-screen bg-[#090a0f] flex flex-col overflow-hidden font-sans text-white relative">
      {/* Glow Rings */}
      <div className="absolute top-[-20%] left-[-10%] w-[550px] h-[550px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[550px] h-[550px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>

      {/* Header */}
      <header className="h-14 bg-[#18181b]/60 border-b border-white/5 flex items-center justify-between px-6 shadow-sm z-20 backdrop-blur-xl shrink-0">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => {
              if (window.confirm("Abandon current interview board? Progress will not be saved.")) {
                navigate(-1);
              }
            }} 
            className="p-1.5 bg-white/5 border border-white/15 rounded-lg text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <div>
            <h1 className="text-xs font-black uppercase text-white/80 tracking-widest">
              Live Board: {selectedTopic?.title}
            </h1>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isListening ? 'bg-emerald-400 animate-pulse' : isSpeaking ? 'bg-indigo-400 animate-pulse animate-ping' : 'bg-slate-500'}`}></span>
              <span className="text-[7px] font-bold text-white/35 uppercase tracking-widest">
                {isListening ? "Candidate Speaking" : isSpeaking ? "Interviewer Transmitting" : "Awaiting Turn"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/10 shrink-0">
            <Timer size={14} className={timeLeft < 300 ? "text-rose-400 animate-pulse" : "text-indigo-400"} />
            <span className={`text-xs font-bold tabular-nums ${timeLeft < 300 ? "text-rose-400" : "text-white/95"}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={handleFinish}
            className="bg-white hover:bg-slate-100 text-black font-semibold h-8 px-4 rounded-lg text-xs transition-all cursor-pointer shadow-md shrink-0"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Holographic Interview Dashboard Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        
        {/* Core Robot Visor HUD */}
        <div className="w-full max-w-xl flex flex-col items-center space-y-8">
          
          {/* Main Large Visualizer Head */}
          <div className="w-[300px] h-[300px] relative">
            <RobotAvatar 
              isSpeaking={isSpeaking}
              isListening={isListening}
              isThinking={sending}
            />
            {/* Spinning Radar Scan ring effect on container */}
            <div className={`absolute inset-0 border border-indigo-500/10 rounded-2xl pointer-events-none transition-all duration-700 ${isSpeaking ? 'scale-105 border-indigo-500/20' : isListening ? 'scale-105 border-emerald-500/20' : ''}`}></div>
          </div>

          {/* Live Subtitles Teleprompter */}
          {transcribedText && !isSessionFinished && (
            <div className="w-full bg-[#1c1d24]/60 border border-emerald-500/25 rounded-2xl p-4 shadow-lg shadow-emerald-950/10 backdrop-blur-md transition-all duration-300 animate-fade-in-up">
              <div className="text-[7px] font-black uppercase text-emerald-400 tracking-widest mb-1.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shrink-0"></span>
                <span>Live Speech Transcription</span>
              </div>
              <p className="text-xs font-semibold text-white/90 leading-relaxed text-left max-h-24 overflow-y-auto custom-scrollbar italic">
                "{transcribedText}"
              </p>
            </div>
          )}

          {/* Interactive Speech Status Box */}
          <div className="w-full text-center space-y-3">
            <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-4 shadow-lg shadow-black/30 backdrop-blur-xl">
              {isSessionFinished ? (
                <div className="flex flex-col items-center justify-center py-1.5 space-y-1">
                  <div className="text-emerald-400 font-bold uppercase tracking-widest text-[9px] animate-pulse">
                    🎉 Oral Interview Complete
                  </div>
                  <div className="text-white/45 text-[10px] font-medium leading-relaxed">
                    You have answered all 5 technical/behavioral questions.
                  </div>
                </div>
              ) : sending ? (
                <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[9px] py-1.5 animate-pulse">
                  <Activity size={12} className="animate-spin" />
                  <span>AI Recruiter parsing speech...</span>
                </div>
              ) : isListening ? (
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold uppercase tracking-widest text-[9px] py-1.5 animate-pulse">
                  <Mic size={12} className="animate-bounce" />
                  <span>Microphone Active. Speak now...</span>
                </div>
              ) : isSpeaking ? (
                <div className="flex items-center justify-center gap-2 text-indigo-400 font-bold uppercase tracking-widest text-[9px] py-1.5">
                  <Volume2 size={12} />
                  <span>Interviewer is talking...</span>
                </div>
              ) : (
                <div className="text-white/35 font-bold uppercase tracking-widest text-[9px] py-1.5">
                  Microphone Standby. Enable auto-listen or click mic to reply.
                </div>
              )}
            </div>
          </div>

          {/* Audio Controls Toolbar */}
          <div className="flex items-center justify-center gap-3.5 bg-[#18181b]/40 border border-white/10 px-4 py-2.5 rounded-2xl shadow-xl shadow-black/35 backdrop-blur-xl">
            {isSessionFinished ? (
              <button
                onClick={handleFinish}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold h-11 px-8 rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-500/20 animate-pulse border border-indigo-400/30"
              >
                <CheckCircle2 size={14} />
                <span>View Performance Scorecard</span>
              </button>
            ) : (
              <>
                {/* Mic Toggle Button */}
                <button
                  onClick={toggleListening}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all cursor-pointer ${
                    isListening 
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-lg shadow-rose-500/10' 
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }`}
                  title={isListening ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                </button>

                {/* Auto Listen Toggle */}
                <button
                  onClick={() => setAutoListen(!autoListen)}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    autoListen 
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                  title="Auto-Listen Mode (Auto-mic after AI speaks)"
                >
                  <Activity size={14} className={autoListen ? "animate-pulse" : ""} />
                  <span className="text-[6px] font-black uppercase tracking-widest mt-0.5">AUTO</span>
                </button>

                {/* Speaker Voice Mode Toggle */}
                <button
                  onClick={() => setVoiceMode(!voiceMode)}
                  className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center border transition-all cursor-pointer ${
                    voiceMode 
                      ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-500/10' 
                      : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                  }`}
                  title="Voice output volume toggle"
                >
                  {voiceMode ? <Volume2 size={14} /> : <VolumeX size={14} />}
                  <span className="text-[6px] font-black uppercase tracking-widest mt-0.5">VOICE</span>
                </button>

                {/* Interrupt AI Button */}
                <button
                  onClick={handleInterrupt}
                  disabled={!isSpeaking}
                  className={`h-11 px-4 rounded-xl flex items-center gap-1.5 border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    isSpeaking 
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                      : 'bg-white/5 border-white/5 text-white/20 cursor-not-allowed'
                  }`}
                  title="Interrupt AI speaking to reply immediately"
                >
                  <Pause size={12} />
                  <span>Interrupt</span>
                </button>
              </>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}

export default MockInterview;

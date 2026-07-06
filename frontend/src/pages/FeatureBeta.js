import React from "react";
import { useLocation } from "react-router-dom";
import { 
  Terminal, 
  Users, 
  Radio, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Settings, 
  Activity,
  Cpu,
  ShieldCheck,
  Flame
} from "lucide-react";

function FeatureBeta() {
  const location = useLocation();
  const path = location.pathname;

  const features = {
    "/sandbox-compiler": {
      title: "Multi-Language Sandbox Compiler",
      icon: <Terminal className="text-amber-400" size={36} />,
      status: "In Development",
      progress: 85,
      spec: "Expanding Judge0 sandbox compiler to execute Rust, C++, Java, and Python alongside JavaScript. Fully integrated syntax boilerplates inside Monaco.",
      details: [
        { label: "Compiler Engine", value: "Judge0 API v4 Sandbox" },
        { label: "Active Languages", value: "JavaScript, Python, C++, Java" },
        { label: "Memory Isolation Limit", value: "128MB per execution" },
        { label: "Timeout Policies", value: "5.0 seconds standard throttle" }
      ],
      logs: [
        "Initialized multi-language wrapper middleware.",
        "Created default boilerplates for Python class structures.",
        "Integrated Monaco language configuration hooks."
      ]
    },
    "/collaborative-mocks": {
      title: "WebSocket-based Collaborative Mocks",
      icon: <Users className="text-indigo-400" size={36} />,
      status: "Under Integration",
      progress: 60,
      spec: "Real-time multiplayer coding sheets utilizing Yjs CRDTs and Operational Transformation (OT) over Socket.io connections for zero-conflict peer reviews.",
      details: [
        { label: "Conflict Resolution", value: "Yjs CRDT Engine" },
        { label: "Signaling Server", value: "Socket.io horizontal clusters" },
        { label: "Sync Latency", value: "<15ms local loop" },
        { label: "Multiplayer Limit", value: "Up to 5 concurrent editors" }
      ],
      logs: [
        "Configured Redis Adapter for multiplayer horizontal scaling.",
        "Completed Socket.io cursor synchronizer prototype.",
        "Integrating Yjs document fragments with Monaco editor."
      ]
    },
    "/gemini-live": {
      title: "Gemini Live Multimodal Voice Feed",
      icon: <Radio className="text-rose-400" size={36} />,
      status: "Pending API Access",
      progress: 30,
      spec: "Replacing traditional Speech Synthesis API voice reading with direct low-latency WebRTC streams connected to the Gemini Multimodal Live API.",
      details: [
        { label: "Streaming API", value: "Gemini Multimodal Live WebRTC" },
        { label: "Voice Latency Goal", value: "<120ms roundtrip delay" },
        { label: "Audio Sampling Rate", value: "16kHz high-fidelity speech" },
        { label: "Context Window", value: "1M tokens dynamic prompt" }
      ],
      logs: [
        "Created WebRTC audio streaming capture components.",
        "Tested local speech synthesis fallback structures.",
        "Awaiting production keys for Gemini Live endpoints."
      ]
    },
    "/security-audits": {
      title: "CI/CD Security Tests & Audits",
      icon: <Lock className="text-emerald-400" size={36} />,
      status: "Beta Active",
      progress: 95,
      spec: "Automated Jest and Supertest scanning engines validating CSRF protection headers, IDOR access controls, and rate-limiting modules in GitHub Actions.",
      details: [
        { label: "Workflow Config", value: ".github/workflows/security.yml" },
        { label: "Audit Suite", value: "backend/scripts/test-security.js" },
        { label: "Origin Verification", value: "Strict CORS check (Local Port 5099)" },
        { label: "Auto-Fail Threshold", value: "Any single security gap" }
      ],
      logs: [
        "Created central security testing harness script.",
        "Added automatic Redis and MongoDB containers to GitHub runner.",
        "Secured administrative routes with sailokeshnalabothu@gmail.com restriction."
      ]
    }
  };

  const feature = features[path] || features["/sandbox-compiler"];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-[#090a0f] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Feature Intro Card */}
      <div className="bg-[#18181b]/50 border border-white/5 p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl shrink-0">
            {feature.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">{feature.title}</h1>
              <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                feature.status === "Beta Active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                feature.status === "In Development" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
              }`}>
                {feature.status}
              </span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed mt-2.5 max-w-2xl font-medium">{feature.spec}</p>
          </div>
        </div>

        {/* Progress Circular representation */}
        <div className="flex flex-col items-center gap-1.5 shrink-0 bg-white/[0.02] border border-white/5 px-4 py-3 rounded-xl">
          <div className="text-2xl font-extrabold text-white leading-none">{feature.progress}%</div>
          <div className="text-[9px] text-white/40 uppercase font-black tracking-wider">Engine Ready</div>
          <div className="w-24 bg-white/10 h-1.5 rounded-full overflow-hidden mt-1.5">
            <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${feature.progress}%` }}></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        
        {/* Specifications List */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-white/35 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu size={12} className="text-indigo-400" />
              <span>Architectural Specifications</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {feature.details.map((det, i) => (
                <div key={i} className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-1">
                  <div className="text-[10px] text-white/30 font-bold uppercase tracking-wide">{det.label}</div>
                  <div className="text-xs text-white/80 font-bold">{det.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Development Logs / Integration Pipeline */}
          <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-white/35 uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={12} className="text-indigo-400" />
              <span>Development Release Logs</span>
            </h3>
            
            <div className="space-y-2.5">
              {feature.logs.map((log, i) => (
                <div key={i} className="flex items-center space-x-2.5 p-2.5 bg-white/[0.01] border border-white/5 rounded-lg text-xs text-white/70 font-semibold">
                  <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Diagnostics Info */}
        <div className="space-y-6">
          <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl space-y-4">
            <h3 className="text-[10px] font-bold text-white/35 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-indigo-400" />
              <span>Audit Clearance</span>
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-white/40">Status:</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <Clock size={11} />
                  Pending Deploy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Compliance:</span>
                <span className="text-white/80 font-bold">Standard Sandbox v2</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/40">Security Scan:</span>
                <span className="text-emerald-400 font-bold">PASSED</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/15 p-5 rounded-2xl text-center space-y-3">
            <Flame className="mx-auto text-indigo-400" size={24} />
            <h4 className="text-xs font-bold text-white">Trigger Integration Pipeline</h4>
            <p className="text-[10px] text-white/45 leading-relaxed font-semibold">Initiate compiling simulations and local sandbox validation routines.</p>
            <button 
              onClick={() => alert(`Simulating integration pipeline for: ${feature.title}`)}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-8 rounded-lg text-[9px] uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-950/40"
            >
              Run Diagnostic Scan
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default FeatureBeta;

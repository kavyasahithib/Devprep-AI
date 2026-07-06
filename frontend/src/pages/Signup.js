import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, AlertCircle as Shield } from "lucide-react";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/signup", {
        name,
        email,
        password,
      });
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#090a0f] font-sans overflow-hidden relative selection:bg-indigo-500/30 selection:text-white">
      {/* Premium Apple Ambient Glow Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Left side: branding/visuals */}
      <div className="hidden lg:flex w-[42%] border-r border-white/5 text-white flex-col justify-between p-12 relative z-10">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold tracking-tight">DevPrep AI</span>
        </div>

        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl font-extrabold mb-4 leading-[1.1] tracking-tight">
              Engineer Your <br/>
              <span className="text-indigo-400">Perfect Career</span>
            </h1>
            <p className="text-white/60 text-sm mb-8 leading-relaxed max-w-xs">
              Elite-tier technical preparation with real-time AI logic analysis and senior-level interview simulations.
            </p>
          </motion.div>

          <div className="space-y-3.5">
            {[
              { title: "Deep Trace Logic", desc: "AI that explains why your approach fails, not just how.", color: "bg-indigo-500" },
              { title: "Global Sync", desc: "Auto-sync accepted solutions to your GitHub portfolio.", color: "bg-emerald-500" },
              { title: "Senior Agents", desc: "Mock interviews with AI optimized for Tier-1 companies.", color: "bg-amber-500" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="flex items-center gap-3.5 bg-white/[0.02] border border-white/5 p-3.5 rounded-2xl"
              >
                <div className={`w-2 h-2 rounded-full ${item.color} shadow-lg shadow-white/10`}></div>
                <div>
                  <h4 className="font-bold text-xs text-white/90">{item.title}</h4>
                  <p className="text-white/45 text-[10px] font-semibold leading-relaxed mt-0.5">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-white/35 font-bold text-[9px] uppercase tracking-wider">
          <span>&copy; 2026 Platform</span>
          <div className="flex gap-4">
            <span>Terms</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>

      {/* Right side: form */}
      <div className="flex w-full lg:w-[58%] items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-md bg-[#18181b]/60 p-6 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
        >
          <div className="mb-5 text-center lg:text-left">
            <h2 className="text-xl font-bold text-white tracking-tight">Create Your Account</h2>
            <p className="text-[11px] text-white/55 font-medium mt-0.5">
              Get started with your learning journey today.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Your Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-9 pr-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-white/[0.02] border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              {/* Compact Password Policy Guide */}
              <div className="mt-3.5 p-3 bg-white/[0.02] rounded-xl border border-dashed border-white/15">
                <div className="flex items-center gap-1.5 mb-1.5 text-indigo-400">
                  <Shield size={12} />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Security Checklist</span>
                </div>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-3 gap-y-1">
                  {[
                    { label: "8-12 Characters", met: password.length >= 8 && password.length <= 12 },
                    { label: "Case-sensitive", met: /[A-Z]/.test(password) && /[a-z]/.test(password) },
                    { label: "Includes a Number", met: /[0-9]/.test(password) },
                    { label: "Special Character", met: /[!@#$%^&*(),.?":{}|<>]/.test(password) }
                  ].map((req, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <div className={`w-1 h-1 rounded-full ${req.met ? 'bg-emerald-500' : 'bg-white/25'}`}></div>
                      <span className={`text-[9px] font-semibold ${req.met ? 'text-white/95' : 'text-white/40'}`}>
                        {req.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold flex items-center gap-2"
                >
                  <Shield size={14} className="shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white hover:bg-slate-100 text-black font-semibold h-10 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50 mt-3"
            >
              {loading ? <Loader2 className="animate-spin text-black" size={18} /> : (
                <>
                  <span className="text-xs">CREATE ACCOUNT</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          <p className="text-[11px] text-white/40 mt-6 text-center font-semibold">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors uppercase underline underline-offset-4 decoration-1">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;

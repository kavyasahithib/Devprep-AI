import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Sparkles, AlertCircle as Shield } from "lucide-react";

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
      // Redirect to OTP verification
      navigate("/verify-otp", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white font-sans overflow-hidden">
      {/* Left side: branding/visuals */}
      <div className="hidden lg:flex w-[45%] bg-slate-950 text-white flex-col justify-between p-16 relative overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
            <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-indigo-600 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-emerald-600 rounded-full blur-[120px] animate-pulse delay-700"></div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
                <Sparkles className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter uppercase">DevPrep AI</span>
        </div>

        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-black mb-8 leading-[1.1] tracking-tighter">
                Engineer Your <br/>
                <span className="text-indigo-500">Perfect Career</span>
            </h1>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed font-semibold max-w-md">
                Elite-tier technical preparation with real-time AI logic analysis and senior-level interview simulations.
            </p>
          </motion.div>

          <div className="space-y-6">
            {[
                { title: "Deep Trace Logic", desc: "AI that explains *why* your approach fails, not just how.", color: "bg-indigo-500" },
                { title: "Global Sync", desc: "Auto-sync accepted solutions to your GitHub portfolio.", color: "bg-emerald-500" },
                { title: "Senior Agents", desc: "Mock interviews with AI optimized for Tier-1 companies.", color: "bg-amber-500" }
            ].map((item, i) => (
                <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + (i * 0.1) }}
                    className="flex items-center gap-4 bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-sm"
                >
                    <div className={`w-3 h-3 rounded-full ${item.color} shadow-lg shadow-${item.color}/50`}></div>
                    <div>
                        <h4 className="font-bold text-sm">{item.title}</h4>
                        <p className="text-slate-500 text-xs font-bold leading-relaxed">{item.desc}</p>
                    </div>
                </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex justify-between items-center text-slate-500 font-bold text-xs uppercase tracking-[0.2em]">
            <span>&copy; 2026 Platform</span>
            <div className="flex gap-4">
                <span>Terms</span>
                <span>Privacy</span>
            </div>
        </div>
      </div>

      {/* Right side: form */}
      <div className="flex w-full lg:w-[55%] items-center justify-center p-8 bg-slate-50">
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-lg bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100"
        >
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter">Create Your Account</h2>
            <p className="text-slate-500 font-bold text-sm tracking-wide">
              Get started with your learning journey.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Name</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all shadow-inner"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all shadow-inner"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none text-sm font-bold transition-all shadow-inner"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
            </div>

            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-black flex items-center gap-3"
                    >
                        <Shield size={18} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-slate-950 text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3 group mt-4 overflow-hidden relative"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                  <>
                    <span className="relative z-10 uppercase tracking-widest">Create My Account</span>
                    <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />
                  </>
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 mt-10 text-center font-bold font-mono">
            ALREADY HAVE AN ACCOUNT?{" "}
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 transition-all uppercase underline underline-offset-4 decoration-2">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Signup;

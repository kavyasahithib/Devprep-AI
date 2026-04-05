import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../services/api";
import { Lock, Mail, ArrowRight, Loader2, Globe, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for auth errors in URL
    const params = new URLSearchParams(location.search);
    const authError = params.get("error");
    if (authError) {
      setError("Google authentication failed. Please try again.");
    }
  }, [location]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      // Store user info and role, but tokens are now in secure cookies
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);
      navigate("/dashboard");
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.email) {
          navigate("/verify-otp", { state: { email: err.response.data.email } });
      } else {
          setError(err.response?.data?.message || "Invalid credentials. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-10 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="flex flex-col items-center mb-10 text-center">
            <motion.div 
                whileHover={{ rotate: 15 }}
                className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-200"
            >
                <Lock className="text-white" size={36} />
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Hello Again!</h1>
            <p className="text-slate-500 font-semibold text-sm uppercase tracking-widest px-2 py-1 bg-slate-100 rounded-lg inline-block">Welcome</p>
        </div>

        <div className="space-y-4 mb-8">
            <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border-2 border-slate-100 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95"
          >
            <Globe className="text-slate-400" size={20} />
            <span>Continue with Google</span>
          </button>

            <div className="flex items-center gap-4 text-slate-300 py-2">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] font-black uppercase tracking-widest">or with email</span>
                <div className="h-px bg-slate-100 flex-1"></div>
            </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="email"
                        placeholder="you@engineers.com"
                        className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-bold placeholder:font-medium shadow-inner"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <div className="flex justify-between items-end mb-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
                    <button type="button" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Forgot?</button>
                </div>
                <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={20} />
                    <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-2 border-slate-50 p-4 pl-12 rounded-2xl text-slate-900 outline-none focus:border-indigo-500 focus:bg-white transition-all text-sm font-bold placeholder:font-medium shadow-inner"
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
                        className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-3"
                    >
                        <AlertCircle size={18} />
                        {error}
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-slate-950 text-white font-black h-14 rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center space-x-2 active:scale-95 group"
            >
                {loading ? <Loader2 className="animate-spin" size={24} /> : (
                    <>
                        <span>LOG IN</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
            <p className="text-slate-400 text-xs font-bold">
                NEW HERE?{" "}
                <Link to="/signup" className="text-indigo-600 font-black hover:text-indigo-800 transition-all uppercase underline underline-offset-4 decoration-2">
                    Create an Account
                </Link>
            </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
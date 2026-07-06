import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import API from "../services/api";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.33 0 3.321 2.673 1.391 6.573L5.266 9.765z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.273c0-.818-.073-1.609-.209-2.373H12v4.5h6.49a5.556 5.556 0 0 1-2.409 3.645l3.873 3c2.264-2.09 3.536-5.172 3.536-8.772z"
    />
    <path
      fill="#FBBC05"
      d="M5.266 14.235A7.014 7.014 0 0 1 4.909 12c0-.79.136-1.55.357-2.265L1.391 6.573C.5 8.218 0 10.055 0 12c0 1.945.5 3.782 1.391 5.427l3.875-3.192z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.955-1.073 7.945-2.91l-3.873-3c-1.073.718-2.455 1.145-4.072 1.145-3.136 0-5.8-2.118-6.734-4.964L1.391 17.464C3.321 21.327 7.33 24 12 24z"
    />
  </svg>
);

function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState(location.state?.email || "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.message || "");

  useEffect(() => {
    // Check for auth errors in URL
    const params = new URLSearchParams(location.search);
    const authError = params.get("error");
    if (authError === "maintenance_active") {
      setError("Platform is currently under maintenance. Only the administrator can log in.");
      setSuccessMessage("");
    } else if (authError) {
      setError("Google authentication failed. Please try again.");
      setSuccessMessage("");
    }
  }, [location]);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMessage("");
    try {
      const res = await API.post("/auth/login", { email, password });
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
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden font-sans p-4 selection:bg-indigo-500/30 selection:text-white">
      {/* Premium Apple Ambient Glow Background */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Login Window Card - Compact Apple UI */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[360px] p-6 bg-[#18181b]/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Brand/Header Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">Hello Again!</h1>
          <p className="text-[11px] text-white/55 font-medium mt-0.5">Welcome back to DevPrep AI</p>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input
                type="email"
                placeholder="you@engineers.com"
                className="w-full bg-white/[0.02] border border-white/10 p-2.5 pl-9 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-end">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Password</label>
              <button type="button" className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Forgot?</button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-white/[0.02] border border-white/10 p-2.5 pl-9 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error Message rendering */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-semibold flex items-center gap-2"
              >
                <AlertCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message rendering */}
          <AnimatePresence>
            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold flex items-center gap-2"
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Actions */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white hover:bg-slate-100 text-black font-semibold h-10 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-black/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin text-black" size={18} /> : (
              <>
                <span className="text-xs">LOG IN</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>

        {/* Separator - Industry Standard Placement */}
        <div className="flex items-center gap-3 text-white/20 py-3">
          <div className="h-px bg-white/10 flex-1"></div>
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/30">or continue with</span>
          <div className="h-px bg-white/10 flex-1"></div>
        </div>

        {/* Google OAuth Option */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-2 bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-white py-2.5 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-[0.98] cursor-pointer"
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>

        {/* Footer section */}
        <div className="mt-6 text-center border-t border-white/5 pt-4">
          <p className="text-white/40 text-[11px] font-semibold">
            NEW HERE?{" "}
            <Link to="/signup" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors uppercase underline underline-offset-4 decoration-1">
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default Login;
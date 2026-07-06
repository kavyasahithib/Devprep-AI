import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { CheckCircle2, Loader2, Key, ShieldAlert, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("Missing email context. Please sign up again.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      await API.post("/auth/verify-otp", { email, otp });
      setVerified(true);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (verified) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden font-sans p-4 selection:bg-indigo-500/30 selection:text-white">
        {/* Premium Apple Ambient Glow Backgrounds */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Verify Window Card - Compact */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full max-w-[360px] p-8 bg-[#18181b]/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden text-center flex flex-col items-center"
        >
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-5 animate-pulse">
            <ShieldCheck size={32} />
          </div>

          <h1 className="text-xl font-bold text-white tracking-tight">OTP Verified!</h1>
          <p className="text-[11px] text-white/55 font-medium mt-2 leading-relaxed max-w-[240px]">
            Your email has been successfully verified. Please log in to access your dashboard.
          </p>

          <button
            onClick={() => navigate("/", { state: { email, message: "Email verified successfully! Please log in." } })}
            className="w-full bg-white hover:bg-slate-100 text-black font-semibold h-10 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-black/20 mt-6 text-xs uppercase"
          >
            <span>Proceed to Login</span>
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#090a0f] relative overflow-hidden font-sans p-4 selection:bg-indigo-500/30 selection:text-white">
      {/* Premium Apple Ambient Glow Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Verify Window Card - Compact */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-[360px] p-6 bg-[#18181b]/60 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-xl relative overflow-hidden"
      >
        {/* Brand/Header Section */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-xl font-bold text-white tracking-tight">Check your email</h1>
          <p className="text-[11px] text-white/55 font-medium mt-1.5 max-w-[240px] mx-auto leading-relaxed">
            We've sent a 6-digit code to <br/>
            <span className="text-indigo-400 font-semibold">{email || "your email"}</span>
          </p>
        </div>

        {/* OTP Input Form */}
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">6-Digit Code</label>
            <div className="relative group">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                className="w-full bg-white/[0.02] border border-white/10 p-2.5 pl-9 rounded-xl text-white outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xl font-bold tracking-[0.5em] text-center placeholder:text-white/20"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Error Message rendering */}
          {error && (
            <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Form Actions */}
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-white hover:bg-slate-100 disabled:bg-white/20 disabled:text-white/40 disabled:cursor-not-allowed text-black font-semibold h-10 rounded-xl transition-all duration-200 active:scale-[0.98] flex items-center justify-center space-x-1.5 cursor-pointer shadow-lg shadow-black/20"
          >
            {loading ? <Loader2 className="animate-spin text-black" size={18} /> : (
              <>
                <span className="text-sm">CONFIRM CODE</span>
                <CheckCircle2 size={14} />
              </>
            )}
          </button>
        </form>

        {/* Footer section */}
        <p className="text-[11px] text-white/40 mt-6 text-center font-semibold">
          Didn't receive the code?{" "}
          <button className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-1">
            Resend Code
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;

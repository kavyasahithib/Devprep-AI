import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { Mail, CheckCircle2, Loader2, Key } from "lucide-react";
import { motion } from "framer-motion";

function VerifyOTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
        setError("Missing email context. Please sign up again.");
        return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await API.post("/auth/verify-otp", { email, otp });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      localStorage.setItem("role", res.data.user.role);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 font-sans p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl border border-slate-200"
      >
        <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Mail className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h1>
            <p className="text-slate-500 font-medium">We've sent a 6-digit code to <br/><span className="text-indigo-600">{email || "your email"}</span></p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
            <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">6-Digit Code</label>
                <div className="relative">
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="w-full bg-slate-50 border border-slate-200 p-4 pl-12 rounded-xl text-slate-900 outline-none focus:border-indigo-500 transition-all text-2xl font-bold tracking-[0.5em] text-center"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-semibold">
                    {error}
                </div>
            )}

            <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold h-14 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 group"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        <span>Confirm Code</span>
                        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                    </>
                )}
            </button>
        </form>

        <p className="text-sm text-slate-500 mt-8 text-center font-medium">
            Didn't receive the code?{" "}
            <button className="text-indigo-600 font-bold hover:text-indigo-700 transition-all">
                Resend Code
            </button>
        </p>
      </motion.div>
    </div>
  );
}

export default VerifyOTP;

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, AlertCircle, Save, CheckCircle, FileText, Calendar, ChevronLeft } from "lucide-react";
import API from "../services/api";

function GovernanceSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    allowSignup: true,
    maintenanceMode: false,
    requireOTP: true,
    maintenanceMessage: "We are currently down for maintenance. Please check back later.",
    maintenanceStartDate: "",
    maintenanceEndDate: ""
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await API.get('/settings');
        setSettings({
          allowSignup: res.data.allowSignup ?? true,
          maintenanceMode: res.data.maintenanceMode ?? false,
          requireOTP: res.data.requireOTP ?? true,
          maintenanceMessage: res.data.maintenanceMessage || "We are currently down for maintenance. Please check back later.",
          maintenanceStartDate: res.data.maintenanceStartDate ? new Date(res.data.maintenanceStartDate).toISOString().slice(0, 16) : "",
          maintenanceEndDate: res.data.maintenanceEndDate ? new Date(res.data.maintenanceEndDate).toISOString().slice(0, 16) : ""
        });
      } catch (error) {
        console.error("Failed to fetch settings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/settings', settings);
      setMessage("Settings updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Failed to save settings", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#090a0f] text-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Back to Admin</span>
          </button>
        </div>

        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-indigo-400" size={20} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Site Settings</h1>
            <p className="text-[11px] text-white/50 font-medium mt-0.5">Change how the site works for everyone.</p>
          </div>
        </div>

        <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/25 space-y-6">
          
          <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-xl border border-white/5">
            <div>
              <h4 className="font-bold text-white mb-0.5 leading-tight text-sm">Allow New Signups</h4>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-tight mt-0.5">Let new students create accounts.</p>
            </div>
            <button 
              type="button"
              onClick={() => setSettings({...settings, allowSignup: !settings.allowSignup})}
              className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${settings.allowSignup ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all ${settings.allowSignup ? 'left-[22px]' : 'left-[2px]'}`}></div>
            </button>
          </div>

          <div className="bg-white/[0.02] rounded-xl border border-white/5 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-white mb-0.5 leading-tight text-sm">Maintenance Mode</h4>
                <p className="text-[10px] text-white/40 font-semibold uppercase tracking-tight mt-0.5">Temporarily close the site for everyone.</p>
              </div>
              <button 
                type="button"
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${settings.maintenanceMode ? 'bg-rose-600' : 'bg-white/10'}`}
              >
                <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-[22px]' : 'left-[2px]'}`}></div>
              </button>
            </div>
            
            {settings.maintenanceMode && (
              <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Maintenance Message</label>
                  <div className="relative group">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-rose-400 transition-colors" size={14} />
                    <input 
                      type="text"
                      value={settings.maintenanceMessage}
                      onChange={(e) => setSettings({...settings, maintenanceMessage: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white placeholder-white/20 outline-none focus:border-rose-500/80 focus:bg-white/[0.05] transition-all font-semibold text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Start Date/Time (Optional)</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-rose-400 transition-colors" size={14} />
                    <input 
                      type="datetime-local"
                      value={settings.maintenanceStartDate}
                      onChange={(e) => setSettings({...settings, maintenanceStartDate: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white outline-none focus:border-rose-500/80 focus:bg-white/[0.05] transition-all font-mono text-xs"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">End Date/Time (Optional)</label>
                  <div className="relative group">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-rose-400 transition-colors" size={14} />
                    <input 
                      type="datetime-local"
                      value={settings.maintenanceEndDate}
                      onChange={(e) => setSettings({...settings, maintenanceEndDate: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-white outline-none focus:border-rose-500/80 focus:bg-white/[0.05] transition-all font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-5 bg-white/[0.02] rounded-xl border border-white/5">
            <div>
              <h4 className="font-bold text-white mb-0.5 leading-tight text-sm">Require Email Check</h4>
              <p className="text-[10px] text-white/40 font-semibold uppercase tracking-tight mt-0.5">Send a code to check new emails.</p>
            </div>
            <button 
              type="button"
              onClick={() => setSettings({...settings, requireOTP: !settings.requireOTP})}
              className={`w-11 h-6 rounded-full transition-all relative cursor-pointer ${settings.requireOTP ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
              <div className={`absolute top-[2px] w-5 h-5 bg-white rounded-full transition-all ${settings.requireOTP ? 'left-[22px]' : 'left-[2px]'}`}></div>
            </button>
          </div>

          <div className="pt-5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-white/40">
              <AlertCircle size={16} />
              <span className="text-[11px] font-semibold">Changes will apply to everyone once saved.</span>
            </div>
            
            <div className="flex items-center gap-3 shrink-0">
              {message && (
                <motion.span 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                >
                  <CheckCircle size={14} />
                  {message}
                </motion.span>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-10 px-5 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                {saving ? "Saving..." : (
                  <>
                    <Save size={14} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GovernanceSettings;

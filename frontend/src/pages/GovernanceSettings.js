import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield, AlertCircle, Save, CheckCircle } from "lucide-react";

function GovernanceSettings() {
  const [settings, setSettings] = useState({
    allowSignup: true,
    maintenanceMode: false,
    requireOTP: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Simulated fetch - In a real app, this would be a GET /api/admin/settings
    setTimeout(() => {
        setLoading(false);
    }, 800);
  }, []);

  const handleSave = () => {
    setSaving(true);
    // Simulated save
    setTimeout(() => {
        setSaving(false);
        setMessage("Settings updated successfully!");
        setTimeout(() => setMessage(""), 3000);
    }, 1000);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-1">Site Settings</h1>
            <p className="text-slate-500 font-medium">Change how the site works for everyone.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 shadow-sm space-y-10">
          
          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 leading-none">Allow New Signups</h4>
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-tight">Let new students create accounts.</p>
            </div>
            <button 
                onClick={() => setSettings({...settings, allowSignup: !settings.allowSignup})}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.allowSignup ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.allowSignup ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 leading-none">Maintenance Mode</h4>
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-tight">Temporarily close the site for everyone.</p>
            </div>
            <button 
                onClick={() => setSettings({...settings, maintenanceMode: !settings.maintenanceMode})}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-rose-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 mb-1 leading-none">Require Email Check</h4>
              <p className="text-xs text-slate-500 font-medium font-mono uppercase tracking-tight">Send a code to check new emails.</p>
            </div>
            <button 
                onClick={() => setSettings({...settings, requireOTP: !settings.requireOTP})}
                className={`w-14 h-8 rounded-full transition-all relative ${settings.requireOTP ? 'bg-indigo-600' : 'bg-slate-300'}`}
            >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${settings.requireOTP ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-400">
                <AlertCircle size={20} />
                <span className="text-sm font-medium">Changes will apply to everyone once saved.</span>
            </div>
            
            <div className="flex items-center gap-4">
                {message && (
                    <motion.span 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-emerald-600 text-sm font-bold flex items-center gap-2"
                    >
                        <CheckCircle size={16} />
                        {message}
                    </motion.span>
                )}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-slate-900 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                >
                    {saving ? "Saving..." : (
                        <>
                            <Save size={18} />
                            Save Settings
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

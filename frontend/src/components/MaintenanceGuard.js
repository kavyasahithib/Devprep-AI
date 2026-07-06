import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { AlertTriangle, Hammer, Clock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const MaintenanceGuard = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState(null);
  
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const checkIsMaintenanceActive = (data) => {
      if (!data.maintenanceMode) return false;
      const now = new Date();
      if (data.maintenanceStartDate) {
        const start = new Date(data.maintenanceStartDate);
        if (now < start) return false;
      }
      if (data.maintenanceEndDate) {
        const end = new Date(data.maintenanceEndDate);
        if (now > end) return false;
      }
      return true;
    };

    const fetchMaintenanceStatus = async () => {
      try {
        const res = await API.get('/settings/public');
        const active = checkIsMaintenanceActive(res.data);
        if (active) {
          setIsMaintenance(true);
          setMaintenanceData({
            message: res.data.maintenanceMessage,
            startDate: res.data.maintenanceStartDate,
            endDate: res.data.maintenanceEndDate
          });
        } else {
          setIsMaintenance(false);
        }
      } catch (error) {
        console.error("Failed to check maintenance status", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaintenanceStatus();

    // Poll status every 10 seconds to respond automatically to schedule changes/expiry
    const interval = setInterval(fetchMaintenanceStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  const isAuthRoute = location.pathname === '/' || location.pathname === '/verify-otp';

  // Admins bypass maintenance mode, and the login flow remains unblocked
  if (!isMaintenance || isAdmin || isAuthRoute) {
    return children;
  }

  // Format dates gracefully
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  const getFormattedDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const start = maintenanceData ? getFormattedDate(maintenanceData.startDate) : null;
  const end = maintenanceData ? getFormattedDate(maintenanceData.endDate) : null;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl p-12 text-center relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-3 bg-amber-500"></div>
        
        <div className="w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-100">
          <Hammer size={48} className="text-amber-500" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Under Maintenance</h1>
        
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 shadow-sm">
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            {maintenanceData.message || "We are currently down for scheduled maintenance to improve your experience. Please check back later."}
          </p>
        </div>

        {(start || end) && (
            <div className="flex flex-col items-center gap-3 bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 text-indigo-600 font-bold uppercase tracking-wider text-xs">
                    <Clock size={16} />
                    <span>Maintenance Schedule</span>
                </div>
                <div className="text-slate-700 text-sm font-semibold space-y-1">
                    {start && <div>From: {start}</div>}
                    {end && <div>Until: {end}</div>}
                </div>
            </div>
        )}

        <div className="mt-10 flex items-center justify-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-[10px]">
            <AlertTriangle size={14} />
            <span>Thank you for your patience</span>
        </div>
      </motion.div>
    </div>
  );
};

export default MaintenanceGuard;

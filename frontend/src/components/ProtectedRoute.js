import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../services/api';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      // First check localStorage for a cached user
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setLoading(false);
        return;
      }

      // If no stored user, try to fetch from backend (incase of fresh Cookie-based login like Google OAuth)
      try {
        const res = await API.get('/users/profile');
        const userData = res.data;
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('role', userData.role);
        setUser(userData);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;

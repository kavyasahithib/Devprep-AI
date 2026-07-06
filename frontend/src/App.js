import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import React, { Suspense, lazy } from 'react';

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Submissions from "./pages/Submissions";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
import ManageUsers from "./pages/ManageUsers";
import UserStats from "./pages/UserStats";
import VerifyOTP from "./pages/VerifyOTP";
import GovernanceSettings from "./pages/GovernanceSettings";
import VerifiedStatus from "./pages/VerifiedStatus";
import FeatureBeta from "./pages/FeatureBeta";

import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import MaintenanceGuard from "./components/MaintenanceGuard";

// Lazy Loaded Heavy Components
const Editor = lazy(() => import("./pages/Editor"));
const MockInterview = lazy(() => import("./pages/MockInterview"));
const BugFixMode = lazy(() => import("./pages/BugFixMode"));
const ExplainCode = lazy(() => import("./pages/ExplainCode"));
const SystemDesign = lazy(() => import("./pages/SystemDesign"));

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/verify-otp";
  const isEditorPage = location.pathname.startsWith("/editor/");

  return (
    <div className="flex bg-[#090a0f] h-screen w-screen text-white overflow-hidden">
      {!isAuthPage && !isEditorPage && <Sidebar />}
      
      <div className="flex-1 flex flex-col h-screen relative overflow-hidden bg-[#090a0f]">
        <main className={`flex-1 ${!isAuthPage && !isEditorPage ? 'overflow-y-auto' : 'flex flex-col'}`}>
          <Suspense fallback={
            <div className="h-full flex flex-col items-center justify-center p-12 space-y-4 bg-[#090a0f]">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold text-white/40 uppercase tracking-wider">Loading Library...</p>
            </div>
          }>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/verify-otp" element={<VerifyOTP />} />
              
              {/* Authenticated Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
              <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
              <Route path="/editor/:id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
              <Route path="/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
              <Route path="/interview/:id" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
              <Route path="/debug" element={<ProtectedRoute><BugFixMode /></ProtectedRoute>} />
              <Route path="/debug/:id" element={<ProtectedRoute><BugFixMode /></ProtectedRoute>} />
              <Route path="/explain" element={<ProtectedRoute><ExplainCode /></ProtectedRoute>} />
              <Route path="/system-design" element={<ProtectedRoute><SystemDesign /></ProtectedRoute>} />
              <Route path="/submissions" element={<ProtectedRoute><Submissions /></ProtectedRoute>} />



              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/verified-status" element={<ProtectedRoute><VerifiedStatus /></ProtectedRoute>} />
              
              {/* Next Gen Beta Feature Routes */}
              <Route path="/sandbox-compiler" element={<ProtectedRoute><FeatureBeta /></ProtectedRoute>} />
              <Route path="/collaborative-mocks" element={<ProtectedRoute><FeatureBeta /></ProtectedRoute>} />
              <Route path="/gemini-live" element={<ProtectedRoute><FeatureBeta /></ProtectedRoute>} />
              <Route path="/security-audits" element={<ProtectedRoute><FeatureBeta /></ProtectedRoute>} />
              
              {/* Admin Only Routes */}
              <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/add" element={<ProtectedRoute adminOnly={true}><AddQuestion /></ProtectedRoute>} />
              <Route path="/admin/edit/:id" element={<ProtectedRoute adminOnly={true}><EditQuestion /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>} />
              <Route path="/admin/users/:id/stats" element={<ProtectedRoute adminOnly={true}><UserStats /></ProtectedRoute>} />
              <Route path="/admin/governance" element={<ProtectedRoute adminOnly={true}><GovernanceSettings /></ProtectedRoute>} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </div>
  );
}

function App() {

  return (

    <Router>
      <MaintenanceGuard>
        <Layout />
      </MaintenanceGuard>
    </Router>

  );

}

export default App;
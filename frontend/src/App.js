import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Questions from "./pages/Questions";
import Editor from "./pages/Editor";
import Submissions from "./pages/Submissions";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import AddQuestion from "./pages/AddQuestion";
import EditQuestion from "./pages/EditQuestion";
import MockInterview from "./pages/MockInterview";
import BugFixMode from "./pages/BugFixMode";
import ExplainCode from "./pages/ExplainCode";
import SystemDesign from "./pages/SystemDesign";
import ManageUsers from "./pages/ManageUsers";
import VerifyOTP from "./pages/VerifyOTP";
import GovernanceSettings from "./pages/GovernanceSettings";





import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === "/" || location.pathname === "/signup" || location.pathname === "/verify-otp";
  const isEditorPage = location.pathname.startsWith("/editor/");

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-900 overflow-hidden">
      {!isAuthPage && !isEditorPage && <Sidebar />}
      
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden bg-slate-50">
        <main className={`flex-1 ${!isAuthPage && !isEditorPage ? 'overflow-y-auto' : 'flex flex-col'}`}>
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
            
            {/* Admin Only Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/add" element={<ProtectedRoute adminOnly={true}><AddQuestion /></ProtectedRoute>} />
            <Route path="/admin/edit/:id" element={<ProtectedRoute adminOnly={true}><EditQuestion /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><ManageUsers /></ProtectedRoute>} />
            <Route path="/admin/governance" element={<ProtectedRoute adminOnly={true}><GovernanceSettings /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {

  return (

    <Router>
      <Layout />
    </Router>

  );

}

export default App;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { 
  Users, 
  Trash2, 
  Shield, 
  User, 
  ChevronLeft, 
  Loader2, 
  Search, 
  Mail, 
  Calendar 
} from "lucide-react";

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/users");
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (id, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user";
    if (!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    try {
      await API.put(`/users/${id}/role`, { role: newRole });
      setUsers(users.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Failed to update user role");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      await API.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
    } catch (error) {
      alert("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group cursor-pointer"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Back to Admin</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
              <Users className="text-indigo-400" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">User Management</h1>
              <p className="text-[11px] text-white/50 font-medium mt-0.5">Control platform access and role assignments.</p>
            </div>
          </div>
          
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" size={14} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.02] border border-white/10 text-white pl-10 pr-4 py-2 rounded-xl outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-64 transition-all text-xs placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl shadow-lg shadow-black/25 overflow-hidden">
          <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-white/[0.02] border-b border-white/5 text-[9px] font-bold text-white/35 uppercase tracking-wider">
            <div className="col-span-4">User Details</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Joined Date</div>
            <div className="col-span-1">Role</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          
          <div className="divide-y divide-white/5">
            {filteredUsers.length === 0 ? (
              <div className="py-16 text-center">
                <Users size={36} className="mx-auto text-white/10 mb-3" />
                <p className="text-white/30 font-bold uppercase tracking-wider text-[10px]">No users found</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user._id} className="grid grid-cols-1 md:grid-cols-12 px-6 py-4 items-center hover:bg-white/[0.02] transition-colors">
                  <div className="col-span-4 flex items-center gap-3 mb-3 md:mb-0">
                    <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                      <User size={16} className="text-white/30" />
                    </div>
                    <div className="font-bold text-white/90 text-xs">{user.name}</div>
                  </div>
                  
                  <div className="col-span-3 flex items-center gap-2 text-white/60 mb-3 md:mb-0">
                    <Mail size={13} className="text-white/30" />
                    <span className="font-semibold text-xs">{user.email}</span>
                  </div>

                  <div className="col-span-2 flex items-center gap-2 text-white/40 mb-3 md:mb-0">
                    <Calendar size={13} className="text-white/30" />
                    <span className="font-semibold text-xs font-mono">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="col-span-1 mb-3 md:mb-0">
                    <button 
                      onClick={() => handleRoleChange(user._id, user.role)}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        user.role === 'admin' 
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20' 
                          : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      <Shield size={10} />
                      {user.role}
                    </button>
                  </div>

                  <div className="col-span-2 flex justify-end items-center gap-2.5">
                    <button 
                      onClick={() => navigate(`/admin/users/${user._id}/stats`)}
                      className="flex items-center justify-center px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-indigo-600/10 shrink-0"
                    >
                      Stats
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-1.5 text-white/30 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all cursor-pointer shrink-0"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageUsers;

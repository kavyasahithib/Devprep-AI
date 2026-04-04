import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/users", {
          headers: { Authorization: "Bearer " + token }
        });
        setUsers(res.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, currentRole) => {
    const newRole = currentRole === "user" ? "admin" : "user";
    if (!window.confirm(`Are you sure you want to make this user an ${newRole}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/users/${userId}/role`, { role: newRole }, {
        headers: { Authorization: "Bearer " + token }
      });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      alert("Failed to update user role");
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/users/${userId}`, {
        headers: { Authorization: "Bearer " + token }
      });
      setUsers(users.filter(u => u._id !== userId));
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
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Back to Admin</span>
          </button>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                   <Users className="text-white" size={28} />
               </div>
               <div>
                   <h1 className="text-4xl font-bold text-slate-900 mb-1">User Management</h1>
                   <p className="text-slate-500 font-medium">Control platform access and role assignments.</p>
               </div>
            </div>
            
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-12 pr-6 outline-none focus:border-indigo-500 transition-all text-sm font-medium placeholder-slate-400 shadow-sm"
              />
            </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="hidden md:grid grid-cols-12 px-8 py-4 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-4">User Details</div>
                <div className="col-span-3">Contact</div>
                <div className="col-span-2">Joined Date</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-1 text-right">Actions</div>
            </div>
            
            <div className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                    <div className="py-16 text-center">
                        <Users size={48} className="mx-auto text-slate-200 mb-4" />
                        <p className="text-slate-500 font-bold uppercase tracking-wider text-xs">No users found</p>
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user._id} className="grid grid-cols-1 md:grid-cols-12 px-8 py-5 items-center hover:bg-slate-50 transition-colors">
                            <div className="col-span-4 flex items-center gap-4 mb-4 md:mb-0">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center border border-slate-200">
                                    <User size={20} className="text-slate-400" />
                                </div>
                                <div className="font-bold text-slate-900 text-sm">{user.name}</div>
                            </div>
                            
                            <div className="col-span-3 flex items-center gap-2 text-slate-500 mb-4 md:mb-0">
                                <Mail size={16} className="text-slate-400" />
                                <span className="font-medium text-xs">{user.email}</span>
                            </div>

                            <div className="col-span-2 flex items-center gap-2 text-slate-500 mb-4 md:mb-0">
                                <Calendar size={16} className="text-slate-400" />
                                <span className="font-medium text-xs text-slate-400 font-mono">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>

                            <div className="col-span-2 mb-4 md:mb-0">
                                <button 
                                    onClick={() => handleRoleChange(user._id, user.role)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        user.role === 'admin' 
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                                    }`}
                                >
                                    <Shield size={12} />
                                    {user.role}
                                </button>
                            </div>

                            <div className="col-span-1 flex justify-end">
                                <button 
                                    onClick={() => handleDelete(user._id)}
                                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                >
                                    <Trash2 size={18} />
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

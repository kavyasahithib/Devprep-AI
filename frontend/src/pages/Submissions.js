import { useEffect, useState } from "react";
import axios from "axios";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Code2, 
  Calendar,
  Search,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/submissions/my-submissions",
          {
            headers: {
              Authorization: "Bearer " + localStorage.getItem("token")
            }
          }
        );
        setSubmissions(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, []);

  const stats = {
    total: submissions.length,
    accepted: submissions.filter(s => s.status === "Accepted").length,
    languages: [...new Set(submissions.map(s => s.language))].length
  };

  const accuracy = stats.total > 0 ? Math.round((stats.accepted / stats.total) * 100) : 0;

  const filteredSubmissions = submissions.filter(s => 
    s.questionId?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Submission History</h1>
            <p className="text-slate-500 font-medium">Review your past performance and solved problems.</p>
          </div>
          
          <div className="flex items-center space-x-4">
             <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search submissions..."
                    className="bg-white border border-slate-200 text-slate-900 pl-12 pr-6 py-3 rounded-2xl outline-none focus:border-indigo-400 w-full md:w-80 transition-all font-medium text-sm shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Total Sessions", value: stats.total, icon: <Clock className="text-indigo-600" size={20} /> },
            { label: "Success Rate", value: `${accuracy}%`, icon: <CheckCircle2 className="text-emerald-500" size={20} /> },
            { label: "Solved Problems", value: stats.accepted, icon: <Target className="text-amber-500" size={20} /> },
            { label: "Languages", value: stats.languages, icon: <Code2 className="text-indigo-600" size={20} /> }
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm group"
            >
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-slate-50 rounded-2xl group-hover:scale-110 transition-transform">
                  {stat.icon}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{stat.value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-8 mb-2">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Problem Details</div>
             <div className="flex items-center space-x-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span className="hidden md:block">Language</span>
                <span className="hidden md:block">Status</span>
                <span>Actions</span>
             </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-24 bg-white border border-slate-200 rounded-[2.5rem]">
               <div className="p-6 bg-slate-50 rounded-full w-fit mx-auto mb-6">
                 <Code2 size={48} className="text-slate-200" />
               </div>
               <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => navigate(`/editor/${sub.questionId?._id}`)}
                  className="bg-white border border-slate-200 p-6 rounded-[2rem] hover:border-indigo-400 transition-all cursor-pointer group shadow-sm flex items-center justify-between"
                >
                  <div className="flex items-center space-x-6">
                    <div className={`p-4 rounded-2xl ${sub.status === "Accepted" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"}`}>
                      {sub.status === "Accepted" ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{sub.questionId?.title || "Unknown Problem"}</h3>
                      <div className="flex items-center space-x-3 text-slate-400 text-xs font-medium mt-1">
                         <Calendar size={12} />
                         <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-12">
                    <div className="hidden md:flex items-center space-x-3">
                       <div className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-600 border border-slate-100">
                          {sub.language}
                       </div>
                    </div>

                    <div className={`hidden md:block text-xs font-bold uppercase px-4 py-1.5 rounded-full ${sub.status === "Accepted" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                       {sub.status}
                    </div>

                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default Submissions;
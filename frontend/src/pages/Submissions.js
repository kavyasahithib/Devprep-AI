import { useEffect, useState } from "react";
import API from "../services/api";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  Code2, 
  Calendar,
  Search,
  Target,
  Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function Submissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const res = await API.get("/submissions");
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
      <div className="h-screen bg-[#090a0f] flex items-center justify-center text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Submission History</h1>
            <p className="text-[11px] text-white/50 font-medium mt-0.5">Review your past performance and solved problems.</p>
          </div>
          
          <div className="relative shrink-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" size={14} />
            <input 
              type="text"
              placeholder="Search submissions..."
              className="bg-white/[0.02] border border-white/10 text-white pl-10 pr-4 py-2 rounded-xl outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 w-full sm:w-64 transition-all text-xs placeholder:text-white/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Sessions", value: stats.total, icon: <Clock className="text-indigo-400" size={16} /> },
            { label: "Success Rate", value: `${accuracy}%`, icon: <CheckCircle2 className="text-emerald-400" size={16} /> },
            { label: "Solved Problems", value: stats.accepted, icon: <Target className="text-amber-400" size={16} /> },
            { label: "Languages", value: stats.languages, icon: <Code2 className="text-indigo-400" size={16} /> }
          ].map((stat, i) => (
            <div 
              key={i}
              className="bg-[#18181b]/50 border border-white/5 p-4 rounded-xl flex items-center space-x-3.5 shadow-lg shadow-black/25"
            >
              <div className="p-2 rounded-lg bg-white/5 border border-white/5 shrink-0">
                {stat.icon}
              </div>
              <div>
                <div className="text-base font-bold text-white leading-tight">{stat.value}</div>
                <div className="text-white/40 text-[9px] font-bold uppercase tracking-wider mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* List Section */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-6 text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1">
            <div>Problem Details</div>
            <div className="flex items-center space-x-8">
              <span className="hidden sm:block">Language</span>
              <span className="hidden sm:block">Status</span>
              <span>Actions</span>
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="text-center py-16 bg-[#18181b]/30 rounded-2xl border border-dashed border-white/10">
              <Code2 size={36} className="mx-auto text-white/10 mb-3" />
              <p className="text-white/30 font-bold uppercase tracking-wider text-[10px]">No records found</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredSubmissions.map((sub) => (
                <div
                  key={sub._id}
                  onClick={() => navigate(`/editor/${sub.questionId?._id}`)}
                  className="bg-[#18181b]/50 border border-white/5 p-4 rounded-xl hover:border-white/15 transition-all cursor-pointer group shadow-lg shadow-black/20 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg border shrink-0 ${
                      sub.status === "Accepted" 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/10" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/10"
                    }`}>
                      {sub.status === "Accepted" ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white/90 group-hover:text-indigo-400 transition-colors">
                        {sub.questionId?.title || "Unknown Problem"}
                      </h3>
                      <div className="flex items-center space-x-1.5 text-white/40 text-[9px] font-semibold mt-1">
                        <Calendar size={10} />
                        <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-8 shrink-0">
                    <div className="hidden sm:flex items-center">
                      <div className="px-2 py-0.5 bg-white/5 rounded text-[10px] font-bold text-white/60 border border-white/5">
                        {sub.language}
                      </div>
                    </div>

                    <div className={`hidden sm:block text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                      sub.status === "Accepted" 
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10" 
                        : "text-rose-400 bg-rose-500/10 border border-rose-500/10"
                    }`}>
                      {sub.status}
                    </div>

                    <div className="p-1.5 bg-white/5 text-white/30 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/5">
                      <ChevronRight size={14} />
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
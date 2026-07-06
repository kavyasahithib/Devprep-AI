import React, { useEffect, useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Search, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit3,
  ChevronRight,
  TrendingUp,
  Loader2
} from "lucide-react";

function Questions() {
  const [questions, setQuestions] = useState([]);
  const [solvedIds, setSolvedIds] = useState(new Set());
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedCompany, setSelectedCompany] = useState("All");
  const [loading, setLoading] = useState(true);

  const uniqueCompanies = Array.from(new Set(
    questions.flatMap(q => q.companies || []).map(c => c.trim())
  )).sort();
  const companies = ["All", ...uniqueCompanies];
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          API.get("/questions"),
          API.get("/submissions/solved").catch(() => ({ data: [] }))
        ]);

        setQuestions(qRes.data);
        setSolvedIds(new Set(sRes.data));

        const user = JSON.parse(localStorage.getItem("user") || "{}");
        setIsAdmin(user?.role === "admin");
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const deleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await API.delete(`/questions/${id}`);
      setQuestions(questions.filter(q => q._id !== id));
    } catch (error) {
      console.error(error);
      alert("Delete failed");
    }
  };

  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "All" || q.difficulty === filter;
    const matchesCompany = selectedCompany === "All" || (q.companies && q.companies.some(c => c.toLowerCase() === selectedCompany.toLowerCase()));
    return matchesSearch && matchesFilter && matchesCompany;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-[#090a0f] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Ambient backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 relative z-10">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Coding Lessons</h1>
          <p className="text-[11px] text-white/50 font-medium">Practice and learn with real-world coding challenges.</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => navigate("/admin/add")}
            className="bg-white hover:bg-slate-100 text-black px-4 py-2 rounded-lg font-bold transition-all text-xs shrink-0 cursor-pointer shadow-lg shadow-black/25"
          >
            + Add Lesson
          </button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-[#18181b]/50 p-4 rounded-2xl border border-white/5 shadow-lg shadow-black/25 relative z-10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35" size={16} />
          <input 
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all text-xs placeholder:text-white/20"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-1.5 md:pb-0 shrink-0">
          {["All", "Easy", "Medium", "Hard"].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                filter === level 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-white/5 text-white/60 border border-white/5 hover:bg-white/10"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Company Badges */}
      {companies.length > 1 && (
        <div className="flex gap-2 pb-1 overflow-x-auto custom-scrollbar relative z-10">
          {companies.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCompany(c)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                selectedCompany === c 
                  ? "bg-white text-black shadow-md" 
                  : "bg-white/5 text-white/50 border border-white/5 hover:border-white/10"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-2.5 relative z-10">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-6 text-[9px] font-bold text-white/30 uppercase tracking-wider mb-1">
          <div className="col-span-1">Status</div>
          <div className="col-span-7">Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2 text-right">Action</div>
        </div>

        {filteredQuestions.map((q) => (
          <div
            key={q._id}
            className="group grid grid-cols-1 md:grid-cols-12 items-center px-6 py-4 bg-[#18181b]/50 border border-white/5 rounded-xl hover:border-white/15 transition-all cursor-pointer shadow-lg shadow-black/20"
            onClick={() => navigate(`/editor/${q._id}`)}
          >
            <div className="col-span-1 mb-2 md:mb-0 shrink-0">
              {solvedIds.has(q._id) ? (
                <CheckCircle2 size={18} className="text-emerald-400" />
              ) : (
                <Circle size={18} className="text-white/20" />
              )}
            </div>
            <div className="col-span-7 mb-2 md:mb-0">
              <h3 className="text-white/90 font-bold group-hover:text-indigo-400 transition-colors text-sm">
                {q.title}
              </h3>
              {q.companies && q.companies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {q.companies.map((c, idx) => (
                    <span key={idx} className="text-[8px] font-bold uppercase bg-white/5 text-white/40 px-1.5 py-0.5 rounded border border-white/5">
                      {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="col-span-2 mb-2 md:mb-0">
              <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded ${
                q.difficulty === "Easy" ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/10" :
                q.difficulty === "Medium" ? "text-amber-400 bg-amber-500/10 border border-amber-500/10" :
                "text-rose-400 bg-rose-500/10 border border-rose-500/10"
              }`}>
                {q.difficulty}
              </span>
            </div>
            <div className="col-span-2 flex justify-end space-x-2">
              {isAdmin && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit/${q._id}`); }}
                    className="p-1.5 bg-white/5 text-white/70 rounded-lg hover:bg-white/10 border border-white/5 cursor-pointer"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteQuestion(q._id); }}
                    className="p-1.5 bg-white/5 text-rose-400 rounded-lg hover:bg-white/10 border border-white/5 cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
              <div className="p-1.5 bg-white/5 text-white/30 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all border border-white/5">
                <ChevronRight size={14} />
              </div>
            </div>
          </div>
        ))}
        
        {filteredQuestions.length === 0 && (
          <div className="text-center py-16 bg-[#18181b]/30 rounded-2xl border border-dashed border-white/10">
            <TrendingUp size={36} className="mx-auto text-white/10 mb-3" />
            <p className="text-white/30 font-bold uppercase tracking-wider text-[10px]">No lessons found. Try searching for something else!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Questions;
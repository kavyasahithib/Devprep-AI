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

  const companies = ["All", "Google", "Amazon", "Meta", "Microsoft", "Netflix"];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [qRes, sRes] = await Promise.all([
          API.get("/questions"),
          API.get("/submissions").catch(() => ({ data: [] }))
        ]);

        setQuestions(qRes.data);
        setSolvedIds(new Set(sRes.data.map(s => s.questionId)));

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
      <div className="flex items-center justify-center h-full bg-slate-50">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 bg-slate-50 min-h-screen text-slate-900 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-1">Coding Lessons</h1>
          <p className="text-slate-500 font-medium">Practice and learn with real-world coding challenges.</p>
        </div>
        {isAdmin && (
            <button 
                onClick={() => navigate("/admin/add")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md uppercase text-xs tracking-wider"
            >+ Add Lesson</button>
        )}
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-6 outline-none focus:border-indigo-500 transition-all text-sm font-medium placeholder-slate-400"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {["All", "Easy", "Medium", "Hard"].map(level => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-6 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filter === level 
                  ? "bg-indigo-600 text-white shadow-md" 
                  : "bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar">
        {companies.map(c => (
            <button
                key={c}
                onClick={() => setSelectedCompany(c)}
                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    selectedCompany === c 
                        ? "bg-slate-900 text-white shadow-md" 
                        : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-300"
                }`}
            >
                {c}
            </button>
        ))}
      </div>

      {/* Questions list */}
      <div className="space-y-3">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <div className="col-span-2">Status</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-2 text-right">Action</div>
        </div>

        {filteredQuestions.map((q, i) => (
            <div
              key={q._id}
              className="group grid grid-cols-1 md:grid-cols-12 items-center px-8 py-5 bg-white border border-slate-200 rounded-2xl hover:border-indigo-400 transition-all cursor-pointer shadow-sm"
              onClick={() => navigate(`/editor/${q._id}`)}
            >
              <div className="col-span-2 mb-2 md:mb-0">
                {solvedIds.has(q._id) ? (
                  <CheckCircle2 size={20} className="text-emerald-500" />
                ) : (
                  <Circle size={20} className="text-slate-200" />
                )}
              </div>
              <div className="col-span-6 mb-2 md:mb-0">
                <h3 className="text-slate-900 font-bold group-hover:text-indigo-600 transition-colors text-base">
                  {q.title}
                </h3>
              </div>
              <div className="col-span-2 mb-2 md:mb-0">
                <span className={`text-[10px] font-bold uppercase px-3 py-1 rounded-lg ${
                  q.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                  q.difficulty === "Medium" ? "bg-amber-50 text-amber-600" :
                  "bg-rose-50 text-rose-600"
                }`}>
                  {q.difficulty}
                </span>
              </div>
              <div className="col-span-2 flex justify-end space-x-2">
                {isAdmin && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/admin/edit/${q._id}`); }}
                      className="p-2 bg-slate-50 text-slate-500 rounded-lg hover:bg-slate-100 border border-slate-200"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteQuestion(q._id); }}
                      className="p-2 bg-slate-50 text-rose-500 rounded-lg hover:bg-rose-50 border border-slate-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
                <div className="p-2 bg-slate-50 text-slate-400 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all border border-slate-200">
                  <ChevronRight size={16} />
                </div>
              </div>
            </div>
        ))}
        
        {filteredQuestions.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <TrendingUp size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase tracking-wider text-xs">No lessons found. Try searching for something else!</p>
          </div>
        )}
      </div>
    </div>
  );
}


export default Questions;
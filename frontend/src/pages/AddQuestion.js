import React, { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Trash2, 
  Save, 
  ArrowLeft, 
  Code2, 
  Database, 
  AlertCircle,
  Hash,
  FileText,
  Loader2
} from "lucide-react";

function AddQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    functionName: "solution",
    companies: "",
    testCases: [{ input: "", output: "" }]
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const updateTestCase = (index, field, value) => {
    const newTestCases = [...formData.testCases];
    newTestCases[index][field] = value;
    setFormData({ ...formData, testCases: newTestCases });
  };

  const addTestCase = () => {
    setFormData({
      ...formData,
      testCases: [...formData.testCases, { input: "", output: "" }]
    });
  };

  const removeTestCase = (index) => {
    if (formData.testCases.length === 1) return;
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        companies: formData.companies.split(',').map(c => c.trim()).filter(c => c)
      };
      await API.post("/questions", payload);
      navigate("/questions");
    } catch (error) {
      console.error(error);
      alert("Failed to add question. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090a0f] text-white p-6 font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/questions")}
            className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors group cursor-pointer"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="font-bold text-[10px] uppercase tracking-wider">Back to Problems</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center shadow-lg">
              <Plus className="text-indigo-400" size={18} />
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">Add New Problem</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/25 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Problem Title</label>
                <div className="relative group">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Two Sum"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Function Name</label>
                <div className="relative group">
                  <Code2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                  <input
                    required
                    name="functionName"
                    value={formData.functionName}
                    onChange={handleChange}
                    placeholder="e.g. solve"
                    className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Companies (Comma Separated)</label>
              <div className="relative group">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                <input
                  name="companies"
                  value={formData.companies}
                  onChange={handleChange}
                  placeholder="e.g. Google, Netflix, Amazon"
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-semibold text-xs"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Problem Description</label>
              <div className="relative group">
                <FileText className="absolute left-3.5 top-3 text-white/35 group-focus-within:text-indigo-400 transition-colors" size={14} />
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the problem, constraints, and examples..."
                  className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed text-xs resize-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Difficulty Level</label>
              <div className="flex gap-3">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`flex-1 py-2 rounded-xl font-bold border transition-all text-[10px] tracking-wide cursor-pointer uppercase ${
                      formData.difficulty === level 
                        ? (level === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-md' :
                           level === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-md' :
                           'bg-rose-500/10 border-rose-500/20 text-rose-400 shadow-md')
                        : 'bg-white/5 border-white/5 text-white/40 hover:border-white/10'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Database className="text-indigo-400" size={16} />
                <h2 className="text-sm font-bold text-white">Test Cases</h2>
              </div>
              <span className="text-[10px] font-bold text-white/40 bg-white/5 border border-white/5 px-2.5 py-0.5 rounded-full shrink-0">
                {formData.testCases.length} Test Cases
              </span>
            </div>

            <div className="space-y-3.5">
              {formData.testCases.map((tc, index) => (
                <div 
                  key={index}
                  className="bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 shadow-lg shadow-black/25 flex flex-col space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">Case #{index + 1}</span>
                    <button 
                      type="button"
                      onClick={() => removeTestCase(index)}
                      className="text-white/30 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Input</div>
                      <textarea
                        value={tc.input}
                        onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                        placeholder="e.g. [2, 7, 11, 15], 9"
                        rows={2}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono text-xs resize-none leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[9px] font-bold text-white/40 uppercase tracking-widest ml-1">Expected Output</div>
                      <textarea
                        value={tc.output}
                        onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                        placeholder="e.g. [0, 1]"
                        rows={2}
                        className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 px-3 text-white placeholder-white/20 outline-none focus:border-indigo-500/80 focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/20 transition-all font-mono text-xs resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={addTestCase}
                className="w-full py-3.5 border border-dashed border-white/10 rounded-2xl text-white/40 font-bold uppercase tracking-wider text-[10px] hover:border-indigo-500/50 hover:text-indigo-400 transition-all bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus size={14} />
                <span>Add Test Case</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-11 rounded-xl transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="animate-spin text-black" size={18} />
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Problem</span>
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-8 p-5 bg-[#18181b]/50 border border-white/5 rounded-2xl flex items-start gap-3.5 shadow-lg shadow-black/25">
          <AlertCircle className="text-indigo-400 mt-0.5 shrink-0" size={18} />
          <div className="text-xs">
            <h4 className="font-bold text-white text-[10px] uppercase tracking-wider mb-1">Architectural Note</h4>
            <p className="text-white/45 font-semibold leading-relaxed">Ensure the function name matches exactly what the user should implement. Standard input/output parsing handles common data structures automatically.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddQuestion;
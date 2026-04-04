import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Trash2, 
  Save, 
  ArrowLeft, 
  Code2, 
  Database, 
  AlertCircle,
  Hash,
  FileText,
  Loader2,
  CheckCircle2,
  Plus
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

function EditQuestion() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    functionName: "solution",
    testCases: []
  });

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/questions");
        const q = res.data.find(item => item._id === id);
        if (q) {
          setFormData({
            title: q.title || "",
            description: q.description || "",
            difficulty: q.difficulty || "Easy",
            functionName: q.functionName || "solution",
            testCases: q.testCases || []
          });
        }
      } catch (error) {
        console.error("Error fetching question:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestion();
  }, [id]);

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
    const newTestCases = formData.testCases.filter((_, i) => i !== index);
    setFormData({ ...formData, testCases: newTestCases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(
        `http://localhost:5000/api/questions/${id}`,
        formData,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error(error);
      alert("Failed to update question.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="text-indigo-600 animate-spin" size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/questions")}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Back to Problems</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <FileText className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Problem</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Info Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Problem Title</label>
                <div className="relative">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-semibold text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Function Name</label>
                <div className="relative">
                  <Code2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    required
                    name="functionName"
                    value={formData.functionName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-mono text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Problem Description</label>
              <div className="relative">
                <FileText className="absolute left-4 top-4 text-slate-400" size={18} />
                <textarea
                  required
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-12 pr-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-medium leading-relaxed text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Difficulty Level</label>
              <div className="flex gap-4">
                {["Easy", "Medium", "Hard"].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({ ...formData, difficulty: level })}
                    className={`flex-1 py-3 px-6 rounded-xl font-bold border transition-all text-xs ${
                      formData.difficulty === level 
                        ? (level === 'Easy' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' :
                           level === 'Medium' ? 'bg-amber-50 border-amber-500 text-amber-700 shadow-sm' :
                           'bg-rose-50 border-rose-500 text-rose-700 shadow-sm')
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {level.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Test Cases Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <Database className="text-indigo-600" size={20} />
                <h2 className="text-lg font-bold text-slate-900">Test Cases</h2>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                {formData.testCases.length} Test Cases
              </span>
            </div>

            <div className="space-y-4">
                {formData.testCases.map((tc, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Case #{index + 1}</span>
                      <button 
                        type="button"
                        onClick={() => removeTestCase(index)}
                        className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Input</div>
                         <textarea
                            value={tc.input}
                            onChange={(e) => updateTestCase(index, 'input', e.target.value)}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-mono text-xs"
                         />
                      </div>
                      <div className="space-y-2">
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Expected Output</div>
                         <textarea
                            value={tc.output}
                            onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-mono text-xs"
                         />
                      </div>
                    </div>
                  </div>
                ))}

              <button
                type="button"
                onClick={addTestCase}
                className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:border-indigo-300 hover:text-indigo-600 transition-all bg-white flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add Test Case
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              disabled={saving}
              type="submit"
              className={`flex-1 font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3 ${
                success 
                ? "bg-emerald-600 text-white shadow-emerald-200" 
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {saving ? (
                <Loader2 className="animate-spin" size={20} />
              ) : success ? (
                <>
                  <CheckCircle2 size={24} />
                  Changes Saved
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Problem
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-200 flex items-start gap-4 shadow-sm">
            <AlertCircle className="text-indigo-600 mt-0.5" size={20} />
            <div className="text-sm">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Architectural Note</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-xs">Standardized updates will affect all future submissions. Ensure test coverage remains consistent with the original problem constraints.</p>
            </div>
        </div>
      </div>
    </div>
  );
}


export default EditQuestion;
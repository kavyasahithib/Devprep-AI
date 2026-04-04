import React, { useState } from "react";
import axios from "axios";
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
import { AnimatePresence } from "framer-motion";

function AddQuestion() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    functionName: "solution",
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
      await axios.post(
        "http://localhost:5000/api/questions/add",
        formData,
        {
          headers: { Authorization: "Bearer " + localStorage.getItem("token") }
        }
      );
      navigate("/questions");
    } catch (error) {
      console.error(error);
      alert("Failed to add question. Please check all fields.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => navigate("/questions")}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-xs uppercase tracking-wider">Back to Problems</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                <Plus className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Add New Problem</h1>
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
                    placeholder="e.g. Two Sum"
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
                    placeholder="e.g. solve"
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
                  rows={5}
                  placeholder="Describe the problem, constraints, and examples..."
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
                            placeholder="e.g. [2, 7, 11, 15], 9"
                            rows={2}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-500 transition-all font-mono text-xs"
                         />
                      </div>
                      <div className="space-y-2">
                         <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Expected Output</div>
                         <textarea
                            value={tc.output}
                            onChange={(e) => updateTestCase(index, 'output', e.target.value)}
                            placeholder="e.g. [0, 1]"
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
              disabled={loading}
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all shadow-md flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Save size={20} />
                  Save Problem
                </>
              )}
            </button>
          </div>
        </form>
        
        <div className="mt-12 p-6 bg-white rounded-3xl border border-slate-200 flex items-start gap-4 shadow-sm">
            <AlertCircle className="text-indigo-600 mt-0.5" size={20} />
            <div className="text-sm">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-1">Architectural Note</h4>
                <p className="text-slate-500 font-medium leading-relaxed text-xs">Ensure the function name matches exactly what the user should implement. Standard input/output parsing handles common data structures automatically.</p>
            </div>
        </div>
      </div>
    </div>
  );
}


export default AddQuestion;
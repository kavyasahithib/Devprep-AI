import React, { useEffect, useState } from "react";
import API from "../services/api";
import { 
  User, 
  Mail, 
  GitBranch as Github, 
  BrainCircuit, 
  BarChart3, 
  CheckCircle2,
  Loader2,
  Calendar,
  Shield,
  MapPin,
  FileText,
  Edit2,
  GraduationCap,
  Briefcase,
  Layers,
  Award,
  Globe,
  Plus,
  Trash2
} from "lucide-react";
import SkillsRadar from "../components/SkillsRadar";
import ActivityHeatmap from "../components/ActivityHeatmap";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("basic");

  // Profile Picture State
  const [profilePic, setProfilePic] = useState("");

  // Basic Profile Fields (Initialize empty or from cache)
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [college, setCollege] = useState("");
  const [summary, setSummary] = useState("");
  const [permAddress, setPermAddress] = useState("");
  const [currAddress, setCurrAddress] = useState("");

  // Dynamic Array Fields (CV details added by user)
  const [educationList, setEducationList] = useState([]);
  const [experienceList, setExperienceList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [accomplishmentsList, setAccomplishmentsList] = useState([]);

  // Edit toggles for Basic Details
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);

  // Add form toggles
  const [isAddingEdu, setIsAddingEdu] = useState(false);
  const [isAddingExp, setIsAddingExp] = useState(false);
  const [isAddingProj, setIsAddingProj] = useState(false);
  const [isAddingAcc, setIsAddingAcc] = useState(false);

  // Form State buffers
  const [tempDob, setTempDob] = useState(dob);
  const [tempGender, setTempGender] = useState(gender);
  const [tempCollege, setTempCollege] = useState(college);
  const [tempSummary, setTempSummary] = useState(summary);
  const [tempPermAddress, setTempPermAddress] = useState(permAddress);
  const [tempCurrAddress, setTempCurrAddress] = useState(currAddress);

  // Add buffers
  const [eduForm, setEduForm] = useState({ degree: "", school: "", year: "", metric: "" });
  const [expForm, setExpForm] = useState({ role: "", company: "", duration: "", desc: "" });
  const [projForm, setProjForm] = useState({ title: "", tech: "", desc: "" });
  const [accForm, setAccForm] = useState({ name: "", issuer: "", date: "" });

  const updateUserProfileBackend = async (fields) => {
    try {
      const res = await API.put("/users/profile", fields);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to update profile on backend:", err);
      alert("Failed to save changes to server.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result;
        setProfilePic(base64Data);
        await updateUserProfileBackend({ avatar: base64Data });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [profRes, activityRes] = await Promise.all([
          API.get("/users/profile"),
          API.get("/submissions/activity")
        ]);
        const data = profRes.data;
        setProfile(data);
        setActivity(activityRes.data);
        if (data) {
          setDob(data.dob || "");
          setGender(data.gender || "");
          setCollege(data.college || "");
          setSummary(data.summary || "");
          setPermAddress(data.permAddress || "");
          setCurrAddress(data.currAddress || "");
          setEducationList(data.educationList || []);
          setExperienceList(data.experienceList || []);
          setProjectsList(data.projectsList || []);
          setAccomplishmentsList(data.accomplishmentsList || []);
          setProfilePic(data.avatar || "");
          
          setTempDob(data.dob || "");
          setTempGender(data.gender || "");
          setTempCollege(data.college || "");
          setTempSummary(data.summary || "");
          setTempPermAddress(data.permAddress || "");
          setTempCurrAddress(data.currAddress || "");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const runAiAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await API.get("/submissions/analyze");
      setAiAnalysis(res.data);
    } catch (error) {
      console.error("Error running AI analysis:", error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGithubSync = async () => {
    if (!profile.githubToken) {
      alert("Please connect GitHub first.");
      return;
    }
    setSyncing(true);
    try {
      const subRes = await API.get("/submissions/my-submissions");
      const latestAccepted = subRes.data.find(s => s.status === "Accepted");
      if (!latestAccepted) {
        alert("No accepted solutions found to sync!");
        return;
      }
      
      const res = await API.post(`/submissions/sync/${latestAccepted._id}`);
      alert(res.data.message);
    } catch (error) {
      alert(error.response?.data?.message || "Sync failed");
    } finally {
      setSyncing(false);
    }
  };

  // Save actions for Basic details
  const saveAbout = async () => {
    setDob(tempDob);
    setGender(tempGender);
    setCollege(tempCollege);
    setIsEditingAbout(false);
    await updateUserProfileBackend({ dob: tempDob, gender: tempGender, college: tempCollege });
  };

  const saveSummary = async () => {
    setSummary(tempSummary);
    setIsEditingSummary(false);
    await updateUserProfileBackend({ summary: tempSummary });
  };

  const saveAddress = async () => {
    setPermAddress(tempPermAddress);
    setCurrAddress(tempCurrAddress);
    setIsEditingAddress(false);
    await updateUserProfileBackend({ permAddress: tempPermAddress, currAddress: tempCurrAddress });
  };

  // Add actions for CV arrays
  const handleAddEdu = async () => {
    const list = [...educationList, eduForm];
    setEducationList(list);
    setEduForm({ degree: "", school: "", year: "", metric: "" });
    setIsAddingEdu(false);
    await updateUserProfileBackend({ educationList: list });
  };

  const handleAddExp = async () => {
    const list = [...experienceList, expForm];
    setExperienceList(list);
    setExpForm({ role: "", company: "", duration: "", desc: "" });
    setIsAddingExp(false);
    await updateUserProfileBackend({ experienceList: list });
  };

  const handleAddProj = async () => {
    const list = [...projectsList, projForm];
    setProjectsList(list);
    setProjForm({ title: "", tech: "", desc: "" });
    setIsAddingProj(false);
    await updateUserProfileBackend({ projectsList: list });
  };

  const handleAddAcc = async () => {
    const list = [...accomplishmentsList, accForm];
    setAccomplishmentsList(list);
    setAccForm({ name: "", issuer: "", date: "" });
    setIsAddingAcc(false);
    await updateUserProfileBackend({ accomplishmentsList: list });
  };

  // Delete actions
  const handleDeleteEdu = async (idx) => {
    const list = educationList.filter((_, i) => i !== idx);
    setEducationList(list);
    await updateUserProfileBackend({ educationList: list });
  };

  const handleDeleteExp = async (idx) => {
    const list = experienceList.filter((_, i) => i !== idx);
    setExperienceList(list);
    await updateUserProfileBackend({ experienceList: list });
  };

  const handleDeleteProj = async (idx) => {
    const list = projectsList.filter((_, i) => i !== idx);
    setProjectsList(list);
    await updateUserProfileBackend({ projectsList: list });
  };

  const handleDeleteAcc = async (idx) => {
    const list = accomplishmentsList.filter((_, i) => i !== idx);
    setAccomplishmentsList(list);
    await updateUserProfileBackend({ accomplishmentsList: list });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full bg-[#090a0f] text-white">
        <div className="text-center">
          <p className="text-white text-base font-bold">Failed to load profile</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "basic", label: "Basic Details", icon: <User size={13} /> },
    { id: "education", label: "Education Details", icon: <GraduationCap size={13} /> },
    { id: "experience", label: "Internship & Work Ex", icon: <Briefcase size={13} /> },
    { id: "skills", label: "Skills & Activity", icon: <Layers size={13} /> },
    { id: "projects", label: "Projects", icon: <Globe size={13} /> },
    { id: "accomplishments", label: "Accomplishments", icon: <Award size={13} /> },
    { id: "resume", label: "Resume & Documents", icon: <FileText size={13} /> }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 bg-[#090a0f] min-h-screen text-white font-sans relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Actions Card */}
      <div className="bg-[#18181b]/50 border border-white/5 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-black/20 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <BrainCircuit className="text-indigo-400" size={20} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">Profile Analytics Sync</h2>
            <p className="text-[10px] text-white/40 mt-1">Connect third-party accounts and execute performance reports.</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button 
            onClick={runAiAnalysis}
            disabled={analyzing}
            className="bg-white hover:bg-slate-100 disabled:opacity-50 text-black font-semibold h-9 px-4 rounded-lg transition-all flex items-center space-x-1.5 text-xs shadow-md cursor-pointer"
          >
            {analyzing ? <Loader2 className="animate-spin text-black" size={12} /> : <BrainCircuit size={12} />}
            <span>AI Review</span>
          </button>
          <button 
            onClick={() => {
              if (profile.githubToken) {
                handleGithubSync();
              } else {
                window.location.href = "http://localhost:5000/api/users/github/auth";
              }
            }}
            disabled={syncing}
            className={`font-semibold h-9 px-4 rounded-lg transition-all flex items-center space-x-1.5 border text-xs cursor-pointer ${
              profile.githubToken ? "bg-white/5 hover:bg-white/10 text-white border-white-15" : "bg-indigo-600 border-indigo-500/20 text-white hover:bg-indigo-700"
            }`}
          >
            {syncing ? <Loader2 className="animate-spin" size={12} /> : <Github size={12} />}
            <span>{profile.githubToken ? "Sync Solutions" : "Connect GitHub"}</span>
          </button>
        </div>
      </div>

      {/* Main Split Profile Layout */}
      <div className="flex flex-col md:flex-row gap-6 items-start relative z-10">
        
        {/* Left Side Navigation Menu */}
        <div className="w-full md:w-[280px] bg-[#18181b]/50 border border-white/5 rounded-2xl p-5 flex flex-col items-center shrink-0 shadow-lg shadow-black/25">
          <div className="relative group mb-4 cursor-pointer">
            <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full overflow-hidden flex items-center justify-center border-2 border-white/10 shrink-0 shadow-lg text-white text-2xl font-extrabold select-none relative">
              {profilePic ? (
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                profile.name ? profile.name.charAt(0).toUpperCase() : "S"
              )}
              {/* Hover overlay to change photo */}
              <label 
                htmlFor="profile-pic-upload" 
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider text-indigo-400 cursor-pointer transition-opacity duration-200"
              >
                Change
              </label>
            </div>
            <input 
              id="profile-pic-upload" 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              className="hidden" 
            />
          </div>

          <div className="text-center w-full pb-5 border-b border-white/5 mb-4">
            <h1 className="text-sm font-bold text-white tracking-tight leading-tight uppercase">{profile.name}</h1>
            <p className="text-[10px] text-white/35 font-mono mt-1">DevPrep ID: {profile.enrollmentId || "20260001"}</p>
          </div>

          <nav className="w-full space-y-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === t.id 
                    ? "bg-white/5 text-indigo-400 border-l-2 border-indigo-500 rounded-l-none" 
                    : "text-white/50 hover:text-white/80 hover:bg-white/[0.02]"
                }`}
              >
                {t.icon}
                <span>{t.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Side details panel */}
        <div className="flex-1 bg-[#18181b]/50 border border-white/5 rounded-2xl p-6 shadow-lg shadow-black/25 w-full min-h-[460px]">
          
          {/* TAB 1: BASIC DETAILS */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              
              {/* About Box */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <User size={13} className="text-indigo-400" />
                    <span>About</span>
                  </h3>
                  {!isEditingAbout ? (
                    <button 
                      onClick={() => {
                        setTempDob(dob);
                        setTempGender(gender);
                        setTempCollege(college);
                        setIsEditingAbout(true);
                      }}
                      className="text-white/40 hover:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 size={10} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <button 
                        onClick={saveAbout}
                        className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingAbout(false)}
                        className="text-white/30 hover:text-white/50 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingAbout ? (
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-3">
                      <span className="text-white/40 font-medium">Full Name:</span>
                      <span className="col-span-2 text-white/80 font-bold uppercase">{profile.name}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-white/40 font-medium">Date of Birth:</span>
                      <span className="col-span-2 text-white/85 font-bold">{dob || "Not specified (Click Edit to add)"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-white/40 font-medium">Gender:</span>
                      <span className="col-span-2 text-white/85 font-bold">{gender || "Not specified (Click Edit to add)"}</span>
                    </div>
                    <div className="grid grid-cols-3">
                      <span className="text-white/40 font-medium">Current/Latest College:</span>
                      <span className="col-span-2 text-white/85 font-bold">{college || "Not specified (Click Edit to add)"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3.5 text-xs">
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-white/40 font-medium">Date of Birth:</span>
                      <input 
                        type="text" 
                        value={tempDob}
                        onChange={(e) => setTempDob(e.target.value)}
                        placeholder="e.g. 22 December, 2004"
                        className="col-span-2 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-white/40 font-medium">Gender:</span>
                      <select 
                        value={tempGender}
                        onChange={(e) => setTempGender(e.target.value)}
                        className="col-span-2 bg-[#18181b] border border-white/10 rounded px-2 py-1 text-white text-xs outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                      <span className="text-white/40 font-medium">Current/Latest College:</span>
                      <input 
                        type="text" 
                        value={tempCollege}
                        onChange={(e) => setTempCollege(e.target.value)}
                        placeholder="e.g. Saveetha School of Engineering"
                        className="col-span-2 bg-white/5 border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Box */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <FileText size={13} className="text-indigo-400" />
                    <span>Summary</span>
                  </h3>
                  {summary && !isEditingSummary && (
                    <button 
                      onClick={() => {
                        setTempSummary(summary);
                        setIsEditingSummary(true);
                      }}
                      className="text-white/40 hover:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 size={10} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {!isEditingSummary ? (
                  summary ? (
                    <p className="text-white/75 text-xs leading-relaxed font-semibold">{summary}</p>
                  ) : (
                    <div className="py-4 text-center">
                      <p className="text-white/30 text-xs font-bold mb-3">You have not added a profile summary yet.</p>
                      <button 
                        onClick={() => {
                          setTempSummary("");
                          setIsEditingSummary(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-4 rounded-lg text-[10px] uppercase tracking-wider transition-all flex items-center gap-1 mx-auto cursor-pointer"
                      >
                        <Plus size={12} />
                        <span>Add Summary</span>
                      </button>
                    </div>
                  )
                ) : (
                  <div className="space-y-3">
                    <textarea 
                      value={tempSummary}
                      onChange={(e) => setTempSummary(e.target.value)}
                      placeholder="Write a brief professional summary about yourself..."
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-indigo-500 font-medium resize-none leading-relaxed"
                    />
                    <div className="flex justify-end gap-2 text-[10px] font-bold uppercase">
                      <button 
                        onClick={saveSummary}
                        className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingSummary(false)}
                        className="text-white/30 hover:text-white/50 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Address Box */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5 relative">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <MapPin size={13} className="text-indigo-400" />
                    <span>Address Details</span>
                  </h3>
                  {!isEditingAddress ? (
                    <button 
                      onClick={() => {
                        setTempPermAddress(permAddress);
                        setTempCurrAddress(currAddress);
                        setIsEditingAddress(true);
                      }}
                      className="text-white/40 hover:text-indigo-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Edit2 size={10} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={saveAddress}
                        className="text-emerald-400 hover:text-emerald-300 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setIsEditingAddress(false)}
                        className="text-white/30 hover:text-white/50 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {!isEditingAddress ? (
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1">
                      <span className="text-white/40 font-medium">Permanent Address:</span>
                      <span className="text-white/80 font-bold leading-relaxed">{permAddress || "Not specified (Click Edit to add)"}</span>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 border-t border-white/5">
                      <span className="text-white/40 font-medium">Current Address:</span>
                      <span className="text-white/80 font-bold leading-relaxed">{currAddress || "Not specified (Click Edit to add)"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-white/40 font-medium">Permanent Address:</span>
                      <input 
                        type="text"
                        value={tempPermAddress}
                        onChange={(e) => setTempPermAddress(e.target.value)}
                        placeholder="e.g. 6-404 Opposite Water Tank Road, Guntur"
                        className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-white/40 font-medium">Current Address:</span>
                      <input 
                        type="text"
                        value={tempCurrAddress}
                        onChange={(e) => setTempCurrAddress(e.target.value)}
                        placeholder="e.g. 6-404 Opposite Water Tank Road, Guntur"
                        className="bg-white/5 border border-white/10 rounded px-2.5 py-1 text-white text-xs outline-none focus:border-indigo-500 font-semibold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Placement Enrollments Box */}
              <div className="bg-white/[0.01] border border-white/5 rounded-xl p-5">
                <div className="flex items-center gap-1.5 mb-4 pb-2 border-b border-white/5">
                  <Shield size={13} className="text-indigo-400" />
                  <h3 className="text-xs font-bold text-white">Placement Enrollments</h3>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3">
                    <span className="text-white/40 font-medium">Placement Status:</span>
                    <span className="col-span-2 text-emerald-400 font-extrabold flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      Active & Enrolled
                    </span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-white/40 font-medium">Active Cycle:</span>
                    <span className="col-span-2 text-white/80 font-bold">2026 Batch Placement Pool</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: EDUCATION DETAILS */}
          {activeTab === "education" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <GraduationCap className="text-indigo-400" size={16} />
                  <h2 className="text-sm font-bold text-white">Education Details</h2>
                </div>
                {!isAddingEdu && (
                  <button 
                    onClick={() => setIsAddingEdu(true)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold h-7 px-3.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-white/10 shadow-sm"
                  >
                    <Plus size={12} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingEdu && (
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3.5 text-xs">
                  <div className="font-bold text-indigo-400">Add Academic Record</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Degree / Qualification</label>
                      <input 
                        type="text" 
                        placeholder="e.g. B.E. Computer Science" 
                        value={eduForm.degree}
                        onChange={(e) => setEduForm({...eduForm, degree: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">School / College / Institute</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Saveetha School of Engineering" 
                        value={eduForm.school}
                        onChange={(e) => setEduForm({...eduForm, school: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Duration (Years)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 2022 - 2026" 
                        value={eduForm.year}
                        onChange={(e) => setEduForm({...eduForm, year: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Score / CGPA / Percentage</label>
                      <input 
                        type="text" 
                        placeholder="e.g. CGPA: 9.12 / 10" 
                        value={eduForm.metric}
                        onChange={(e) => setEduForm({...eduForm, metric: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 font-bold uppercase text-[10px]">
                    <button 
                      onClick={handleAddEdu} 
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      Save Record
                    </button>
                    <button 
                      onClick={() => setIsAddingEdu(false)} 
                      className="text-white/30 hover:text-white/50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {educationList.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-white/30 text-xs font-bold">No academic details added yet.</p>
                  </div>
                ) : (
                  educationList.map((edu, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5 relative group">
                      <button 
                        onClick={() => handleDeleteEdu(idx)}
                        className="absolute top-4 right-4 text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-between items-start gap-8">
                        <h4 className="text-xs font-bold text-white leading-tight pr-6">{edu.degree}</h4>
                        <span className="text-[10px] text-white/35 font-bold whitespace-nowrap">{edu.year}</span>
                      </div>
                      <p className="text-[11px] text-white/50 font-semibold">{edu.school}</p>
                      <div className="pt-1 flex items-center gap-1 text-indigo-400 text-xs font-bold">
                        <CheckCircle2 size={11} />
                        <span>{edu.metric}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Briefcase className="text-indigo-400" size={16} />
                  <h2 className="text-sm font-bold text-white">Internship & Work Experience</h2>
                </div>
                {!isAddingExp && (
                  <button 
                    onClick={() => setIsAddingExp(true)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold h-7 px-3.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-white/10 shadow-sm"
                  >
                    <Plus size={12} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingExp && (
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3.5 text-xs">
                  <div className="font-bold text-indigo-400">Add Professional Experience</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Job Role / Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. SDE Intern" 
                        value={expForm.role}
                        onChange={(e) => setExpForm({...expForm, role: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Company / Organization</label>
                      <input 
                        type="text" 
                        placeholder="e.g. DevPrep Labs" 
                        value={expForm.company}
                        onChange={(e) => setExpForm({...expForm, company: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Duration (Period)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jan 2026 - Present" 
                        value={expForm.duration}
                        onChange={(e) => setExpForm({...expForm, duration: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-white/40 text-[10px]">Job Description / Key Outcomes</label>
                      <textarea 
                        placeholder="Describe your core responsibilities and achievements..." 
                        value={expForm.desc}
                        onChange={(e) => setExpForm({...expForm, desc: e.target.value})}
                        rows={3}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 font-bold uppercase text-[10px]">
                    <button 
                      onClick={handleAddExp} 
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      Save Experience
                    </button>
                    <button 
                      onClick={() => setIsAddingExp(false)} 
                      className="text-white/30 hover:text-white/50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {experienceList.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-white/30 text-xs font-bold">No internship or work details added yet.</p>
                  </div>
                ) : (
                  experienceList.map((exp, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-1.5 relative group">
                      <button 
                        onClick={() => handleDeleteExp(idx)}
                        className="absolute top-4 right-4 text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="flex justify-between items-start gap-8">
                        <h4 className="text-xs font-bold text-white leading-tight pr-6">{exp.role}</h4>
                        <span className="text-[10px] text-white/35 font-bold whitespace-nowrap">{exp.duration}</span>
                      </div>
                      <p className="text-[11px] text-indigo-400 font-bold">{exp.company}</p>
                      <p className="text-[11px] text-white/60 leading-relaxed font-semibold">{exp.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: SKILLS & ACTIVITY */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                <Layers className="text-indigo-400" size={16} />
                <h2 className="text-sm font-bold text-white">Skills Matrix & Submissions Heatmap</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col items-center justify-center">
                  <h3 className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-4 align-self-start">Skills Radar</h3>
                  <div className="w-full h-52 flex items-center justify-center">
                    <SkillsRadar data={aiAnalysis?.stats?.topics ? Object.entries(aiAnalysis.stats.topics).map(([k, v]) => ({ subject: k, A: Math.min(100, v * 20), fullMark: 100 })) : [
                      { subject: "Arrays", A: 90, fullMark: 100 },
                      { subject: "Strings", A: 80, fullMark: 100 },
                      { subject: "DP", A: 65, fullMark: 100 },
                      { subject: "Graphs", A: 75, fullMark: 100 },
                      { subject: "Trees", A: 70, fullMark: 100 }
                    ]} />
                  </div>
                </div>

                <div className="bg-white/[0.01] border border-white/5 p-4 rounded-xl flex flex-col">
                  <h3 className="text-[9px] font-bold text-white/35 uppercase tracking-widest mb-4">Submission Heatmap</h3>
                  <div className="flex-1 flex items-center justify-center">
                    <ActivityHeatmap data={activity} />
                  </div>
                </div>
              </div>

              {/* AI Insights Block */}
              <div className="bg-[#1b1b24]/40 border border-indigo-500/10 p-5 rounded-xl">
                <div className="flex items-center space-x-2 mb-3">
                  <BrainCircuit className="text-indigo-400" size={16} />
                  <h4 className="text-xs font-bold text-white">AI Diagnostics & Performance Insights</h4>
                </div>
                {aiAnalysis ? (
                  <p className="text-white/80 leading-relaxed text-xs whitespace-pre-wrap font-semibold">{aiAnalysis.analysis}</p>
                ) : (
                  <div className="text-center py-6">
                    <BarChart3 className="mx-auto text-white/10 mb-2" size={24} />
                    <p className="text-white/30 text-[10px] font-bold">No active review data generated yet. Click "AI Review" above to run diagnostic logs.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS */}
          {activeTab === "projects" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Globe className="text-indigo-400" size={16} />
                  <h2 className="text-sm font-bold text-white">Engineering Projects</h2>
                </div>
                {!isAddingProj && (
                  <button 
                    onClick={() => setIsAddingProj(true)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold h-7 px-3.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-white/10 shadow-sm"
                  >
                    <Plus size={12} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingProj && (
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3.5 text-xs">
                  <div className="font-bold text-indigo-400">Add Project details</div>
                  <div className="grid grid-cols-1 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Project Title</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Collaborative Editor" 
                        value={projForm.title}
                        onChange={(e) => setProjForm({...projForm, title: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Tech Stack (e.g. React, Node.js, Redis)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. React, Socket.io, Node.js" 
                        value={projForm.tech}
                        onChange={(e) => setProjForm({...projForm, tech: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Project Description</label>
                      <textarea 
                        placeholder="Describe key outcomes, challenges, and implementation layers..." 
                        value={projForm.desc}
                        onChange={(e) => setProjForm({...projForm, desc: e.target.value})}
                        rows={3}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500 resize-none leading-relaxed"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 font-bold uppercase text-[10px]">
                    <button 
                      onClick={handleAddProj} 
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      Save Project
                    </button>
                    <button 
                      onClick={() => setIsAddingProj(false)} 
                      className="text-white/30 hover:text-white/50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {projectsList.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl">
                    <p className="text-white/30 text-xs font-bold">No projects added yet.</p>
                  </div>
                ) : (
                  projectsList.map((proj, idx) => (
                    <div key={idx} className="p-4 bg-white/[0.01] border border-white/5 rounded-xl space-y-2 relative group">
                      <button 
                        onClick={() => handleDeleteProj(idx)}
                        className="absolute top-4 right-4 text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                      <h4 className="text-xs font-bold text-white leading-tight pr-6">{proj.title}</h4>
                      <span className="text-[9px] text-indigo-400 font-extrabold uppercase tracking-wide">{proj.tech}</span>
                      <p className="text-[11px] text-white/60 leading-relaxed font-semibold">{proj.desc}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 6: ACCOMPLISHMENTS */}
          {activeTab === "accomplishments" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <div className="flex items-center gap-1.5">
                  <Award className="text-indigo-400" size={16} />
                  <h2 className="text-sm font-bold text-white">Achievements & Certifications</h2>
                </div>
                {!isAddingAcc && (
                  <button 
                    onClick={() => setIsAddingAcc(true)}
                    className="bg-white/5 hover:bg-white/10 text-white font-bold h-7 px-3.5 rounded-lg text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-all border border-white/10 shadow-sm"
                  >
                    <Plus size={12} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {isAddingAcc && (
                <div className="p-4 bg-white/[0.02] border border-white/10 rounded-xl space-y-3.5 text-xs">
                  <div className="font-bold text-indigo-400">Add Accomplishment</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Award / Certification Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Consistency King" 
                        value={accForm.name}
                        onChange={(e) => setAccForm({...accForm, name: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Issuing Authority</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Saveetha College Hackathon" 
                        value={accForm.issuer}
                        onChange={(e) => setAccForm({...accForm, issuer: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-white/40 text-[10px]">Date of Accomplishment</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Nov 2025" 
                        value={accForm.date}
                        onChange={(e) => setAccForm({...accForm, date: e.target.value})}
                        className="w-full bg-[#18181b] border border-white/10 rounded-lg p-2 text-white outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 font-bold uppercase text-[10px]">
                    <button 
                      onClick={handleAddAcc} 
                      className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
                    >
                      Save Award
                    </button>
                    <button 
                      onClick={() => setIsAddingAcc(false)} 
                      className="text-white/30 hover:text-white/50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {accomplishmentsList.length === 0 ? (
                  <div className="py-12 text-center border border-dashed border-white/10 rounded-xl col-span-2">
                    <p className="text-white/30 text-xs font-bold">No accomplishments added yet.</p>
                  </div>
                ) : (
                  accomplishmentsList.map((badge, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-4 bg-white/[0.01] border border-white/5 rounded-xl relative group">
                      <button 
                        onClick={() => handleDeleteAcc(idx)}
                        className="absolute top-4 right-4 text-white/20 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                      <CheckCircle2 className="text-emerald-400 shrink-0" size={16} />
                      <div>
                        <h4 className="text-xs font-bold text-white pr-4">{badge.name}</h4>
                        <p className="text-[10px] text-white/40 font-semibold">{badge.issuer} • {badge.date}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 7: RESUME & DOCUMENTS */}
          {activeTab === "resume" && (
            <div className="space-y-5">
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-2">
                <FileText className="text-indigo-400" size={16} />
                <h2 className="text-sm font-bold text-white">Resume & Documents</h2>
              </div>

              <div className="p-5 bg-white/[0.01] border border-white/5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl">
                      <FileText className="text-indigo-400" size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white leading-none">sai_lokesh_resume.pdf</h4>
                      <p className="text-[9px] text-white/40 mt-1">PDF Document • 1.2 MB</p>
                    </div>
                  </div>
                  <a 
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Resume download triggered (Mock file representation)");
                    }}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                  >
                    Download
                  </a>
                </div>

                <div className="pt-4 border-t border-white/5 flex flex-col gap-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Verify Status</label>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-400 font-extrabold">
                    <span>Active Placement Eligibility Clearance</span>
                    <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded font-black">PASSED</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Profile;
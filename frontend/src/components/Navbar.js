import { Link, useNavigate } from "react-router-dom";

function Navbar() {

  const navigate = useNavigate();

  const logout = () => {

    localStorage.removeItem("token");
    navigate("/");

  };

  return (

    <div className="bg-white border-b border-teal-900/10 px-8 py-4 flex justify-between items-center shadow-sm">

      <h1 className="font-black text-xl text-[#114a42] tracking-tighter italic uppercase">
        DevPrep AI
      </h1>

      <div className="flex items-center space-x-8">

        <Link to="/dashboard" className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">Dashboard</Link>

        <Link to="/questions" className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">Questions</Link>

        <Link to="/submissions" className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">Submissions</Link>

        <Link to="/leaderboard" className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">Leaderboard</Link>

        <Link to="/profile" className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">Profile</Link>

        <button onClick={() => navigate("/admin")} className="font-bold text-[#4a5d4a] hover:text-[#2BBAA5] transition-colors text-sm uppercase tracking-tight italic">
  Admin
</button>

        <button
          onClick={logout}
          className="bg-[#2BBAA5] hover:bg-[#1f3f1b] text-white px-4 py-2 rounded-xl font-bold text-sm uppercase tracking-tight italic transition-all shadow-md"
        >
          Logout
        </button>

      </div>

    </div>

  );

}

export default Navbar;
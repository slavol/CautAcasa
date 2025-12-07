import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, LogOut } from "lucide-react";

export default function AdminNavbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const isActive = (path) =>
    pathname === path
      ? "bg-blue-600 text-white shadow-md"
      : "text-gray-300 hover:bg-gray-700 hover:text-white";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="w-full bg-gray-900/95 backdrop-blur-sm p-4 flex items-center justify-between shadow-lg border-b border-gray-800 sticky top-0 z-50">
      
      {/* LEFT SIDE: TITLE + BACK BUTTON */}
      <div className="flex items-center gap-6">
        <div className="text-2xl font-semibold text-white tracking-wide">
          🔧 Admin Panel
        </div>

        <Link
          to="/listings"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-200 hover:bg-gray-700 transition-all shadow-sm"
        >
          <ArrowLeft size={18} />
          <span>Înapoi la Listings</span>
        </Link>
      </div>

      {/* RIGHT SIDE: NAVIGATION + LOGOUT */}
      <div className="flex items-center gap-3">
        <Link className={`px-4 py-2 rounded-xl transition-all ${isActive("/admin/dashboard")}`} to="/admin/dashboard">
          Dashboard
        </Link>

        <Link className={`px-4 py-2 rounded-xl transition-all ${isActive("/admin/listings")}`} to="/admin/listings">
          Toate Anunțurile
        </Link>

        <Link className={`px-4 py-2 rounded-xl transition-all ${isActive("/admin/listings/incomplete")}`} to="/admin/listings/incomplete">
          Incomplete
        </Link>

        <Link className={`px-4 py-2 rounded-xl transition-all ${isActive("/admin/listings/new")}`} to="/admin/listings/new">
          Adaugă
        </Link>

        <Link className={`px-4 py-2 rounded-xl transition-all ${isActive("/admin/scraper")}`} to="/admin/scraper">
          Scraper
        </Link>

        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 ml-3 px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-md transition-all"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
}
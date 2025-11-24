import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function UserDropdown({ user, closeMenu }) {
  const { logout } = useAuth();

  return (
    <div
      className="
        absolute right-0 mt-3 
        bg-white shadow-xl rounded-xl border 
        py-2 w-52 z-50
        animate-fadeIn
      "
      style={{ animation: "fadeIn 0.15s ease-out" }}
    >
      {/* NAME */}
      <p className="px-4 py-2 text-gray-800 font-semibold border-b">
        {user?.name}
      </p>

      <Link
        to="/favorites"
        className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
        onClick={closeMenu}
      >
        ⭐ Favorite
      </Link>

      <Link
        to="/history"
        className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
        onClick={closeMenu}
      >
        🕒 Istoric
      </Link>

      <button
        onClick={() => {
          logout();
          closeMenu();
        }}
        className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
      >
        🚪 Logout
      </button>
    </div>
  );
}
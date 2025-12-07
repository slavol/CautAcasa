import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import UserDropdown from "./UserDropdown";
import UserAvatar from "./UserAvatar";
import { Link } from "react-router-dom";
import { RiRobot2Line } from "react-icons/ri";

export default function UserNavbar() {
  const { user } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-md py-3 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* LOGO */}
        <Link
          to="/listings"
          className="text-2xl font-bold select-none whitespace-nowrap"
        >
          Caut<span className="text-blue-600">Acasa</span>
        </Link>

        {/* RIGHT ACTIONS */}
        <div className="flex items-center gap-4">

          {/* NAVIGATION LINKS */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/chat/list"
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-lg transition text-sm"
            >
              <RiRobot2Line size={18} />
              <span>Căutare AI</span>
            </Link>
          </div>

          {/* AI BUTTON (mobile only) */}
          <Link
            to="/chat/list"
            className="md:hidden flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white px-4 py-2 rounded-full font-semibold shadow hover:shadow-lg transition text-sm"
          >
            <RiRobot2Line size={18} />
          </Link>

          {/* AVATAR + DROPDOWN */}
          <div className="relative">
            <button onClick={() => setDropdownOpen(!dropdownOpen)}>
              <UserAvatar name={user?.name} />
            </button>

            {dropdownOpen && (
              <UserDropdown
                user={user}
                closeMenu={() => setDropdownOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
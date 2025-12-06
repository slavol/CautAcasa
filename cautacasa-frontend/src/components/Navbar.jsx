import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">

        {/* Logo */}
        <motion.a
          href="/"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-extrabold text-gray-900 tracking-tight"
        >
          Caut<span className="text-blue-600">Acasă</span>
        </motion.a>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">

          {/* LOGIN BUTTON */}
          <a
            href="/login"
            className="px-5 py-2 border border-gray-300 rounded-xl text-gray-800 hover:bg-gray-100 font-medium transition"
          >
            Login
          </a>

          {/* REGISTER BUTTON */}
          <a
            href="/register"
            className="px-5 py-2 bg-blue-600 text-white rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Register
          </a>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="md:hidden text-gray-800"
          onClick={() => setOpen(!open)}
        >
          <svg
            className="w-7 h-7"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white/80 backdrop-blur-lg border-b border-gray-200 px-6 py-4"
          >
            <div className="flex flex-col gap-4">

              {/* LOGIN MOBILE */}
              <a
                href="/login"
                onClick={() => setOpen(false)}
                className="px-5 py-2 border border-gray-300 rounded-xl text-gray-800 hover:bg-gray-100 font-medium text-center transition"
              >
                Login
              </a>

              {/* REGISTER MOBILE */}
              <a
                href="/register"
                onClick={() => setOpen(false)}
                className="px-5 py-2 bg-blue-600 text-white rounded-xl text-lg font-semibold text-center hover:bg-blue-700 transition"
              >
                Register
              </a>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
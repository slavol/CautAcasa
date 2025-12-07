import { useState } from "react";
import { FiSearch } from "react-icons/fi";

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState("");
  const [openMobile, setOpenMobile] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
    if (openMobile) setOpenMobile(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex items-center w-full max-w-lg bg-white shadow rounded-full px-4 py-2"
      >
        <FiSearch className="text-gray-500 text-xl" />
        <input
          type="text"
          placeholder="Caută anunțuri..."
          className="flex-1 px-3 py-1 outline-none text-gray-700"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>

      <button
        onClick={() => setOpenMobile(true)}
        className="md:hidden bg-white shadow rounded-full p-2"
      >
        <FiSearch className="text-gray-700 text-xl" />
      </button>

      {openMobile && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col p-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => setOpenMobile(false)}
              className="text-lg font-semibold px-3 py-1"
            >
              ✕
            </button>
            <span className="flex-1 text-center font-semibold">
              Căutare
            </span>
            <div className="w-8"></div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex items-center w-full bg-gray-100 rounded-full px-4 py-3 shadow"
          >
            <FiSearch className="text-gray-500 text-xl" />
            <input
              type="text"
              placeholder="Caută..."
              className="flex-1 px-3 py-2 outline-none text-gray-700 text-lg"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </form>
        </div>
      )}
    </>
  );
}
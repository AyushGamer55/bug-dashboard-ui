import React from 'react';
import logo from '../assets/logo.png';

function Header({
  onFile,
  toggleEdit,
  exportJSON,
  resetAll,
  toggleAddForm,
  editMode,
  search,
  setSearch,
  toggleTheme,
  theme,
  onOpenSummary,
  totalBugs,
  onOpenFilters
}) {
  return (
    <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-6 shadow-lg">
      
      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-4 z-10">
        {/* Total Bugs Counter */}
        <div
          className={`px-3 py-1 rounded text-sm font-semibold border transition 
            ${theme === "dark"
              ? "bg-black/60 text-cyan-300 border-cyan-500"
              : "bg-white text-black border-gray-400"
            }`}
        >
          🐞Total Bugs: <span className="font-bold">{totalBugs}</span>
        </div>

        {/* Light/Dark Mode Toggle */}
        <button
          onClick={() => {
            toggleTheme();
            const btn = document.querySelector(".theme-toggle");
            btn.classList.add("spin");
            setTimeout(() => btn.classList.remove("spin"), 600);
          }}
          className="theme-toggle text-2xl hover:scale-110 transition"
          title="Toggle Light/Dark Mode"
        >
          {theme === "dark" ? "☀️" : "🌙"}
        </button>
      </div>

      {/* Logo + Title */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3 sm:gap-4 text-center sm:text-left">
        <img
          src={logo}
          alt="Spider Logo"
          className="h-32 sm:h-28 w-auto object-contain drop-shadow-[0_0_10px_#f00] animate-pulse"
        />
        <div>
           <h1 className="text-5xl md:6x1 sm:text-5x1 font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_#0ff] animate-pulse">
            Bug Report Dashboard
          </h1>
          <p className="text-sm text-purple-300 italic">
            Upload, edit, add, delete and export your bug reports efficiently
          </p>
        </div>
      </div>

      {/* Buttons + Search */}
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="file-upload"
          className="btn bg-cyan-500 text-black hover:bg-cyan-400 cursor-pointer"
        >
          Upload File
        </label>
        <input
          id="file-upload"
          type="file"
          onChange={onFile}
          className="hidden"
        />

        <button
          onClick={toggleEdit}
          className="btn bg-yellow-300 text-black hover:bg-yellow-200"
        >
          {editMode ? "Disable Edit 🔒" : "Enable Edit ✏️"}
        </button>

        <button
          onClick={exportJSON}
          className="btn bg-green-400 text-black hover:bg-green-300"
        >
          Export 💾
        </button>

        <button
          onClick={resetAll}
          className="btn bg-red-600 text-black hover:bg-red-500"
        >
          Reset 🧨
        </button>

        <button
          onClick={toggleAddForm}
          className="btn bg-purple-700 text-black hover:bg-purple-500"
        >
          Add ➕
        </button>

        {/* Generate Summary */}
        <button
          onClick={onOpenSummary}
          className="btn bg-orange-500 text-black hover:bg-orange-400"
        >
          Generate Summary 📊
        </button>
        
        <button
          onClick={onOpenFilters}
          className="btn bg-pink-300 text-black hover:bg-pink-400"
          >
          Filters ⚙️
        </button>

        <input
          type="text"
          placeholder="🔎 Search bugs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`px-4 py-2 rounded shadow focus:outline-none focus:ring-2 
            ${theme === "dark"
              ? "bg-[#1c1c2a] text-cyan-200 border border-cyan-400 focus:ring-cyan-500"
              : "bg-white text-black border border-gray-400 focus:ring-gray-500"
            }`}
        />
      </div>
    </div>
  );
}

export default Header;

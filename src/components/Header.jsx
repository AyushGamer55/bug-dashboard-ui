import React, { useState, useEffect, useRef } from "react";
import logo from "../assets/logo.png";

function Header({
  onFile,
  toggleEdit,
  exportJSON,
  exportCSV,
  resetAll,
  toggleAddForm,
  editMode,
  search,
  setSearch,
  toggleTheme,
  theme,
  onOpenSummary,
  totalBugs,
  onOpenFilters,
  sortField,
  setSortField,
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportRef = useRef(null);

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-6 shadow-lg">
      {/* Top Right Controls */}
      <div className="absolute top-3 right-3 flex items-center gap-4 z-10">
        {/* Total Bugs Counter */}
        <div
          className={`px-3 py-1 rounded text-sm font-semibold border transition 
            ${
              theme === "dark"
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
          <h1
            className={`text-5xl md:text-6xl sm:text-5xl font-bold tracking-wider animate-pulse
              ${
                theme === "dark"
                  ? "text-cyan-400 drop-shadow-[0_0_10px_#0ff]"
                  : "text-purple-700 drop-shadow-[0_0_6px_#a78bfa]"
              }`}
          >
            Bug Report Dashboard
          </h1>

          <p className="text-sm text-red-600 italic">
            View bug reports, upload new ones, edit, delete, generate summaries,
            and manage everything efficiently.
          </p>
        </div>
      </div>

      {/* Buttons + Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="file-upload"
          className="btn bg-cyan-500 text-black hover:bg-cyan-400 cursor-pointer"
        >
          Upload File 📁
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

        {/* Export Dropdown */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setShowExportMenu((prev) => !prev)}
            className="btn bg-green-400 text-black hover:bg-green-300"
          >
            Export 💾
          </button>

          {showExportMenu && (
            <div
              className={`absolute mt-2 w-44 rounded shadow-lg border z-20 ${
                theme === "dark"
                  ? "bg-[#1c1c2a] text-cyan-200 border-cyan-500"
                  : "bg-white text-black border-gray-400"
              }`}
            >
              <button
                onClick={() => {
                  exportJSON();
                  setShowExportMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-green-500 hover:text-black"
              >
                📄 Export as JSON
              </button>
              <button
                onClick={() => {
                  exportCSV();
                  setShowExportMenu(false);
                }}
                className="block w-full text-left px-4 py-2 hover:bg-green-500 hover:text-black"
              >
                📑 Export as CSV
              </button>
            </div>
          )}
        </div>

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

        {/* Search bar */}
        <input
          type="text"
          placeholder="🔎 Search bugs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`px-4 py-2 rounded shadow focus:outline-none focus:ring-2 
            ${
              theme === "dark"
                ? "bg-[#1c1c2a] text-cyan-200 border border-cyan-400 focus:ring-cyan-500"
                : "bg-white text-black border border-gray-400 focus:ring-gray-500"
            }`}
        />

        {/* Sort Dropdown */}
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className={`px-3 py-2 rounded shadow focus:outline-none focus:ring-2 
            ${
              theme === "dark"
                ? "bg-[#1c1c2a] text-cyan-200 border border-cyan-400 focus:ring-cyan-500"
                : "bg-white text-black border border-gray-400 focus:ring-gray-500"
            }`}
          aria-label="Sort bugs by field"
        >
          <option value="" disabled style={{ fontWeight: "bold" }}>
            -- Sort bugs by --
          </option>
          <option value="ScenarioID">Sort by: Scenario ID</option>
          <option value="Status">Sort by: Status</option>
          <option value="Priority">Sort by: Priority</option>
          <option value="Severity">Sort by: Severity</option>
        </select>
      </div>
    </div>
  );
}

export default Header;

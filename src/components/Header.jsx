import React from 'react'

function Header({
  onFile, toggleEdit, exportJSON, resetAll, toggleAddForm,
  editMode, search, setSearch, toggleTheme, theme
}) {
  return (
    <div className="glass relative flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-6 border border-cyan-400 shadow-lg">
      
      {/* 🌗 Light/Dark Mode Toggle (TOP RIGHT) */}
      <button
        onClick={() => {
          toggleTheme();
          const btn = document.querySelector(".theme-toggle");
          btn.classList.add("spin");
          setTimeout(() => btn.classList.remove("spin"), 600);
        }}
        className="theme-toggle absolute top-3 right-3 text-2xl hover:scale-110 transition z-10"
        title="Toggle Light/Dark Mode"
      >
        {theme === "dark" ? "☀️" : "🌙"}
      </button>

      {/* 🔥 Cyberpunk Title */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_#0ff] animate-pulse">
          🧠 Bug Report Dashboard
        </h1>
        <p className="text-sm text-purple-300 italic">
          Upload, edit, add, delete and export your bug reports efficiently
        </p>
      </div>

      {/* 🎛️ Buttons */}
      <div className="flex flex-wrap justify-center md:justify-end gap-3 mt-2">
        <input
          type="file"
          onChange={onFile}
          className="btn bg-cyan-500 text-black hover:bg-cyan-400 cursor-pointer"
        />

        <button
          onClick={toggleEdit}
          className="btn bg-yellow-300 text-black hover:bg-yellow-200 hover:scale-105"
        >
          {editMode ? "Disable Edit 🔒" : "Enable Edit ✏️"}
        </button>

        <button
          onClick={exportJSON}
          className="btn bg-green-400 text-black hover:bg-green-300 hover:scale-105"
        >
          Export 💾
        </button>

        <button
          onClick={resetAll}
          className="btn bg-red-600 text-black hover:bg-red-500 hover:scale-105"
        >
          Reset 🧨
        </button>

        <button
          onClick={toggleAddForm}
          className="btn bg-purple-700 text-black hover:bg-purple-500 hover:scale-105"
        >
          Add ➕
        </button>
      </div>

      {/* 🔍 Search Field */}
      <input
        type="text"
        placeholder="🔎 Search bugs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full md:w-1/2 mt-4 md:mt-0 px-4 py-2 bg-[#1c1c2a] text-cyan-200 border border-cyan-400 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-500"
      />
    </div>
  )
}

export default Header

import React from 'react'
import logo from '../assets/logo.png'

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
  theme
}) {
  return (
    <header className="glass relative flex flex-col md:flex-row justify-between items-center gap-4 mb-6 p-6 border border-cyan-400 shadow-lg">
      
      {/* 🌗 Light/Dark Mode Toggle (TOP RIGHT) */}
      <button
        type="button"
        onClick={() => {
          toggleTheme()
          const btn = document.querySelector('.theme-toggle')
          if (btn) {
            btn.classList.add('spin')
            setTimeout(() => btn.classList.remove('spin'), 600)
          }
        }}
        className="theme-toggle absolute top-3 right-3 text-2xl hover:scale-110 transition z-10"
        aria-label="Toggle Light/Dark Mode"
        title="Toggle Light/Dark Mode"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* 🔥 Logo + Title */}
      <div className="flex items-center gap-4 flex-wrap text-center md:text-left">
        <img
          src={logo}
          alt="Spider Logo"
          className="h-12 w-auto object-contain drop-shadow-[0_0_10px_#f00] animate-pulse"
        />
        <div>
          <h1 className="text-2xl md:text-4xl font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_#0ff] animate-pulse">
            Bug Report Dashboard
          </h1>
          <p className="text-sm text-purple-300 italic mt-1">
            Upload, edit, add, delete and export your bug reports efficiently
          </p>
        </div>
      </div>

      {/* 🎛️ Controls + Search */}
      <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
        <div className="flex flex-wrap items-center gap-3">
          {/* Accessible file upload */}
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
            type="button"
            onClick={toggleEdit}
            className="btn bg-yellow-300 text-black hover:bg-yellow-200"
          >
            {editMode ? 'Disable Edit 🔒' : 'Enable Edit ✏️'}
          </button>

          <button
            type="button"
            onClick={exportJSON}
            className="btn bg-green-400 text-black hover:bg-green-300"
          >
            Export 💾
          </button>

          <button
            type="button"
            onClick={resetAll}
            className="btn bg-red-600 text-black hover:bg-red-500"
          >
            Reset 🧨
          </button>

          <button
            type="button"
            onClick={toggleAddForm}
            className="btn bg-purple-700 text-black hover:bg-purple-500"
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
          className="w-full md:w-64 mt-3 md:mt-0 px-4 py-2 bg-[#1c1c2a] text-cyan-200 border border-cyan-400 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
      </div>
    </header>
  )
}

export default Header

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
    <header className="glass border border-cyan-400 shadow-lg p-6 flex flex-col gap-4">
      
      {/* Row 1: Logo + Title */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <img
          src={logo}
          alt="Spider Logo"
          className="h-20 w-20 object-contain drop-shadow-[0_0_15px_#f00]"
        />

        {/* Title + Subtitle */}
        <div>
          <h1 className="text-4xl font-bold text-cyan-400 tracking-wider drop-shadow-[0_0_10px_#0ff]">
            Bug Report Dashboard
          </h1>
          <p className="text-sm text-purple-300 italic mt-1">
            Upload, edit, add, delete and export your bug reports efficiently
          </p>
        </div>
      </div>

      {/* Row 2: Buttons + Search */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3">
        
        {/* Buttons */}
        <div className="flex flex-wrap gap-3">
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

        {/* Search + Theme Toggle */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="🔎 Search bugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-4 py-2 bg-[#1c1c2a] text-cyan-200 border border-cyan-400 rounded shadow focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />

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
            className="theme-toggle text-2xl hover:scale-110 transition"
            aria-label="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header

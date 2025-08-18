// src/components/FilterModal.jsx
import React from "react";

function FilterModal({ open, onClose, filters, setFilters, bugs, theme }) {
  if (!open) return null;

  // Collect unique values for each field dynamically
  const fieldValues = {};
  bugs.forEach((bug) => {
    Object.entries(bug).forEach(([key, value]) => {
      if (!value) return;
      if (!fieldValues[key]) fieldValues[key] = new Set();
      fieldValues[key].add(value);
    });
  });

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const current = prev[key] || [];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter((v) => v !== value) };
      } else {
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const resetFilters = () => {
    setFilters({});
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50"
      onClick={onClose}
    >
      <div
        className={`w-72 sm:w-80 h-full shadow-xl border-l overflow-y-auto transform transition-transform duration-500 ease-in-out ${
          theme === "dark"
            ? "bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 text-white border-purple-700"
            : "bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100 text-black border-gray-300"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="font-bold text-lg">🎛 Filters</h2>
          <button
            onClick={onClose}
            className="text-lg hover:scale-110 transition"
          >
            ✖
          </button>
        </div>

        {/* Filter Options */}
        <div className="p-4 space-y-4">
          {Object.entries(fieldValues).map(([key, values]) => (
            <div key={key} className="border-b pb-2">
              <h3 className="font-semibold mb-2">{key}</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {[...values].map((value) => (
                  <label key={value} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters[key]?.includes(value) || false}
                      onChange={() => toggleFilter(key, value)}
                    />
                    <span className="text-sm">{value}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reset Button */}
        <div className="p-4 border-t">
          <button
            onClick={resetFilters}
            className="w-full py-2 rounded font-bold bg-pink-400 hover:bg-pink-500 text-black transition"
          >
            🔄 Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;

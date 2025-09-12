import React from "react";
import { normalizeValue, SORT_ORDER } from "../utils/Sorting";

function FilterModal({ open, onClose, bugs, filters, setFilters, theme }) {
  if (!open) return null;

  // Get unique values for each field from ALL bugs (not filtered)
  const getUniqueValues = (key) => {
    const values = bugs.map((bug) => bug[key]).filter(Boolean);
    const unique = [...new Set(values)];
    const order = SORT_ORDER[key];
    if (order) {
      unique.sort((a, b) => {
        const normA = normalizeValue(key, a);
        const normB = normalizeValue(key, b);
        const indexA = order.indexOf(normA);
        const indexB = order.indexOf(normB);
        return (
          (indexA === -1 ? order.length : indexA) -
          (indexB === -1 ? order.length : indexB)
        );
      });
    }
    return unique;
  };

  const fields = [
    { label: "Status", key: "Status" },
    { label: "Priority", key: "Priority" },
    { label: "Severity", key: "Severity" },
    { label: "Category", key: "Category" },
  ];

  const handleToggle = (key, value) => {
    setFilters((prev) => {
      const existing = prev[key] || [];
      return {
        ...prev,
        [key]: existing.includes(value)
          ? existing.filter((v) => v !== value)
          : [...existing, value],
      };
    });
  };

  // ✅ Reset filters
  const handleReset = () => {
    setFilters({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (arr) => arr && arr.length > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Background overlay */}
      <div className="flex-1 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div
        className={`w-64 sm:w-80 h-full shadow-lg border-l overflow-y-auto transition-transform transform
        ${
          theme === "dark"
            ? "bg-gradient-to-b from-purple-900 via-indigo-900 to-blue-900 text-white border-purple-700"
            : "bg-gradient-to-b from-pink-100 via-purple-100 to-blue-100 text-black border-gray-300"
        }
        animate-slideIn`}
      >
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-500">
          <h2 className="text-lg font-bold text-purple-400">✨ Filters</h2>

          <div className="flex items-center gap-3">
            {/* 🚫 Clear All icon (only shows if filters applied) */}
            {hasActiveFilters && (
              <button
                onClick={handleReset}
                className="text-lg hover:scale-110 transition"
                title="Clear All Filters"
              >
                🚫
              </button>
            )}

            <button
              onClick={onClose}
              className="text-xl font-bold text-pink-500 hover:text-pink-700"
              title="Close"
            >
              ✖
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="p-4 space-y-6">
          {fields.map((field) => {
            const values = getUniqueValues(field.key);
            if (values.length === 0) return null;
            return (
              <div key={field.key}>
                <h3 className="font-semibold text-blue-400 mb-2">
                  {field.label}
                </h3>
                <div className="flex flex-col gap-2">
                  {values.map((val) => (
                    <label
                      key={val}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={filters[field.key]?.includes(val) || false}
                        onChange={() => handleToggle(field.key, val)}
                      />
                      <span>{val}</span>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}

          {/* ✅ Reset Button at Bottom */}
          <div className="pt-6">
            <button
              onClick={handleReset}
              className={`w-full py-2 rounded font-semibold transition ${
                theme === "dark"
                  ? "bg-[#007FFF] text-white hover:bg-[#3399FF]"
                  : "bg-[#007FFF] text-black hover:bg-[#66B2FF]"
              }`}
            >
              Reset Filters 🔁
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterModal;

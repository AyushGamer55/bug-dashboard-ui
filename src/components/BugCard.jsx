import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL;

function BugCard({ bug, editMode, onDelete, onUpdate, onToggleEdit }) {
  const [savingField, setSavingField] = useState(null);
  const [isLightMode, setIsLightMode] = useState(
    document.body.classList.contains('light-mode')
  );
  const [editingField, setEditingField] = useState({});
  const [tooltipField, setTooltipField] = useState(null);

  // Listen for mode changes dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });

    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const showTooltip = (key) => {
    setTooltipField(key);
    setTimeout(() => setTooltipField(null), 1500); // hide after 1.5s
  };

  const handleBlur = (key, newValue) => {
    setEditingField({ ...editingField, [key]: false });

    // Special case: StepsToExecute (array in schema)
    let updatedValue = newValue;
    if (key === 'StepsToExecute') {
      updatedValue = newValue
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line);
    }

    if (JSON.stringify(updatedValue) !== JSON.stringify(bug[key])) {
      setSavingField(key);
      fetch(`${API_BASE}/bugs/${bug._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: updatedValue })
      })
        .then((res) => res.json())
        .then(() => onUpdate?.({ [key]: updatedValue }))
        .catch(() => toast.error('❌ Update failed'))
        .finally(() => setSavingField(null));
    }
  };

  const field = (label, key, value, multiline = false) => (
    <div className="mb-4 relative">
      <label
        className={`block font-semibold mb-1 ${
          isLightMode ? 'text-gray-800' : 'text-cyan-300'
        }`}
      >
        {label}
      </label>

      {editingField[key] || editMode ? (
        multiline ? (
          <textarea
            autoFocus
            rows={4}
            className={`w-full px-3 py-2 rounded border transition-all duration-300 ${
              isLightMode
                ? 'bg-white border-gray-400 text-black'
                : 'bg-black bg-opacity-50 border-cyan-600 text-white'
            }`}
            defaultValue={value}
            onBlur={(e) => handleBlur(key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) e.target.blur();
            }}
          />
        ) : (
          <input
            autoFocus
            className={`w-full px-3 py-2 rounded border transition-all duration-300 ${
              isLightMode
                ? 'bg-white border-gray-400 text-black'
                : 'bg-black bg-opacity-50 border-cyan-600 text-white'
            }`}
            defaultValue={value}
            onBlur={(e) => handleBlur(key, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.target.blur();
            }}
          />
        )
      ) : (
        <div
          className={`w-full px-3 py-2 rounded border transition-all duration-300 ${
            isLightMode
              ? 'bg-white border-gray-400 text-black'
              : 'bg-black bg-opacity-50 border-cyan-600 text-white'
          } hover:cursor-text whitespace-pre-line`}
          onDoubleClick={() => {
            setEditingField({ ...editingField, [key]: true });
            showTooltip(key);
          }}
        >
          {value}
        </div>
      )}

      {savingField === key && (
        <span className="text-sm text-blue-400 animate-pulse">Saving...</span>
      )}

      {tooltipField === key && (
        <span className="absolute top-0 right-0 text-xs bg-black/70 text-white px-1 rounded pointer-events-none select-none">
          Editing enabled
        </span>
      )}
    </div>
  );

  return (
    <div
      className={`rounded-lg p-6 shadow-xl border relative transition-transform hover:scale-[1.02] duration-300
      ${
        isLightMode
          ? 'bg-white border-gray-300 text-black'
          : 'bg-gradient-to-br from-black via-gray-900 to-gray-800 border-cyan-700 text-white'
      }`}
    >
      {/* Edit Button */}
      <button
        onClick={onToggleEdit}
        className={`absolute top-3 right-20 px-3 py-1 text-xs font-bold rounded-full shadow-lg transition duration-200 ${
          editMode
            ? 'bg-orange-500 hover:bg-orange-400 text-white'
            : 'bg-orange-400 hover:bg-orange-500 text-white'
        }`}
      >
        {editMode ? 'Editing' : 'Edit'}
      </button>

      {/* Delete Button */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition duration-200"
      >
        Delete
      </button>

      <div className="grid md:grid-cols-2 gap-x-6">
        {field('Scenario ID', 'ScenarioID', bug.ScenarioID)}
        {field('Category', 'TestCaseID', bug.TestCaseID)}
        {field('Description', 'Description', bug.Description, true)}
        {field('Status', 'Status', bug.Status)}
        {field('Priority', 'Priority', bug.Priority)}
        {field('Severity', 'Severity', bug.Severity)}
        {field('Pre-Condition', 'PreCondition', bug.PreCondition, true)}
        {field(
          'Steps To Execute',
          'StepsToExecute',
          Array.isArray(bug.StepsToExecute)
            ? bug.StepsToExecute.join('\n')
            : bug.StepsToExecute,
          true
        )}
        {field('Expected Result', 'ExpectedResult', bug.ExpectedResult, true)}
        {field('Actual Result', 'ActualResult', bug.ActualResult, true)}
        {field('Comments', 'Comments', bug.Comments, true)}
        {field('Suggestion To Fix', 'SuggestionToFix', bug.SuggestionToFix, true)}
      </div>
    </div>
  );
}

export default BugCard;

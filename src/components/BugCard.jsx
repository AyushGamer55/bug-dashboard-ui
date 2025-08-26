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

  // Detect theme changes dynamically
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains('light-mode'));
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Tooltip helper
  const showTooltip = (key) => {
    setTooltipField(key);
    setTimeout(() => setTooltipField(null), 1500);
  };

  // Save updates to backend
  const handleBlur = (key, newValue) => {
    setEditingField({ ...editingField, [key]: false });

    if (newValue !== bug[key]) {
      setSavingField(key);
      fetch(`${API_BASE}/bugs/${bug._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue }),
      })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to update');
          return res.json();
        })
        .then(() => {
          onUpdate?.({ ...bug, [key]: newValue });
          toast.success('✅ Updated successfully');
        })
        .catch(() => toast.error('❌ Update failed'))
        .finally(() => setSavingField(null));
    }
  };

  // Decide which fields should be textarea
  const isMultilineField = (key) =>
    [
      'StepsToExecute',
      'PreCondition',
      'ExpectedResult',
      'ActualResult',
      'Comments',
      'SuggestionToFix',
    ].includes(key);

  // Render field
  const field = (label, key, value) => (
    <div className="mb-4 relative">
      <label
        className={`block font-semibold mb-1 ${
          isLightMode ? 'text-gray-800' : 'text-cyan-300'
        }`}
      >
        {label}
      </label>

      {editingField[key] || editMode ? (
        isMultilineField(key) ? (
          <textarea
            autoFocus
            rows={3}
            className={`w-full px-3 py-2 rounded border transition-all duration-300 resize-y ${
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
          className={`w-full px-3 py-2 rounded border transition-all duration-300 whitespace-pre-line ${
            isLightMode
              ? 'bg-white border-gray-400 text-black'
              : 'bg-black bg-opacity-50 border-cyan-600 text-white'
          } hover:cursor-text`}
          onDoubleClick={() => {
            setEditingField({ ...editingField, [key]: true });
            showTooltip(key);
          }}
        >
          {value || <span className="italic text-gray-400">—</span>}
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
        {field('Description', 'Description', bug.Description)}
        {field('Status', 'Status', bug.Status)}
        {field('Priority', 'Priority', bug.Priority)}
        {field('Severity', 'Severity', bug.Severity)}
        {field('Pre-Condition', 'PreCondition', bug.PreCondition)}
        {field('Steps To Execute', 'StepsToExecute', bug.StepsToExecute)}
        {field('Expected Result', 'ExpectedResult', bug.ExpectedResult)}
        {field('Actual Result', 'ActualResult', bug.ActualResult)}
        {field('Comments', 'Comments', bug.Comments)}
        {field('Suggestion To Fix', 'SuggestionToFix', bug.SuggestionToFix)}
      </div>
    </div>
  );
}

export default BugCard;

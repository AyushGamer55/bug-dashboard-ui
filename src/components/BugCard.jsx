import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const API_BASE = import.meta.env.VITE_API_URL;

function BugCard({ bug, editMode, onDelete, onUpdate, onToggleEdit }) {
  const [savingField, setSavingField] = useState(null);
  const [isLightMode, setIsLightMode] = useState(
    document.body.classList.contains('light-mode')
  );
  const [editingField, setEditingField] = useState({});
  const [fieldValues, setFieldValues] = useState({});
  const [tooltipField, setTooltipField] = useState(null);

  // sync bug props into state
  useEffect(() => {
    if (bug) {
      setFieldValues(bug);
    }
  }, [bug]);

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

    if (newValue !== bug[key]) {
      setSavingField(key);

      fetch(`${API_BASE}/bugs/${bug._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: newValue })
      })
        .then((res) => res.json())
        .then(() => {
          setFieldValues({ ...fieldValues, [key]: newValue });
          onUpdate?.({ [key]: newValue });
        })
        .catch(() => toast.error('❌ Update failed'))
        .finally(() => setSavingField(null));
    }
  };

  // helper to decide if a field should be textarea
  const isMultilineField = (key) => [
    'StepsToExecute',
    'PreCondition',
    'ExpectedResult',
    'ActualResult',
    'Comments',
    'SuggestionToFix'
  ].includes(key);

  const field = (label, key) => (
    <div className="mb-4 relative">
      <label className={`block font-semibold mb-1 ${isLightMode ? 'text-gray-800' : 'text-cyan-300'}`}>
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
            value={fieldValues[key] ?? ''}
            onChange={(e) => setFieldValues({ ...fieldValues, [key]: e.target.value })}
            onBlur={(e) => handleBlur(key, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) e.target.blur(); }}
          />
        ) : (
          <input
            autoFocus
            className={`w-full px-3 py-2 rounded border transition-all duration-300 ${
              isLightMode
                ? 'bg-white border-gray-400 text-black'
                : 'bg-black bg-opacity-50 border-cyan-600 text-white'
            }`}
            value={fieldValues[key] ?? ''}
            onChange={(e) => setFieldValues({ ...fieldValues, [key]: e.target.value })}
            onBlur={(e) => handleBlur(key, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur(); }}
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
          {fieldValues[key] ?? '—'}
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
      ${isLightMode
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
        {field('Scenario ID', 'ScenarioID')}
        {field('Category', 'TestCaseID')}
        {field('Description', 'Description')}
        {field('Status', 'Status')}
        {field('Priority', 'Priority')}
        {field('Severity', 'Severity')}
        {field('Pre-Condition', 'PreCondition')}
        {field('Steps To Execute', 'StepsToExecute')}
        {field('Expected Result', 'ExpectedResult')}
        {field('Actual Result', 'ActualResult')}
        {field('Comments', 'Comments')}
        {field('Suggestion To Fix', 'SuggestionToFix')}
      </div>
    </div>
  );
}

export default BugCard;

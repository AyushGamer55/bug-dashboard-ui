import React, { useState } from 'react'
import { toast } from 'react-toastify'

function BugCard({ bug, editMode, onDelete, onUpdate }) {
  const [savingField, setSavingField] = useState(null)

  const field = (label, key, value) => (
    <div className="mb-4">
      <label className="block text-cyan-300 font-semibold mb-1">{label}</label>
      <div
        className={`w-full px-3 py-2 rounded bg-black bg-opacity-50 border border-cyan-600 text-white transition-all duration-300 ${
          editMode ? 'hover:shadow-cyan focus:outline-none cursor-text' : ''
        }`}
        contentEditable={editMode}
        suppressContentEditableWarning={true}
        data-key={key}
        onBlur={(e) => {
          if (!editMode) return
          const newValue = e.target.innerText.trim()
          if (newValue !== value) {
            setSavingField(key)
            fetch(`${API_BASE}/bugs/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [key]: newValue })
            })
              .then(res => res.json())
              .then(() => {
                toast.success(`✅ ${key} updated!`)
                onUpdate?.({ [key]: newValue })
              })
              .catch(() => {
                toast.error("❌ Update failed")
              })
              .finally(() => setSavingField(null))
          }
        }}
      >
        {value}
      </div>
      {savingField === key && (
        <span className="text-sm text-blue-400 animate-pulse">Saving...</span>
      )}
    </div>
  )

  return (
    <div className="bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white rounded-lg p-6 shadow-xl border border-cyan-700 relative transition-transform hover:scale-[1.02] duration-300">
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition duration-200"
      >
        Delete
      </button>

      <div className="grid md:grid-cols-2 gap-x-6">
        {field("Scenario ID", "ScenarioID", bug.ScenarioID)}
        {field("TestCase ID", "TestCaseID", bug.TestCaseID)}
        {field("Description", "Description", bug.Description)}
        {field("Status", "Status", bug.Status)}
        {field("Priority", "Priority", bug.Priority)}
        {field("Severity", "Severity", bug.Severity)}
        {field("Pre-Condition", "PreCondition", bug.PreCondition)}
        {field("Steps To Execute", "StepsToExecute", bug.StepsToExecute)}
        {field("Expected Result", "ExpectedResult", bug.ExpectedResult)}
        {field("Actual Result", "ActualResult", bug.ActualResult)}
        {field("Comments", "Comments", bug.Comments)}
        {field("Suggestion To Fix", "SuggestionToFix", bug.SuggestionToFix)}
      </div>
    </div>
  )
}

export default BugCard

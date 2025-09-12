// src/components/BugCard.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env.VITE_API_URL;

export default function BugCard({
  bug,
  editMode,
  onDelete,
  onUpdate,
  onToggleEdit,
}) {
  const { token } = useAuth?.() || {}; // optional: won't break if no auth provider
  const [savingField, setSavingField] = useState(null);
  const [isLightMode, setIsLightMode] = useState(
    typeof document !== "undefined" &&
      document.body.classList.contains("light-mode")
  );
  const [editingField, setEditingField] = useState({});
  const [tooltipField, setTooltipField] = useState(null);
  const [localBug, setLocalBug] = useState(bug);

  const fieldRefs = useRef({});
  const tooltipTimeoutRef = useRef(null);
  const observerRef = useRef(null);

  useEffect(() => {
    setLocalBug(bug);
  }, [bug]);

  // Listen for body class changes (light/dark)
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const observer = new MutationObserver(() => {
      setIsLightMode(document.body.classList.contains("light-mode"));
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const showTooltip = useCallback((key) => {
    setTooltipField(key);
    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
    tooltipTimeoutRef.current = setTimeout(
      () => setTooltipField((cur) => (cur === key ? null : cur)),
      1400
    );
  }, []);

  const sendPatch = async (id, payload) => {
    if (!API_BASE) {
      toast.error("Backend URL not configured");
      return null;
    }

    try {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // try to get server message
        let errText = `${res.status} ${res.statusText}`;
        try {
          const json = await res.json();
          if (json?.message) errText = json.message;
        } catch {}
        throw new Error(errText);
      }

      const updated = await res.json();
      return updated;
    } catch (err) {
      console.error("PATCH error:", err);
      toast.error("❌ Update failed: " + (err.message || ""));
      return null;
    }
  };

  const handleBlur = async (key, rawValue) => {
    setEditingField((p) => ({ ...p, [key]: false }));

    // Normalize StepsToExecute from textarea to array
    let updatedValue = rawValue;
    if (key === "StepsToExecute") {
      updatedValue = String(rawValue || "")
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);
    }

    // If nothing changed, return
    const original = localBug?.[key];
    const originalNormalized =
      key === "StepsToExecute" && Array.isArray(original) ? original : original;
    // compare simply by JSON
    if (JSON.stringify(updatedValue) === JSON.stringify(originalNormalized)) {
      return;
    }

    setSavingField(key);
    const updatedFromServer = await sendPatch(bug._id, { [key]: updatedValue });
    setSavingField(null);

    if (updatedFromServer) {
      // Update local UI immediately
      setLocalBug((prev) => ({ ...prev, [key]: updatedValue }));
      // notify parent to update overall list
      onUpdate?.(bug._id, { [key]: updatedValue });
      toast.success("✅ Saved");
    }
  };

  const startEditing = (key) => {
    setEditingField((p) => ({ ...p, [key]: true }));
    showTooltip(key);
    // do NOT autofocus programmatically to avoid page jump
  };

  const baseInputClasses =
    "w-full px-3 py-2 rounded border transition-all duration-300 outline-none";

  const focusMixin = isLightMode
    ? "focus:ring-2 focus:ring-pink-500 focus:border-pink-400"
    : "focus:ring-2 focus:ring-cyan-500 focus:border-cyan-400";

  const combinedInputClasses = `${baseInputClasses} ${focusMixin}`;

  const previewDivClasses =
    `${baseInputClasses} hover:cursor-text whitespace-pre-line ` +
    (isLightMode
      ? "bg-white border-gray-400 text-black"
      : "bg-black bg-opacity-50 border-cyan-600 text-white") +
    " hover:shadow-[0_0_8px_rgba(0,255,255,0.06)]";

  const renderField = (label, key, value, multiline = false) => {
    const valToShow =
      key === "StepsToExecute" && Array.isArray(value)
        ? value.join("\n")
        : value ?? "";

    return (
      <div className="mb-4 relative" key={key}>
        <label
          className={`block font-semibold mb-1 ${
            isLightMode ? "text-gray-800" : "text-cyan-300"
          }`}
        >
          {label}
        </label>

        {editingField[key] || editMode ? (
          multiline ? (
            <textarea
              ref={(el) => (fieldRefs.current[key] = el)}
              rows={4}
              className={`${combinedInputClasses} ${
                isLightMode
                  ? "bg-white border-gray-400 text-black"
                  : "bg-black bg-opacity-50 border-cyan-600 text-white"
              }`}
              defaultValue={valToShow}
              onBlur={(e) => handleBlur(key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) e.target.blur();
              }}
            />
          ) : (
            <input
              ref={(el) => (fieldRefs.current[key] = el)}
              className={`${combinedInputClasses} ${
                isLightMode
                  ? "bg-white border-gray-400 text-black"
                  : "bg-black bg-opacity-50 border-cyan-600 text-white"
              }`}
              defaultValue={valToShow}
              onBlur={(e) => handleBlur(key, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.target.blur();
              }}
            />
          )
        ) : (
          <div
            tabIndex={0}
            className={`${previewDivClasses}`}
            onDoubleClick={() => startEditing(key)}
            onKeyDown={(e) => {
              if (e.key === "Enter") startEditing(key);
            }}
            aria-label={`Field ${label}. Double click to edit.`}
          >
            {valToShow}
          </div>
        )}

        {savingField === key && (
          <span className="text-sm text-blue-400 animate-pulse absolute left-0 -bottom-5">
            Saving...
          </span>
        )}

        {tooltipField === key && (
          <span className="absolute top-0 right-0 text-xs bg-black/70 text-white px-1 rounded pointer-events-none select-none">
            Editing enabled
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`rounded-lg p-6 shadow-xl border relative transition-transform hover:scale-[1.02] duration-300
        ${
          isLightMode
            ? "bg-white border-gray-300 text-black"
            : "bg-gradient-to-br from-black via-gray-900 to-gray-800 border-cyan-700 text-white"
        }`}
    >
      <button
        type="button"
        onClick={onToggleEdit}
        className={`absolute top-3 right-20 px-3 py-1 text-xs font-bold rounded-full shadow-lg transition duration-200 ${
          editMode
            ? "bg-orange-500 hover:bg-orange-400 text-white"
            : "bg-orange-400 hover:bg-orange-500 text-white"
        }`}
      >
        {editMode ? "Editing" : "Edit"}
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="absolute top-3 right-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-full shadow-lg transition duration-200"
      >
        Delete
      </button>

      <div className="grid md:grid-cols-2 gap-x-6">
        {renderField("Scenario ID", "ScenarioID", localBug.ScenarioID)}
        {renderField("Category", "Category", localBug.Category)}
        {renderField("Description", "Description", localBug.Description, true)}
        {renderField("Status", "Status", localBug.Status)}
        {renderField("Priority", "Priority", localBug.Priority)}
        {renderField("Severity", "Severity", localBug.Severity)}
        {renderField(
          "Pre-Condition",
          "PreCondition",
          localBug.PreCondition,
          true
        )}
        {renderField(
          "Steps To Execute",
          "StepsToExecute",
          Array.isArray(localBug.StepsToExecute)
            ? localBug.StepsToExecute.join("\n")
            : localBug.StepsToExecute,
          true
        )}
        {renderField(
          "Expected Result",
          "ExpectedResult",
          localBug.ExpectedResult,
          true
        )}
        {renderField(
          "Actual Result",
          "ActualResult",
          localBug.ActualResult,
          true
        )}
        {renderField("Comments", "Comments", localBug.Comments, true)}
        {renderField(
          "Suggestion To Fix",
          "SuggestionToFix",
          localBug.SuggestionToFix,
          true
        )}
      </div>
    </div>
  );
}

import React, { useState } from 'react';

function AddBugForm({ newBug, setNewBug, handleAddBug }) {
  const [showHint, setShowHint] = useState(false);

  const handleClick = () => {
    const hasValue = Object.values(newBug).some(v => v && v.trim() !== '');
    if (!hasValue) {
      setShowHint(true);
      return;
    }
    setShowHint(false);
    handleAddBug();
  };

  return (
    <div className="bg-black shadow-md p-4 mt-4 rounded border border-blue-300">
      <h2 className="text-lg font-semibold mb-2 text-blue-600">➕ Add New Scenario</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {Object.keys(newBug)
          .filter(key => key !== 'deviceId') // hide deviceId from form
          .map(key => (
            <input
              key={key}
              type="text"
              placeholder={key}
              value={newBug[key]}
              onChange={(e) => setNewBug({ ...newBug, [key]: e.target.value })}
              className="p-2 rounded bg-transparent border border-cyan-500 text-white text-sm"
            />
          ))}
      </div>
      <button
        onClick={handleClick}
        className="mt-3 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
      >
        Add Bug
      </button>
      {showHint && (
        <p className="text-yellow-400 text-sm mt-1">
          Please fill at least <span className="font-semibold">one</span> field before saving.
        </p>
      )}
    </div>
  );
}

export default AddBugForm;

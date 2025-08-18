// src/App.jsx
import React, { useState, useEffect } from "react";
import { useBugLogic } from "./hooks/useBugLogic";
import Header from "./components/Header";
import AddBugForm from "./components/AddBugForm";
import BugList from "./components/BugList";
import VideoIntro from "./components/VideoIntro";
import SummaryModal from "./components/SummaryModal";

function App() {
  const {
    bugs,
    editMode,
    search,
    loading,
    showAddForm,
    newBug,
    setSearch,
    setEditMode,
    setShowAddForm,
    setNewBug,
    handleFile,
    handleAddBug,
    resetAll,
    exportJSON,
    handleDelete,
    handleUpdate,
  } = useBugLogic();

  const [theme, setTheme] = useState("dark");
  const [showIntro, setShowIntro] = useState(true);

  // Summary modal states
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryMode, setSummaryMode] = useState("text");

  // 🔹 New Filter States
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  useEffect(() => {
    if (sessionStorage.getItem("introPlayed") === "true") {
      setShowIntro(false);
    } else {
      setShowIntro(true);
    }
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introPlayed", "true");
    setShowIntro(false);
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // 🔹 Apply Search + Filters
  const filteredBugs = bugs.filter((bug) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = Object.values(bug).some((value) =>
      (value || "").toString().toLowerCase().includes(query)
    );

    const matchesFilters =
      (!filterStatus || bug.Status === filterStatus) &&
      (!filterPriority || bug.Priority === filterPriority) &&
      (!filterSeverity || bug.Severity === filterSeverity) &&
      (!filterCategory || bug.TestCaseID === filterCategory);

    return matchesSearch && matchesFilters;
  });

  const handleOpenSummary = async () => {
    if (bugs.length === 0) {
      alert("❌ No bugs available to summarize!");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bugs/summary`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      const data = await res.json();
      setSummaryData(data);
      setSummaryMode("text");
      setShowSummary(true);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to load summary report.");
    }
  };

  return (
    <div className="p-6">
      {showIntro ? (
        <VideoIntro onFinish={handleIntroFinish} />
      ) : (
        <>
          <Header
            onFile={handleFile}
            toggleEdit={() => setEditMode(!editMode)}
            exportJSON={exportJSON}
            resetAll={resetAll}
            toggleAddForm={() => setShowAddForm(!showAddForm)}
            editMode={editMode}
            search={search}
            setSearch={setSearch}
            toggleTheme={toggleTheme}
            theme={theme}
            onOpenSummary={handleOpenSummary}
            totalBugs={bugs.length}
          />

          {loading && (
            <div className="text-center text-blue-600 font-semibold animate-pulse mt-2">
              Loading...
            </div>
          )}

          {/* 🔹 Filters Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="p-2 border rounded bg-gray-800 text-white dark:bg-[#1c1c2a]"
            >
              <option value="">All Status</option>
              <option value="Pass">Pass</option>
              <option value="Fail">Fail</option>
            </select>

            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="p-2 border rounded bg-gray-800 text-white dark:bg-[#1c1c2a]"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="p-2 border rounded bg-gray-800 text-white dark:bg-[#1c1c2a]"
            >
              <option value="">All Severity</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="p-2 border rounded bg-gray-800 text-white dark:bg-[#1c1c2a]"
            >
              <option value="">All Categories</option>
              <option value="Livestream">Livestream</option>
              <option value="Screenshot">Screenshot</option>
              <option value="Apps">Apps</option>
              <option value="URL">URL</option>
              <option value="Others">Others</option>
            </select>
          </div>

          {showAddForm && (
            <AddBugForm
              newBug={newBug}
              setNewBug={setNewBug}
              handleAddBug={handleAddBug}
            />
          )}

          <BugList
            bugs={filteredBugs}
            editMode={editMode}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            onToggleEdit={() => setEditMode((prev) => !prev)}
          />

          {/* Summary Modal */}
          <SummaryModal
            open={showSummary}
            onClose={() => setShowSummary(false)}
            summary={summaryData}
            mode={summaryMode}
            setMode={setSummaryMode}
          />
        </>
      )}
    </div>
  );
}

export default App;

// src/App.jsx
import React, { useState, useEffect } from "react";
import { useBugLogic } from "./hooks/useBugLogic";
import Header from "./components/Header";
import AddBugForm from "./components/AddBugForm";
import BugList from "./components/BugList";
import VideoIntro from "./components/VideoIntro";
import SummaryModal from "./components/SummaryModal";
import FilterModal from "./components/FilterModal";

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

  // 🔹 Filter states
  const [filters, setFilters] = useState({});
  const [showFilters, setShowFilters] = useState(false);

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

  const filteredBugs = bugs.filter((bug) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = Object.values(bug).some((value) =>
      (value || "").toString().toLowerCase().includes(query)
    );
    const matchesFilters = Object.entries(filters).every(([key, values]) => {
      if (values.length === 0) return true; // no filter applied for this field
      return values.includes(bug[key]);
    });
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
            onOpenFilters={() => setShowFilters(true)} // ⬅️ NEW
          />

          {loading && (
            <div className="text-center text-blue-600 font-semibold animate-pulse mt-2">
              Loading...
            </div>
          )}

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

          {/* 🔹 Filter Modal */}
          <FilterModal
            open={showFilters}
            onClose={() => setShowFilters(false)}
            bugs={bugs}
            filters={filters}
            setFilters={setFilters}
            theme={theme}
          />
        </>
      )}
    </div>
  );
}

export default App;

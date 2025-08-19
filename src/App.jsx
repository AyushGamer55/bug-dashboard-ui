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
    showFilters,
    newBug,
    setSearch,
    setEditMode,
    setShowAddForm,
    setShowFilters,
    setNewBug,
    handleFile,
    handleAddBug,
    resetAll,
    exportJSON,
    handleDelete,
    handleUpdate,
    handleOpenFilters,
  } = useBugLogic();

  const [theme, setTheme] = useState("dark");
  const [showIntro, setShowIntro] = useState(true);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryMode, setSummaryMode] = useState("text");
  const [filters, setFilters] = useState({});

  // Apply theme to body
  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  // Check if intro video already played
  useEffect(() => {
    if (sessionStorage.getItem("introPlayed") === "true") setShowIntro(false);
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introPlayed", "true");
    setShowIntro(false);
  };

  const toggleTheme = () => setTheme(prev => prev === "dark" ? "light" : "dark");

  // Filter + search
  const filteredBugs = bugs.filter(bug => {
    const query = search.trim().toLowerCase();
    const matchesSearch = Object.values(bug).some(v =>
      (v || '').toString().toLowerCase().includes(query)
    );
    const matchesFilters = Object.entries(filters).every(([k, vals]) =>
      !vals?.length || vals.includes(bug[k])
    );
    return matchesSearch && matchesFilters;
  });

  const handleOpenSummary = async () => {
    if (!bugs.length) return alert("❌ No bugs available to summarize!");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/bugs/summary`);
      if (!res.ok) throw new Error("Failed to fetch summary");
      setSummaryData(await res.json());
      setSummaryMode("text");
      setShowSummary(true);
    } catch {
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
            onOpenFilters={handleOpenFilters}
          />

          {loading && (
            <div className="text-center text-blue-600 animate-pulse font-semibold mt-2">
              Loading...
            </div>
          )}

          {showAddForm && (
            <AddBugForm
              newBug={newBug} // ✅ deviceId handled automatically in hook
              setNewBug={setNewBug}
              handleAddBug={handleAddBug}
            />
          )}

          <BugList
            bugs={filteredBugs}
            editMode={editMode}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            onToggleEdit={() => setEditMode(prev => !prev)}
          />

          <SummaryModal
            open={showSummary}
            onClose={() => setShowSummary(false)}
            summary={summaryData}
            mode={summaryMode}
            setMode={setSummaryMode}
          />

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

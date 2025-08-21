import React, { useState, useEffect } from "react";
import { useBugLogic } from "./hooks/useBugLogic";
import Header from "./components/Header";
import AddBugForm from "./components/AddBugForm";
import BugList from "./components/BugList";
import VideoIntro from "./components/VideoIntro";
import SummaryModal from "./components/SummaryModal";
import FilterModal from "./components/FilterModal";
import { normalizeValue, compareValues } from "./utils/Sorting";

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
    exportCSV,
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
  const [sortField, setSortField] = useState("ScenarioID");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  useEffect(() => {
    if (sessionStorage.getItem("introPlayed") === "true") setShowIntro(false);
    else setShowIntro(true);
  }, []);

  const handleIntroFinish = () => {
    sessionStorage.setItem("introPlayed", "true");
    setShowIntro(false);
  };

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // 🔹 Filtered Bugs
  const filteredBugs = bugs.filter((bug) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = Object.values(bug).some((val) =>
      (val || "").toString().toLowerCase().includes(query)
    );

    const matchesFilters = Object.entries(filters).every(([key, values]) => {
      if (!values || values.length === 0) return true;
      const bugValue = normalizeValue(key, bug[key]);
      return values.some((val) => normalizeValue(key, val) === bugValue);
    });

    return matchesSearch && matchesFilters;
  });

  // 🔹 Sorted Bugs
  const sortedBugs = [...filteredBugs].sort((a, b) => {
    const result = compareValues(sortField, a[sortField], b[sortField]);
    return sortOrder === "asc" ? result : -result;
  });

  const handleOpenSummary = async () => {
    if (!bugs.length) return alert("❌ No bugs available to summarize!");
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
            exportCSV={exportCSV}
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
            sortField={sortField}
            setSortField={setSortField}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
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
            bugs={sortedBugs}
            editMode={editMode}
            handleDelete={handleDelete}
            handleUpdate={handleUpdate}
            onToggleEdit={() => setEditMode((prev) => !prev)}
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

import React, { useState, useEffect } from "react";
import { useBugLogic } from "./hooks/useBugLogic";
import Header from "./components/Header";
import AddBugForm from "./components/AddBugForm";
import BugList from "./components/BugList";
import VideoIntro from "./components/VideoIntro";

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
  const [showGraph, setShowGraph] = useState(false);

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
    return Object.values(bug).some((value) =>
      (value || "").toString().toLowerCase().includes(query)
    );
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
            onOpenSummary={handleOpenSummary} // 🔥 new prop
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
          />

          {/* 🔥 Summary Modal */}
          {showSummary && summaryData && (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
              <div className="bg-[#111] text-cyan-300 p-6 rounded-lg shadow-xl max-w-3xl w-full relative border border-cyan-400">
                <button
                  className="absolute top-2 right-2 text-red-500 hover:text-red-300"
                  onClick={() => setShowSummary(false)}
                >
                  ✖
                </button>
                <h2 className="text-2xl font-bold mb-4">
                  Bug Summary Report
                </h2>

                {!showGraph ? (
                  <div className="space-y-2">
                    <p>Total Bugs: {summaryData.total}</p>
                    <p>Open Bugs: {summaryData.open}</p>
                    <p>Closed Bugs: {summaryData.closed}</p>
                    <p>By Priority: {JSON.stringify(summaryData.priority)}</p>
                  </div>
                ) : (
                  <div>
                    {/* You can replace this with chart library later */}
                    <p>[Graphical View Placeholder]</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between">
                  <button
                    onClick={() => setShowGraph(!showGraph)}
                    className="btn bg-purple-600 hover:bg-purple-500 text-white"
                  >
                    {showGraph ? "Show Text Summary" : "Show Graph"}
                  </button>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="btn bg-red-600 hover:bg-red-500 text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;

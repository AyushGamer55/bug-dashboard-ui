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

  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  useEffect(() => {
    // Show intro only if not played yet in this tab
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
        </>
      )}
    </div>
  );
}

export default App;

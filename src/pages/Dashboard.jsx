import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AddBugForm from "../components/AddBugForm";
import BugList from "../components/BugList";
import SummaryModal from "../components/SummaryModal";
import FilterModal from "../components/FilterModal";
import ScreenshotSection from "../components/ScreenshotSection";
import { normalizeValue, compareValues } from "../utils/Sorting";
import { useScreenshotSession } from "../hooks/useScreenshotSession";

function Dashboard(props) {
  const [openScreenshotUpload, setOpenScreenshotUpload] = useState(() => {
    try {
      return sessionStorage.getItem("openScreenshotUpload") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(
        "openScreenshotUpload",
        openScreenshotUpload.toString()
      );
    } catch {}
  }, [openScreenshotUpload]);

  const handleOpenScreenshot = () => {
    setOpenScreenshotUpload((prev) => !prev);
  };

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
    theme,
    toggleTheme,
    showSummary,
    setShowSummary,
    summaryData,
    summaryMode,
    setSummaryMode,
    filters,
    setFilters,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    onOpenSummary,
  } = props;

  const {
    screenshots,
    addScreenshot,
    removeScreenshot,
    clearScreenshots,
    updateScreenshot,
    fetchedScreenshots,
    addFetchedScreenshot,
    removeFetchedScreenshot,
    updateFetchedScreenshot,
    clearFetchedScreenshots,
  } = useScreenshotSession();

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

  const sortedBugs = [...filteredBugs].sort((a, b) => {
    const result = compareValues(sortField, a[sortField], b[sortField]);
    return sortOrder === "asc" ? result : -result;
  });

  return (
    <div className="p-6">
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
        onOpenSummary={onOpenSummary}
        totalBugs={bugs.length}
        onOpenFilters={handleOpenFilters}
        sortField={sortField}
        setSortField={setSortField}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        onOpenScreenshot={handleOpenScreenshot}
        clearScreenshots={clearScreenshots}
        clearFetchedScreenshots={clearFetchedScreenshots}
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

      <ScreenshotSection
        openScreenshotUpload={openScreenshotUpload}
        onToggleUpload={handleOpenScreenshot}
        categories={[
          ...new Set(bugs.map((bug) => bug.TestCaseID).filter(Boolean)),
        ]}
        screenshots={screenshots}
        addScreenshot={addScreenshot}
        removeScreenshot={removeScreenshot}
        clearScreenshots={clearScreenshots}
        updateScreenshot={updateScreenshot}
        fetchedScreenshots={fetchedScreenshots}
        addFetchedScreenshot={addFetchedScreenshot}
        removeFetchedScreenshot={removeFetchedScreenshot}
        updateFetchedScreenshot={updateFetchedScreenshot}
        clearFetchedScreenshots={clearFetchedScreenshots}
        theme={theme}
      />
    </div>
  );
}

export default Dashboard;

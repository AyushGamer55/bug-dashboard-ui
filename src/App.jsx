import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useBugLogic } from "./hooks/useBugLogic";
import Header from "./components/Header";
import AddBugForm from "./components/AddBugForm";
import BugList from "./components/BugList";
import SummaryModal from "./components/SummaryModal";
import FilterModal from "./components/FilterModal";
import { normalizeValue, compareValues } from "./utils/Sorting";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";

// 🔹 PrivateRoute wrapper
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function Dashboard(props) {
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
    onOpenSummary
  } = props;

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
    </div>
  );
}

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
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryMode, setSummaryMode] = useState("text");
  const [filters, setFilters] = useState({});
  const [sortField, setSortField] = useState("ScenarioID");
  const [sortOrder, setSortOrder] = useState("asc");

  const { isAuthenticated } = useAuth();

  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

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
    <Routes>
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Dashboard
              bugs={bugs}
              editMode={editMode}
              search={search}
              loading={loading}
              showAddForm={showAddForm}
              showFilters={showFilters}
              newBug={newBug}
              setSearch={setSearch}
              setEditMode={setEditMode}
              setShowAddForm={setShowAddForm}
              setShowFilters={setShowFilters}
              setNewBug={setNewBug}
              handleFile={handleFile}
              handleAddBug={handleAddBug}
              resetAll={resetAll}
              exportJSON={exportJSON}
              exportCSV={exportCSV}
              handleDelete={handleDelete}
              handleUpdate={handleUpdate}
              handleOpenFilters={handleOpenFilters}
              theme={theme}
              toggleTheme={toggleTheme}
              showSummary={showSummary}
              setShowSummary={setShowSummary}
              summaryData={summaryData}
              summaryMode={summaryMode}
              setSummaryMode={setSummaryMode}
              filters={filters}
              setFilters={setFilters}
              sortField={sortField}
              setSortField={setSortField}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              onOpenSummary={handleOpenSummary}
            />
          </PrivateRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/reset-password" element={<PasswordReset />} /> 
      <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useBugLogic } from "./hooks/useBugLogic";
import { useAuth } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import PasswordReset from "./pages/PasswordReset.jsx";
import Dashboard from "./pages/Dashboard.jsx";

// 🔹 PrivateRoute wrapper
function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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
    sortField,
    sortOrder,
    filters,
    setSearch,
    setEditMode,
    setShowAddForm,
    setShowFilters,
    setNewBug,
    setSortField,
    setSortOrder,
    setFilters,
    handleFile,
    handleAddBug,
    resetAll,
    exportJSON,
    exportCSV,
    handleDelete,
    handleUpdate,
    handleOpenFilters,
    deviceId,
  } = useBugLogic();

  const [theme, setTheme] = useState("dark");
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [summaryMode, setSummaryMode] = useState("text");

  const { isAuthenticated, token } = useAuth();

  useEffect(() => {
    document.body.className = theme === "light" ? "light-mode" : "";
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const handleOpenSummary = async () => {
    if (!bugs.length) return alert("❌ No bugs available to summarize!");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/bugs/summary?deviceId=${deviceId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
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
      <Route
        path="*"
        element={
          <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
        }
      />
    </Routes>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useBugAPI } from './useBugAPI';
import { useBugState } from './useBugState';
import { useBugFiles } from './useBugFiles';
import { useBugFilters } from './useBugFilters';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL;

export const useBugLogic = () => {
  const { token, isAuthenticated } = useAuth();

  // State management
  const {
    editMode,
    search,
    showAddForm,
    showFilters,
    newBug,
    deviceId,
    justUploadedRef,
    firstLoadRef,
    setSearch,
    setEditMode,
    setShowAddForm,
    setShowFilters,
    setNewBug,
    resetNewBug,
    handleOpenFilters: handleOpenFiltersState
  } = useBugState();

  // API operations
  const {
    bugs: apiBugs,
    loading: apiLoading,
    addBug,
    updateBug,
    deleteBug,
    resetAllBugs,
    setBugs
  } = useBugAPI(deviceId);

  // File operations
  const { fileLoading, handleFile: handleFileUpload } = useBugFiles(
    deviceId,
    token,
    (updatedBugs) => {
      setBugs(updatedBugs);
      justUploadedRef.current = true;
    }
  );

  // Filtering and sorting
  const [sortField, setSortField] = useState("ScenarioID");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filters, setFilters] = useState({});

  const {
    filteredAndSortedBugs,
    exportJSON,
    exportCSV
  } = useBugFilters(apiBugs, search, sortField, sortOrder, filters);

  // Combined loading state
  const loading = apiLoading || fileLoading;

  // Handle notifications for data changes
  useEffect(() => {
    if (justUploadedRef.current && !apiLoading) {
      justUploadedRef.current = false;
    } else if (!firstLoadRef.current && !apiLoading) {
      toast.info('🔄 Page refreshed');
    }
    firstLoadRef.current = false;
  }, [apiLoading]);

  // Enhanced handlers
  const handleAddBug = async () => {
    try {
      await addBug({ ...newBug, deviceId });
      resetNewBug();
      setShowAddForm(false);
    } catch (err) {
      // Error already handled in useBugAPI
    }
  };

  const handleUpdate = async (id, updatedFields) => {
    try {
      await updateBug(id, { ...updatedFields, deviceId });
    } catch (err) {
      // Error already handled in useBugAPI
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteBug(id);
    } catch (err) {
      // Error already handled in useBugAPI
    }
  };

  const resetAll = async () => {
    try {
      await resetAllBugs();
    } catch (err) {
      // Error already handled in useBugAPI
    }
  };

  const handleOpenFilters = () => {
    handleOpenFiltersState(apiBugs);
  };

  return {
    bugs: filteredAndSortedBugs,
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
    handleFile: handleFileUpload,
    handleAddBug,
    resetAll,
    exportJSON,
    exportCSV,
    handleDelete,
    handleUpdate,
    handleOpenFilters,
    deviceId
  };
};

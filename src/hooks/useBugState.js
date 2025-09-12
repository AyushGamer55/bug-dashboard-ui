import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

// Generate a unique device ID if not already set
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', id);
  }
  return id;
};

export const useBugState = () => {
  const deviceId = getDeviceId();
  const { isAuthenticated } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [newBug, setNewBug] = useState({
    ScenarioID: '',
    Category: '',
    Description: '',
    Status: '',
    Priority: '',
    Severity: '',
    PreCondition: '',
    StepsToExecute: '',
    ExpectedResult: '',
    ActualResult: '',
    Comments: '',
    SuggestionToFix: '',
    deviceId
  });

  const justUploadedRef = useRef(false);
  const firstLoadRef = useRef(true);

  // Reset bugs when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setEditMode(false);
      setSearch('');
      setShowAddForm(false);
      setShowFilters(false);
    }
  }, [isAuthenticated]);

  const resetNewBug = () => {
    setNewBug({
      ScenarioID: '',
      Category: '',
      Description: '',
      Status: '',
      Priority: '',
      Severity: '',
      PreCondition: '',
      StepsToExecute: '',
      ExpectedResult: '',
      ActualResult: '',
      Comments: '',
      SuggestionToFix: '',
      deviceId
    });
  };

  const handleOpenFilters = (bugs) => {
    if (!bugs.length) return toast.warning('⚠️ No data to filter');
    setShowFilters(true);
  };

  return {
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
    handleOpenFilters
  };
};

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { exportAsJSON, exportAsCSV } from '../utils/exportUtils';
import { isValidBug } from '../utils/bugUtils';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL;

// Generate a unique device ID if not already set
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', id);
  }
  return id;
};

// Sort bugs by ScenarioID
const sortByScenario = (arr) =>
  [...arr].sort((a, b) =>
    String(a.ScenarioID || '').localeCompare(String(b.ScenarioID || ''))
  );

export const useBugLogic = () => {
  const deviceId = getDeviceId();
  const { token, isAuthenticated } = useAuth(); // ✅ Use the hook

  const [bugs, setBugs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [newBug, setNewBug] = useState({
    ScenarioID: '',
    TestCaseID: '',
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
    if (!isAuthenticated) setBugs([]);
  }, [isAuthenticated]);

  // Fetch device-specific bugs
  useEffect(() => {
    if (!API_BASE || !isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setBugs(sortByScenario(data));

        if (justUploadedRef.current) justUploadedRef.current = false;
        else if (!firstLoadRef.current) toast.info('🔄 Page refreshed');

        firstLoadRef.current = false;
      } catch (err) {
        console.error(err);
        toast.error('❌ Failed to load bugs.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, isAuthenticated, token]);

  const apiHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // Upload JSON or CSV file
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    const processUpload = async (data) => {
      try {
        const cleaned = Array.isArray(data)
          ? data.map((row) => ({
              ...Object.fromEntries(
                Object.entries(row || {}).map(([k, v]) => [k.trim(), typeof v === 'string' ? v.trim() : v])
              ),
              deviceId
            }))
          : [];

        if (!cleaned.length || !cleaned.every(isValidBug)) {
          toast.error('❌ Invalid file format!');
          return;
        }

        await Promise.all(
          cleaned.map((bug) =>
            fetch(`${API_BASE}/bugs`, {
              method: 'POST',
              headers: apiHeaders,
              body: JSON.stringify(bug)
            })
          )
        );

        justUploadedRef.current = true;
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`, { headers: apiHeaders });
        const allBugs = await res.json();
        setBugs(sortByScenario(allBugs));

        toast.success(`✅ ${file.name} uploaded!`);
      } catch (err) {
        console.error(err);
        toast.error('❌ Failed to upload file.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.onload = (ev) => {
        try { processUpload(JSON.parse(ev.target.result)); }
        catch { toast.error('❌ Failed to parse JSON'); }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processUpload(results.data),
        error: () => toast.error('❌ Failed to parse CSV')
      });
    } else toast.error('❌ Upload JSON or CSV only');
  };

  // Export functions
  const exportJSON = () => exportAsJSON(sortByScenario(bugs));
  const exportCSV = () => exportAsCSV(sortByScenario(bugs));

  const resetAll = async () => {
    if (!window.confirm('Delete all bugs?')) return;
    try {
      const res = await fetch(`${API_BASE}/bugs/delete-all?deviceId=${deviceId}`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      if (!res.ok) throw new Error('Failed to reset');
      setBugs([]);
      toast.success('🧨 All bugs deleted for this device!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to reset');
    }
  };

  const handleAddBug = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bugs`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify({ ...newBug, deviceId })
      });
      if (!res.ok) throw new Error('Add failed');
      const added = await res.json();
      setBugs((prev) => sortByScenario([...prev, added]));

      setNewBug({
        ScenarioID: '',
        TestCaseID: '',
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
      setShowAddForm(false);
      toast.success('✅ Bug added!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to add');
    } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/bugs/${id}?deviceId=${deviceId}`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      if (!res.ok) throw new Error('Delete failed');
      setBugs((prev) => sortByScenario(prev.filter((b) => b._id !== id)));
      toast.success('🗑️ Bug deleted');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to delete');
    } finally { setLoading(false); }
  };

  const handleUpdate = async (id, updatedFields) => {
    const prevBugs = [...bugs];
    setBugs((prev) => prev.map((b) => (b._id === id ? { ...b, ...updatedFields } : b)));

    try {
      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify({ ...updatedFields, deviceId })
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedBug = await res.json();
      setBugs((prev) => sortByScenario(prev.map((b) => (b._id === id ? updatedBug : b))));
      toast.success('✅ Bug updated!');
    } catch (err) {
      console.error(err);
      setBugs(prevBugs);
      toast.error('❌ Failed to update');
    }
  };

  const handleOpenFilters = () => {
    if (!bugs.length) return toast.warning('⚠️ No data to filter');
    setShowFilters(true);
  };

  return {
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
    handleOpenFilters
  };
};

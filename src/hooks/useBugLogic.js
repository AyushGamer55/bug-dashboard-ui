import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { exportAsJSON } from '../utils/exportUtils';
import { isValidBug } from '../utils/bugUtils';

const API_BASE = import.meta.env.VITE_API_URL;

// Generate unique deviceId per device
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
  deviceId = crypto.randomUUID();
  localStorage.setItem('deviceId', deviceId);
}

const sortByScenario = (arr) =>
  [...arr].sort((a, b) => String(a.ScenarioID || '').localeCompare(String(b.ScenarioID || '')));

export const useBugLogic = () => {
  const [bugs, setBugs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [newBug, setNewBug] = useState({
    ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
    Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '',
    ActualResult: '', Comments: '', SuggestionToFix: ''
  });

  const justUploadedRef = useRef(false);
  const firstLoadRef = useRef(true);

  // Fetch all bugs for this device
  useEffect(() => {
    if (!API_BASE) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setBugs(sortByScenario(data));

        if (justUploadedRef.current) justUploadedRef.current = false;
        else if (!firstLoadRef.current) toast.info('🔄 Page refreshed successfully');

        firstLoadRef.current = false;
      } catch (err) {
        console.error('Failed to fetch bugs:', err);
        toast.error('Failed to load bugs.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // File upload handler
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();

    const processUpload = async (data) => {
      try {
        const cleaned = Array.isArray(data)
          ? data.map((row) =>
              Object.fromEntries(Object.entries(row || {}).map(([k, v]) => [k.trim(), typeof v === 'string' ? v.trim() : v]))
            )
          : [];

        if (!Array.isArray(cleaned) || !cleaned.every(isValidBug)) {
          toast.error('❌ Invalid file format!');
          return;
        }

        await Promise.all(
          cleaned.map((bug) =>
            fetch(`${API_BASE}/bugs`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...bug, deviceId }),
            })
          )
        );

        justUploadedRef.current = true;

        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`);
        const allBugs = await res.json();
        setBugs(sortByScenario(allBugs));

        toast.success(`✅ ${file.name.endsWith('.json') ? 'JSON' : 'CSV'} uploaded!`);
      } catch (err) {
        console.error(err);
        toast.error('❌ Failed to upload file.');
      }
    };

    if (file.name.endsWith('.json')) {
      reader.onload = (ev) => {
        try { processUpload(JSON.parse(ev.target.result)); }
        catch { toast.error('❌ Failed to parse JSON file'); }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processUpload(results.data),
        error: (err) => { console.error(err); toast.error('❌ Failed to parse CSV'); },
      });
    } else toast.error('❌ Please upload a JSON or CSV file only');
  };

  const exportJSON = () => exportAsJSON(sortByScenario(bugs));

  const resetAll = () => {
    if (!window.confirm('Are you sure you want to delete ALL bugs?')) return;

    fetch(`${API_BASE}/bugs/delete-all?deviceId=${deviceId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json().catch(() => ({}));
        setBugs([]);
        const removed = typeof data.deletedCount === 'number' ? data.deletedCount : 'all';
        toast.success(`🧨 All bugs deleted for this device! (${removed} removed)`);
      })
      .catch((err) => { console.error(err); toast.error('❌ Failed to reset bugs'); });
  };

  const handleAddBug = () => {
    setLoading(true);
    fetch(`${API_BASE}/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newBug, deviceId }),
    })
      .then(res => res.json())
      .then((addedBug) => {
        setBugs((prev) => sortByScenario([...prev, addedBug]));
        setNewBug({
          ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
          Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '',
          ActualResult: '', Comments: '', SuggestionToFix: ''
        });
        setShowAddForm(false);
        toast.success('✅ Bug added successfully!');
      })
      .catch(err => { console.error(err); toast.error('❌ Failed to add bug'); })
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setLoading(true);
    fetch(`${API_BASE}/bugs/${id}?deviceId=${deviceId}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setBugs(prev => sortByScenario(prev.filter(bug => bug._id !== id)));
        toast.success('🗑️ Bug deleted!');
      })
      .catch(err => { console.error(err); toast.error('❌ Failed to delete bug'); })
      .finally(() => setLoading(false));
  };

  const handleUpdate = async (id, updatedFields) => {
    const previousBugs = [...bugs];
    setBugs(prev => prev.map(bug => bug._id === id ? { ...bug, ...updatedFields } : bug));

    try {
      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });

      if (!res.ok) throw new Error('Failed to update bug');

      const updatedBug = await res.json();
      setBugs(prev => sortByScenario(prev.map(bug => bug._id === id ? updatedBug : bug)));
      toast.success('✅ Bug updated successfully!');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(`❌ Update failed: ${err.message}`);
      setBugs(previousBugs);
    }
  };

  const handleOpenFilters = () => {
    if (bugs.length === 0) {
      toast.warning('⚠️ No data available to filter!');
      return;
    }
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
    handleDelete,
    handleUpdate,
    handleOpenFilters,
  };
};

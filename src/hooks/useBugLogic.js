import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { exportAsJSON } from '../utils/exportUtils';
import { isValidBug } from '../utils/bugUtils';

const API_BASE = import.meta.env.VITE_API_URL;

// Utility to get or generate a persistent device ID
const getDeviceId = () => {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'device-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('deviceId', id);
  }
  return id;
};

const sortByScenario = (arr) =>
  [...arr].sort((a, b) => String(a.ScenarioID || '').localeCompare(String(b.ScenarioID || '')));

export const useBugLogic = () => {
  const deviceId = getDeviceId(); // <-- device-specific
  const [bugs, setBugs] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [newBug, setNewBug] = useState({
    ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
    Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '',
    ActualResult: '', Comments: '', SuggestionToFix: '', deviceId
  });

  const justUploadedRef = useRef(false);
  const firstLoadRef = useRef(true);

  // Fetch device-specific bugs
  useEffect(() => {
    if (!API_BASE) {
      console.error('VITE_API_URL missing');
      toast.error('Backend URL not configured.');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setBugs(sortByScenario(data));

        if (justUploadedRef.current) justUploadedRef.current = false;
        else if (!firstLoadRef.current) toast.info('🔄 Page refreshed');

        firstLoadRef.current = false;
      } catch (err) {
        console.error(err);
        toast.error('Failed to load bugs.');
      } finally { setLoading(false); }
    };

    fetchData();
  }, [deviceId]);

  // Upload JSON/CSV file
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
              deviceId // <-- attach deviceId
            }))
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
              body: JSON.stringify(bug)
            })
          )
        );

        justUploadedRef.current = true;
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`);
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
        header: true, skipEmptyLines: true,
        complete: (results) => processUpload(results.data),
        error: (err) => toast.error('❌ Failed to parse CSV')
      });
    } else toast.error('❌ Upload JSON or CSV only');
  };

  const exportJSON = () => exportAsJSON(sortByScenario(bugs));

  const resetAll = () => {
    if (!window.confirm('Delete all bugs?')) return;
    fetch(`${API_BASE}/bugs/delete-all?deviceId=${deviceId}`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.statusText}`);
        setBugs([]);
        toast.success('🧨 All bugs deleted for this device!');
      })
      .catch(() => toast.error('❌ Failed to reset'));
  };

  const handleAddBug = () => {
    setLoading(true);
    fetch(`${API_BASE}/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newBug, deviceId }) // attach deviceId
    })
      .then((res) => res.json())
      .then((added) => {
        setBugs((prev) => sortByScenario([...prev, added]));
        setNewBug({ ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
          Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '', ActualResult: '',
          Comments: '', SuggestionToFix: '', deviceId });
        setShowAddForm(false);
        toast.success('✅ Bug added!');
      })
      .catch(() => toast.error('❌ Failed to add'))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id) => {
    setLoading(true);
    fetch(`${API_BASE}/bugs/${id}?deviceId=${deviceId}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error('Delete failed');
        setBugs((prev) => sortByScenario(prev.filter(b => b._id !== id)));
        toast.success('🗑️ Bug deleted');
      })
      .catch(() => toast.error('❌ Failed to delete'))
      .finally(() => setLoading(false));
  };

  const handleUpdate = async (id, updatedFields) => {
    const prevBugs = [...bugs];
    setBugs(prev => prev.map(b => b._id === id ? { ...b, ...updatedFields } : b));

    try {
      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...updatedFields, deviceId })
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedBug = await res.json();
      setBugs(prev => sortByScenario(prev.map(b => b._id === id ? updatedBug : b)));
      toast.success('✅ Bug updated!');
    } catch {
      setBugs(prevBugs);
      toast.error('❌ Failed to update');
    }
  };

  const handleOpenFilters = () => {
    if (bugs.length === 0) return toast.warning('⚠️ No data to filter');
    setShowFilters(true);
  };

  return {
    bugs, editMode, search, loading, showAddForm, showFilters,
    newBug, setSearch, setEditMode, setShowAddForm, setShowFilters, setNewBug,
    handleFile, handleAddBug, resetAll, exportJSON, handleDelete, handleUpdate, handleOpenFilters
  };
};

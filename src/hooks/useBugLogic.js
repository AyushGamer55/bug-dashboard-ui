import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { exportAsJSON } from '../utils/exportUtils';
import { isValidBug } from '../utils/bugUtils';
import { v4 as uuidv4 } from 'uuid'; // <-- npm i uuid

const API_BASE = import.meta.env.VITE_API_URL;

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

  // 🔹 Automatically handle deviceId
  const [deviceId, setDeviceId] = useState(null);
  useEffect(() => {
    let stored = localStorage.getItem('deviceId');
    if (!stored) {
      stored = uuidv4(); // generate once
      localStorage.setItem('deviceId', stored);
    }
    setDeviceId(stored);
  }, []);

  // 🔹 Fetch all bugs
  useEffect(() => {
    if (!API_BASE) {
      console.error('VITE_API_URL is missing.');
      toast.error('Backend URL not configured (VITE_API_URL).');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bugs`);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setBugs(sortByScenario(data));

        if (justUploadedRef.current) {
          justUploadedRef.current = false;
        } else if (!firstLoadRef.current) {
          toast.info('🔄 Page refreshed successfully');
        }

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

  // 🔹 Add deviceId automatically to all POST requests
  const sendBug = async (bug) => {
    if (!deviceId) return toast.error('❌ Device ID not ready yet');
    return fetch(`${API_BASE}/bugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...bug, deviceId }),
    }).then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    });
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    const processUpload = async (data) => {
      try {
        const cleaned = Array.isArray(data)
          ? data.map((row) =>
              Object.fromEntries(
                Object.entries(row || {}).map(([k, v]) => [k.trim(), typeof v === 'string' ? v.trim() : v])
              )
            )
          : [];

        if (!Array.isArray(cleaned) || !cleaned.every(isValidBug)) {
          toast.error('❌ Invalid file format!');
          return;
        }

        await Promise.all(cleaned.map(sendBug)); // <-- deviceId automatically included

        justUploadedRef.current = true;

        const res = await fetch(`${API_BASE}/bugs`);
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
        try {
          const data = JSON.parse(ev.target.result);
          processUpload(data);
        } catch {
          toast.error('❌ Failed to parse JSON file');
        }
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => processUpload(results.data),
        error: (err) => {
          console.error('CSV Error:', err);
          toast.error('❌ Failed to parse CSV file');
        },
      });
    } else {
      toast.error('❌ Please upload a JSON or CSV file only');
    }
  };

  const handleAddBug = () => {
    setLoading(true);
    sendBug(newBug)
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
      .catch((err) => {
        console.error('Failed to add bug:', err);
        toast.error('❌ Failed to add bug');
      })
      .finally(() => setLoading(false));
  };

  const resetAll = () => {
    if (!window.confirm('Are you sure you want to delete ALL bugs?')) return;

    fetch(`${API_BASE}/bugs/delete-all`, { method: 'DELETE' })
      .then(async (res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        await res.json().catch(() => ({}));
        setBugs([]);
        toast.success(`🧨 All bugs deleted from backend!`);
      })
      .catch((err) => {
        console.error('❌ Failed to reset all bugs:', err);
        toast.error('❌ Failed to reset bugs');
      });
  };

  const handleDelete = (id) => {
    setLoading(true);
    fetch(`${API_BASE}/bugs/${id}`, { method: 'DELETE' })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        setBugs((prev) => sortByScenario(prev.filter((b) => b._id !== id)));
        toast.success('🗑️ Bug deleted!');
      })
      .catch((err) => {
        console.error('Failed to delete bug:', err);
        toast.error('❌ Failed to delete bug.');
      })
      .finally(() => setLoading(false));
  };

  const handleUpdate = async (id, updatedFields) => {
    const prev = [...bugs];
    setBugs((b) => b.map((bug) => (bug._id === id ? { ...bug, ...updatedFields } : bug)));
    try {
      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedBug = await res.json();
      setBugs((b) => sortByScenario(b.map((bug) => (bug._id === id ? updatedBug : bug))));
      toast.success('✅ Bug updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('❌ Update failed');
      setBugs(prev);
    }
  };

  const handleOpenFilters = () => {
    if (!bugs.length) return toast.warning('⚠️ No data available to filter!');
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
    handleDelete,
    handleUpdate,
    exportJSON: () => exportAsJSON(sortByScenario(bugs)),
    handleOpenFilters,
  };
};

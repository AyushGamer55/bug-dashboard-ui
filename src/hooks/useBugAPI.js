import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext.jsx';

const API_BASE = import.meta.env.VITE_API_URL;

export const useBugAPI = (deviceId) => {
  const { token, isAuthenticated } = useAuth();

  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);

  const apiHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  useEffect(() => {
    if (!API_BASE || !isAuthenticated) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`, {
          headers: apiHeaders
        });
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        const data = await res.json();
        setBugs(data);
      } catch (err) {
        console.error(err);
        toast.error('❌ Failed to load bugs.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId, isAuthenticated, token]);

  const addBug = async (bug) => {
    try {
      const res = await fetch(`${API_BASE}/bugs`, {
        method: 'POST',
        headers: apiHeaders,
        body: JSON.stringify(bug)
      });
      if (!res.ok) throw new Error('Add failed');
      const added = await res.json();
      setBugs((prev) => [...prev, added]);
      toast.success('✅ Bug added!');
      return added;
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to add');
      throw err;
    }
  };

  const updateBug = async (id, updatedFields) => {
    try {
      const res = await fetch(`${API_BASE}/bugs/${id}`, {
        method: 'PATCH',
        headers: apiHeaders,
        body: JSON.stringify(updatedFields)
      });
      if (!res.ok) throw new Error('Update failed');
      const updatedBug = await res.json();
      setBugs((prev) => prev.map((b) => (b._id === id ? updatedBug : b)));
      toast.success('✅ Bug updated!');
      return updatedBug;
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to update');
      throw err;
    }
  };

  const deleteBug = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/bugs/${id}?deviceId=${deviceId}`, {
        method: 'DELETE',
        headers: apiHeaders
      });
      if (!res.ok) throw new Error('Delete failed');
      setBugs((prev) => prev.filter((b) => b._id !== id));
      toast.success('🗑️ Bug deleted');
    } catch (err) {
      console.error(err);
      toast.error('❌ Failed to delete');
      throw err;
    }
  };

  const resetAllBugs = async () => {
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
      throw err;
    }
  };

  return {
    bugs,
    loading,
    addBug,
    updateBug,
    deleteBug,
    resetAllBugs,
    setBugs
  };
};

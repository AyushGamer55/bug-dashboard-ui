import { useState } from 'react';
import { toast } from 'react-toastify';
import Papa from 'papaparse';
import { isValidBug } from '../utils/bugUtils';

const API_BASE = import.meta.env.VITE_API_URL;

export const useBugFiles = (deviceId, token, onBugsUpdate) => {
  const [fileLoading, setFileLoading] = useState(false);

  const apiHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileLoading(true);
    const reader = new FileReader();

    const processUpload = async (data) => {
      try {
        // Normalize field names to match expected casing
        const normalizeKey = (key) => {
          const trimmed = key.trim();
          const lower = trimmed.toLowerCase();
          if (lower === 'scenarioid') return 'ScenarioID';
          if (lower === 'testcaseid') return 'Category';
          if (lower === 'description') return 'Description';
          if (lower === 'status') return 'Status';
          if (lower === 'priority') return 'Priority';
          if (lower === 'severity') return 'Severity';
          if (lower === 'precondition') return 'PreCondition';
          if (lower === 'stepstoexecute') return 'StepsToExecute';
          if (lower === 'expectedresult') return 'ExpectedResult';
          if (lower === 'actualresult') return 'ActualResult';
          if (lower === 'comments') return 'Comments';
          if (lower === 'suggestiontofix') return 'SuggestionToFix';
          return trimmed;
        };

        const cleaned = Array.isArray(data)
          ? data.map((row) => ({
              ...Object.fromEntries(
                Object.entries(row || {}).map(([k, v]) => [normalizeKey(k), typeof v === 'string' ? v.trim() : v])
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

        // Refresh bugs list
        const res = await fetch(`${API_BASE}/bugs?deviceId=${deviceId}`, { headers: apiHeaders });
        const allBugs = await res.json();
        onBugsUpdate(allBugs);

        toast.success(`✅ ${file.name} uploaded!`);
      } catch (err) {
        console.error(err);
        toast.error('❌ Failed to upload file.');
      } finally {
        setFileLoading(false);
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
    } else {
      toast.error('❌ Upload JSON or CSV only');
      setFileLoading(false);
    }
  };

  return {
    fileLoading,
    handleFile
  };
};

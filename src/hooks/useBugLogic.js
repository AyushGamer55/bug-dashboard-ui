import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import Papa from 'papaparse'
import { exportAsJSON } from '../utils/exportUtils'
import { isValidBug } from '../utils/bugUtils'

const API_BASE = import.meta.env.VITE_API_URL;

export const useBugLogic = () => {
  const [bugs, setBugs] = useState([])
  const [editMode, setEditMode] = useState(false)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBug, setNewBug] = useState({
    ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
    Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '',
    ActualResult: '', Comments: '', SuggestionToFix: ''
  })

  const justUploadedRef = useRef(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API_BASE}/bugs`)
        const data = await res.json()
        const sorted = data.sort((a, b) => a.ScenarioID.localeCompare(b.ScenarioID))
        setBugs(sorted)

        if (justUploadedRef.current) {
          justUploadedRef.current = false
        } else {
          toast.info("🔄 Page refreshed successfully")
        }

      } catch (err) {
        console.error("Failed to fetch bugs:", err)
        toast.error("Failed to load bugs.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleFile = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()

    const processUpload = async (data) => {
      try {
        if (!Array.isArray(data) || !data.every(isValidBug)) {
          toast.error("❌ Invalid File format!")
          return
        }

        await Promise.all(data.map(bug =>
          fetch(`${API_BASE}/bugs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bug)
          })
        ))

        justUploadedRef.current = true

        const res = await fetch(`${API_BASE}/bugs`)
        const allBugs = await res.json()
        const sorted = allBugs.sort((a, b) => a.ScenarioID.localeCompare(b.ScenarioID))
        setBugs(sorted)

        toast.success(`✅ ${file.name.endsWith('.json') ? 'JSON' : 'CSV'} uploaded!`)

      } catch (err) {
        console.error(err)
        toast.error("❌ Failed to upload file.")
      }
    }

    if (file.name.endsWith('.json')) {
      reader.onload = ev => {
        try {
          const data = JSON.parse(ev.target.result)
          processUpload(data)
        } catch (err) {
          toast.error("❌ Failed to parse JSON File")
        }
      }
      reader.readAsText(file)

    } else if (file.name.endsWith('.csv')) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => processUpload(results.data),
        error: err => {
          console.error("CSV Error:", err)
          toast.error("❌ Failed to parse CSV File")
        }
      })
    } else {
      toast.error("❌ Please upload a JSON or CSV file only")
    }
  }

  const exportJSON = () => exportAsJSON(bugs)

  const resetAll = () => {
    if (!window.confirm("Are you sure you want to delete ALL bugs?")) return

    fetch(`${API_BASE}/bugs/delete-all`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setBugs([])
        toast.success("🧨 All bugs deleted from backend!")
      })
      .catch(err => {
        console.error("❌ Failed to reset all bugs:", err)
        toast.error("❌ Failed to reset bugs")
      })
  }

  const handleAddBug = () => {
  setLoading(true)
  fetch(`${API_BASE}/bugs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newBug)
  })
    .then(res => {
      if (!res.ok) throw new Error("Network response was not ok")
      return res.json()
    })
    .then(addedBug => {
      setBugs(prev => [...prev, addedBug])
      setNewBug({
        ScenarioID: '', TestCaseID: '', Description: '', Status: '', Priority: '',
        Severity: '', PreCondition: '', StepsToExecute: '', ExpectedResult: '',
        ActualResult: '', Comments: '', SuggestionToFix: ''
      })
      setShowAddForm(false)
      toast.success("✅ Bug added successfully!")
    })
    .catch(err => {
      console.error("Failed to add bug:", err)
      toast.error("❌ Failed to add bug")
    })
    .finally(() => setLoading(false))
}
  
  const handleDelete = (id) => {
    setLoading(true)
    fetch(`${API_BASE}/bugs/${id}`, { method: 'DELETE' })
      .then(() => {
        setBugs(prev => prev.filter(bug => bug._id !== id))
        toast.success("🗑️ Bug deleted!")
      })
      .catch(err => {
        console.error("Failed to delete bug:", err)
        toast.error("❌ Failed to delete bug.")
      })
      .finally(() => setLoading(false))
  }

  const handleUpdate = async (id, updatedFields) => {
  const previousBugs = [...bugs];
  setBugs(prev =>
    prev.map(bug => bug._id === id ? { ...bug, ...updatedFields } : bug)
  );

  try {
    const res = await fetch(`${API_BASE}/bugs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedFields)
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update bug: ${res.status} ${res.statusText} - ${errorText}`);
    }

    const updatedBug = await res.json();
    setBugs(prev =>
      prev.map(bug => bug._id === id ? updatedBug : bug)
    );
    toast.success("✅ Bug updated successfully!");

  } catch (err) {
    console.error("Update failed:", err);
    toast.error(`❌ Update failed: ${err.message}`);
    setBugs(previousBugs); 
  }
};

  return {
    bugs, editMode, search, loading, showAddForm, newBug,
    setSearch, setEditMode, setShowAddForm, setNewBug,
    handleFile, handleAddBug, resetAll, exportJSON, handleDelete,
    handleUpdate
  }
}

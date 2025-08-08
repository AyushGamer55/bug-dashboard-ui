import { useState, useEffect, useRef } from 'react'
import { toast } from 'react-toastify'
import Papa from 'papaparse'
import { exportAsJSON } from '../utils/exportUtils'
import { isValidBug } from '../utils/bugUtils'

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

  // ✅ Fetch on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch('http://localhost:5000/api/bugs')
        const data = await res.json()
        const sorted = data.sort((a, b) => a.ScenarioID.localeCompare(b.ScenarioID))
        setBugs(sorted)

        if (justUploadedRef.current) {
          justUploadedRef.current = false // reset flag
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

  // ✅ Import Handler
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
          fetch('http://localhost:5000/api/bugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bug)
          })
        ))

        justUploadedRef.current = true // ✅ sets before re-fetching

        const res = await fetch('http://localhost:5000/api/bugs')
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

  // ✅ JSON Export
  const exportJSON = () => exportAsJSON(bugs)

  // ✅ Reset all from backend
  const resetAll = () => {
    if (!window.confirm("Are you sure you want to delete ALL bugs?")) return

    fetch('http://localhost:5000/api/bugs/delete-all', { method: 'DELETE' })
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

  // ✅ Add bug
  const handleAddBug = () => {
    setLoading(true)
    fetch('http://localhost:5000/api/bugs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBug)
    })
      .then(res => res.json())
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

  // ✅ Delete bug
  const handleDelete = (id) => {
    setLoading(true)
    fetch(`http://localhost:5000/api/bugs/${id}`, { method: 'DELETE' })
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

  // ✅ Update bug
  const handleUpdate = (id, updatedFields) => {
  setBugs(prev =>
    prev.map(bug =>
      bug._id === id ? { ...bug, ...updatedFields } : bug
    )
  )
}


  return {
    bugs, editMode, search, loading, showAddForm, newBug,
    setSearch, setEditMode, setShowAddForm, setNewBug,
    handleFile, handleAddBug, resetAll, exportJSON, handleDelete,
    handleUpdate
  }
}

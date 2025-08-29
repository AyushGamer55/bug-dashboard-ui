import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import Header from "../components/Header.jsx"; 
import cyberpunkVideo from "../assets/cyberpunk-bg.mp4";

export default function Dashboard() {
  const { token, user, logout } = useAuth();
  const [deviceId, setDeviceId] = useState(() => localStorage.getItem("deviceId") || "test-device-1");
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createForm, setCreateForm] = useState({
    ScenarioID: "",
    TestCaseID: "",
    Description: "",
    StepsToExecute: ""
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  useEffect(() => {
    localStorage.setItem("deviceId", deviceId);
    if (token) loadBugs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, token]);

  const loadBugs = async () => {
    if (!deviceId) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/bugs`, { params: { deviceId }, ...authHeaders() });
      setBugs(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to load bugs");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    try {
      const payload = {
        deviceId,
        ScenarioID: createForm.ScenarioID,
        TestCaseID: createForm.TestCaseID,
        Description: createForm.Description,
        StepsToExecute: createForm.StepsToExecute.split("\n").map(s => s.trim()).filter(Boolean)
      };
      const res = await api.post("/bugs", payload, authHeaders());
      setBugs(prev => [res.data, ...prev]);
      setSuccessMsg("Bug created");
      setCreateForm({ ScenarioID: "", TestCaseID: "", Description: "", StepsToExecute: "" });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to create bug";
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.delete(`/bugs/${id}`, { params: { deviceId }, ...authHeaders() });
      setBugs(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <video src={cyberpunkVideo} autoPlay muted loop className="fixed inset-0 w-full h-full object-cover z-0" />
      <div className="relative z-10 backdrop-blur-sm bg-black/30 min-h-screen">
        <Header />

        <main className="p-6 max-w-5xl mx-auto">
          <div className="flex gap-4 items-center mb-6">
            <label className="text-sm text-gray-300">Device ID:</label>
            <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)}
                   className="p-2 rounded bg-gray-900 text-white outline-none" />
            <button onClick={() => { localStorage.removeItem("deviceId"); logout(); }}
                    className="ml-auto bg-red-600 px-3 py-1 rounded">Logout</button>
          </div>

          <section className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <form className="bg-black/60 p-4 rounded" onSubmit={handleCreate}>
              <h3 className="font-semibold mb-2">Quick Add Bug</h3>
              <input placeholder="ScenarioID" value={createForm.ScenarioID}
                     onChange={(e)=>setCreateForm({...createForm, ScenarioID: e.target.value})}
                     className="w-full p-2 mb-2 rounded bg-gray-900" />
              <input placeholder="TestCaseID" value={createForm.TestCaseID}
                     onChange={(e)=>setCreateForm({...createForm, TestCaseID: e.target.value})}
                     className="w-full p-2 mb-2 rounded bg-gray-900" />
              <textarea placeholder="Description" value={createForm.Description}
                        onChange={(e)=>setCreateForm({...createForm, Description: e.target.value})}
                        className="w-full p-2 mb-2 rounded bg-gray-900" />
              <textarea placeholder="Steps (one per line)" value={createForm.StepsToExecute}
                        onChange={(e)=>setCreateForm({...createForm, StepsToExecute: e.target.value})}
                        className="w-full p-2 mb-2 rounded bg-gray-900" rows={4} />
              <button type="submit" className="bg-green-600 px-3 py-1 rounded">Create Bug</button>
              {successMsg && <p className="text-green-300 mt-2">{successMsg}</p>}
              {error && <p className="text-red-400 mt-2">{error}</p>}
            </form>

            <div className="bg-black/60 p-4 rounded">
              <h3 className="font-semibold mb-3">Latest bugs</h3>
              {loading ? <p>Loading...</p> : (
                <>
                  {bugs.length === 0 && <p className="text-gray-400">No bugs for this device yet.</p>}
                  <ul className="space-y-3 max-h-80 overflow-auto">
                    {bugs.map(b => (
                      <li key={b._id} className="p-3 bg-gray-900 rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm text-gray-300">{b.ScenarioID || "—"} • {b.TestCaseID || "—"}</div>
                            <div className="font-medium">{b.Description}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(b.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button onClick={() => handleDelete(b._id)} className="text-sm bg-red-600 px-2 py-1 rounded">Delete</button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

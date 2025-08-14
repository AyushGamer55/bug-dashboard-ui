// src/components/SummaryModal.jsx
import React, { useMemo, useRef, useEffect } from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  BarElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

function Section({ title, obj }) {
  const entries = Object.entries(obj || {});
  return (
    <div className="glass p-4 border border-cyan-500">
      <h3 className="text-lg font-semibold text-cyan-300 mb-2">{title}</h3>
      {entries.length === 0 ? (
        <div className="text-sm text-gray-400">No data</div>
      ) : (
        <ul className="space-y-1 text-sm">
          {entries.map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="text-gray-300">{k}</span>
              <span className="font-semibold text-cyan-200">{v}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SummaryModal({
  open,
  onClose,
  summary,
  mode,
  setMode
}) {
  const overlayRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const statusData = useMemo(() => {
    const labels = Object.keys(summary?.byStatus || {});
    const data = Object.values(summary?.byStatus || {});
    return {
      labels,
      datasets: [
        {
          label: 'By Status',
          data,
          backgroundColor: labels.map(() => 'rgba(0,255,255,0.6)'),
          borderColor: labels.map(() => 'rgba(0,255,255,1)'),
          borderWidth: 1
        }
      ]
    };
  }, [summary]);

  const priorityData = useMemo(() => {
    const labels = Object.keys(summary?.byPriority || {});
    const data = Object.values(summary?.byPriority || {});
    return {
      labels,
      datasets: [
        {
          label: 'By Priority',
          data,
          backgroundColor: labels.map(() => 'rgba(55, 99, 132, 0.6)'),
          borderColor: labels.map(() => 'rgba(55, 99, 132, 1)'),
          borderWidth: 1
        }
      ]
    };
  }, [summary]);

  const severityData = useMemo(() => {
    const labels = Object.keys(summary?.bySeverity || {});
    const data = Object.values(summary?.bySeverity || {});
    const colors = [
      'rgba(255, 99, 132, 0.6)',
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 206, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)'
    ];
    return {
      labels,
      datasets: [
        {
          label: 'By Severity',
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: labels.map((_, i) => colors[i % colors.length].replace('0.6', '1')),
          borderWidth: 1
        }
      ]
    };
  }, [summary]);

  const areaData = useMemo(() => {
    const labels = Object.keys(summary?.byArea || {});
    const data = Object.values(summary?.byArea || {});
    const greenShades = [
      'rgba(0, 255, 0, 0.7)',
      'rgba(0, 255, 128, 0.7)',
      'rgba(128, 255, 0, 0.7)',
      'rgba(50, 255, 100, 0.7)',
      'rgba(0, 200, 0, 0.7)',
      'rgba(0, 255, 180, 0.7)'
    ];
    return {
      labels,
      datasets: [
        {
          label: 'By Category',
          data,
          backgroundColor: labels.map((_, i) => greenShades[i % greenShades.length]),
          borderColor: labels.map((_, i) => greenShades[i % greenShades.length].replace('0.7', '1')),
          borderWidth: 1
        }
      ]
    };
  }, [summary]);

  const barOpts = {
    responsive: true,
    maintainAspectRatio: false
  };

  const horizontalBarOpts = {
    ...barOpts,
    indexAxis: 'y'
  };

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="glass animate-fadeIn w-full max-w-5xl p-5 border-2 border-cyan-500 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-cyan-300 drop-shadow-[0_0_10px_#0ff]">
            Bug Summary Report
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-red-600 hover:bg-red-500 text-white"
          >
            Close
          </button>
        </div>

        {/* Toggle */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-300">
            Total bugs: <span className="font-semibold text-cyan-200">{summary?.total ?? 0}</span>
          </div>
          <button
            onClick={() => setMode(mode === 'text' ? 'graph' : 'text')}
            className="btn bg-cyan-500 text-black hover:bg-cyan-400"
          >
            {mode === 'text' ? 'Switch to Graph View' : 'Switch to Text View'}
          </button>
        </div>

        {/* Body */}
        {mode === 'text' ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Section title="By Status"   obj={summary?.byStatus} />
            <Section title="By Priority" obj={summary?.byPriority} />
            <Section title="By Severity" obj={summary?.bySeverity} />
            <Section title="By Category"     obj={summary?.byArea} />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass p-4 border border-cyan-500">
              <Bar data={statusData} options={barOpts} height={220} />
            </div>
            <div className="glass p-4 border border-cyan-500">
              <Bar data={priorityData} options={barOpts} height={220} />
            </div>
            <div className="glass p-4 border border-cyan-500">
              <Pie data={severityData} />
            </div>
            <div className="glass p-4 border border-cyan-500 md:col-span-2">
              <Bar data={areaData} options={horizontalBarOpts} height={280} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


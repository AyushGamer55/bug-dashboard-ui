// src/utils/exportUtils.js
import { toast } from "react-toastify";
import Papa from "papaparse";

// Helper: flatten bug objects and remove unwanted fields
const cleanBugForExport = (bug) => {
  const flat = {};
  for (const key in bug) {
    if (["_id", "deviceId", "createdAt", "updatedAt", "__v"].includes(key)) continue; // skip metadata
    const val = bug[key];
    if (val && typeof val === "object") {
      flat[key] = JSON.stringify(val); // flatten nested objects
    } else {
      flat[key] = val ?? ""; // avoid undefined/null
    }
  }
  return flat;
};

// -------------------- JSON Export --------------------
export const exportAsJSON = (bugs) => {
  if (!bugs || bugs.length === 0) {
    toast.error("❌ No bugs found to export");
    return;
  }

  const cleaned = bugs.map(cleanBugForExport);

  const blob = new Blob([JSON.stringify(cleaned, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "bug_report.json";
  link.click();

  toast.success("✅ Bug report exported as JSON");
};

// -------------------- CSV Export (Table-Ready) --------------------
export const exportAsCSV = (bugs) => {
  if (!bugs || bugs.length === 0) {
    toast.error("❌ No bugs found to export");
    return;
  }

  try {
    // 1️⃣ Clean & flatten bugs
    const cleaned = bugs.map(cleanBugForExport);

    // 2️⃣ Auto-format headers: capitalize for neatness
    const formatted = cleaned.map((bug) => {
      const newBug = {};
      for (const key in bug) {
        // Capitalize first letter of header (ScenarioID -> ScenarioID, steps -> Steps)
        const prettyKey = key.charAt(0).toUpperCase() + key.slice(1);
        newBug[prettyKey] = bug[key];
      }
      return newBug;
    });

    // 3️⃣ Convert JSON → CSV (UTF-8 BOM so Excel reads correctly)
    const csv = Papa.unparse(formatted, {
      quotes: true,
    });
    const BOM = "\uFEFF"; // ensures Excel opens with UTF-8 encoding

    // 4️⃣ Trigger download
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bug_report.csv";
    link.click();

    toast.success("✅ Bug report exported as Table-Ready CSV");
  } catch (err) {
    console.error("CSV Export Error:", err);
    toast.error("❌ Failed to export CSV");
  }
};

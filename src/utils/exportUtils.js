import { toast } from "react-toastify"

export const exportAsJSON = (bugs) => {
  if (!bugs || bugs.length === 0) {
    toast.error("❌ No bugs found to export")
    return
  }

  const blob = new Blob([JSON.stringify(bugs, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "bug_report.json"
  link.click()

  toast.success("✅ Bug report exported successfully")
}

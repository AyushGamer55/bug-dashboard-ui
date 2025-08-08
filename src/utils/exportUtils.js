export const exportAsJSON = (bugs) => {
  const blob = new Blob([JSON.stringify(bugs, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "bug_report.json"
  link.click()
}
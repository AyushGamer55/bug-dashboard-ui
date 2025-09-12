export const isValidBug = (bug) => {
  if (!bug || typeof bug !== "object") return false

  const fields = [
    "ScenarioID",
    "Category",
    "Description",
    "Status",
    "Priority",
    "Severity",
    "PreCondition",
    "StepsToExecute",
    "ExpectedResult",
    "ActualResult",
    "Comments",
    "SuggestionToFix"
  ]

  // At least one field should be non-empty
  return fields.some(
    field =>
      bug[field] !== undefined &&
      bug[field] !== null &&
      bug[field].toString().trim() !== ""
  )
}

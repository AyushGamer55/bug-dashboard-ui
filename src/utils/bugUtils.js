export const isValidBug = (bug) => {
  return (
    bug.ScenarioID &&
    bug.TestCaseID &&
    bug.Description &&
    bug.Status &&
    bug.Priority &&
    bug.Severity
  )
}
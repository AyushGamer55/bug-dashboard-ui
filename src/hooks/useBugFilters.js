import { useMemo } from 'react';
import { exportAsJSON, exportAsCSV } from '../utils/exportUtils';
import { normalizeValue, compareValues } from '../utils/Sorting';

// Sort bugs by ScenarioID
const sortByScenario = (arr) =>
  [...arr].sort((a, b) =>
    String(a.ScenarioID || '').localeCompare(String(b.ScenarioID || ''))
  );

export const useBugFilters = (bugs, search, sortField, sortOrder, filters) => {
  const filteredAndSortedBugs = useMemo(() => {
    // Filter bugs
    const filtered = bugs.filter((bug) => {
      const query = search.trim().toLowerCase();
      const matchesSearch = Object.values(bug).some((val) =>
        (val || "").toString().toLowerCase().includes(query)
      );

      const matchesFilters = Object.entries(filters).every(([key, values]) => {
        if (!values || values.length === 0) return true;
        const bugValue = normalizeValue(key, bug[key]);
        return values.some((val) => normalizeValue(key, val) === bugValue);
      });

      return matchesSearch && matchesFilters;
    });

    // Sort bugs
    const sorted = [...filtered].sort((a, b) => {
      const result = compareValues(sortField, a[sortField], b[sortField]);
      return sortOrder === "asc" ? result : -result;
    });

    return sorted;
  }, [bugs, search, sortField, sortOrder, filters]);

  const exportJSON = () => exportAsJSON(sortByScenario(bugs));
  const exportCSV = () => exportAsCSV(sortByScenario(bugs));

  return {
    filteredAndSortedBugs,
    exportJSON,
    exportCSV
  };
};

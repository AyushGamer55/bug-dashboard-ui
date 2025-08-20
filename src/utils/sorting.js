// src/utils/sorting.js
// 🔹 Normalization dictionary (adaptable to any style)
export const normalizeValue = (field, value) => {
  if (!value) return "";

  const v = value.toString().toLowerCase().trim();

  if (field === "Status") {
    if (v.includes("open")) return "Open";
    if (v.includes("progress") || v.includes("working")) return "In Progress";
    if (
      v.includes("close") ||
      v.includes("done") ||
      v.includes("fixed") ||
      v.includes("completed") ||
      v.includes("resolved") ||
      v.includes("finished")
    )
      return "Closed";
    if (v.includes("fail") || v.includes("error")) return "Failed";
    if (v.includes("pass") || v.includes("success")) return "Passed";
    return "Open";
  }

  if (field === "Priority") {
    if (v.startsWith("h") || v.includes("critical")) return "High";
    if (v.startsWith("m")) return "Medium";
    if (v.startsWith("l")) return "Low";
    return "Medium";
  }

  if (field === "Severity") {
    if (v.includes("critical") || v.includes("blocker") || v.includes("showstopper"))
      return "Critical";
    if (v.includes("major") || v.includes("significant") || v.includes("important"))
      return "Major";
    if (v.includes("minor") || v.includes("trivial") || v.includes("cosmetic"))
      return "Minor";
    return "Minor";
  }

  return value;
};

// 🔹 Fixed sorting order maps
export const SORT_ORDER = {
  Status: ["Open", "In Progress", "Failed", "Passed", "Closed"],
  Priority: ["High", "Medium", "Low"],
  Severity: ["Critical", "Major", "Minor"],
};

// 🔹 Compare function using normalization + order map
export const compareValues = (field, a, b) => {
  const normA = normalizeValue(field, a);
  const normB = normalizeValue(field, b);

  const order = SORT_ORDER[field];
  if (order) {
    const indexA = order.indexOf(normA);
    const indexB = order.indexOf(normB);

    return (indexA === -1 ? order.length : indexA) - (indexB === -1 ? order.length : indexB);
  }

  return normA.localeCompare(normB);
};

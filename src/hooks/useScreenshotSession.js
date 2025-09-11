// src/hooks/useScreenshotSession.js
import { useState, useEffect } from 'react';

const SCREENSHOTS_KEY = "screenshot_data";
const FETCHED_SCREENSHOTS_KEY = "fetched_screenshot_data";

function safeSessionStorageGetItem(key) {
  try {
    return sessionStorage.getItem(key);
  } catch (error) {
    console.warn("sessionStorage getItem error:", error);
    return null;
  }
}

function safeSessionStorageSetItem(key, value) {
  try {
    sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn("sessionStorage setItem error:", error);
  }
}

function safeSessionStorageRemoveItem(key) {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn("sessionStorage removeItem error:", error);
  }
}

export function useScreenshotSession() {
  const [screenshots, setScreenshots] = useState(() => {
    try {
      const saved = safeSessionStorageGetItem(SCREENSHOTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Error parsing screenshots from sessionStorage:", error);
      return [];
    }
  });

  const [fetchedScreenshots, setFetchedScreenshots] = useState(() => {
    try {
      const saved = safeSessionStorageGetItem(FETCHED_SCREENSHOTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.warn("Error parsing fetchedScreenshots from sessionStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    safeSessionStorageSetItem(SCREENSHOTS_KEY, JSON.stringify(screenshots));
  }, [screenshots]);

  useEffect(() => {
    safeSessionStorageSetItem(FETCHED_SCREENSHOTS_KEY, JSON.stringify(fetchedScreenshots));
  }, [fetchedScreenshots]);

  // Screenshots functions
  const addScreenshot = (screenshotOrArray) => {
    setScreenshots((prev) => {
      if (Array.isArray(screenshotOrArray)) {
        return [...prev, ...screenshotOrArray];
      } else {
        return [...prev, screenshotOrArray];
      }
    });
  };

  const removeScreenshot = (id) => {
    setScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateScreenshot = (id, updatedData) => {
    setScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  const clearScreenshots = () => {
    setScreenshots([]);
    setFetchedScreenshots([]);
    safeSessionStorageRemoveItem(SCREENSHOTS_KEY);
    safeSessionStorageRemoveItem(FETCHED_SCREENSHOTS_KEY);
  };

  // FetchedScreenshots functions
  const addFetchedScreenshot = (screenshotOrArray) => {
    setFetchedScreenshots((prev) => {
      if (Array.isArray(screenshotOrArray)) {
        const prefixed = screenshotOrArray.map((s) => ({
          ...s,
          id: s.id.startsWith("fetched-") ? s.id : "fetched-" + s.id,
        }));
        return [...prev, ...prefixed];
      } else {
        const prefixed = {
          ...screenshotOrArray,
          id: screenshotOrArray.id.startsWith("fetched-")
            ? screenshotOrArray.id
            : "fetched-" + screenshotOrArray.id,
        };
        return [...prev, prefixed];
      }
    });
  };

  const removeFetchedScreenshot = (id) => {
    setFetchedScreenshots((prev) => prev.filter((s) => s.id !== id));
  };

  const updateFetchedScreenshot = (id, updatedData) => {
    setFetchedScreenshots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedData } : s))
    );
  };

  const clearFetchedScreenshots = () => {
    setFetchedScreenshots([]);
    safeSessionStorageRemoveItem(FETCHED_SCREENSHOTS_KEY);
  };

  return {
    screenshots,
    addScreenshot,
    removeScreenshot,
    updateScreenshot,
    fetchedScreenshots,
    addFetchedScreenshot,
    removeFetchedScreenshot,
    updateFetchedScreenshot,
    clearScreenshots,
    clearFetchedScreenshots,
  };
}

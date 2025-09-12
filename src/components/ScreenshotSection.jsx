// src/components/ScreenshotSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { validateImageUrl, convertToDirectLink } from "../utils/validateurl";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import CategoryFolders from "./CategoryFolders";

function ScreenshotSection({
  openScreenshotUpload,
  onToggleUpload,
  categories = [],
  screenshots,
  addScreenshot,
  removeScreenshot,
  clearScreenshots,
  updateScreenshot,
  fetchedScreenshots,
  addFetchedScreenshot,
  removeFetchedScreenshot,
  updateFetchedScreenshot,
  clearFetchedScreenshots,
  theme,
}) {
  const [inputValue, setInputValue] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const textareaRef = useRef(null);
  const modalRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (openScreenshotUpload && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [openScreenshotUpload]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // New state to track if fetch has been done, initialize from sessionStorage
  const [hasFetched, setHasFetched] = useState(() => {
    try {
      return sessionStorage.getItem("hasFetchedFromCloudinary") === "true";
    } catch {
      return false;
    }
  });

  // Re-enable fetch button if fetchedScreenshots is empty
  useEffect(() => {
    if (fetchedScreenshots.length === 0 && hasFetched) {
      setHasFetched(false);
      try {
        sessionStorage.removeItem("hasFetchedFromCloudinary");
      } catch {}
    }
  }, [fetchedScreenshots, hasFetched]);

  const fetchFromCloudinary = async () => {
    setIsFetching(true);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/images`);
      const cloudinaryImages = response.data.map((img) => ({
        id: img.public_id,
        url: img.url,
        title: `Screenshot Image`,
        category: "",
        createdAt: img.created_at,
      }));

      // Filter out duplicates by url and id against both screenshots and fetchedScreenshots
      const existingUrls = new Set([
        ...screenshots.map((s) => s.url),
        ...fetchedScreenshots.map((fs) => fs.url),
      ]);
      const existingIds = new Set([
        ...screenshots.map((s) => s.id),
        ...fetchedScreenshots.map((fs) => fs.id),
      ]);
      const newImages = cloudinaryImages.filter(
        (img) => !existingUrls.has(img.url) && !existingIds.has(img.id)
      );

      if (newImages.length === 0) {
        toast.info("No new images to fetch from Cloudinary");
      } else {
        // Assign sequential titles to new images
        const numberedImages = newImages.map((img, index) => ({
          ...img,
          title: `Screenshot Image ${fetchedScreenshots.length + index + 1}`,
        }));
        addFetchedScreenshot(numberedImages);
        toast.success(`${newImages.length} images fetched from Cloudinary`);
      }

      // Disable fetch button after first fetch
      setHasFetched(true);
      try {
        sessionStorage.setItem("hasFetchedFromCloudinary", "true");
      } catch {}
    } catch (error) {
      console.error("Error fetching images from Cloudinary:", error);
      toast.error("Failed to fetch images from Cloudinary");
    } finally {
      setIsFetching(false);
    }
  };

  const handleAdd = async () => {
    const urls = inputValue
      .split(/[\n,]+/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      toast.error("Please enter at least one URL.");
      return;
    }

    const validScreenshots = [];
    for (let url of urls) {
      const result = await validateImageUrl(url);
      if (result.valid) {
        // Use converted URL for display
        const displayUrl = convertToDirectLink(url);
        validScreenshots.push({
          id: uuidv4(),
          url: displayUrl,
          title: `Screenshot ${
            screenshots.length + validScreenshots.length + 1
          }`,
          category: "",
          createdAt: new Date().toISOString(),
        });
      } else {
        toast.error(`Invalid image URL: ${url} - ${result.error}`);
      }
    }

    if (validScreenshots.length > 0) {
      addScreenshot(validScreenshots);
      toast.success(`${validScreenshots.length} image(s) added!`);
    }

    setInputValue("");
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));
    if (validFiles.length !== files.length) {
      toast.error("Only image files are allowed.");
      return;
    }

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        const newScreenshot = {
          id: uuidv4(),
          url: dataUrl,
          title: `Uploaded ${file.name}`,
          category: "",
          createdAt: new Date().toISOString(),
        };
        addScreenshot(newScreenshot);
      };
      reader.readAsDataURL(file);
    });

    toast.success(`${validFiles.length} image(s) uploaded!`);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    clearScreenshots();
    clearFetchedScreenshots();
    setHasFetched(false);
    try {
      sessionStorage.removeItem("hasFetchedFromCloudinary");
    } catch {}
    toast.info("All screenshots deleted");
    setShowConfirmModal(false);
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await modalRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error);
    }
  };

  // Merge screenshots and fetchedScreenshots, avoiding duplicates by url
  // Also prefix fetchedScreenshots ids with "fetched-" to ensure unique keys
  const mergedScreenshots = [
    ...screenshots.map((s) => ({
      ...s,
      id: s.id.startsWith("fetched-") ? s.id : "manual-" + s.id,
    })),
    ...fetchedScreenshots
      .filter((fs) => !screenshots.some((s) => s.url === fs.url))
      .map((fs) => ({
        ...fs,
        id: fs.id.startsWith("fetched-") ? fs.id : "fetched-" + fs.id,
      })),
  ];

  return (
    <>
      {openScreenshotUpload && (
        <div id="screenshots" className="glass p-4 rounded-md shadow-md mt-4">
          <h2 className="text-xl font-bold mb-3">📸 Screenshot Section</h2>
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste image URLs (comma or newline separated)"
            className="w-full p-2 border rounded-md mb-2 resize-none h-24 text-black bg-white"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="w-full p-2 border rounded-md mb-2 text-black bg-white"
          />
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleAdd}
              className="btn btn-glow bg-cyan-500 text-black hover:bg-cyan-400"
              disabled={isFetching}
            >
              Add Screenshots
            </button>

            <button
              onClick={() => setShowConfirmModal(true)}
              className="btn btn-glow bg-red-500 text-white hover:bg-red-400"
              disabled={isFetching}
            >
              Delete All Screenshots 🗑️
            </button>

            <button
              onClick={onToggleUpload}
              className="btn btn-glow bg-gray-500 text-white hover:bg-gray-400"
              disabled={isFetching}
            >
              Close ❌
            </button>

            <button
              onClick={fetchFromCloudinary}
              className="btn btn-glow bg-blue-500 text-white hover:bg-blue-400"
              disabled={isFetching || hasFetched}
            >
              {isFetching
                ? "Fetching..."
                : hasFetched
                ? "Fetched"
                : "Fetch from Cloudinary"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {mergedScreenshots.map((screenshot) => (
          <div
            key={`${
              screenshot.id.startsWith("fetched-")
                ? screenshot.id
                : "manual-" + screenshot.id
            }`}
            className="border rounded-md p-2 bg-white cursor-pointer hover:bg-gray-100 transition-colors duration-200"
          >
            <img
              src={screenshot.url}
              alt={screenshot.title}
              className="w-full h-32 object-contain"
              onClick={() => setPreviewUrl(screenshot.url)}
              onError={() =>
                toast.error("Cannot load image. Please check the URL.")
              }
            />
            <div className="text-sm mt-1 text-black">{screenshot.title}</div>
            <div className="text-xs text-black">
              <span
                className="cursor-pointer underline"
                onClick={() => {
                  setEditingCategoryId(screenshot.id);
                  setSelectedCategory(screenshot.category || "");
                }}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setEditingCategoryId(screenshot.id);
                    setSelectedCategory(screenshot.category || "");
                  }
                }}
                aria-label="Click to select category"
              >
                {screenshot.category || "No category"}
              </span>
              {editingCategoryId === screenshot.id && (
                <select
                  className="ml-2 text-xs text-black bg-white border border-gray-300 rounded"
                  value={selectedCategory}
                  onChange={(e) => {
                    const newCategory = e.target.value;
                    setSelectedCategory(newCategory);
                    // Update category for fetchedScreenshots or screenshots
                    if (screenshot.id.startsWith("fetched-")) {
                      updateFetchedScreenshot(screenshot.id, {
                        category: newCategory,
                      });
                    } else {
                      const originalId = screenshot.id.replace(/^manual-/, "");
                      updateScreenshot(originalId, {
                        category: newCategory,
                      });
                    }
                    setEditingCategoryId(null);
                    toast.success("Category updated");
                  }}
                  onBlur={() => setEditingCategoryId(null)}
                  autoFocus
                >
                  <option value="">No category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <button
              onClick={() => {
                if (screenshot.id.startsWith("fetched-")) {
                  removeFetchedScreenshot(screenshot.id);
                } else {
                  const originalId = screenshot.id.replace(/^manual-/, "");
                  removeScreenshot(originalId);
                }
              }}
              className="text-red-600 text-xs hover:text-red-800 hover:underline mt-1"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* CategoryFolders component below the screenshots grid */}
      <CategoryFolders
        screenshots={screenshots}
        fetchedScreenshots={fetchedScreenshots}
      />

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          className={`fixed inset-0 ${
            isFullscreen ? "bg-transparent" : "bg-black bg-opacity-70"
          } flex justify-center items-center z-50`}
        >
          <div
            ref={modalRef}
            className={`relative bg-white p-4 rounded-md shadow-lg max-w-full max-h-full overflow-auto ${
              isFullscreen ? "w-full h-full rounded-none" : ""
            }`}
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-10 text-xl font-bold text-black"
            >
              ⛶
            </button>
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-2 right-2 text-xl font-bold text-black"
            >
              ×
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className={`max-w-full ${
                isFullscreen ? "h-full object-contain" : "max-h-[80vh]"
              }`}
            />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div
            className={`rounded-md p-6 w-80 shadow-lg ${
              theme === "dark"
                ? "bg-[#1c1c2a] text-cyan-200 border border-cyan-500"
                : "bg-white text-black border border-gray-400"
            }`}
          >
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="text-sm mb-6">
              Are you sure you want to delete all screenshots? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className={`btn ${
                  theme === "dark"
                    ? "bg-gray-600 hover:bg-gray-500 text-cyan-200"
                    : "bg-gray-300 hover:bg-gray-400 text-black"
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleClear}
                className="btn bg-red-500 hover:bg-red-600 text-white"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ScreenshotSection;

import React, { useState, useRef, useEffect } from "react";

function CategoryFolders({ screenshots, fetchedScreenshots }) {
  // Combine screenshots and fetchedScreenshots, avoiding duplicates by url
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

  // Group by category
  const grouped = mergedScreenshots.reduce((acc, screenshot) => {
    const cat = screenshot.category || "No category";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(screenshot);
    return acc;
  }, {});

  // Filter categories with at least one screenshot
  const categoriesWithScreenshots = Object.entries(grouped).filter(
    ([cat, shots]) => shots.length > 0 && cat !== "No category"
  );

  // Hide the entire section if no categories with screenshots
  if (categoriesWithScreenshots.length === 0) {
    return null;
  }

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const modalRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const previewModalRef = useRef(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handlePreviewFullscreenChange = () => {
      setIsPreviewFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener(
      "fullscreenchange",
      handlePreviewFullscreenChange
    );
    return () =>
      document.removeEventListener(
        "fullscreenchange",
        handlePreviewFullscreenChange
      );
  }, []);

  const handleFolderClick = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setIsFullscreen(false);
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

  return (
    <>
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2 text-gray-500">
          📁 Category Folders
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {categoriesWithScreenshots.map(([category, shots]) => (
            <div
              key={category}
              className="border rounded-md p-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 flex flex-col items-center justify-center"
              onClick={() => handleFolderClick(category)}
            >
              <div className="text-2xl text-black dark:text-white">📁</div>
              <div className="text-sm font-medium text-black dark:text-white">
                {category}
              </div>
              <div className="text-xs text-black dark:text-white">
                {shots.length} screenshots
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && selectedCategory && (
        <div
          className={`fixed inset-0 ${
            isFullscreen ? "bg-transparent" : "bg-black bg-opacity-70"
          } flex justify-center items-center z-50`}
        >
          <div
            ref={modalRef}
            className={`relative bg-white dark:bg-gray-900 p-4 rounded-md shadow-lg max-w-full max-h-full overflow-auto ${
              isFullscreen ? "w-full h-full rounded-none" : ""
            }`}
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-2 right-10 text-2xl font-bold text-black dark:text-white hover:text-red-500 transition-colors"
            >
              ⛶
            </button>
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-2xl font-bold text-black dark:text-white hover:text-red-500 transition-colors"
            >
              X
            </button>
            <h4 className="text-lg font-bold mb-4 text-black dark:text-white">
              {selectedCategory} Screenshots
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
              {grouped[selectedCategory].map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="border rounded-md p-2 bg-white dark:bg-gray-900"
                >
                  <img
                    src={screenshot.url}
                    alt={screenshot.title}
                    className={`w-full ${
                      isFullscreen
                        ? "h-full object-contain"
                        : "h-32 object-contain"
                    }`}
                    onClick={() => {
                      setPreviewUrl(screenshot.url);
                      setIsPreviewFullscreen(true);
                    }}
                    style={{ cursor: "pointer" }}
                  />
                  <div className="text-sm mt-1 text-black dark:text-white">
                    {screenshot.title}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal for fullscreen image */}
      {previewUrl && (
        <div
          className={`fixed inset-0 ${
            isPreviewFullscreen ? "bg-transparent" : "bg-black bg-opacity-70"
          } flex justify-center items-center z-50`}
        >
          <div
            ref={previewModalRef}
            className={`relative bg-white dark:bg-gray-900 p-4 rounded-md shadow-lg max-w-full max-h-full overflow-auto ${
              isPreviewFullscreen ? "w-full h-full rounded-none" : ""
            }`}
          >
            <button
              onClick={async () => {
                try {
                  if (!document.fullscreenElement) {
                    await previewModalRef.current.requestFullscreen();
                  } else {
                    await document.exitFullscreen();
                  }
                } catch (error) {
                  console.error("Error toggling fullscreen:", error);
                }
              }}
              className="absolute top-2 right-10 text-3xl font-bold text-black dark:text-white hover:text-red-500 transition-colors"
            >
              ⛶
            </button>
            <button
              onClick={() => {
                setPreviewUrl(null);
                setIsPreviewFullscreen(false);
              }}
              className="absolute top-2 right-2 text-3xl font-bold text-black dark:text-white hover:text-red-500 transition-colors"
            >
              X
            </button>
            <img
              src={previewUrl}
              alt="Preview"
              className={`max-w-full ${
                isPreviewFullscreen ? "h-full object-contain" : "max-h-[80vh]"
              }`}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default CategoryFolders;

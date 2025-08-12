import React, { useEffect, useRef, useState } from "react";
import introVideo from "../assets/intro.mp4";

export default function VideoIntro({ onFinish }) {
  const videoRef = useRef(null);
  const [showSoundButton, setShowSoundButton] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.warn("Autoplay failed:", err);
      });
    }

    const handleEnded = () => {
      onFinish();
    };

    video.addEventListener("ended", handleEnded);
    return () => {
      video.removeEventListener("ended", handleEnded);
    };
  }, [onFinish]);

  const enableSound = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = false;
      video.play();
      setShowSoundButton(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
      <video
        ref={videoRef}
        src={introVideo}
        className="w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Controls overlay */}
      <div className="absolute bottom-6 flex gap-4">
        {showSoundButton && (
          <button
            onClick={enableSound}
            className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded font-semibold shadow-lg transition"
          >
            Enable Sound 🔊
          </button>
        )}
        <button
          onClick={onFinish}
          className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded font-semibold shadow-lg transition"
        >
          Skip Intro ⏩
        </button>
      </div>
    </div>
  );
}

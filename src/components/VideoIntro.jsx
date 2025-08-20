import React, { useEffect, useRef, useState } from "react";
import introVideo from "../assets/intro.webm";

export default function VideoIntro({ onFinish }) {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);

  const handleEndOrSkip = () => {
    if (videoRef.current) videoRef.current.pause();
    onFinish();
  };

  const enableSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = false;
      videoRef.current.play().catch(() => {});
      setMuted(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => console.warn("Autoplay prevented:", err));
    }

    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        enableSound();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
      onClick={handleEndOrSkip}
    >
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted
        playsInline
        onEnded={handleEndOrSkip}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-5 text-white text-sm opacity-70">
        Click anywhere to skip • Press Tab for sound
      </div>

      {/* Mobile Volume Button */}
      {muted && (
        <button
          onClick={enableSound}
          className="absolute bottom-12 right-5 bg-white/20 text-white px-3 py-1 rounded backdrop-blur-sm hover:bg-white/40 transition"
        >
          🔇Muted
        </button>
      )}
    </div>
  );
}


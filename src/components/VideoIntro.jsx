import React, { useEffect, useRef } from "react";
import introVideo from "../assets/intro.webm";

export default function VideoIntro({ onFinish }) {
  const videoRef = useRef(null);

  const handleEndOrSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    onFinish();
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.warn("Autoplay prevented:", err);
      });
    }

    // Keyboard shortcut: Press Tab to enable audio
    const handleKeyDown = (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        if (video) {
          video.muted = false;
          video.play();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
      onClick={handleEndOrSkip} // click anywhere to skip
    >
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        muted // starts muted so autoplay works
        playsInline
        onEnded={handleEndOrSkip}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-5 text-white text-sm opacity-70">
        Click anywhere to skip • Press Tab for sound
      </div>
    </div>
  );
}


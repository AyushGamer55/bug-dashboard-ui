import React, { useEffect, useState } from "react";
import introVideo from "../assets/intro.mp4"; // place your mp4 here

export default function VideoIntro({ onFinish }) {
  const [fade, setFade] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const hasSeenIntro = localStorage.getItem("hasSeenIntro");
    if (hasSeenIntro) {
      onFinish();
      return;
    }

    // play intro once, then mark in storage
    const timer = setTimeout(() => setFade(true), 5000);
    const finishTimer = setTimeout(() => {
      localStorage.setItem("hasSeenIntro", "true");
      onFinish();
    }, 5500);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 bg-black z-50 flex items-center justify-center transition-opacity duration-500 ${
        fade ? "opacity-0" : "opacity-100"
      }`}
    >
      <video
        src={introVideo}
        autoPlay
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
      />
      {/* Unmute Button */}
      {muted && (
        <button
          onClick={() => setMuted(false)}
          className="absolute bottom-5 right-5 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-red-400"
        >
          🔊 Unmute
        </button>
      )}
    </div>
  );
}

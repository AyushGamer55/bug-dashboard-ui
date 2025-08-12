// src/components/VideoIntro.jsx
import React, { useEffect, useRef } from "react";
import introVideo from "../assets/intro.mp4";

const VideoIntro = ({ onFinish }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;

    if (videoElement) {
      // Try to autoplay
      const playPromise = videoElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Autoplay prevented:", error);
        });
      }

      // Listen for video end
      videoElement.addEventListener("ended", handleFinish);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("ended", handleFinish);
      }
    };
  }, []);

  const handleFinish = () => {
    onFinish();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={introVideo}
        autoPlay
        playsInline
        unmuted
        controls={false}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoIntro;

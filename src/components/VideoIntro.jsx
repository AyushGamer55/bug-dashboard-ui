import React, { useEffect } from "react";

function VideoIntro({ onFinish }) {
  useEffect(() => {
    const video = document.getElementById("intro-video");
    if (video) {
      video.play().catch(() => {
        // If autoplay with audio is blocked, wait for click
        const startPlayback = () => {
          video.play();
          window.removeEventListener("click", startPlayback);
        };
        window.addEventListener("click", startPlayback);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <video
        id="intro-video"
        src="/intro.mp4"
        autoPlay
        playsInline
        className="w-full h-full object-cover"
        onEnded={onFinish}
      />
    </div>
  );
}

export default VideoIntro;

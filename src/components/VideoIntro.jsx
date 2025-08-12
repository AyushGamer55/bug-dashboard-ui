import React, { useEffect, useState } from "react";
import introVideo from "../assets/intro.mp4";

const VideoIntro = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Show intro only if user hasn't seen it in this browser session
    if (sessionStorage.getItem("seenIntro") === "true") {
      setShow(false);
      onFinish();
    }
  }, [onFinish]);

  const handleVideoEnd = () => {
    sessionStorage.setItem("seenIntro", "true");
    setShow(false);
    onFinish();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      <video
        src={introVideo}
        autoPlay
        muted={false} // set to true if you don’t want sound
        onEnded={handleVideoEnd}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default VideoIntro;

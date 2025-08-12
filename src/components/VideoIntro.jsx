import React, { useEffect, useState } from "react";
import introVideo from "../assets/intro.mp4";

const VideoIntro = ({ onFinish }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // If intro already played this session, skip it
    if (sessionStorage.getItem("seenIntro") === "true") {
      setShow(false);
      onFinish();
    }
  }, [onFinish]);

  const handleEndOrSkip = () => {
    sessionStorage.setItem("seenIntro", "true");
    setShow(false);
    onFinish();
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center cursor-pointer"
      onClick={handleEndOrSkip} // click anywhere to skip
    >
      <video
        src={introVideo}
        autoPlay
        muted={false} // set to true if you want it silent
        onEnded={handleEndOrSkip}
        className="w-full h-full object-cover"
      />
      <div className="absolute bottom-5 text-white text-sm opacity-70">
        Click to skip
      </div>
    </div>
  );
};

export default VideoIntro;

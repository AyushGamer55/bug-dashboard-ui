import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Lottie from "react-lottie-player";
import cyberpunkVideo from "../assets/cyberpunk-bg.mp4";
import checkmarkAnimation from "../assets/checkmark.json";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function PasswordReset() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) return setError("Passwords do not match");
    if (newPassword.length < 6) return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/reset-password`, { email, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen flex items-center justify-center overflow-hidden">
      <video
        src={cyberpunkVideo}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/55 z-10"></div>

      <div className="relative z-20 flex flex-col items-center gap-6">
        {!success ? (
          <form
            onSubmit={handleSubmit}
            className="bg-black/70 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-80 relative"
          >
            <h2 className="text-xl font-semibold text-center text-white mb-4">Reset Password</h2>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400"
              required
            />

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 rounded bg-gray-900 text-white outline-none w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-2 rounded bg-gray-900 text-white outline-none w-full pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showConfirm ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white py-2 rounded transition"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

            {error && <p className="text-red-400 text-sm">{error}</p>}
          </form>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Lottie animationData={checkmarkAnimation} loop={false} play style={{ width: 140, height: 140 }} />
            <p className="text-green-300">Password reset successful! Redirecting to login...</p>
          </div>
        )}
      </div>
    </div>
  );
}

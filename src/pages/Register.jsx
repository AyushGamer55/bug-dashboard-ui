import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "react-lottie-player";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import cyberpunkVideo from "../assets/cyberpunk-bg.mp4";
import WelcomeAnimation from "../assets/Welcome.json";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword)
      return setError("Passwords do not match");
    if (form.password.length < 6)
      return setError("Password must be at least 6 characters");

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: form.name,
          email: form.email,
          password: form.password,
        }
      );

      const data = res.data;
      login({ token: data.token, user: data.user });
      navigate("/dashboard");
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden flex items-center justify-center">
      <video
        src={cyberpunkVideo}
        autoPlay
        muted
        loop
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      <div className="absolute inset-0 bg-black/55 z-10"></div>

      <div className="relative z-20 flex flex-col items-center gap-6">
        <Lottie
          animationData={WelcomeAnimation}
          loop
          play
          style={{ width: 180, height: 180 }}
        />

        <form
          className="bg-black/70 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-80 relative"
          onSubmit={handleRegister}
        >
          <input
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400"
            required
          />

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400 w-full pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400 w-full pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showConfirmPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white py-2 rounded transition"
          >
            {loading ? "Creating..." : "Create account"}
          </button>

          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

          <p className="text-sm text-gray-300 text-center">
            Already have an account?{" "}
            <Link to="/login" className="underline hover:text-white">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

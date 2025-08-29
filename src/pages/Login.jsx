import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Lottie from "react-lottie-player";
import axios from "axios";
import { useAuth } from "../context/AuthContext.jsx";
import cyberpunkVideo from "../assets/cyberpunk-bg.mp4";
import loginAnimation from "../assets/Login.json";
import checkmarkAnimation from "../assets/checkmark.json";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [showCheckmark, setShowCheckmark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        form,
        { headers: { "Content-Type": "application/json" } }
      );

      const data = res.data;
      login({ token: data.token, user: data.user });

      setShowCheckmark(true);
      setTimeout(() => {
        setShowCheckmark(false);
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Login failed");
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
          animationData={loginAnimation}
          loop
          play
          style={{ width: 200, height: 200 }}
        />

        <form
          className="bg-black/70 p-8 rounded-2xl shadow-lg flex flex-col gap-4 w-80 relative"
          onSubmit={handleLogin}
        >
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-2 rounded bg-gray-900 text-white outline-none placeholder-gray-400"
            required
          />

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

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white py-2 rounded transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {error && <p className="text-red-400 text-sm mt-1">{error}</p>}

          <p className="text-sm text-gray-300 mt-2 text-center">
            <Link to="/reset-password" className="underline hover:text-white">
              Forgot Password?
            </Link>
          </p>
          <p className="text-sm text-gray-300 text-center">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="underline hover:text-white">
              Register
            </Link>
          </p>
        </form>

        {showCheckmark && (
          <Lottie
            animationData={checkmarkAnimation}
            loop={false}
            play
            style={{ width: 140, height: 140 }}
          />
        )}
      </div>
    </div>
  );
}

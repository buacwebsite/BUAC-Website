"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import { HiArrowLeft, HiEye, HiEyeOff } from "react-icons/hi";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("Reset token missing.");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post("/api/auth/reset-password", {
        token,
        password,
      });

      setMessage(res.data.message || "Password reset successful.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to reset password.");
      } else {
        setError("Failed to reset password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen -mt-16 flex items-center justify-center bg-black px-4 py-24">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl"
      >
        <Link
          href="/login"
          className="mb-6 inline-flex items-center gap-2 text-sm text-white/50 hover:text-accent"
        >
          <HiArrowLeft />
          Back to Login
        </Link>

        <h1 className="font-bebasNeue text-5xl text-white tracking-wider">
          Reset Password
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Enter your new password below.
        </p>

        <div className="relative mt-6">
          <input
            type={showPassword ? "text" : "password"}
            required
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-13 w-full rounded-xl border border-white/10 bg-black/40 px-4 pr-12 text-white outline-none focus:border-accent"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent"
          >
            {showPassword ? <HiEye /> : <HiEyeOff />}
          </button>
        </div>

        <div className="relative mt-4">
          <input
            type={showConfirm ? "text" : "password"}
            required
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="h-13 w-full rounded-xl border border-white/10 bg-black/40 px-4 pr-12 text-white outline-none focus:border-accent"
          />

          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-accent"
          >
            {showConfirm ? <HiEye /> : <HiEyeOff />}
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
            {message}
            <div className="mt-2">
              <Link href="/login" className="text-accent hover:underline">
                Go to login
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent/90 disabled:opacity-60"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </motion.form>
    </div>
  );
}
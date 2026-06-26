"use client";

import { useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import { HiArrowLeft, HiMail } from "react-icons/hi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setMessage(res.data.message || "Reset link sent if account exists.");
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Failed to send reset link.");
      } else {
        setError("Failed to send reset link.");
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
          Forgot Password
        </h1>

        <p className="mt-2 text-sm text-white/50">
          Enter your email and we will send you a password reset link.
        </p>

        <div className="relative mt-6">
          <input
            type="email"
            required
            placeholder="Your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-13 w-full rounded-xl border border-white/10 bg-black/40 px-4 pr-12 text-white outline-none focus:border-accent"
          />

          <HiMail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-300">
            {message}
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
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </motion.form>
    </div>
  );
}
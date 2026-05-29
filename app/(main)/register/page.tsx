"use client";

import { useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import { FaMountain, FaGraduationCap } from "react-icons/fa";
import { FaPaperPlane } from "react-icons/fa6";

type RoleType = "member" | "alumni";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RoleType>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (res.status === 201) {
        window.location.href = "/";
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Registration failed");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bebasNeue text-accent tracking-wider mb-2">
            Be an Adventurer
          </h1>
          <p className="text-text-muted">
            Create your BUAC account and start exploring
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setRole("member")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              role === "member"
                ? "border-accent bg-accent/10 text-accent scale-105 shadow-lg shadow-accent/20"
                : "border-text-muted/20 text-text-muted hover:border-text-muted/40"
            }`}
          >
            <FaMountain className="text-xl" />
            <div className="text-left">
              <div className="font-semibold text-sm">Member</div>
              <div className="text-xs opacity-70">Active adventurer</div>
            </div>
          </button>

          <button
            onClick={() => setRole("alumni")}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
              role === "alumni"
                ? "border-blue-500 bg-blue-500/10 text-blue-500 scale-105 shadow-lg shadow-blue-500/20"
                : "border-text-muted/20 text-text-muted hover:border-text-muted/40"
            }`}
          >
            <FaGraduationCap className="text-xl" />
            <div className="text-left">
              <div className="font-semibold text-sm">Alumni</div>
              <div className="text-xs opacity-70">Former member</div>
            </div>
          </button>
        </div>

        {/* Registration Form */}
        <div className="bg-background border-2 border-accent/20 p-8 rounded-2xl shadow-2xl">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Full Name
              </label>
              <input
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className="w-full px-4 py-3 rounded-xl bg-text-secondary/5 border border-text-muted/20 text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Email Address
              </label>
              <input
                type="email"
                placeholder={
                  role === "member"
                    ? "name@g.bracu.ac.bd"
                    : "alumni@email.com"
                }
                autoComplete="email"
                className="w-full px-4 py-3 rounded-xl bg-text-secondary/5 border border-text-muted/20 text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Password
              </label>
              <input
                type="password"
                placeholder="Min 6 characters"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-text-secondary/5 border border-text-muted/20 text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-muted mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-3 rounded-xl bg-text-secondary/5 border border-text-muted/20 text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                "Creating Account..."
              ) : (
                <>
                  Create Account <FaPaperPlane />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-muted text-sm">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-accent hover:underline font-semibold"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-text-muted hover:text-accent text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
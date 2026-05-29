"use client";

import { useState } from "react";
import Link from "next/link";
import axios, { AxiosError } from "axios";
import {
  FaMountain,
  FaUserTie,
  FaGraduationCap,
  FaShieldAlt,
} from "react-icons/fa";

type RoleType = "member" | "alumni" | "admin";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<RoleType>("member");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: "member" as RoleType,
      label: "Member",
      icon: <FaMountain className="text-xl" />,
      description: "Active club member",
      color: "from-accent to-orange-600",
    },
    {
      id: "alumni" as RoleType,
      label: "Alumni",
      icon: <FaGraduationCap className="text-xl" />,
      description: "Former member",
      color: "from-blue-500 to-blue-700",
    },
    {
      id: "admin" as RoleType,
      label: "Admin",
      icon: <FaShieldAlt className="text-xl" />,
      description: "Administrator",
      color: "from-red-500 to-red-700",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        email,
        password,
        role,
      });

      if (res.status === 200) {
        window.location.href = "/";
      }
    } catch (err) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || "Invalid credentials");
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  const activeRole = roles.find((r) => r.id === role)!;

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bebasNeue text-text-secondary tracking-wider mb-2">
            Welcome Back
          </h1>
          <p className="text-text-muted">
            Sign in to your BUAC account
          </p>
        </div>

        {/* Role Selector */}
        <div className="flex gap-2 mb-6">
          {roles.map((r) => (
            <button
              key={r.id}
              onClick={() => {
                setRole(r.id);
                setError("");
              }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                role === r.id
                  ? "border-accent bg-accent/10 text-accent scale-105"
                  : "border-text-muted/20 text-text-muted hover:border-text-muted/40"
              }`}
            >
              {r.icon}
              <span className="text-xs font-semibold">{r.label}</span>
            </button>
          ))}
        </div>

        {/* Login Form */}
        <div
          className={`bg-linear-to-br ${activeRole.color} p-[2px] rounded-2xl shadow-2xl`}
        >
          <div className="bg-background p-8 rounded-2xl">
            <div className="flex items-center gap-2 mb-6">
              <FaUserTie className="text-accent text-xl" />
              <h2 className="text-lg font-semibold text-text-secondary">
                {activeRole.label} Login
              </h2>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-text-muted mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
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
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-xl bg-text-secondary/5 border border-text-muted/20 text-text-secondary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Register Link */}
            {role !== "admin" && (
              <div className="mt-6 text-center">
                <p className="text-text-muted text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-accent hover:underline font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </div>
            )}
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

export default Login;
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
import { motion } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bebasNeue text-text-secondary tracking-wider mb-2">
            Welcome Back
          </h1>
          <p className="text-text-muted">Sign in to your BUAC account</p>
        </motion.div>

        {/* Role Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="flex gap-2 mb-6"
        >
          {roles.map((r) => (
            <motion.button
              key={r.id}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          ))}
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`bg-linear-to-br ${activeRole.color} p-[2px] rounded-2xl shadow-2xl`}
        >
          <div className="bg-background p-8 rounded-2xl">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.3 }}
              className="flex items-center gap-2 mb-6"
            >
              <FaUserTie className="text-accent text-xl" />
              <h2 className="text-lg font-semibold text-text-secondary">
                {activeRole.label} Login
              </h2>
            </motion.div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
              >
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
              </motion.div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.2 }}
                  className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.97 }}
                className="w-full px-4 py-3 bg-accent text-white font-semibold rounded-xl hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
              >
                {loading ? "Signing in..." : "Sign In"}
              </motion.button>
            </form>

            {/* Register Link */}
            {role !== "admin" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="mt-6 text-center"
              >
                <p className="text-text-muted text-sm">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-accent hover:underline font-semibold"
                  >
                    Create Account
                  </Link>
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.3 }}
          className="mt-6 text-center"
        >
          <Link
            href="/"
            className="text-text-muted hover:text-accent text-sm transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
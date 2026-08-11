"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { motion } from "framer-motion";
import { FaFacebook, FaInstagram, FaLinkedin } from "react-icons/fa6";
import {
  HiArrowRight,
  HiEye,
  HiEyeOff,
  HiMail,
  HiShieldCheck,
} from "react-icons/hi";
import { FaMountain } from "react-icons/fa";
import { HiAcademicCap } from "react-icons/hi2";

type RoleType = "member" | "alumni" | "admin";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const AppInput = ({ icon, className = "", ...rest }: AppInputProps) => {
  return (
    <div className="relative w-full">
      <input
        className={`h-12 sm:h-13 w-full rounded-xl border-2 border-white/15 bg-black/50 px-4 pr-11 text-[15px] sm:text-sm font-light text-white outline-none transition-all duration-200 placeholder:text-white/45 focus:border-accent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        {...rest}
      />
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/55">
          {icon}
        </div>
      )}
    </div>
  );
};

const Login = () => {
  const [role, setRole] = useState<RoleType>("member");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const socialIcons = [
    {
      icon: <FaInstagram />,
      href: "https://instagram.com/brac_university_adventure_club",
    },
    {
      icon: <FaLinkedin />,
      href: "https://linkedin.com/company/buac",
    },
    {
      icon: <FaFacebook />,
      href: "https://facebook.com/buacofficial",
    },
  ];

  const roles = [
    { id: "member" as RoleType, label: "Member", icon: <FaMountain /> },
    { id: "alumni" as RoleType, label: "Alumni", icon: <HiAcademicCap /> },
    { id: "admin" as RoleType, label: "Admin", icon: <HiShieldCheck /> },
  ];

  const getEmailPlaceholder = () => {
    if (role === "member") return "G Suite Email";
    if (role === "alumni") return "Gmail Address";
    return "Admin Email";
  };

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
        email: email.trim().toLowerCase(),
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

  return (
    <div className="auth-shell buac-gradient-bg relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden px-3 py-20 sm:px-6 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-black/60 shadow-2xl backdrop-blur-2xl sm:rounded-3xl"
      >
        <form
          className="relative z-10 grid gap-4 p-5 text-center sm:gap-5 sm:p-8 md:p-10"
          onSubmit={handleSubmit}
        >
          <Link href="/" className="mx-auto block">
            <Image
              src="/assets/logos/buac.webp"
              alt="BUAC Logo"
              width={56}
              height={56}
              className="mx-auto object-contain sm:h-[62px] sm:w-[62px]"
            />
          </Link>

          <div>
            <h1 className="font-bebasNeue text-4xl tracking-wider text-white sm:text-6xl">
              Sign In
            </h1>
            <p className="mt-1 text-xs text-white/70 sm:text-sm">
              Welcome back to BRAC University Adventure Club
            </p>
          </div>

          <div className="flex items-center justify-center">
            <ul className="flex gap-3">
              {socialIcons.map((social, index) => (
                <li key={index}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative z-[1] flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border-2 border-accent/50 bg-white/5 sm:h-11 sm:w-11"
                  >
                    <div className="absolute inset-0 h-full w-full origin-bottom scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100" />
                    <span className="z-[2] text-lg text-white/80 transition-all duration-500 group-hover:text-white sm:text-xl">
                      {social.icon}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {roles.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setRole(item.id);
                  setError("");
                }}
                className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs transition-all ${
                  role === item.id
                    ? "border-accent bg-accent text-white"
                    : "border-white/15 bg-white/5 text-white/70 hover:border-accent/50 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          <AppInput
            placeholder={getEmailPlaceholder()}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            icon={<HiMail className="h-5 w-5" />}
          />

          <AppInput
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer text-white/70 transition-colors hover:text-accent"
              >
                {showPassword ? (
                  <HiEye className="h-5 w-5" />
                ) : (
                  <HiEyeOff className="h-5 w-5" />
                )}
              </button>
            }
          />

          <div className="flex items-center justify-between">
            <Link
              href="/forgot-password"
              className="text-xs text-white/70 transition-colors hover:text-accent sm:text-sm"
            >
              Forgot password?
            </Link>

            {role !== "admin" && (
              <Link
                href="/register"
                className="text-xs text-white/70 transition-colors hover:text-accent sm:text-sm"
              >
                Create account
              </Link>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-red-500/40 bg-red-500/15 p-3 text-xs text-red-300 sm:text-sm"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-accent px-6 py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/80 border-t-transparent" />
              ) : (
                <>
                  Sign In <HiArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>

          <Link
            href="/"
            className="text-xs text-white/50 transition-colors hover:text-accent"
          >
            ← Back to Home
          </Link>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
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
import GoogleAuthButton from "@/app/components/GoogleAuthButton";

type RoleType = "member" | "alumni" | "admin";

interface AppInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

const AppInput = ({ icon, className = "", ...rest }: AppInputProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left });
  };

  return (
    <div className="relative w-full">
      <input
        className={`peer relative z-10 h-13 w-full rounded-xl border-2 border-white/12 bg-black/35 px-4 pr-11 font-light text-white outline-none transition-all duration-200 placeholder:text-white/35 focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        {...rest}
      />
      {isHovering && (
        <>
          <div
            className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-[2px] rounded-t-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[2px] rounded-b-xl"
            style={{
              background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, var(--color-accent) 0%, transparent 70%)`,
            }}
          />
        </>
      )}
      {icon && (
        <div className="absolute right-3 top-1/2 z-20 -translate-y-1/2 text-white/50">
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
  const [isCardHovering, setIsCardHovering] = useState(false);
  const [cardMousePosition, setCardMousePosition] = useState({ x: 0, y: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const section = e.currentTarget.getBoundingClientRect();
    setCardMousePosition({
      x: e.clientX - section.left,
      y: e.clientY - section.top,
    });
  };

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
    <div className="relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-24">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-background to-black" />
      <div className="absolute top-0 left-1/2 h-[50vh] w-[90vw] -translate-x-1/2 rounded-b-full bg-accent/20 blur-[90px]" />
      <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-tl-full bg-accent/10 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-2xl backdrop-blur-2xl"
        onMouseMove={handleCardMouseMove}
        onMouseEnter={() => setIsCardHovering(true)}
        onMouseLeave={() => setIsCardHovering(false)}
      >
        <div
          className={`pointer-events-none absolute h-[520px] w-[520px] rounded-full bg-gradient-to-r from-accent/30 via-orange-300/20 to-white/10 blur-3xl transition-opacity duration-200 ${
            isCardHovering ? "opacity-100" : "opacity-0"
          }`}
          style={{
            transform: `translate(${cardMousePosition.x - 260}px, ${
              cardMousePosition.y - 260
            }px)`,
            transition: "transform 0.1s ease-out",
          }}
        />

        <form
          className="relative z-10 grid gap-5 px-6 py-10 text-center md:px-12"
          onSubmit={handleSubmit}
        >
          <Link href="/" className="mx-auto block">
            <Image
              src="/assets/logos/buac.webp"
              alt="BUAC Logo"
              width={62}
              height={62}
              className="mx-auto object-contain"
            />
          </Link>

          <div>
            <h1 className="font-bebasNeue text-6xl tracking-wider text-white">
              Sign In
            </h1>
            <p className="mt-1 text-xs text-white/55">
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
                    className="group relative z-[1] flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-accent/50 bg-white/5"
                  >
                    <div className="absolute inset-0 h-full w-full origin-bottom scale-y-0 bg-accent transition-transform duration-500 group-hover:scale-y-100" />
                    <span className="z-[2] text-xl text-white/80 transition-all duration-500 group-hover:text-white">
                      {social.icon}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <GoogleAuthButton mode="login" className="flex justify-center" />

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-white/40">or use email</span>
            <div className="h-px flex-1 bg-white/10" />
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
                className={`flex items-center justify-center gap-1 rounded-xl border px-2 py-2 text-xs transition-all cursor-pointer ${
                  role === item.id
                    ? "border-accent bg-accent text-white"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-accent/50 hover:text-white"
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
                className="cursor-pointer transition-colors hover:text-accent"
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
              className="text-sm text-white/55 transition-colors hover:text-accent"
            >
              Forgot password?
            </Link>
            {role !== "admin" && (
              <Link
                href="/register"
                className="text-sm text-white/55 transition-colors hover:text-accent"
              >
                Create account
              </Link>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex items-center gap-2">
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
              ) : (
                <>
                  Sign In <HiArrowRight className="h-4 w-4" />
                </>
              )}
            </span>
          </button>

          <Link
            href="/"
            className="text-xs text-white/40 transition-colors hover:text-accent"
          >
            ← Back to Home
          </Link>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
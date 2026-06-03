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
  label?: string;
  icon?: React.ReactNode;
}

const AppInput = ({ label, icon, className = "", ...rest }: AppInputProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLInputElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({ x: e.clientX - rect.left });
  };

  return (
    <div className="relative w-full min-w-[200px]">
      {label && <label className="mb-2 block text-sm text-white/75">{label}</label>}

      <div className="relative w-full">
        <input
          className={`peer relative z-10 h-13 w-full rounded-md border-2 border-white/12 bg-black/35 px-4 pr-11 font-light text-white outline-none drop-shadow-sm transition-all duration-200 ease-in-out placeholder:text-white/35 focus:border-accent/55 focus:bg-black/45 ${className}`}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...rest}
        />

        {isHovering && (
          <>
            <div
              className="pointer-events-none absolute top-0 left-0 right-0 z-20 h-[2px] overflow-hidden rounded-t-md"
              style={{
                background: `radial-gradient(34px circle at ${mousePosition.x}px 0px, var(--color-accent) 0%, transparent 70%)`,
              }}
            />
            <div
              className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-[2px] overflow-hidden rounded-b-md"
              style={{
                background: `radial-gradient(34px circle at ${mousePosition.x}px 2px, var(--color-accent) 0%, transparent 70%)`,
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
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 pt-28 pb-12 relative overflow-hidden -mt-16">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/20 via-background to-black" />
      <div className="absolute top-0 left-1/2 h-[50vh] w-[90vw] -translate-x-1/2 rounded-b-full bg-accent/20 blur-[90px]" />
      <div className="absolute bottom-0 right-0 h-[40vh] w-[40vw] rounded-tl-full bg-accent/10 blur-[80px]" />

      <motion.div
        initial={{ opacity: 0, y: 35 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-[95%] md:w-[70%] lg:w-[64%] max-w-5xl flex justify-between min-h-[600px] rounded-3xl border border-white/10 bg-black/35 shadow-2xl backdrop-blur-2xl overflow-hidden"
      >
        <div
          className="relative h-full w-full lg:w-1/2 overflow-hidden px-5 md:px-10 lg:px-14"
          onMouseMove={handleCardMouseMove}
          onMouseEnter={() => setIsCardHovering(true)}
          onMouseLeave={() => setIsCardHovering(false)}
        >
          <div
            className={`pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-gradient-to-r from-accent/30 via-orange-300/20 to-white/10 blur-3xl transition-opacity duration-200 ${
              isCardHovering ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform: `translate(${cardMousePosition.x - 250}px, ${
                cardMousePosition.y - 250
              }px)`,
              transition: "transform 0.1s ease-out",
            }}
          />

          <form
            className="relative z-10 grid h-full gap-4 py-10 md:py-16 text-center"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5">
              <Link href="/" className="mx-auto block">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={58}
                  height={58}
                  className="mx-auto object-contain"
                />
              </Link>

              <div>
                <h1 className="font-bebasNeue text-5xl tracking-wider text-white">
                  Sign In
                </h1>
                <p className="mt-1 text-xs text-white/55">
                  Welcome back to BRAC University Adventure Club
                </p>
              </div>

              <div className="flex items-center justify-center">
                <ul className="flex gap-3 md:gap-4">
                  {socialIcons.map((social, index) => (
                    <li key={index} className="list-none">
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative z-[1] flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border-2 border-accent/50 bg-white/5"
                      >
                        <div className="absolute inset-0 h-full w-full origin-bottom scale-y-0 bg-accent transition-transform duration-500 ease-in-out group-hover:scale-y-100" />
                        <span className="z-[2] text-xl text-white/80 transition-all duration-500 ease-in-out group-hover:text-white">
                          {social.icon}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <span className="text-sm text-white/50">or use your account</span>
            </div>

            <div className="grid gap-4 items-center">
              <div className="grid grid-cols-3 gap-2">
                {roles.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRole(item.id);
                      setError("");
                    }}
                    className={`flex items-center justify-center gap-1 rounded-md border px-2 py-2 text-xs transition-all cursor-pointer ${
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
                placeholder={
                  role === "member"
                    ? "G Suite Email"
                    : role === "alumni"
                      ? "Gmail Address"
                      : "Admin Email"
                }
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
            </div>

            <div className="flex items-center justify-between">
              <Link
                href="/contact"
                className="font-light text-sm text-white/55 hover:text-accent transition-colors"
              >
                Need help?
              </Link>

              {role !== "admin" && (
                <Link
                  href="/register"
                  className="font-light text-sm text-white/55 hover:text-accent transition-colors"
                >
                  Create account
                </Link>
              )}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            <div className="flex justify-center items-center">
              <button
                type="submit"
                disabled={loading}
                className="group/button relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-md bg-accent px-6 py-2 text-sm font-medium text-white transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg hover:shadow-accent/40 disabled:opacity-60"
              >
                <span className="flex items-center gap-2 px-2 py-1">
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-transparent" />
                  ) : (
                    <>
                      Sign In <HiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-13deg)_translateX(-100%)] group-hover/button:duration-1000 group-hover/button:[transform:skew(-13deg)_translateX(100%)]">
                  <div className="relative h-full w-8 bg-white/20" />
                </div>
              </button>
            </div>

            <Link
              href="/"
              className="text-xs text-white/40 hover:text-accent transition-colors"
            >
              ← Back to Home
            </Link>
          </form>
        </div>

        <div className="hidden lg:block w-1/2 h-full overflow-hidden relative">
          <Image
            src="/assets/footerbg.webp"
            width={1000}
            height={1000}
            priority
            alt="BUAC Adventure"
            className="h-full w-full object-cover opacity-35 transition-transform duration-500 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-black/20 to-black/55" />
          <div className="absolute bottom-10 left-10 right-10">
            <h2 className="font-bebasNeue text-5xl text-white tracking-wider">
              Explore More
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Every trail tells a story. Sign in and continue your BUAC journey.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
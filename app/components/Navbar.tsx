"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthProvider";
import { FaUser, FaSignOutAlt, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/activities", label: "Activities" },
  { href: "/about", label: "About" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case "alumni":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "member":
        return "bg-accent/20 text-accent border-accent/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl -translate-x-1/2 transition-all duration-500">
        <div
          className={`relative overflow-hidden rounded-full border px-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${
            scrolled
              ? "border-white/15 bg-black/30 shadow-black/20"
              : "border-white/10 bg-black/20 shadow-black/10"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/8 via-transparent to-accent/10" />
          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/5" />

          <div className="relative flex h-14 items-center justify-between gap-4">
            <Link href="/" className="group relative z-50 flex items-center gap-3">
              <div className="relative">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={42}
                  height={42}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 -z-10 bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <div className="hidden sm:block">
                <h1 className="font-bebasNeue text-lg lg:text-xl tracking-wider text-white leading-none">
                  BRAC UNIVERSITY ADVENTURE CLUB
                </h1>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-2">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                        isActive(link.href)
                          ? "text-accent"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {isActive(link.href) && (
                        <motion.span
                          layoutId="navbar-active-pill"
                          className="absolute inset-0 rounded-full border border-accent/30 bg-accent/10"
                          transition={{
                            type: "spring",
                            stiffness: 320,
                            damping: 32,
                          }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="hidden lg:flex items-center gap-2">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-3 py-2 text-accent transition-all duration-300 hover:bg-accent/20"
                  >
                    <FaUser className="text-xs" />
                    <span className="max-w-24 truncate text-xs font-semibold">
                      {user?.name || "Admin"}
                    </span>
                    <motion.div
                      animate={{ rotate: userMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="text-[10px]" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-white/10 bg-black/70 shadow-2xl backdrop-blur-2xl"
                      >
                        <div className="border-b border-white/10 p-4">
                          <p className="truncate text-sm font-semibold text-white">
                            {user?.name || "Admin"}
                          </p>
                          <p className="truncate text-xs text-white/45">
                            {user?.email}
                          </p>
                          <span
                            className={`mt-2 inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${getRoleBadgeColor(
                              user?.role || "admin",
                            )}`}
                          >
                            {user?.role?.toUpperCase() || "ADMIN"}
                          </span>
                        </div>

                        <button
                          onClick={logout}
                          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-red-400 transition-colors hover:bg-red-500/10"
                        >
                          <FaSignOutAlt /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-105 hover:bg-accent/90 hover:shadow-accent/40"
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 lg:hidden"
              aria-label="Toggle menu"
            >
              <motion.span
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 origin-center bg-white"
              />
              <motion.span
                animate={isOpen ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                className="block h-0.5 w-6 bg-white"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 origin-center bg-white"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-2xl lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
                className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-accent/15 blur-3xl"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-3xl"
              />
            </div>

            <div className="relative flex h-full flex-col items-center justify-center px-8">
              {isLoggedIn && user && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                  className="mb-8 text-center"
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                    <FaUser className="text-2xl text-accent" />
                  </div>
                  <p className="font-semibold text-white">{user.name}</p>
                  <span
                    className={`mt-1 inline-block rounded-full border px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(
                      user.role,
                    )}`}
                  >
                    {user.role.toUpperCase()}
                  </span>
                </motion.div>
              )}

              <ul className="space-y-6 text-center">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: index * 0.07,
                        duration: 0.3,
                      },
                    }}
                    exit={{ opacity: 0, x: 30 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block font-bebasNeue text-4xl tracking-wider transition-all duration-300 md:text-5xl ${
                        isActive(link.href)
                          ? "scale-110 text-accent"
                          : "text-white hover:scale-110 hover:text-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}

                <motion.li
                  initial={{ opacity: 0, x: 30 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay: navLinks.length * 0.07,
                      duration: 0.3,
                    },
                  }}
                  exit={{ opacity: 0, x: 30 }}
                  className="pt-8"
                >
                  {isLoggedIn ? (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        logout();
                      }}
                      className="inline-block rounded-full bg-red-500 px-10 py-4 text-xl font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-red-500/50"
                    >
                      Sign Out
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="inline-block rounded-full border-2 border-accent px-10 py-4 text-xl font-bold uppercase tracking-wider text-accent transition-all duration-300 hover:bg-accent hover:text-white"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="inline-block rounded-full bg-accent px-10 py-4 text-xl font-bold uppercase tracking-wider text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/50"
                      >
                        Join Us
                      </Link>
                    </div>
                  )}
                </motion.li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
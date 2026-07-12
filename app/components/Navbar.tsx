"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthProvider";
import {
  FaUser,
  FaSignOutAlt,
  FaChevronDown,
  FaBell,
  FaTint,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
  { href: "/panel-eb", label: "Panel & EB" },
];

const moreLinks = [
  { href: "/activities", label: "Activities" },
  { href: "/weather", label: "Weather" },
  { href: "/gallery", label: "Gallery" },
  { href: "/club-fair", label: "Club Fair" },
  { href: "/contact", label: "Contact" },
];

const mobileNavLinks = [...mainNavLinks, ...moreLinks];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const { isLoggedIn, user, logout } = useAuth();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = () => {
      setUserMenuOpen(false);
      setMoreMenuOpen(false);
    };

    if (userMenuOpen || moreMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen, moreMenuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => pathname === path;
  const isMoreActive = moreLinks.some((link) => pathname === link.href);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setUserMenuOpen(false);
      setMoreMenuOpen(false);
      setIsOpen(false);
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="fixed top-4 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 transition-all duration-500">
        <div
          className={`relative overflow-visible rounded-full border px-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${
            scrolled
              ? "border-white/15 bg-black/30 shadow-black/20"
              : "border-white/10 bg-black/20 shadow-black/10"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-gradient-to-r from-white/8 via-transparent to-accent/10" />
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

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              <ul className="flex items-center gap-1">
                {mainNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
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

                {/* More Dropdown */}
                <li className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMoreMenuOpen((prev) => !prev);
                      setUserMenuOpen(false);
                    }}
                    className={`relative flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                      isMoreActive || moreMenuOpen
                        ? "text-accent"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    {(isMoreActive || moreMenuOpen) && (
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

                    <span className="relative z-10">More</span>

                    <motion.span
                      className="relative z-10"
                      animate={{ rotate: moreMenuOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <FaChevronDown className="text-[10px]" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {moreMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute left-1/2 top-[calc(100%+0.75rem)] z-[999] w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-2 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                      >
                        {moreLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`block rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                              isActive(link.href)
                                ? "bg-accent text-white"
                                : "text-white/70 hover:bg-white/10 hover:text-accent"
                            }`}
                          >
                            {link.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </ul>
            </div>

            {/* Desktop Right Side */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <ThemeToggle />

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen((prev) => !prev);
                      setMoreMenuOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-accent/25 bg-accent/10 px-4 py-2 text-accent transition-all duration-300 hover:bg-accent/20"
                  >
                    <FaUser className="text-xs" />

                    <span className="max-w-24 truncate text-xs font-semibold">
                      {user?.name || "User"}
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
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-[calc(100%+0.75rem)] z-[999] w-72 overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl shadow-black/50 backdrop-blur-2xl"
                      >
                        <div className="p-3 space-y-1 border-b border-white/10">
                          <Link
                            href="/notifications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-accent transition"
                          >
                            <FaBell className="text-xs text-accent" />
                            Notifications
                          </Link>

                          <Link
                            href="/blood-donation"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-accent transition"
                          >
                            <FaTint className="text-xs text-red-500" />
                            Blood Donation
                          </Link>
                        </div>

                        <div className="p-3">
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-60"
                          >
                            <FaSignOutAlt />
                            {loggingOut ? "Signing Out..." : "Sign Out"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="min-w-[78px] whitespace-nowrap text-center rounded-full px-5 py-2 text-xs font-semibold text-white/75 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/register"
                    className="min-w-[82px] whitespace-nowrap text-center rounded-full bg-accent px-5 py-2 text-xs font-bold text-white shadow-lg shadow-accent/20 transition-all hover:scale-105 hover:bg-accent/90"
                  >
                    Join Us
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
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

      {/* Mobile Drawer */}
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
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <ThemeToggle />
              </motion.div>

              <ul className="space-y-6 text-center">
                {mobileNavLinks.map((link, index) => (
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

                {isLoggedIn && (
                  <motion.li
                    initial={{ opacity: 0, x: 30 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: {
                        delay: mobileNavLinks.length * 0.07,
                        duration: 0.3,
                      },
                    }}
                    exit={{ opacity: 0, x: 30 }}
                    className="border-t border-white/10 pt-4 flex flex-col gap-3"
                  >
                    <Link
                      href="/notifications"
                      onClick={() => setIsOpen(false)}
                      className="font-bebasNeue text-2xl text-white/70 hover:text-accent tracking-wide flex items-center justify-center gap-2"
                    >
                      <FaBell className="text-sm text-accent" />
                      Notifications
                    </Link>

                    <Link
                      href="/blood-donation"
                      onClick={() => setIsOpen(false)}
                      className="font-bebasNeue text-2xl text-white/70 hover:text-accent tracking-wide flex items-center justify-center gap-2"
                    >
                      <FaTint className="text-sm text-red-500" />
                      Blood Donation
                    </Link>
                  </motion.li>
                )}

                <motion.li
                  initial={{ opacity: 0, x: 30 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    transition: {
                      delay:
                        (mobileNavLinks.length + (isLoggedIn ? 2 : 0)) * 0.07,
                      duration: 0.3,
                    },
                  }}
                  exit={{ opacity: 0, x: 30 }}
                  className="pt-8"
                >
                  {isLoggedIn ? (
                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={loggingOut}
                      className="inline-flex items-center gap-3 rounded-full bg-red-500 px-10 py-4 text-xl font-bold uppercase tracking-wider text-white transition hover:scale-105 disabled:opacity-60"
                    >
                      <FaSignOutAlt />
                      {loggingOut ? "Signing Out..." : "Sign Out"}
                    </button>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Link
                        href="/login"
                        onClick={() => setIsOpen(false)}
                        className="inline-block rounded-full border-2 border-accent px-10 py-4 text-xl font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-white"
                      >
                        Sign In
                      </Link>

                      <Link
                        href="/register"
                        onClick={() => setIsOpen(false)}
                        className="inline-block rounded-full bg-accent px-10 py-4 text-xl font-bold uppercase tracking-wider text-white transition hover:scale-105"
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
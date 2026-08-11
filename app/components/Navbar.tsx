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
      <nav className="site-nav fixed top-3 sm:top-4 left-1/2 z-50 w-[calc(100%-1.25rem)] sm:w-[calc(100%-2rem)] max-w-6xl -translate-x-1/2 transition-all duration-500">
        <div
          className={`relative overflow-visible rounded-full border px-3 sm:px-4 shadow-2xl backdrop-blur-2xl transition-all duration-500 ${
            scrolled
              ? "border-white/15 bg-black/40 shadow-black/30"
              : "border-white/10 bg-black/25 shadow-black/20"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-gradient-to-r from-white/8 via-transparent to-accent/10" />

          <div className="relative flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            <Link href="/" className="group relative z-50 flex items-center gap-2.5 sm:gap-3">
              <div className="relative shrink-0">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={38}
                  height={38}
                  className="object-contain transition-transform duration-300 group-hover:scale-110 sm:w-[42px] sm:h-[42px]"
                />
              </div>
              <div className="hidden xs:block sm:block">
                <h1 className="font-bebasNeue text-base sm:text-lg lg:text-xl tracking-wider text-white leading-none">
                  BRAC UNIVERSITY ADVENTURE CLUB
                </h1>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-2">
              <ul className="flex items-center gap-1">
                {mainNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 ${
                        isActive(link.href)
                          ? "text-accent"
                          : "text-white/80 hover:text-white"
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
                    className={`relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-300 cursor-pointer ${
                      isMoreActive || moreMenuOpen
                        ? "text-accent"
                        : "text-white/80 hover:text-white"
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
                        className="absolute left-1/2 top-[calc(100%+0.75rem)] z-[999] w-52 -translate-x-1/2 overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl"
                      >
                        {moreLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreMenuOpen(false)}
                            className={`block rounded-xl px-4 py-2.5 text-xs font-semibold transition-colors ${
                              isActive(link.href)
                                ? "bg-accent text-white"
                                : "text-white/80 hover:bg-white/10 hover:text-accent"
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

            {/* Right Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>

              {isLoggedIn ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen((prev) => !prev);
                      setMoreMenuOpen(false);
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-accent/15 px-3 sm:px-4 py-1.5 text-xs font-semibold text-accent transition-all duration-300 hover:bg-accent/25"
                  >
                    <FaUser className="text-xs" />
                    <span className="max-w-[80px] sm:max-w-[120px] truncate">
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
                        className="absolute right-0 top-[calc(100%+0.75rem)] z-[999] w-64 overflow-hidden rounded-2xl border border-white/15 bg-black/90 p-2 shadow-2xl backdrop-blur-2xl"
                      >
                        <div className="p-3 space-y-1 border-b border-white/10">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-accent transition"
                          >
                            <FaUser className="text-accent" />
                            My Profile
                          </Link>

                          <Link
                            href="/notifications"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-accent transition"
                          >
                            <FaBell className="text-accent" />
                            Notifications
                          </Link>

                          <Link
                            href="/blood-donation"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-accent transition"
                          >
                            <FaTint className="text-red-500" />
                            Blood Donation
                          </Link>
                        </div>
                        <div className="p-2 pt-2">
                          <button
                            type="button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
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
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full px-4 py-2 text-xs font-semibold text-white/80 transition-all hover:bg-white/10 hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg shadow-accent/20 transition-all hover:bg-accent/90"
                  >
                    Join Us
                  </Link>
                </div>
              )}

              {/* Mobile Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-white/10 text-white lg:hidden cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                <motion.span
                  animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-5 bg-white rounded-full transition-transform"
                />
                <motion.span
                  animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="block h-0.5 w-5 bg-white rounded-full transition-opacity"
                />
                <motion.span
                  animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
                  className="block h-0.5 w-5 bg-white rounded-full transition-transform"
                />
              </button>
            </div>
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
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-2xl lg:hidden flex flex-col justify-between pt-24 pb-8 px-6"
          >
            <div className="flex justify-center mb-6">
              <ThemeToggle />
            </div>

            <div className="flex-1 overflow-y-auto my-auto py-4">
              <ul className="space-y-4 text-center">
                {mobileNavLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      transition: { delay: index * 0.04, duration: 0.25 },
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block font-bebasNeue text-3xl sm:text-4xl tracking-wider transition-colors ${
                        isActive(link.href) ? "text-accent" : "text-white hover:text-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-white/15 text-center space-y-3 shrink-0">
              {isLoggedIn ? (
                <div className="flex flex-col gap-3 items-center">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full border-2 border-accent px-8 py-3 text-base font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-white"
                  >
                    <FaUser />
                    My Profile
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-8 py-3 text-base font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer"
                  >
                    <FaSignOutAlt />
                    {loggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border-2 border-accent px-8 py-3 text-base font-bold uppercase tracking-wider text-accent transition hover:bg-accent hover:text-white"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-bold uppercase tracking-wider text-white shadow-lg transition hover:bg-accent/90"
                  >
                    Join Us
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
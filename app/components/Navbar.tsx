"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaChevronDown,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import ThemeToggle from "./ThemeToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
  { href: "/panel-eb", label: "Panel & EB" },
  { href: "/club-fair", label: "Club Fair" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/weather", label: "Weather" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { auth, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [mobileAdminMenuOpen, setMobileAdminMenuOpen] =
    useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen
      ? "hidden"
      : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setAdminMenuOpen(false);
    setMobileAdminMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return (
      pathname === href ||
      pathname.startsWith(`${href}/`)
    );
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      setAdminMenuOpen(false);
      setMobileAdminMenuOpen(false);
      setMobileOpen(false);

      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="site-nav fixed top-3 left-1/2 z-50 w-[calc(100%-1rem)] max-w-7xl -translate-x-1/2 sm:top-4 sm:w-[calc(100%-1.5rem)]">
        <div
          className={`relative overflow-visible rounded-full border px-2.5 shadow-2xl backdrop-blur-2xl transition-all duration-500 sm:px-4 ${
            scrolled
              ? "border-white/15 bg-black/45"
              : "border-white/10 bg-black/25"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-gradient-to-r from-white/8 via-transparent to-accent/10" />

          <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/5" />

          <div className="relative flex h-14 items-center gap-2 sm:h-16 sm:gap-3">
            {/* Logo and brand name */}
            <Link
              href="/"
              aria-label="BRAC University Adventure Club"
              className="group relative z-50 flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
            >
              <div className="relative shrink-0">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={46}
                  height={46}
                  priority
                  className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-110 sm:h-[42px] sm:w-[42px]"
                />

                <div className="absolute inset-0 -z-10 bg-accent/30 opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100" />
              </div>

              <span className="block whitespace-nowrap font-bebasNeue text-[clamp(0.62rem,3.8vw,0.95rem)] leading-none tracking-[0.04em] text-white sm:text-lg sm:tracking-wider xl:text-xl">
                BRAC UNIVERSITY ADVENTURE CLUB
              </span>
            </Link>

            {/* Desktop navigation */}
            <div
              className="hidden min-w-0 flex-1 items-center justify-center overflow-x-auto lg:flex"
              style={{
                scrollbarWidth: "none",
              }}
            >
              <div className="flex min-w-max items-center gap-0.5 px-1">
                {navLinks.map((link) => {
                  const active = isActive(link.href);

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`relative whitespace-nowrap rounded-full px-2.5 py-2 text-[10px] font-semibold tracking-wide transition-all duration-300 xl:px-3 xl:text-[11px] ${
                        active
                          ? "text-accent"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {active && (
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

                      <span className="relative z-10">
                        {link.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Desktop controls */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <ThemeToggle />

              {auth && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();

                      setAdminMenuOpen(
                        (previous) => !previous,
                      );
                    }}
                    className="flex cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-2 text-[11px] font-bold text-accent transition hover:bg-accent/20 xl:px-4"
                    aria-expanded={adminMenuOpen}
                    aria-haspopup="menu"
                  >
                    <FaShieldAlt className="text-xs" />

                    <span>Admin</span>

                    <FaChevronDown
                      className={`text-[9px] transition-transform ${
                        adminMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {adminMenuOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -8,
                          scale: 0.96,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          y: -8,
                          scale: 0.96,
                        }}
                        transition={{
                          duration: 0.15,
                        }}
                        onClick={(event) =>
                          event.stopPropagation()
                        }
                        className="absolute right-0 top-[calc(100%+0.75rem)] z-[999] w-48 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          role="menuitem"
                        >
                          <FaSignOutAlt />

                          {loggingOut
                            ? "Signing Out..."
                            : "Sign Out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (previous) => !previous,
                )
              }
              className="relative z-50 ml-auto flex h-10 w-10 shrink-0 flex-col items-center justify-center gap-1.5 rounded-full bg-white/10 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <motion.span
                animate={
                  mobileOpen
                    ? {
                        rotate: 45,
                        y: 8,
                      }
                    : {
                        rotate: 0,
                        y: 0,
                      }
                }
                className="block h-0.5 w-6 bg-white"
              />

              <motion.span
                animate={
                  mobileOpen
                    ? {
                        opacity: 0,
                      }
                    : {
                        opacity: 1,
                      }
                }
                className="block h-0.5 w-6 bg-white"
              />

              <motion.span
                animate={
                  mobileOpen
                    ? {
                        rotate: -45,
                        y: -8,
                      }
                    : {
                        rotate: 0,
                        y: 0,
                      }
                }
                className="block h-0.5 w-6 bg-white"
              />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
            }}
            className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute left-1/4 top-1/4 h-80 w-80 rounded-full bg-accent/15 blur-3xl" />

              <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
            </div>

            <div className="relative flex min-h-full flex-col items-center px-6 pb-10 pt-28">
              <div className="mb-7">
                <ThemeToggle />
              </div>

              <div className="mb-7 w-full overflow-x-auto text-center">
                <p className="whitespace-nowrap font-bebasNeue text-lg tracking-wider text-white">
                  BRAC UNIVERSITY ADVENTURE CLUB
                </p>
              </div>

              <ul className="w-full max-w-md space-y-1.5 text-center">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{
                      opacity: 0,
                      x: 24,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    transition={{
                      delay: index * 0.035,
                      duration: 0.25,
                    }}
                  >
                    <Link
                      href={link.href}
                      onClick={() =>
                        setMobileOpen(false)
                      }
                      className={`block rounded-xl px-4 py-2.5 font-bebasNeue text-2xl tracking-wider transition sm:text-3xl ${
                        isActive(link.href)
                          ? "bg-accent/10 text-accent"
                          : "text-white hover:bg-white/5 hover:text-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>

              {/* Mobile admin dropdown: only Sign Out */}
              {auth && (
                <div className="relative mt-7 flex flex-col items-center gap-3 border-t border-white/10 pt-6">
                  <button
                    type="button"
                    onClick={() =>
                      setAdminMenuOpen(
                        (previous) => !previous,
                      )
                    }
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-5 py-2.5 text-sm font-bold text-accent"
                    aria-expanded={adminMenuOpen}
                    aria-haspopup="menu"
                  >
                    <FaShieldAlt />
                    Admin

                    <FaChevronDown
                      className={`text-[10px] transition-transform ${
                        adminMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {adminMenuOpen && (
                      <motion.div
                        initial={{
                          opacity: 0,
                          y: -6,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          y: -6,
                        }}
                        className="w-48 rounded-2xl border border-white/10 bg-black/90 p-2"
                        role="menu"
                      >
                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                          role="menuitem"
                        >
                          <FaSignOutAlt />

                          {loggingOut
                            ? "Signing Out..."
                            : "Sign Out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
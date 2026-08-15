"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronDown, FaSignOutAlt } from "react-icons/fa";
import { useAuth } from "../context/AuthProvider";
import ThemeToggle from "./ThemeToggle";

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/tours", label: "Tours" },
  { href: "/about", label: "About" },
  { href: "/panel-eb", label: "Panel & EB" },
];

const moreLinks = [
  { href: "/club-fair", label: "Club Fair" },
  { href: "/activities", label: "Activities" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/weather", label: "Weather" },
  { href: "/contact", label: "Contact" },
];

const mobileNavLinks = [...mainNavLinks, ...moreLinks];

export default function Navbar() {
  const pathname = usePathname();
  const { auth, logout } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    document.body.style.overflow = mobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, mounted]);

  useEffect(() => {
    if (!mounted) return;

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
  }, [mounted]);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setAdminMenuOpen(false);
  }, [pathname]);

  if (!mounted) {
    return (
      <nav
        className="fixed left-1/2 top-3 z-50 h-14 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 rounded-full border border-white/10 bg-black/25 sm:top-4"
        aria-hidden="true"
      />
    );
  }

  const isActive = (href: string) => pathname === href;
  const isMoreActive = moreLinks.some((link) => pathname === link.href);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await logout();
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="site-nav fixed left-1/2 top-3 z-50 w-[calc(100%-1.5rem)] max-w-6xl -translate-x-1/2 sm:top-4">
        <div
          className={`relative overflow-visible rounded-full border px-3 shadow-2xl backdrop-blur-2xl transition sm:px-4 ${
            scrolled
              ? "border-white/15 bg-black/40"
              : "border-white/10 bg-black/25"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-r from-white/8 via-transparent to-accent/10" />

          <div className="relative flex h-14 items-center justify-between gap-3 sm:h-16">
            <Link
              href="/"
              className="relative z-10 flex shrink-0 items-center gap-2 sm:gap-3"
            >
              <Image
                src="/assets/logos/buac.webp"
                alt="BUAC Logo"
                width={42}
                height={42}
                priority
                className="h-9 w-9 object-contain sm:h-[42px] sm:w-[42px]"
              />

              <span className="hidden font-bebasNeue text-lg tracking-wider text-white sm:block lg:text-xl">
                BRAC UNIVERSITY ADVENTURE CLUB
              </span>
            </Link>

            <div className="hidden items-center gap-2 lg:flex">
              <ul className="flex items-center gap-1">
                {mainNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative rounded-full px-4 py-2 text-xs font-semibold transition ${
                        isActive(link.href)
                          ? "text-accent"
                          : "text-white/75 hover:text-white"
                      }`}
                    >
                      {isActive(link.href) && (
                        <motion.span
                          layoutId="navbar-active"
                          className="absolute inset-0 rounded-full border border-accent/30 bg-accent/10"
                        />
                      )}

                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                ))}

                <li className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setMoreOpen((previous) => !previous);
                      setAdminMenuOpen(false);
                    }}
                    className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                      isMoreActive || moreOpen
                        ? "text-accent"
                        : "text-white/75 hover:text-white"
                    }`}
                  >
                    {(isMoreActive || moreOpen) && (
                      <span className="absolute inset-0 rounded-full border border-accent/30 bg-accent/10" />
                    )}

                    <span className="relative z-10">More</span>

                    <FaChevronDown
                      className={`relative z-10 text-[10px] transition ${
                        moreOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {moreOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        onClick={(event) => event.stopPropagation()}
                        className="absolute left-1/2 top-[calc(100%+0.75rem)] z-[999] w-52 -translate-x-1/2 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                      >
                        {moreLinks.map((link) => (
                          <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMoreOpen(false)}
                            className={`block rounded-xl px-4 py-3 text-sm font-semibold transition ${
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

            <div className="hidden items-center gap-2 lg:flex">
              <ThemeToggle />

              {auth && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setAdminMenuOpen((previous) => !previous);
                      setMoreOpen(false);
                    }}
                    className="flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-xs font-bold text-accent"
                  >
                    Admin
                    <FaChevronDown
                      className={`text-[10px] transition ${
                        adminMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <AnimatePresence>
                    {adminMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        onClick={(event) => event.stopPropagation()}
                        className="absolute right-0 top-[calc(100%+0.75rem)] z-[999] w-48 rounded-2xl border border-white/10 bg-black/95 p-2 shadow-2xl"
                      >
                        <Link
                          href="/secure/admin"
                          onClick={() => setAdminMenuOpen(false)}
                          className="block rounded-xl px-4 py-3 text-sm text-white/75 hover:bg-white/10 hover:text-accent"
                        >
                          Admin Dashboard
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={loggingOut}
                          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-3 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                          <FaSignOutAlt />
                          {loggingOut ? "Signing Out..." : "Sign Out"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((previous) => !previous)}
              className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full bg-white/10 lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <motion.span
                animate={mobileOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 bg-white"
              />
              <motion.span
                animate={mobileOpen ? { opacity: 0 } : { opacity: 1 }}
                className="block h-0.5 w-6 bg-white"
              />
              <motion.span
                animate={mobileOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="block h-0.5 w-6 bg-white"
              />
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 overflow-y-auto bg-black/95 backdrop-blur-2xl lg:hidden"
          >
            <div className="flex min-h-full flex-col items-center px-6 pb-10 pt-28">
              <div className="mb-8">
                <ThemeToggle />
              </div>

              <ul className="w-full max-w-md space-y-2 text-center">
                {mobileNavLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={`block rounded-xl px-4 py-3 font-bebasNeue text-3xl tracking-wider transition ${
                        isActive(link.href)
                          ? "bg-accent/10 text-accent"
                          : "text-white hover:bg-white/5 hover:text-accent"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>

              {auth && (
                <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
                  <Link
                    href="/secure/admin"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full border-2 border-accent px-8 py-3 text-center text-sm font-bold uppercase text-accent"
                  >
                    Admin Dashboard
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="rounded-full bg-red-500 px-8 py-3 text-sm font-bold uppercase text-white disabled:opacity-50"
                  >
                    {loggingOut ? "Signing Out..." : "Sign Out"}
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/AuthProvider";
import { FaUser, FaSignOutAlt, FaChevronDown } from "react-icons/fa";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isLoggedIn, isAdmin, user, logout } = useAuth();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setUserMenuOpen(false);
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/tours", label: "Tours" },
    { href: "/activities", label: "Activities" },
    { href: "/about", label: "About" },
    { href: "/gallery", label: "Gallery" },
    { href: "/contact", label: "Contact" },
  ];

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
      <nav
        className={`absolute top-0 w-full z-50 transition-all duration-500 bg-black/80 backdrop-blur-xl shadow-lg shadow-accent/10`}
      >
        <div className="px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-20 lg:h-16">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-3 group z-50 relative"
            >
              <div className="relative">
                <Image
                  src="/assets/logos/buac.webp"
                  alt="BUAC Logo"
                  width={50}
                  height={50}
                  className="transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-accent/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-2xl lg:text-3xl font-bebasNeue text-zinc-100 leading-tight tracking-wider">
                  BRAC UNIVERSITY
                  <span className="text-accent"> ADVENTURE CLUB</span>
                </h1>
              </div>
              <div className="md:hidden">
                <h1 className="text-4xl font-bebasNeue text-zinc-100 leading-tight tracking-wider">
                  BUAC
                </h1>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              <ul className="flex items-center gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`relative px-5 py-2 text-sm font-medium tracking-widest uppercase transition-all duration-300 group ${
                        isActive(link.href)
                          ? "text-accent"
                          : "text-zinc-100 hover:text-accent"
                      }`}
                    >
                      {link.label}
                      <span
                        className={`absolute bottom-0 left-0 w-full h-0.5 bg-accent transform origin-left transition-transform duration-300 ${
                          isActive(link.href)
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100"
                        }`}
                      ></span>
                    </Link>
                  </li>
                ))}
              </ul>

              {/* Auth Section */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setUserMenuOpen(!userMenuOpen);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-accent hover:bg-accent/20 transition-all duration-300 cursor-pointer"
                  >
                    <FaUser className="text-sm" />
                    <span className="text-sm font-medium max-w-24 truncate">
                      {user?.name || "Admin"}
                    </span>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${
                        userMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-12 w-56 bg-black/95 backdrop-blur-xl border border-accent/20 rounded-xl shadow-2xl overflow-hidden z-50">
                      <div className="p-4 border-b border-accent/10">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.name || "Admin"}
                        </p>
                        <p className="text-zinc-400 text-xs truncate">
                          {user?.email}
                        </p>
                        <span
                          className={`inline-block mt-2 px-2 py-0.5 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                            user?.role || "admin"
                          )}`}
                        >
                          {user?.role?.toUpperCase() || "ADMIN"}
                        </span>
                      </div>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors text-sm cursor-pointer"
                      >
                        <FaSignOutAlt />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/login"
                    className="px-5 py-2 text-sm font-medium tracking-wider uppercase text-zinc-100 hover:text-accent transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="relative px-6 py-3 text-sm font-bold tracking-wider uppercase bg-accent text-text-secondary rounded-full overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-accent/50 hover:scale-105"
                  >
                    <span className="relative z-10">Join Us</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 z-50 group"
              aria-label="Toggle menu"
            >
              <span
                className={`w-7 h-0.5 bg-zinc-100 transition-all duration-300 ${
                  isOpen ? "rotate-45 translate-y-2 bg-accent" : "group-hover:w-6"
                }`}
              ></span>
              <span
                className={`w-7 h-0.5 bg-zinc-100 transition-all duration-300 ${
                  isOpen ? "opacity-0" : "group-hover:w-5"
                }`}
              ></span>
              <span
                className={`w-7 h-0.5 bg-zinc-100 transition-all duration-300 ${
                  isOpen ? "-rotate-45 -translate-y-2 bg-accent" : "group-hover:w-6"
                }`}
              ></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`fixed inset-0 bg-black/95 backdrop-blur-xl z-40 lg:hidden transition-opacity duration-500 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center px-8">
          {/* User info at top of mobile menu */}
          {isLoggedIn && user && (
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FaUser className="text-accent text-2xl" />
              </div>
              <p className="text-white font-semibold">{user.name}</p>
              <span
                className={`inline-block mt-1 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role.toUpperCase()}
              </span>
            </div>
          )}

          <ul className="space-y-6 text-center">
            {navLinks.map((link, index) => (
              <li
                key={link.href}
                className={`transform transition-all duration-500 ${
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-10 opacity-0"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <Link
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-4xl md:text-5xl font-bebasNeue tracking-wider transition-all duration-300 ${
                    isActive(link.href)
                      ? "text-accent scale-110"
                      : "text-zinc-100 hover:text-accent hover:scale-110"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}

            {/* Auth Links in Mobile Menu */}
            <li
              className={`transform transition-all duration-500 pt-8 ${
                isOpen
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{ transitionDelay: "400ms" }}
            >
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    logout();
                  }}
                  className="inline-block px-10 py-4 text-xl font-bold tracking-wider uppercase bg-red-500 text-white rounded-full hover:shadow-lg hover:shadow-red-500/50 hover:scale-105 transition-all duration-300"
                >
                  Sign Out
                </button>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="inline-block px-10 py-4 text-xl font-bold tracking-wider uppercase border-2 border-accent text-accent rounded-full hover:bg-accent hover:text-black transition-all duration-300"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="inline-block px-10 py-4 text-xl font-bold tracking-wider uppercase bg-accent text-black rounded-full hover:shadow-lg hover:shadow-accent/50 hover:scale-105 transition-all duration-300"
                  >
                    Join Us
                  </Link>
                </div>
              )}
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
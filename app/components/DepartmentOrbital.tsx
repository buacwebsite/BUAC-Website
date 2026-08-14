"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPaintbrush,
  FaPeopleGroup,
  FaUserTie,
  FaLaptop,
  FaCamera,
  FaBullhorn,
  FaEnvelopeOpen,
} from "react-icons/fa6";
import { HiArrowDown, HiSparkles } from "react-icons/hi2";

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
}

interface DepartmentOrbitalProps {
  departments: Department[];
  onSelectDepartment: (id: string) => void;
}

function getDepartmentIcon(id: string) {
  switch (id) {
    case "creative":
      return <FaPaintbrush className="h-4 w-4 sm:h-5 sm:w-5" />;

    case "event":
      return <FaPeopleGroup className="h-4 w-4 sm:h-5 sm:w-5" />;

    case "hr":
      return <FaUserTie className="h-4 w-4 sm:h-5 sm:w-5" />;

    case "itphoto":
      return (
        <div className="flex items-center gap-0.5">
          <FaLaptop className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <FaCamera className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      );

    case "pubandmarket":
      return (
        <div className="flex items-center gap-0.5">
          <FaEnvelopeOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <FaBullhorn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </div>
      );

    default:
      return <HiSparkles className="h-4 w-4 sm:h-5 sm:w-5" />;
  }
}

function getShortName(name: string) {
  if (name === "Human Resources Management") return "HRM";
  if (name === "IT & Photography") return "IT & Photo";
  if (name === "Publication & Marketing") return "Publication";
  if (name === "Event Management") return "Events";
  return name;
}

export default function DepartmentOrbital({
  departments,
  onSelectDepartment,
}: DepartmentOrbitalProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [screenWidth, setScreenWidth] = useState(1440);

  const [activeId, setActiveId] = useState<string | null>(
    departments[0]?.id || null,
  );

  useEffect(() => {
    const updateViewport = () => {
      setScreenWidth(window.innerWidth);
    };

    updateViewport();

    window.addEventListener("resize", updateViewport);

    return () => {
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;

  const orbitRadius = useMemo(() => {
    if (screenWidth < 360) return 104;
    if (screenWidth < 420) return 112;
    if (screenWidth < 480) return 124;
    if (screenWidth < 640) return 138;
    if (screenWidth < 768) return 165;
    if (screenWidth < 1024) return 190;
    return 220;
  }, [screenWidth]);

  const orbitHeight = isMobile ? 350 : isTablet ? 460 : 560;

  const nodeSize = isMobile ? 48 : isTablet ? 58 : 64;
  const centerSize = isMobile ? 74 : isTablet ? 96 : 112;

  useEffect(() => {
    if (!autoRotate || departments.length === 0) return;

    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.25) % 360);
    }, 45);

    return () => clearInterval(timer);
  }, [autoRotate, departments.length]);

  useEffect(() => {
    if (!departments.length) {
      setActiveId(null);
      return;
    }

    if (!activeId || !departments.some((item) => item.id === activeId)) {
      setActiveId(departments[0].id);
    }
  }, [departments, activeId]);

  const activeDepartment = useMemo(() => {
    return (
      departments.find((department) => department.id === activeId) ||
      departments[0] ||
      null
    );
  }, [departments, activeId]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = orbitRadius * Math.cos(radian);
    const y = orbitRadius * Math.sin(radian);

    const depth = (1 + Math.sin(radian)) / 2;

    const opacity = Math.max(0.55, depth);
    const scale = 0.82 + depth * 0.22;
    const zIndex = Math.round(10 + depth * 50);

    return {
      x,
      y,
      opacity,
      scale,
      zIndex,
    };
  };

  const handleNodeClick = (department: Department, index: number) => {
    setActiveId(department.id);
    setAutoRotate(false);

    const total = departments.length;
    const targetAngle = (index / total) * 360;

    setRotationAngle(270 - targetAngle);
  };

  const handleExploreClick = () => {
    if (!activeDepartment) return;
    onSelectDepartment(activeDepartment.id);
  };

  if (!departments.length) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <div>
          <h1 className="font-bebasNeue text-5xl tracking-wider text-accent">
            Departments
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            No departments have been added yet.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-background px-3 py-20 text-text-secondary sm:px-4 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,98,43,0.16),transparent_38%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.06),transparent_30%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-20 bg-[linear-gradient(to_right,rgba(255,98,43,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,98,43,0.08)_1px,transparent_1px)] bg-[size:52px_52px] sm:bg-[size:64px_64px]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col items-center justify-center">
        <div className="mb-6 text-center sm:mb-10">
          <motion.p
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.35em]"
          >
            BUAC Structure
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-bebasNeue text-5xl leading-none tracking-wider text-text-secondary sm:text-7xl md:text-8xl"
          >
            Departments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-2xl px-3 text-xs leading-relaxed text-text-muted sm:px-0 sm:text-sm md:text-base"
          >
            Five departments work together to design, manage, document, and
            promote every BUAC adventure.
          </motion.p>
        </div>

        <div
          className="relative flex w-full items-center justify-center"
          style={{ height: `${orbitHeight}px` }}
          onMouseEnter={() => {
            if (!isMobile) setAutoRotate(false);
          }}
          onMouseLeave={() => {
            if (!isMobile) setAutoRotate(true);
          }}
        >
          <div
            className="absolute rounded-full border border-accent/15"
            style={{
              width: orbitRadius * 2,
              height: orbitRadius * 2,
            }}
          />

          <div
            className="absolute rounded-full border border-accent/10"
            style={{
              width: orbitRadius * 1.52,
              height: orbitRadius * 1.52,
            }}
          />

          <div
            className="absolute rounded-full border border-accent/5"
            style={{
              width: orbitRadius * 1.08,
              height: orbitRadius * 1.08,
            }}
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-30 flex flex-col items-center justify-center"
          >
            <div
              className="relative flex items-center justify-center rounded-3xl border border-accent/40 bg-black/80 p-2 shadow-2xl shadow-accent/20 backdrop-blur-xl sm:p-4"
              style={{
                width: centerSize,
                height: centerSize,
              }}
            >
              <div className="absolute inset-0 rounded-3xl bg-accent/10 blur-xl" />

              <Image
                src="/assets/logos/buac.webp"
                alt="BUAC Logo"
                width={86}
                height={86}
                className="relative z-10 h-[70%] w-[70%] object-contain"
                priority
              />
            </div>

            {!isMobile && (
              <div className="mt-4 rounded-full border border-border bg-surface/70 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-text-muted backdrop-blur-md">
                Adventure Club
              </div>
            )}
          </motion.div>

          {departments.map((department, index) => {
            const position = calculateNodePosition(index, departments.length);
            const isActive = department.id === activeId;

            return (
              <motion.button
                key={department.id}
                type="button"
                onClick={() => handleNodeClick(department, index)}
                className="absolute flex cursor-pointer flex-col items-center transition-all duration-500"
                style={{
                  transform: `translate(${position.x}px, ${position.y}px) scale(${
                    isActive ? 1.12 : position.scale
                  })`,
                  opacity: isActive ? 1 : position.opacity,
                  zIndex: isActive ? 80 : position.zIndex,
                }}
              >
                <div
                  className={`absolute rounded-full blur-xl transition-all ${
                    isActive
                      ? "bg-accent/30"
                      : "bg-white/10"
                  }`}
                  style={{
                    width: isActive ? nodeSize * 1.65 : nodeSize * 1.25,
                    height: isActive ? nodeSize * 1.65 : nodeSize * 1.25,
                  }}
                />

                <div
                  className={`relative flex items-center justify-center rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
                    isActive
                      ? "border-accent bg-accent text-white shadow-xl shadow-accent/30"
                      : "border-white/20 bg-black/70 text-white hover:border-accent hover:text-accent"
                  }`}
                  style={{
                    width: nodeSize,
                    height: nodeSize,
                  }}
                >
                  {getDepartmentIcon(department.id)}
                </div>

                <div
                  className={`mt-2 max-w-[92px] rounded-full border px-2 py-1 text-center text-[8px] font-bold leading-tight transition-all sm:mt-3 sm:max-w-[130px] sm:px-3 sm:text-xs ${
                    isActive
                      ? "border-accent bg-accent text-white"
                      : "border-white/10 bg-black/70 text-white/70"
                  }`}
                >
                  {getShortName(department.name)}
                </div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          {activeDepartment && (
            <motion.div
              key={activeDepartment.id}
              initial={{ opacity: 0, y: 24, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="mt-4 w-full max-w-3xl rounded-3xl border border-border bg-surface/90 p-4 shadow-2xl backdrop-blur-2xl sm:mt-6 sm:p-6"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-accent sm:text-xs">
                    {activeDepartment.number}
                  </p>

                  <h2 className="font-bebasNeue text-3xl leading-none tracking-wider text-text-secondary sm:text-5xl">
                    {activeDepartment.name}
                  </h2>

                  <p className="mt-2 text-xs leading-relaxed text-text-muted sm:text-sm">
                    {activeDepartment.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleExploreClick}
                  className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                >
                  View Details
                  <HiArrowDown className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-6 text-center text-[9px] uppercase tracking-[0.18em] text-text-muted sm:mt-8 sm:text-xs sm:tracking-[0.25em]">
          Tap a department to focus · tap view details to explore
        </div>
      </div>
    </section>
  );
}
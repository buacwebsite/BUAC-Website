"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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
      return <FaPaintbrush className="h-5 w-5" />;
    case "event":
      return <FaPeopleGroup className="h-5 w-5" />;
    case "hr":
      return <FaUserTie className="h-5 w-5" />;
    case "itphoto":
      return (
        <div className="flex items-center gap-0.5">
          <FaLaptop className="h-4 w-4" />
          <FaCamera className="h-4 w-4" />
        </div>
      );
    case "pubandmarket":
      return (
        <div className="flex items-center gap-0.5">
          <FaEnvelopeOpen className="h-4 w-4" />
          <FaBullhorn className="h-4 w-4" />
        </div>
      );
    default:
      return <HiSparkles className="h-5 w-5" />;
  }
}

function getShortName(name: string) {
  if (name === "Human Resources Management") return "HRM";
  if (name === "IT & Photography") return "IT & Photo";
  if (name === "Publication & Marketing") return "Pub & Marketing";
  if (name === "Event Management") return "Events";
  return name;
}

export default function DepartmentOrbital({
  departments,
  onSelectDepartment,
}: DepartmentOrbitalProps) {
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(
    departments[0]?.id || null,
  );

  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!autoRotate) return;

    const timer = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.25) % 360);
    }, 45);

    return () => clearInterval(timer);
  }, [autoRotate]);

  useEffect(() => {
    if (!departments.length) return;
    if (!activeId) setActiveId(departments[0].id);
  }, [departments, activeId]);

  const activeDepartment = useMemo(() => {
    return (
      departments.find((department) => department.id === activeId) ||
      departments[0]
    );
  }, [departments, activeId]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 220;
    const radian = (angle * Math.PI) / 180;

    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);

    const depth = (1 + Math.sin(radian)) / 2;
    const opacity = Math.max(0.55, depth);
    const scale = 0.82 + depth * 0.28;
    const zIndex = Math.round(10 + depth * 50);

    return { x, y, angle, opacity, scale, zIndex };
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
      <section className="relative min-h-screen bg-black flex items-center justify-center text-white">
        <p className="text-white/50">Departments loading...</p>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-black px-4 py-24 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,98,43,0.18),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.08),transparent_30%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-40" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col items-center justify-center">
        <div className="mb-10 text-center">
          <motion.p
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-accent"
          >
            BUAC Structure
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-bebasNeue text-6xl leading-none tracking-wider text-white md:text-8xl"
          >
            Departments
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/55 md:text-base"
          >
            Five departments work together to design, manage, document, and
            promote every BUAC adventure.
          </motion.p>
        </div>

        <div
          ref={orbitRef}
          className="relative flex h-[560px] w-full max-w-5xl items-center justify-center"
          onMouseEnter={() => setAutoRotate(false)}
          onMouseLeave={() => {
            if (!activeId) setAutoRotate(true);
          }}
        >
          {/* Orbit rings */}
          <div className="absolute h-[460px] w-[460px] rounded-full border border-white/10" />
          <div className="absolute h-[350px] w-[350px] rounded-full border border-accent/10" />
          <div className="absolute h-[250px] w-[250px] rounded-full border border-white/5" />

          {/* Center logo */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute z-30 flex flex-col items-center justify-center"
          >
            <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-accent/40 bg-black/80 p-4 shadow-2xl shadow-accent/20 backdrop-blur-xl">
              <div className="absolute inset-0 rounded-3xl bg-accent/10 blur-xl" />

              <Image
                src="/assets/logos/buac.webp"
                alt="BUAC Logo"
                width={86}
                height={86}
                className="relative z-10 h-20 w-20 object-contain"
                priority
              />
            </div>

            <div className="mt-4 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white/60">
              Adventure Club
            </div>
          </motion.div>

          {/* Department nodes */}
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
                    isActive ? 1.18 : position.scale
                  })`,
                  opacity: isActive ? 1 : position.opacity,
                  zIndex: isActive ? 80 : position.zIndex,
                }}
              >
                <div
                  className={`absolute rounded-full blur-xl transition-all ${
                    isActive ? "h-24 w-24 bg-accent/30" : "h-16 w-16 bg-white/10"
                  }`}
                />

                <div
                  className={`relative flex h-16 w-16 items-center justify-center rounded-2xl border-2 backdrop-blur-xl transition-all duration-300 ${
                    isActive
                      ? "border-accent bg-accent text-white shadow-xl shadow-accent/30"
                      : "border-white/20 bg-black/70 text-white hover:border-accent hover:text-accent"
                  }`}
                >
                  {getDepartmentIcon(department.id)}
                </div>

                <div
                  className={`mt-3 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-bold transition-all ${
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

          {/* Active detail card */}
          <AnimatePresence mode="wait">
            {activeDepartment && (
              <motion.div
                key={activeDepartment.id}
                initial={{ opacity: 0, y: 24, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 24, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-0 z-40 w-full max-w-3xl rounded-3xl border border-white/10 bg-black/75 p-5 shadow-2xl backdrop-blur-2xl md:p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-accent">
                      {activeDepartment.number}
                    </p>

                    <h2 className="font-bebasNeue text-4xl leading-none tracking-wider text-white md:text-5xl">
                      {activeDepartment.name}
                    </h2>

                    <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white/60">
                      {activeDepartment.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleExploreClick}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent/90"
                  >
                    View Details
                    <HiArrowDown className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-white/35">
          Click a department to focus · click view details to scroll
        </div>
      </div>
    </section>
  );
}
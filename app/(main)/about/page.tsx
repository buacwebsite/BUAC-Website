"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { DepartmentSections } from "../../components/DepartmentSection";
import { useApiData } from "@/lib/publicContent";
import PageLoader from "@/app/components/ui/PageLoader";

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
}

function DepartmentNodeImage({
  image,
  name,
  className = "h-10 w-10",
}: {
  image: string;
  name: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      {image ? (
        <Image
          src={image}
          alt={`${name} Node`}
          fill
          className="object-cover"
          sizes="96px"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-accent text-white">
          <span className="font-bebasNeue text-lg">{name.charAt(0)}</span>
        </div>
      )}
    </div>
  );
}

function getDepartmentDisplayTitle(name: string) {
  if (name === "Human Resources Management") return "Human Resources";
  if (name === "Publication & Marketing") return "Publication";
  return name;
}

function RadialDepartmentTimeline({
  departments,
  onSelectDepartment,
}: {
  departments: Department[];
  onSelectDepartment: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [orbitRadius, setOrbitRadius] = useState(225);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;

      if (width < 380) setOrbitRadius(105);
      else if (width < 480) setOrbitRadius(120);
      else if (width < 640) setOrbitRadius(140);
      else if (width < 768) setOrbitRadius(165);
      else if (width < 1024) setOrbitRadius(190);
      else setOrbitRadius(225);
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    if (!mounted || !autoRotate || departments.length === 0) return;

    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.28) % 360).toFixed(3)));
    }, 50);

    return () => clearInterval(rotationTimer);
  }, [autoRotate, mounted, departments.length]);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setActiveId(null);
      setAutoRotate(true);
    }
  };

  const handleNodeClick = (department: Department, index: number) => {
    setActiveId(department.id);
    setAutoRotate(false);

    const totalNodes = departments.length;
    if (totalNodes === 0) return;

    const targetAngle = (index / totalNodes) * 360;
    setRotationAngle(270 - targetAngle);

    onSelectDepartment(department.id);
  };

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = Number((orbitRadius * Math.cos(radian)).toFixed(3));
    const y = Number((orbitRadius * Math.sin(radian)).toFixed(3));
    const zIndex = Math.round(100 + 50 * Math.cos(radian));

    const opacity = Number(
      Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2))).toFixed(6),
    );

    const scale = Number(
      (0.86 + 0.18 * ((1 + Math.sin(radian)) / 2)).toFixed(6),
    );

    return { x, y, zIndex, opacity, scale };
  };

  const hasDepartments = departments.length > 0;

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-background px-3 pt-20 sm:px-6 sm:pt-24"
      ref={containerRef}
      onClick={handleContainerClick}
      suppressHydrationWarning
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,98,43,0.18),transparent_32%)]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col items-center justify-center">
        <div className="mb-4 text-center sm:mb-6">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bebasNeue text-4xl leading-none tracking-wider text-accent sm:text-6xl md:text-8xl lg:text-9xl"
          >
            Departments
          </motion.h1>
        </div>

        {!hasDepartments ? (
          <div className="rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 px-8 py-16 text-center">
            <p className="font-bebasNeue text-2xl tracking-wide text-text-secondary sm:text-3xl">
              No Departments Yet
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Departments have not been added yet.
            </p>
          </div>
        ) : (
          <>
            <div className="relative h-[420px] w-full max-w-5xl sm:h-[520px] md:h-[620px]">
              <div
                className="absolute inset-0 flex items-center justify-center"
                ref={orbitRef}
                style={{ perspective: "1000px" }}
              >
                <div className="absolute z-20 flex h-20 w-20 items-center justify-center rounded-3xl border-2 border-accent bg-black shadow-2xl shadow-accent/30 sm:h-24 sm:w-24 md:h-28 md:w-28">
                  <div
                    className="absolute rounded-full border border-accent/30 opacity-40 animate-ping"
                    style={{
                      width: orbitRadius * 0.6,
                      height: orbitRadius * 0.6,
                    }}
                  />

                  <div
                    className="absolute rounded-full border border-accent/20 opacity-30 animate-ping"
                    style={{
                      width: orbitRadius * 0.78,
                      height: orbitRadius * 0.78,
                      animationDelay: "0.5s",
                    }}
                  />

                  <Image
                    src="/assets/logos/buac.webp"
                    alt="BUAC Logo"
                    width={82}
                    height={82}
                    className="relative z-10 h-14 w-14 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20"
                    priority
                  />
                </div>

                <div
                  className="absolute rounded-full border border-accent/20"
                  style={{
                    width: orbitRadius * 2,
                    height: orbitRadius * 2,
                  }}
                />

                <div
                  className="absolute rounded-full border border-accent/10"
                  style={{
                    width: orbitRadius * 1.5,
                    height: orbitRadius * 1.5,
                  }}
                />

                {mounted &&
                  departments.map((department, index) => {
                    const position = calculateNodePosition(
                      index,
                      departments.length,
                    );

                    const isActive = department.id === activeId;

                    const nodeStyle = {
                      transform: `translate(${position.x}px, ${position.y}px) scale(${
                        isActive ? 1.15 : position.scale
                      })`,
                      zIndex: isActive ? 220 : position.zIndex,
                      opacity: isActive ? 1 : position.opacity,
                    };

                    return (
                      <div
                        key={department.id}
                        className="absolute cursor-pointer transition-all duration-700"
                        style={nodeStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNodeClick(department, index);
                        }}
                      >
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 p-1 transition-all duration-300 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                            isActive
                              ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                              : "border-accent/50 bg-accent text-white"
                          }`}
                        >
                          <DepartmentNodeImage
                            image={department.image}
                            name={getDepartmentDisplayTitle(department.name)}
                            className="h-full w-full"
                          />
                        </div>

                        <div
                          className={`absolute left-1/2 top-[52px] max-w-[110px] -translate-x-1/2 text-center font-bebasNeue text-[11px] leading-tight tracking-wide transition-all duration-300 sm:top-14 sm:max-w-[140px] sm:text-sm md:top-16 md:max-w-none md:whitespace-nowrap md:text-xl md:tracking-wider ${
                            isActive
                              ? "text-accent scale-110"
                              : "text-accent/70"
                          }`}
                        >
                          {getDepartmentDisplayTitle(department.name)}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-text-muted sm:text-xs">
              Tap a department to view details
            </p>
          </>
        )}
      </div>
    </section>
  );
}

interface DepartmentsResponse {
  departments?: Department[];
  error?: string;
}

const About = () => {
  const { data, loading, error } = useApiData<DepartmentsResponse>(
    "/api/content/departments",
  );

  const departments = useMemo(
    () => (Array.isArray(data?.departments) ? data.departments : []),
    [data],
  );

  const scrollToSection = useCallback((sectionId: string) => {
    requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);

      if (!section) return;

      const navOffset = 96;
      const top =
        section.getBoundingClientRect().top + window.scrollY - navOffset;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  }, []);

  if (loading) {
    return <PageLoader label="Loading departments" />;
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
        <p className="text-text-muted">
          Unable to load departments right now. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <>
      <RadialDepartmentTimeline
        departments={departments}
        onSelectDepartment={scrollToSection}
      />

      <DepartmentSections departments={departments} />
    </>
  );
};

export default About;
"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { HiArrowDown, HiArrowRight, HiBolt, HiLink } from "react-icons/hi2";
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

interface TimelineItem {
  id: number;
  departmentId: string;
  title: string;
  date: string;
  content: string;
  category: string;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  image: string;
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

function getShortContent(description: string) {
  if (!description) return "";
  if (description.length <= 210) return description;
  return `${description.slice(0, 210).trim()}...`;
}

function getStatusStyles(status: TimelineItem["status"]) {
  switch (status) {
    case "completed":
      return "text-white bg-accent border-accent";
    case "in-progress":
      return "text-accent bg-white border-white";
    default:
      return "text-white bg-black/40 border-white/30";
  }
}

function buildTimelineData(departments: Department[]): TimelineItem[] {
  return departments.map((department, index) => {
    const id = index + 1;

    const relatedIds =
      departments.length <= 1
        ? []
        : [
            ((index + 1) % departments.length) + 1,
            ((index + departments.length - 1) % departments.length) + 1,
          ].filter((relatedId, idx, arr) => arr.indexOf(relatedId) === idx);

    return {
      id,
      departmentId: department.id,
      title: getDepartmentDisplayTitle(department.name),
      date: department.number,
      content: department.description,
      category: "Department",
      relatedIds,
      status: index === 0 ? "in-progress" : "completed",
      energy: 78 + index * 4,
      image: department.image,
    };
  });
}

function RadialDepartmentTimeline({
  departments,
  onViewDetails,
}: {
  departments: Department[];
  onViewDetails: (id: string) => void;
}) {
  const timelineData = useMemo(
    () => buildTimelineData(departments),
    [departments],
  );

  const [mounted, setMounted] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(
    timelineData.length ? 1 : null,
  );
  const [orbitRadius, setOrbitRadius] = useState(225);
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);

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

  const getRelatedItems = useCallback(
    (itemId: number): number[] => {
      const currentItem = timelineData.find((item) => item.id === itemId);
      return currentItem ? currentItem.relatedIds : [];
    },
    [timelineData],
  );

  const isRelatedToActive = useCallback(
    (itemId: number): boolean => {
      if (!activeNodeId) return false;
      return getRelatedItems(activeNodeId).includes(itemId);
    },
    [activeNodeId, getRelatedItems],
  );

  const centerViewOnNode = useCallback(
    (nodeId: number) => {
      const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
      const totalNodes = timelineData.length;
      if (!totalNodes) return;
      const targetAngle = (nodeIndex / totalNodes) * 360;
      setRotationAngle(270 - targetAngle);
    },
    [timelineData],
  );

  const toggleItem = useCallback(
    (id: number) => {
      setExpandedItems((prev) => {
        const newState: Record<number, boolean> = {};

        Object.keys(prev).forEach((key) => {
          const parsedKey = Number(key);
          newState[parsedKey] = parsedKey === id ? !prev[parsedKey] : false;
        });

        if (!(id in newState)) newState[id] = true;

        if (!prev[id]) {
          setActiveNodeId(id);
          setAutoRotate(false);

          const relatedItems = getRelatedItems(id);
          const newPulseEffect: Record<number, boolean> = {};
          relatedItems.forEach((relId) => {
            newPulseEffect[relId] = true;
          });

          setPulseEffect(newPulseEffect);
          centerViewOnNode(id);
        } else {
          setActiveNodeId(null);
          setAutoRotate(true);
          setPulseEffect({});
        }

        return newState;
      });
    },
    [centerViewOnNode, getRelatedItems],
  );

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  useEffect(() => {
    if (!mounted || !autoRotate || timelineData.length === 0) return;

    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.28) % 360).toFixed(3)));
    }, 50);

    return () => clearInterval(rotationTimer);
  }, [autoRotate, mounted, timelineData.length]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = Number((orbitRadius * Math.cos(radian)).toFixed(3));
    const y = Number((orbitRadius * Math.sin(radian)).toFixed(3));
    const zIndex = Math.round(100 + 50 * Math.cos(radian));

    const opacity = Number(
      Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2))).toFixed(6),
    );
    const scale = Number((0.86 + 0.18 * ((1 + Math.sin(radian)) / 2)).toFixed(6));

    return { x, y, zIndex, opacity, scale };
  };

  const hasDepartments = timelineData.length > 0;

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
                    style={{ width: orbitRadius * 0.6, height: orbitRadius * 0.6 }}
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
                  style={{ width: orbitRadius * 2, height: orbitRadius * 2 }}
                />
                <div
                  className="absolute rounded-full border border-accent/10"
                  style={{ width: orbitRadius * 1.5, height: orbitRadius * 1.5 }}
                />

                {mounted &&
                  timelineData.map((item, index) => {
                    const position = calculateNodePosition(index, timelineData.length);
                    const isExpanded = expandedItems[item.id];
                    const isRelated = isRelatedToActive(item.id);
                    const isPulsing = pulseEffect[item.id];

                    const nodeStyle = {
                      transform: `translate(${position.x}px, ${position.y}px) scale(${
                        isExpanded ? 1.1 : position.scale
                      })`,
                      zIndex: isExpanded ? 220 : position.zIndex,
                      opacity: isExpanded ? 1 : position.opacity,
                    };

                    return (
                      <div
                        key={item.id}
                        className="absolute cursor-pointer transition-all duration-700"
                        style={nodeStyle}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItem(item.id);
                        }}
                      >
                        <div
                          className={`absolute rounded-full -inset-1 ${
                            isPulsing ? "animate-pulse duration-1000" : ""
                          }`}
                          style={{
                            background:
                              "radial-gradient(circle, rgba(255,98,43,0.28) 0%, rgba(255,98,43,0) 70%)",
                            width: `${item.energy * 0.4 + 40}px`,
                            height: `${item.energy * 0.4 + 40}px`,
                            left: `-${(item.energy * 0.4 + 40 - 40) / 2}px`,
                            top: `-${(item.energy * 0.4 + 40 - 40) / 2}px`,
                          }}
                        />

                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-2xl border-2 p-1 transition-all duration-300 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
                            isExpanded
                              ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                              : isRelated
                                ? "border-accent bg-accent/60 text-white animate-pulse"
                                : "border-accent/50 bg-accent text-white"
                          }`}
                        >
                          <DepartmentNodeImage
                            image={item.image}
                            name={item.title}
                            className="h-full w-full"
                          />
                        </div>

                        <div
                          className={`absolute left-1/2 top-[52px] max-w-[110px] -translate-x-1/2 text-center font-bebasNeue text-[11px] leading-tight tracking-wide transition-all duration-300 sm:top-14 sm:max-w-[140px] sm:text-sm md:top-16 md:max-w-none md:whitespace-nowrap md:text-xl md:tracking-wider ${
                            isExpanded ? "text-accent" : "text-accent/70"
                          }`}
                        >
                          {item.title}
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, y: 18, scale: 0.94 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: 18, scale: 0.94 }}
                              transition={{ duration: 0.25 }}
                              style={{
                                left: isMobile ? `${-position.x - 140}px` : "50%",
                                transform: isMobile ? "none" : "translateX(-50%)",
                              }}
                              className="absolute top-24 w-[280px] overflow-visible rounded-3xl border-2 border-accent bg-white p-4 shadow-2xl shadow-accent/20 sm:w-72 sm:p-5 md:w-80"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <span
                                  className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyles(item.status)}`}
                                >
                                  {item.status === "completed"
                                    ? "Complete"
                                    : item.status === "in-progress"
                                      ? "Active"
                                      : "Pending"}
                                </span>
                                <span className="font-mono text-xs text-text-muted">
                                  {item.date}
                                </span>
                              </div>

                              <h3 className="font-bebasNeue text-2xl leading-none tracking-wider text-text-secondary sm:text-3xl">
                                {item.title}
                              </h3>

                              <p className="mt-3 text-xs leading-relaxed text-text-muted">
                                {getShortContent(item.content)}
                              </p>

                              <div className="mt-4 border-t border-accent/20 pt-3">
                                <div className="mb-1 flex items-center justify-between text-xs text-text-muted">
                                  <span className="flex items-center gap-1">
                                    <HiBolt className="h-3 w-3 text-accent" />
                                    Department Energy
                                  </span>
                                  <span className="font-mono">{item.energy}%</span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-accent/10">
                                  <div
                                    className="h-full rounded-full bg-accent"
                                    style={{ width: `${item.energy}%` }}
                                  />
                                </div>
                              </div>

                              {item.relatedIds.length > 0 && (
                                <div className="mt-4 border-t border-accent/20 pt-3">
                                  <div className="mb-2 flex items-center gap-1">
                                    <HiLink className="h-3 w-3 text-accent" />
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
                                      Connected
                                    </h4>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {item.relatedIds.map((relatedId) => {
                                      const relatedItem = timelineData.find(
                                        (department) => department.id === relatedId,
                                      );
                                      return (
                                        <button
                                          key={relatedId}
                                          type="button"
                                          className="flex h-7 items-center rounded-full border border-accent/30 bg-accent/5 px-2 text-xs font-semibold text-accent transition hover:bg-accent hover:text-white"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleItem(relatedId);
                                          }}
                                        >
                                          {relatedItem?.title}
                                          <HiArrowRight className="ml-1 h-3 w-3" />
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onViewDetails(item.departmentId);
                                }}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-xs font-bold text-white transition hover:bg-accent/90"
                              >
                                View Details
                                <HiArrowDown className="h-4 w-4" />
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
              </div>
            </div>

            <p className="mt-4 text-center text-[10px] uppercase tracking-[0.2em] text-text-muted sm:text-xs">
              Tap a department to explore
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
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
        onViewDetails={scrollToSection}
      />
      <DepartmentSections departments={departments} />
    </>
  );
};

export default About;
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  HiArrowDown,
  HiArrowRight,
  HiBolt,
  HiLink,
} from "react-icons/hi2";
import { DepartmentSections } from "../../components/DepartmentSection";

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

const defaultDepartments: Department[] = [
  {
    id: "creative",
    name: "Creative",
    number: "01",
    image: "/assets/footerbg.webp",
    description:
      "The Creative Department of BRAC University Adventure Club (BUAC) is responsible for transforming ideas into immersive experiences through program décor, thematic planning, and handcrafted props. This department shapes the atmosphere of every event, ensuring that each program reflects the adventurous identity and vision of the club. From designing event themes and visual setups to crafting creative elements that enhance participant engagement, the department plays a vital role in bringing BUAC’s programs to life. Through innovation, teamwork, and attention to detail, the Creative Department elevates every adventure beyond execution turning it into a memorable experience.",
  },
  {
    id: "event",
    name: "Event Management",
    number: "02",
    image: "/assets/footerbg.webp",
    description:
      "The Event Management Department of BRAC University Adventure Club (BUAC) serves as the backbone of all club activities and initiatives. This department is responsible for planning, coordinating, and executing a wide range of events that reflect the adventurous spirit and core values of the club. From large-scale adventure programs and national-level events to in-campus activities, workshops, and orientation sessions, the team ensures that every event is strategically designed, well-organized, and seamlessly delivered. The department works closely with logistics, finance, and safety teams to maintain high standards of professionalism, safety, and participant engagement. Beyond execution, the Event Management Department focuses on innovation, teamwork, and leadership development providing members with hands-on experience in project planning, communication, crisis management, and operational excellence. Through meticulous coordination and creative execution, the department plays a vital role in strengthening the club’s impact and enhancing the overall adventure culture at BRAC University.",
  },
  {
    id: "hr",
    name: "Human Resources Management",
    number: "03",
    image: "/assets/footerbg.webp",
    description:
      "The Human Resources Management Department of BRAC University Adventure Club (BUAC) is responsible for building, managing, and empowering the people who drive the club forward. This department oversees recruitment, member development, internal coordination, and performance management to ensure a motivated, skilled, and well-structured team. From onboarding new adventurers to maintaining discipline, teamwork, and organizational efficiency, the department plays a crucial role in sustaining a healthy club culture. By fostering leadership, accountability, and collaboration, the Human Resources Management Department ensures that every member is prepared to take on challenges and contribute effectively to BUAC’s mission.",
  },
  {
    id: "itphoto",
    name: "IT & Photography",
    number: "04",
    image: "/assets/footerbg.webp",
    description:
      "The IT & Photography Department of BRAC University Adventure Club (BUAC) is responsible for managing the club’s digital operations while capturing the essence of every adventure. This department ensures seamless technical support, digital communication, and visual documentation across all club activities. From maintaining digital platforms to capturing powerful moments from events, expeditions, and in-campus programs, the department bridges technology and storytelling. Through innovation, creativity, and precision, the IT & Photography Department preserves BUAC’s journey, strengthens its digital presence, and showcases the adventurous spirit of the club to a wider audience.",
  },
  {
    id: "pubandmarket",
    name: "Publication & Marketing",
    number: "05",
    image: "/assets/footerbg.webp",
    description:
      "The Publication & Marketing Department of BRAC University Adventure Club (BUAC) is responsible for documenting, organizing, and presenting the club’s activities through written and published content. This department ensures that every adventure, achievement, and milestone is accurately recorded and professionally communicated. From preparing official documents, proposal letters, and event publications to curating written content for digital and print platforms, the department plays a key role in preserving BUAC’s journey. Through clarity, consistency, and strong storytelling, the Publication & Marketing Department strengthens the club’s identity and ensures its adventures are remembered beyond the trail.",
  },
];

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
    case "pending":
      return "text-white bg-black/40 border-white/30";
    default:
      return "text-white bg-black/40 border-white/30";
  }
}

function buildTimelineData(departments: Department[]): TimelineItem[] {
  const safeDepartments = departments.length ? departments : defaultDepartments;

  return safeDepartments.map((department, index) => {
    const id = index + 1;

    const relatedIds =
      safeDepartments.length <= 1
        ? []
        : [
            ((index + 1) % safeDepartments.length) + 1,
            ((index + safeDepartments.length - 1) % safeDepartments.length) + 1,
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
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>(
    {},
  );
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    setMounted(true);
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
      const relatedItems = getRelatedItems(activeNodeId);
      return relatedItems.includes(itemId);
    },
    [activeNodeId, getRelatedItems],
  );

  const centerViewOnNode = useCallback(
    (nodeId: number) => {
      const nodeIndex = timelineData.findIndex((item) => item.id === nodeId);
      const totalNodes = timelineData.length;
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

        if (!(id in newState)) {
          newState[id] = true;
        }

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
    if (!mounted || !autoRotate) return;

    const rotationTimer = setInterval(() => {
      setRotationAngle((prev) => Number(((prev + 0.28) % 360).toFixed(3)));
    }, 50);

    return () => clearInterval(rotationTimer);
  }, [autoRotate, mounted]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radius = 225;
    const radian = (angle * Math.PI) / 180;

    const x = Number((radius * Math.cos(radian)).toFixed(3));
    const y = Number((radius * Math.sin(radian)).toFixed(3));

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Number(
      Math.max(
        0.45,
        Math.min(1, 0.45 + 0.55 * ((1 + Math.sin(radian)) / 2)),
      ).toFixed(6),
    );
    const scale = Number(
      (0.86 + 0.18 * ((1 + Math.sin(radian)) / 2)).toFixed(6),
    );

    return { x, y, angle, zIndex, opacity, scale };
  };

  return (
    <section
      className="relative min-h-screen w-full overflow-hidden bg-background pt-24"
      ref={containerRef}
      onClick={handleContainerClick}
      suppressHydrationWarning
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,98,43,0.18),transparent_32%)]" />
      <div className="absolute inset-x-0 top-0 h-64 bg-linear-to-b from-accent/10 to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-6rem)] max-w-7xl flex-col items-center justify-center px-4">
        <div className="mb-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bebasNeue text-6xl leading-none tracking-wider text-accent md:text-8xl lg:text-9xl"
          >
            Departments
          </motion.h1>
        </div>

        <div className="relative h-[620px] w-full max-w-5xl">
          <div
            className="absolute inset-0 flex items-center justify-center"
            ref={orbitRef}
            style={{ perspective: "1000px" }}
          >
            <div className="absolute z-20 flex h-28 w-28 items-center justify-center rounded-3xl border-2 border-accent bg-black shadow-2xl shadow-accent/30">
              <div className="absolute h-36 w-36 rounded-full border border-accent/30 animate-ping opacity-40" />
              <div
                className="absolute h-44 w-44 rounded-full border border-accent/20 animate-ping opacity-30"
                style={{ animationDelay: "0.5s" }}
              />

              <Image
                src="/assets/logos/buac.webp"
                alt="BUAC Logo"
                width={82}
                height={82}
                className="relative z-10 h-20 w-20 object-contain"
                priority
              />
            </div>

            <div className="absolute h-[450px] w-[450px] rounded-full border border-accent/20" />
            <div className="absolute h-[340px] w-[340px] rounded-full border border-accent/10" />

            {mounted &&
              timelineData.map((item, index) => {
                const position = calculateNodePosition(
                  index,
                  timelineData.length,
                );
                const isExpanded = expandedItems[item.id];
                const isRelated = isRelatedToActive(item.id);
                const isPulsing = pulseEffect[item.id];

                const nodeStyle = {
                  transform: `translate(${position.x}px, ${position.y}px) scale(${
                    isExpanded ? 1.15 : position.scale
                  })`,
                  zIndex: isExpanded ? 220 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                };

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      nodeRefs.current[item.id] = el;
                    }}
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
                        width: `${item.energy * 0.5 + 48}px`,
                        height: `${item.energy * 0.5 + 48}px`,
                        left: `-${(item.energy * 0.5 + 48 - 48) / 2}px`,
                        top: `-${(item.energy * 0.5 + 48 - 48) / 2}px`,
                      }}
                    />

                    <div
                      className={`
                        flex h-14 w-14 items-center justify-center rounded-2xl border-2 p-1
                        ${
                          isExpanded
                            ? "border-accent bg-accent text-white shadow-lg shadow-accent/30"
                            : isRelated
                              ? "border-accent bg-accent/60 text-white animate-pulse"
                              : "border-accent/50 bg-accent text-white"
                        }
                        transition-all duration-300
                      `}
                    >
                      <DepartmentNodeImage
                        image={item.image}
                        name={item.title}
                        className="h-11 w-11"
                      />
                    </div>

                    <div
                      className={`
                        absolute top-16 left-1/2 -translate-x-1/2 whitespace-nowrap
                        font-bebasNeue text-xl tracking-wider transition-all duration-300
                        ${isExpanded ? "text-accent scale-125" : "text-accent/70"}
                      `}
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
                          className="absolute top-24 left-1/2 w-80 -translate-x-1/2 overflow-visible rounded-3xl border-2 border-accent bg-white p-5 shadow-2xl shadow-accent/20"
                        >
                          <div className="absolute -top-4 left-1/2 h-4 w-px -translate-x-1/2 bg-accent/60" />

                          <div className="mb-3 flex items-center justify-between gap-3">
                            <span
                              className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase ${getStatusStyles(
                                item.status,
                              )}`}
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

                          <h3 className="font-bebasNeue text-3xl leading-none tracking-wider text-text-secondary">
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
      </div>
    </section>
  );
}

const About = () => {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;

    fetchedRef.current = true;

    const fetchDepartments = async () => {
      try {
        const res = await axios.get("/api/content/departments");

        if (res.data && Array.isArray(res.data.departments)) {
          setDepartments(
            res.data.departments.length
              ? res.data.departments
              : defaultDepartments,
          );
        } else {
          setDepartments(defaultDepartments);
        }
      } catch (err) {
        console.error("Error fetching departments", err);
        setDepartments(defaultDepartments);
      }
    };

    fetchDepartments();
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, []);

  return (
    <>
      <RadialDepartmentTimeline
        departments={departments ?? defaultDepartments}
        onViewDetails={scrollToSection}
      />

      <DepartmentSections departments={departments ?? defaultDepartments} />
    </>
  );
};

export default About;
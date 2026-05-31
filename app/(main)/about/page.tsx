"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import axios from "axios";
import { DepartmentSections } from "../../components/DepartmentSection";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useEditor } from "@/app/context/EditorContext";
import { useAuth } from "@/app/context/AuthProvider";
import {
  FaChevronDown,
  FaPeopleGroup,
  FaUserTie,
  FaLaptop,
  FaCamera,
  FaPaintbrush,
  FaEnvelopeOpen,
  FaBullhorn,
} from "react-icons/fa6";
import { motion } from "framer-motion";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
  fadeInUp,
} from "@/lib/animations";

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
}

interface PanelMember {
  name: string;
  position: string;
  image: string;
}

const About = () => {
  const [departments, setDepartments] = useState<Department[] | null>(null);
  const [panelMembers, setPanelMembers] = useState<PanelMember[] | null>(null);
  const { auth } = useAuth();
  const { openEditor } = useEditor();
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const deptTextContainerRef = useRef<HTMLDivElement>(null);
  const deptContainerRef = useRef<HTMLUListElement>(null);
  const deptRef = useRef<Array<HTMLLIElement | null>>([]);
  const deptNameRef = useRef<Array<HTMLSpanElement | null>>([]);
  const mmRef = useRef(gsap.matchMedia());
  const fetchedRef = useRef(false);
  const panelSectionRef = useRef<HTMLDivElement>(null);
  const panelCardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    const fetchDepartments = async () => {
      try {
        const res = await axios.get("/api/content/departments");
        if (res.status !== 200) {
          console.error("Failed to fetch departments");
          return;
        }
        if (res.data && res.data.departments) {
          setDepartments(res.data.departments);
        }
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };
    const fetchPanelMembers = async () => {
      try {
        const res = await axios.get("/api/content/panelMembers");
        if (res.status !== 200) {
          console.error("Failed to fetch panel members");
          return;
        }
        if (res.data && res.data.panelMembers) {
          setPanelMembers(res.data.panelMembers);
        }
      } catch (err) {
        console.error("Error fetching panel members", err);
      }
    };

    fetchDepartments();
    fetchPanelMembers();
  }, []);

  useGSAP(
    () => {
      if (!departments || departments.length === 0 || !containerRef.current)
        return;
      const mm = mmRef.current;
      const timeline = gsap.timeline({ delay: 0.2 });

      gsap.set(deptRef.current, {
        width: "100%",
        flex: 1,
        padding: "1rem",
        borderRadius: "0px",
      });
      mm.add(
        {
          isMobile: "(max-width: 767px)",
          isDesktop: "(min-width: 768px)",
        },
        (context) => {
          const { isDesktop } = context.conditions ?? { isDesktop: false };
          gsap.set(deptNameRef.current, {
            fontSize: isDesktop ? "5rem" : "3rem",
            opacity: 0,
          });
        },
      );

      gsap.set(deptTextContainerRef.current, { zIndex: 10 });

      setIsAnimating(true);

      timeline
        .from(deptContainerRef.current, {
          y: -800,
          backgroundColor: `#ff622b`,
          scale: 1.05,
          gap: "0",
          duration: 1.2,
          ease: "power2.out",
        })
        .to(deptContainerRef.current, {
          y: 0,
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out",
        })
        .to(deptContainerRef.current, {
          backgroundColor: `#ff622b`,
          scale: 0.98,
          gap: "0",
          duration: 0.1,
          ease: "power3.out",
          onUpdate: () => {
            gsap.to(deptTextContainerRef.current, {
              duration: 0.6,
              ease: "power2.out",
              color: "var(--color-accent)",
              onComplete: () => {
                gsap.set(deptTextContainerRef.current, { zIndex: 0 });
              },
            });
            gsap.to(deptTextContainerRef.current, {
              duration: 1,
              ease: "power3.inOut",
              y:
                deptContainerRef.current?.offsetHeight &&
                -deptContainerRef.current.offsetHeight / 2 -
                  deptTextContainerRef.current!.children[0].clientHeight / 2,
            });
          },
          onComplete: () => {
            gsap.to(deptNameRef.current, { opacity: 0.5, duration: 0.6 });
          },
        })
        .to(deptContainerRef.current, {
          scale: 1,
          gap: "0.5rem",
          backgroundColor: `transparent`,
          duration: 0.1,
          ease: "none",
          onUpdate: () => {
            gsap.to(deptRef.current, {
              duration: 0.6,
              ease: "power2.out",
              borderRadius: "12px",
            });
          },
          onComplete: () => {
            setIsAnimating(false);
          },
        });
    },
    { scope: containerRef, dependencies: [departments] },
  );

  const handleMouseEnter = useCallback(
    (index: number, event: React.MouseEvent<HTMLLIElement>) => {
      if (isAnimating) event.preventDefault();
      const isDesktop = window.matchMedia("(min-width: 768px)").matches;
      deptRef.current.forEach((dept, idx) => {
        if (dept) {
          gsap.to(dept, {
            flex: idx === index ? 3 : 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
            width:
              idx === index
                ? isDesktop
                  ? "80%"
                  : "100%"
                : isDesktop
                  ? "30%"
                  : "100%",
            padding: "1rem",
            overwrite: true,
          });
        }
      });

      deptNameRef.current.forEach((name, idx) => {
        if (name) {
          gsap.to(name, {
            opacity: idx === index ? 1 : 0.5,
            fontSize:
              idx === index
                ? isDesktop
                  ? "3rem"
                  : "2rem"
                : isDesktop
                  ? "5rem"
                  : "3rem",
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });
        }
      });
    },
    [isAnimating],
  );

  const handleMouseLeave = useCallback(
    (event: React.MouseEvent<HTMLLIElement>) => {
      if (isAnimating) event.preventDefault();
      gsap.to(deptRef.current, {
        flex: 1,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)",
        width: "100%",
        padding: "1rem",
        overwrite: true,
      });

      gsap.to(deptNameRef.current, {
        opacity: 0.5,
        fontSize: "5rem",
        duration: 0.3,
        ease: "power2.out",
        overwrite: true,
      });
    },
    [isAnimating],
  );

  const scrollToSection = useCallback((sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      gsap.to(window, {
        scrollTo: { y: section, offsetY: 0, autoKill: true },
        duration: 1,
        ease: "power2.inOut",
      });
    }
  }, []);

  return (
    <>
      <div
        className="flex flex-col h-screen justify-start items-center lg:mt-25 lg:-mb-25 pt-24 md:pt-16"
        ref={containerRef}
      >
        <ul
          className="flex flex-col md:flex-row text-lg h-[60vh] md:h-2/3 w-full max-w-screen px-4 md:px-8 justify-center items-center"
          ref={deptContainerRef}
        >
          <div
            className={`absolute h-full w-full flex justify-center items-center px-4`}
            ref={deptTextContainerRef}
          >
            <h1 className="text-6xl sm:text-5xl md:text-8xl lg:text-8xl font-bebasNeue uppercase font-lightbold text-center">
              Departments
            </h1>
          </div>
          {departments?.map((dept, index) => (
            <li
              key={index}
              ref={(el) => {
                deptRef.current[index] = el;
              }}
              className={`relative group flex flex-col w-full bg-accent/80 h-full items-start justify-center md:justify-between cursor-pointer overflow-hidden z-5`}
              onMouseEnter={(event) => handleMouseEnter(index, event)}
              onMouseLeave={(event) => handleMouseLeave(event)}
              onClick={() => scrollToSection(dept.id)}
            >
              <span
                ref={(el) => {
                  deptNameRef.current[index] = el;
                }}
                className={`font-bebasNeue leading-20 h-full flex items-center md:items-start`}
              >
                {(() => {
                  const iconMap: Record<string, React.ReactNode> = {
                    event: (
                      <FaPeopleGroup className="hidden md:flex absolute right-0 -bottom-8 text-8xl md:text-[16rem] z-10" />
                    ),
                    hr: (
                      <FaUserTie className="hidden md:flex absolute bottom-6 text-8xl md:text-[11rem] z-10" />
                    ),
                    itphoto: (
                      <>
                        <FaLaptop className="hidden md:flex absolute -bottom-4 text-8xl md:text-[16rem] z-10" />
                        <FaCamera className="hidden md:flex absolute bottom-18 text-8xl md:text-[6rem] z-10" />
                      </>
                    ),
                    creative: (
                      <FaPaintbrush className="hidden md:flex absolute bottom-2 text-8xl md:text-[13rem] z-10" />
                    ),
                    pubandmarket: (
                      <>
                        <FaEnvelopeOpen className="hidden md:flex absolute bottom-6 text-8xl md:text-[11rem] z-10" />
                        <FaBullhorn
                          style={{ rotate: "-15deg" }}
                          className="hidden md:flex absolute bottom-24 right-18 text-8xl md:text-5xl z-10"
                        />
                      </>
                    ),
                  };
                  return (
                    iconMap[dept.id] && (
                      <div className="absolute flex justify-center items-center -bottom-6 -right-10 size-48">
                        {iconMap[dept.id]}
                      </div>
                    )
                  );
                })()}
                <h1 className="text-3xl md:text-7xl">{`${dept.name}`}</h1>
              </span>
              <span className="hidden md:flex text-text opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium pb-4 px-4 items-center gap-1">
                Click to Scroll
                <FaChevronDown className="animate-bounce" />
              </span>
            </li>
          ))}
        </ul>
      </div>
      <DepartmentSections departments={departments ?? []} />

      <MotionSection
        ref={panelSectionRef}
        className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-stone-900 via-stone-800 to-stone-900 flex items-center justify-center py-8 md:py-0"
      >
        <Image
          src="/assets/panelbg.jpg"
          alt="Panel Background"
          fill
          className="absolute inset-0 opacity-10"
        />

        <div className="relative z-10 w-full h-full px-4 md:px-8 py-8 md:py-16 flex flex-col items-center justify-center">
          <div className="mb-6 md:mb-12 text-center flex flex-col items-center relative">
            <RevealHeading className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-bebasNeue text-accent tracking-wider mb-2 drop-shadow-lg">
              Meet the Panel
            </RevealHeading>
            {auth && panelMembers && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                onClick={() => openEditor("panelmembers", panelMembers)}
                className="bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer z-20"
                title="Edit Panel Members"
              >
                <HiOutlinePencilAlt className="text-lg md:text-xl" />
                Edit
              </motion.button>
            )}
            <div className="w-20 md:w-32 h-1 bg-accent mx-auto"></div>
          </div>

          <StaggerGrid className="flex flex-col md:flex-row gap-4 md:gap-6 w-full max-w-8xl min-h-[60vh] md:h-[70vh] justify-center items-stretch">
            {panelMembers?.map((member, index) => (
              <StaggerItem
                key={index}
                className="group relative flex-1 min-w-0 min-h-125 md:min-h-0 rounded-lg overflow-hidden bg-stone-700 border-2 border-stone-600 shadow-2xl transition-all duration-500 hover:scale-105 hover:border-accent hover:shadow-accent/20 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(68,64,60,1) 0%, rgba(41,37,36,1) 100%)",
                  boxShadow:
                    "inset 0 2px 4px rgba(0,0,0,0.3), 0 8px 24px rgba(0,0,0,0.4)",
                }}
              >
                <div className="relative h-full overflow-hidden bg-stone-800">
                  <div className="absolute inset-0 bg-linear-to-t from-stone-900 via-transparent to-transparent z-10"></div>
                  <Image
                    src={member.image}
                    alt={member.name}
                    height={300}
                    width={150}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 -bottom-12 md:-bottom-16 flex justify-center font-white z-50">
                    <Image
                      src="/assets/board.webp"
                      alt={member.name}
                      width={292}
                      height={292}
                      className="w-64 h-32 md:w-96 md:h-48 object-cover mx-auto brightness-80"
                    />
                    <h1
                      className="absolute inset-0 top-2 md:top-3 h-full uppercase font-poppins font-bold text-base md:text-xl tracking-wider"
                      style={{
                        textAlign: "center",
                        background: "url(/assets/board.webp)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        filter:
                          "brightness(0.5) contrast(1.3) drop-shadow(-1px -1px 1px rgba(0,0,0,0.8)) drop-shadow(1px 1px 1px rgba(255,255,255,0.2))",
                      }}
                    >
                      {member.name}
                    </h1>
                    <p
                      className="absolute inset-0 top-8 md:top-10 h-full uppercase font-poppins font-semibold text-xs md:text-sm tracking-widest text-center text-stone-200 opacity-90"
                      style={{
                        textAlign: "center",
                        background: "url(/assets/board.webp)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        color: "transparent",
                        filter:
                          "brightness(0.5) contrast(1.3) drop-shadow(-1px -1px 1px rgba(0,0,0,0.8)) drop-shadow(1px 1px 1px rgba(255,255,255,0.2))",
                      }}
                    >
                      {member.position}
                    </p>
                  </div>
                </div>

                <div className="absolute inset-0 bg-linear-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>
      </MotionSection>
      <section className="h-screen flex justify-center items-center text-6xl font-poppins text-text-secondary">
        End Section
      </section>
    </>
  );
};

export default About;
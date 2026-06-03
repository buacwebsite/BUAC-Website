"use client";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { IoLocationSharp, IoCalendarSharp } from "react-icons/io5";
import { FaMountain, FaLeaf } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { motion } from "framer-motion";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
  fadeInUp,
  fadeInLeft,
  fadeInRight,
} from "@/lib/animations";
import UniqueLoading from "@/app/components/ui/UniqueLoading";

gsap.registerPlugin(ScrollTrigger);

interface TourImage {
  type: string;
  alt: string;
  url: string;
}

interface Tour {
  id: number;
  name: string;
  subtitle: string;
  location: string;
  icon: string;
  elevation?: string;
  description?: string;
  visitCount: number;
  latestVisitYear: string;
  layoutType: "left" | "right";
  gridLayout: string;
  images: TourImage[];
}

const Tours = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const strokeDivRef = useRef<HTMLDivElement>(null);
  const strokeRef = useRef<SVGPathElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const lenis = useLenis();
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const handleEdit = () => openEditor("tours", tours);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get("/api/content/tours");
        const data = response.data;
        setTours(data.tours || []);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  useGSAP(() => {
    if (!lenis || loading || tours.length === 0) return;

    lenis.on("scroll", ScrollTrigger.update);

    const maskPath = maskPathRef.current;
    const strokePath = strokeRef.current;
    if (!strokePath || !maskPath || !containerRef.current) return;

    const maskLength = maskPath.getTotalLength();
    maskPath.style.strokeDasharray = maskLength.toString();
    maskPath.style.strokeDashoffset = maskLength.toString();

    const sections = gsap.utils.toArray<HTMLElement>("#container section");

    gsap.to(maskPath, {
      strokeDashoffset: 0,
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: () => `bottom bottom-=11000`,
        scrub: 1,
        id: "stroke-animation",
      },
    });

    sections.forEach((section, index) => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => `+=${window.innerHeight / 1.5}`,
        pin: true,
        pinSpacing: true,
        id: `section-${index}`,
      });
    });

    const svgGroup = strokeDivRef.current?.querySelector("#Layer_1-2");
    if (svgGroup) {
      const existingMarkers = svgGroup.querySelectorAll(".checkpoint-marker");
      existingMarkers.forEach((marker) => marker.remove());
    }

    const checkpoints = [
      { pathProgress: 0.025, scrollProgress: 0.005, label: "saka haphong", id: "cp1" },
      { pathProgress: 0.085, scrollProgress: 0.07, label: "horinmara", id: "cp2" },
      { pathProgress: 0.148, scrollProgress: 0.12, label: "langlok", id: "cp3" },
      { pathProgress: 0.211, scrollProgress: 0.18, label: "chagolkanda", id: "cp4" },
      { pathProgress: 0.274, scrollProgress: 0.23, label: "rema kalenga", id: "cp5" },
      { pathProgress: 0.337, scrollProgress: 0.31, label: "liblu hung", id: "cp6" },
      { pathProgress: 0.4, scrollProgress: 0.365, label: "jharjhari", id: "cp7" },
      { pathProgress: 0.463, scrollProgress: 0.43, label: "humhum", id: "cp8" },
      { pathProgress: 0.526, scrollProgress: 0.493, label: "khoiyachora", id: "cp9" },
      { pathProgress: 0.589, scrollProgress: 0.53, label: "kristaung rungrang", id: "cp10" },
      { pathProgress: 0.652, scrollProgress: 0.6, label: "palongkhiyang", id: "cp11" },
      { pathProgress: 0.715, scrollProgress: 0.665, label: "napittachora", id: "cp12" },
      { pathProgress: 0.778, scrollProgress: 0.73, label: "shatchori", id: "cp13" },
      { pathProgress: 0.841, scrollProgress: 0.79, label: "nafakhum", id: "cp14" },
      { pathProgress: 0.904, scrollProgress: 0.88, label: "jharjhari", id: "cp15" },
      { pathProgress: 0.967, scrollProgress: 0.93, label: "bhawal", id: "cp16" },
    ];

    const pathLength = strokePath.getTotalLength();
    const svg = strokePath.ownerSVGElement;

    checkpoints.forEach((cp) => {
      const point = strokePath.getPointAtLength(cp.pathProgress * pathLength);
      const markerGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      markerGroup.classList.add("checkpoint-marker");

      const marker = document.createElementNS("http://www.w3.org/2000/svg", "path");
      marker.setAttribute(
        "d",
        "M32,0C18.745,0,8,10.745,8,24c0,5.678,2.502,10.671,5.271,15l17.097,24.156C30.743,63.686,31.352,64,32,64s1.257-0.314,1.632-0.844L50.729,39C53.375,35.438,56,29.678,56,24C56,10.745,45.255,0,32,0z M32,38c-7.732,0-14-6.268-14-14s6.268-14,14-14s14,6.268,14,14S39.732,38,32,38z",
      );
      marker.setAttribute("fill", "#ff5533");
      marker.setAttribute("stroke", "#ffffff");
      marker.setAttribute("stroke-width", "2");
      markerGroup.appendChild(marker);
      markerGroup.setAttribute("transform", `translate(${point.x - 32}, ${point.y - 64})`);
      svg?.appendChild(markerGroup);

      gsap.set(markerGroup, { scale: 0.01, transformOrigin: "32px 64px" });
      gsap.to(markerGroup, {
        scale: 1,
        transformOrigin: "32px 64px",
        scrollTrigger: {
          trigger: containerRef.current,
          start: () =>
            `top+=${cp.scrollProgress * (containerRef.current?.scrollHeight || 0)}px top`,
          end: () =>
            `top+=${cp.scrollProgress * (containerRef.current?.scrollHeight || 0) + window.innerHeight * 0.5}px top`,
          scrub: 1,
          id: `marker-${cp.id}`,
        },
      });
    });

    setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [lenis, tours.length]);

  const renderTourImage = (img: TourImage, idx: number, className: string) => (
    <motion.div
      key={idx}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: idx * 0.1, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className={`rounded-2xl overflow-hidden group cursor-pointer relative ${className}`}
    >
      {img.url ? (
        <Image
          src={img.url}
          alt={img.alt}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full bg-text-secondary/20 flex items-center justify-center text-text-muted transition-transform duration-500 group-hover:scale-105">
          <span className="text-xs">{img.alt}</span>
        </div>
      )}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-accent/30 rounded-2xl transition-colors duration-300 z-20" />
    </motion.div>
  );

  const renderStandardLayout = (tour: Tour) => (
    <section key={tour.id} className="w-full min-h-screen flex z-10">
      <div className="w-[8%] lg:w-[12%] flex-shrink-0" />
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInRight}
        className="flex-1 py-16 pr-6 lg:pr-12 flex flex-col justify-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-6xl md:text-8xl lg:text-[10rem] font-bebasNeue text-text-secondary leading-none tracking-tight mb-8"
        >
          {tour.name}
          {tour.subtitle && (
            <span className="block text-3xl md:text-5xl lg:text-6xl text-text-muted mt-2">
              {tour.subtitle}
            </span>
          )}
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="mb-6 flex flex-wrap gap-4 lg:gap-6 text-text-muted text-sm"
        >
          <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
            <IoLocationSharp className="text-accent" /> {tour.location}
          </span>
          {tour.elevation && (
            <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
              <FaMountain className="text-accent" /> {tour.elevation}
            </span>
          )}
          {tour.description && (
            <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
              <FaLeaf className="text-accent" /> {tour.description}
            </span>
          )}
          <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
            <IoCalendarSharp className="text-accent" /> Visited {tour.visitCount} times
          </span>
        </motion.div>

        <div className="grid grid-cols-3 grid-rows-2 gap-3 lg:gap-4 h-[50vh] lg:h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="col-span-2 row-span-2 rounded-2xl overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            {tour.images[0]?.url ? (
              <Image
                src={tour.images[0].url}
                alt={tour.images[0].alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-text-secondary/20 flex items-center justify-center text-text-muted">
                <span className="text-sm">{tour.images[0]?.alt}</span>
              </div>
            )}
            <div className="absolute top-0 left-0 w-20 h-20 border-l-4 border-t-4 border-accent/50 rounded-tl-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 right-0 w-20 h-20 border-r-4 border-b-4 border-accent/50 rounded-br-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute bottom-4 left-4 text-white font-medium z-20 bg-accent/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Latest Visit - {tour.latestVisitYear}
            </span>
          </motion.div>
          {tour.images.slice(1, 3).map((img, idx) =>
            renderTourImage(img, idx, ""),
          )}
        </div>
      </motion.div>
    </section>
  );

  const renderReversedLayout = (tour: Tour) => (
    <section key={tour.id} className="w-full min-h-screen flex z-10">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInLeft}
        className="flex-1 py-16 pl-6 lg:pl-12 flex flex-col justify-center"
      >
        <motion.h2
          variants={fadeInUp}
          className="text-6xl md:text-8xl lg:text-[10rem] font-bebasNeue text-text-secondary leading-none tracking-tight mb-8 text-right"
        >
          {tour.name}
          {tour.subtitle && (
            <span className="block text-3xl md:text-5xl lg:text-6xl text-text-muted mt-2">
              {tour.subtitle}
            </span>
          )}
        </motion.h2>

        <motion.div
          variants={fadeInUp}
          className="mb-6 flex flex-wrap gap-4 lg:gap-6 text-text-muted text-sm justify-end"
        >
          <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
            <IoLocationSharp className="text-accent" /> {tour.location}
          </span>
          {tour.elevation && (
            <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
              <FaMountain className="text-accent" /> {tour.elevation}
            </span>
          )}
          {tour.description && (
            <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
              <FaLeaf className="text-accent" /> {tour.description}
            </span>
          )}
          <span className="flex items-center gap-2 bg-text-secondary/10 px-4 py-2 rounded-full">
            <IoCalendarSharp className="text-accent" /> Visited {tour.visitCount} times
          </span>
        </motion.div>

        <div className="grid grid-cols-3 grid-rows-2 gap-3 lg:gap-4 h-[50vh] lg:h-[60vh]">
          {tour.images.slice(0, 2).map((img, idx) =>
            renderTourImage(img, idx, ""),
          )}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="col-span-2 row-span-2 col-start-2 row-start-1 rounded-2xl overflow-hidden relative group cursor-pointer"
          >
            <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
            {tour.images[2]?.url ? (
              <Image
                src={tour.images[2].url}
                alt={tour.images[2].alt}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-text-secondary/20 flex items-center justify-center text-text-muted">
                <span className="text-sm">{tour.images[2]?.alt}</span>
              </div>
            )}
            <div className="absolute top-0 right-0 w-20 h-20 border-r-4 border-t-4 border-accent/50 rounded-tr-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 w-20 h-20 border-l-4 border-b-4 border-accent/50 rounded-bl-2xl z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="absolute bottom-4 right-4 text-white font-medium z-20 bg-accent/80 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
              Latest Visit - {tour.latestVisitYear}
            </span>
          </motion.div>
        </div>
      </motion.div>
      <div className="w-[8%] lg:w-[12%] flex-shrink-0" />
    </section>
  );

  const renderTourSection = (tour: Tour) => {
    switch (tour.gridLayout) {
      case "reversed":
        return renderReversedLayout(tour);
      case "standard":
      default:
        return renderStandardLayout(tour);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <UniqueLoading variant="morph" size="lg" />
        <p className="text-text-muted font-poppins text-sm tracking-widest uppercase animate-pulse">
          Loading Tours...
        </p>
      </div>
    );
  }

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={handleEdit}
          className="fixed bottom-8 right-8 z-50 bg-accent text-white p-4 rounded-full shadow-lg hover:bg-accent/90 transition-colors flex items-center gap-2 cursor-pointer"
          title="Edit Tours"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <div id="container" ref={containerRef} className="relative w-screen">
        <div
          className="footprint-svg absolute -top-10 left-0 w-full pointer-events-none z-50 h-full opacity-20"
          ref={strokeDivRef}
        >
          <svg
            id="Layer_2"
            data-name="Layer 2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1920 30000"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <mask id="path-mask">
                <path
                  ref={maskPathRef}
                  fill="none"
                  stroke="#fff"
                  strokeWidth="10"
                  strokeLinecap="round"
                  d="M651 7.61816C-196.496 -145.906 -151.104 2428.54 961 1818.23C2241 1064.31 2241 4456.92 961 3703C-319 2949.09 -319 6341.7 961 5587.79C2241 4833.87 2241 8226.48 961 7472.56C-319 6718.65 -319 10111.3 961 9357.34C2241 8603.43 2241 11996 961 11242.1C-319 10488.2 -319 13880.8 961 13126.9C2241 12373 2241 15765.6 961 15011.7C-319 14257.8 -319 17650.4 961 16896.5C2241 16142.5 2241 19535.1 961 18781.2C-319 18027.3 -319 21419.9 961 20666C2241 19912.1 2241 23304.7 961 22550.8C-319 21796.9 -319 25189.5 961 24435.6C2241 23681.7 2241 27074.3 961 26320.4C-319 25566.4 -319 28959 961 28205.1C2241 27451.2 2241 30843.8 961 30089.9"
                />
              </mask>
            </defs>
            <g id="Layer_1-2" data-name="Layer 1">
              <path
                ref={strokeRef}
                fill="none"
                stroke="#333"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray="20 20"
                mask="url(#path-mask)"
                d="M651 7.61816C-196.496 -145.906 -151.104 2428.54 961 1818.23C2241 1064.31 2241 4456.92 961 3703C-319 2949.09 -319 6341.7 961 5587.79C2241 4833.87 2241 8226.48 961 7472.56C-319 6718.65 -319 10111.3 961 9357.34C2241 8603.43 2241 11996 961 11242.1C-319 10488.2 -319 13880.8 961 13126.9C2241 12373 2241 15765.6 961 15011.7C-319 14257.8 -319 17650.4 961 16896.5C2241 16142.5 2241 19535.1 961 18781.2C-319 18027.3 -319 21419.9 961 20666C2241 19912.1 2241 23304.7 961 22550.8C-319 21796.9 -319 25189.5 961 24435.6C2241 23681.7 2241 27074.3 961 26320.4C-319 25566.4 -319 28959 961 28205.1C2241 27451.2 2241 30843.8 961 30089.9"
              />
            </g>
          </svg>
        </div>

        <div className="relative w-full">
          {tours.map((tour) => renderTourSection(tour))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="h-screen bg-background flex items-center justify-center"
      >
        <h2 className="text-4xl font-bold text-text-secondary">End Section</h2>
      </motion.div>
    </>
  );
};

export default Tours;
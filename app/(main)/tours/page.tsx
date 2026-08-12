"use client";

import { useEffect, useRef, useState } from "react";
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
import { fadeInUp, fadeInLeft, fadeInRight } from "@/lib/animations";
import PageLoader from "@/app/components/ui/PageLoader";

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
        setTours(response.data.tours || []);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  useGSAP(
    () => {
      if (!lenis || loading || tours.length === 0) return;

      const handleScroll = () => ScrollTrigger.update();
      lenis.on("scroll", handleScroll);

      gsap.ticker.lagSmoothing(0);

      const maskPath = maskPathRef.current;
      const container = containerRef.current;

      if (maskPath && container) {
        const length = maskPath.getTotalLength();
        maskPath.style.strokeDasharray = String(length);
        maskPath.style.strokeDashoffset = String(length);

        gsap.to(maskPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.2,
            invalidateOnRefresh: true,
          },
        });
      }

      ScrollTrigger.refresh();

      return () => {
        lenis.off("scroll", handleScroll);
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    },
    {
      dependencies: [lenis, loading, tours.length],
      scope: containerRef,
      revertOnUpdate: true,
    },
  );

  const renderTourImage = (image: TourImage, index: number) => (
    <motion.div
      key={index}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-xl border border-border bg-surface sm:rounded-2xl"
    >
      {image.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 45vw, 30vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-secondary text-text-muted">
          <span className="px-2 text-center text-[10px] sm:text-xs">
            {image.alt}
          </span>
        </div>
      )}
    </motion.div>
  );

  const renderTour = (tour: Tour) => {
    const reversed = tour.gridLayout === "reversed";

    return (
      <section
        key={tour.id}
        className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-20 sm:px-6 sm:py-24 md:px-10 lg:px-16"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={reversed ? fadeInLeft : fadeInRight}
          className="mx-auto w-full max-w-7xl"
        >
          <motion.h2
            variants={fadeInUp}
            className={`mb-4 font-bebasNeue text-[2.75rem] leading-[0.9] tracking-tight text-text-secondary sm:mb-6 sm:text-7xl md:text-8xl lg:text-[8rem] ${
              reversed ? "sm:text-right" : ""
            }`}
          >
            {tour.name}

            {tour.subtitle && (
              <span className="mt-1 block text-xl text-text-muted sm:mt-2 sm:text-4xl lg:text-5xl">
                {tour.subtitle}
              </span>
            )}
          </motion.h2>

          <motion.div
            variants={fadeInUp}
            className={`mb-6 flex flex-wrap gap-2 text-xs text-text-muted sm:mb-8 sm:gap-3 sm:text-sm ${
              reversed ? "sm:justify-end" : ""
            }`}
          >
            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
              <IoLocationSharp className="shrink-0 text-accent" />
              <span className="truncate">{tour.location}</span>
            </span>

            {tour.elevation && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
                <FaMountain className="shrink-0 text-accent" />
                {tour.elevation}
              </span>
            )}

            {tour.description && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
                <FaLeaf className="shrink-0 text-accent" />
                <span className="truncate">{tour.description}</span>
              </span>
            )}

            <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 sm:gap-2 sm:px-4 sm:py-2">
              <IoCalendarSharp className="shrink-0 text-accent" />
              Visited {tour.visitCount}x
            </span>
          </motion.div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6 }}
              className="group relative col-span-2 aspect-video cursor-pointer overflow-hidden rounded-xl border border-border bg-surface sm:row-span-2 sm:aspect-auto sm:min-h-[380px] sm:rounded-2xl"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

              {tour.images[0]?.url ? (
                <Image
                  src={tour.images[0].url}
                  alt={tour.images[0].alt}
                  fill
                  sizes="(max-width: 640px) 100vw, 66vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-secondary text-text-muted">
                  <span className="text-sm">Main Image</span>
                </div>
              )}

              <span className="absolute bottom-3 left-3 z-20 rounded-full bg-accent/90 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm sm:bottom-4 sm:left-4 sm:px-3 sm:text-sm">
                Latest — {tour.latestVisitYear}
              </span>
            </motion.div>

            {tour.images.slice(1, 3).map((img, i) => renderTourImage(img, i))}
          </div>
        </motion.div>
      </section>
    );
  };

  if (loading) return <PageLoader label="Loading tours" />;

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
          onClick={handleEdit}
          className="fixed bottom-6 right-4 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-3.5 text-white shadow-lg transition-colors hover:bg-accent/90 sm:bottom-8 sm:right-8 sm:p-4"
          title="Edit Tours"
        >
          <HiOutlinePencilAlt size={22} />
        </motion.button>
      )}

      {tours.length > 0 ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-x-hidden bg-background"
        >
          <div className="pointer-events-none absolute inset-0 z-0 hidden opacity-15 sm:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1920 6000"
              preserveAspectRatio="none"
              className="h-full w-full"
            >
              <defs>
                <mask id="tours-path-mask">
                  <path
                    ref={maskPathRef}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="8"
                    strokeLinecap="round"
                    d="M960 0 C 400 800, 1500 1600, 960 2400 C 400 3200, 1500 4000, 960 4800 C 400 5400, 1200 5800, 960 6000"
                  />
                </mask>
              </defs>

              <path
                fill="none"
                stroke="var(--color-text-muted)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="18 18"
                mask="url(#tours-path-mask)"
                d="M960 0 C 400 800, 1500 1600, 960 2400 C 400 3200, 1500 4000, 960 4800 C 400 5400, 1200 5800, 960 6000"
              />
            </svg>
          </div>

          <div className="relative w-full">{tours.map(renderTour)}</div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <FaMountain className="mb-5 text-5xl text-accent/30 sm:text-6xl" />

          <h1 className="font-bebasNeue text-4xl tracking-wider text-text-secondary sm:text-5xl">
            No Tours Available
          </h1>

          <p className="mt-3 max-w-xl text-sm text-text-muted">
            There are currently no tours to display. Please check again later.
          </p>
        </div>
      )}

      {tours.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex h-[40vh] items-center justify-center border-t border-border bg-background px-4 sm:h-[50vh]"
        >
          <h2 className="text-center font-bebasNeue text-4xl tracking-wider text-text-secondary sm:text-5xl">
            End of the Trail
          </h2>
        </motion.div>
      )}
    </>
  );
};

export default Tours;
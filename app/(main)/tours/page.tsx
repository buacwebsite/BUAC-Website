"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useLenis } from "lenis/react";
import { HiOutlinePencilAlt, HiOutlineArrowRight } from "react-icons/hi";
import { IoLocationSharp } from "react-icons/io5";
import { FaMountain, FaLeaf } from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import { motion } from "framer-motion";
import {
  fadeInUp,
  fadeInLeft,
  fadeInRight,
} from "@/lib/animations";
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

const FOOTPRINT_PATH =
  "M651 7.61816C-196.496 -145.906 -151.104 2428.54 961 1818.23C2241 1064.31 2241 4456.92 961 3703C-319 2949.09 -319 6341.7 961 5587.79C2241 4833.87 2241 8226.48 961 7472.56C-319 6718.65 -319 10111.3 961 9357.34C2241 8603.43 2241 11996 961 11242.1C-319 10488.2 -319 13880.8 961 13126.9C2241 12373 2241 15765.6 961 15011.7C-319 14257.8 -319 17650.4 961 16896.5C2241 16142.5 2241 19535.1 961 18781.2C-319 18027.3 -319 21419.9 961 20666C2241 19912.1 2241 23304.7 961 22550.8C-319 21796.9 -319 25189.5 961 24435.6C2241 23681.7 2241 27074.3 961 26320.4C-319 25566.4 -319 28959 961 28205.1C2241 27451.2 2241 30843.8 961 30089.9";

const Tours = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);

  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const lenis = useLenis();
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const handleEdit = () => {
    openEditor("tours", tours);
  };

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

      const handleScroll = () => {
        ScrollTrigger.update();
      };

      lenis.on("scroll", handleScroll);
      gsap.ticker.lagSmoothing(0);

      const path = maskPathRef.current;
      const container = containerRef.current;

      if (path && container) {
        const pathLength = path.getTotalLength();

        path.style.strokeDasharray = String(pathLength);
        path.style.strokeDashoffset = String(pathLength);

        gsap.to(path, {
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

        ScrollTrigger.getAll().forEach((trigger) => {
          trigger.kill();
        });
      };
    },
    {
      dependencies: [lenis, loading, tours.length],
      scope: containerRef,
      revertOnUpdate: true,
    },
  );

  const renderTourImage = (
    image: TourImage,
    index: number,
  ) => (
    <motion.div
      key={`${image.alt}-${index}`}
      initial={{
        opacity: 0,
        scale: 0.96,
      }}
      whileInView={{
        opacity: 1,
        scale: 1,
      }}
      viewport={{
        once: true,
        margin: "-40px",
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
      }}
      className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border border-border bg-surface sm:rounded-xl"
    >
      {image.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes="(max-width: 640px) 42vw, (max-width: 1024px) 26vw, 220px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-secondary px-2 text-center">
          <span className="text-[9px] text-text-muted sm:text-xs">
            {image.alt || "No image"}
          </span>
        </div>
      )}
    </motion.div>
  );

  const renderTour = (tour: Tour) => {
    const isReversed = tour.gridLayout === "reversed";

    return (
      <section
        key={tour.id}
        className="relative flex min-h-[58vh] w-full items-center justify-center bg-background px-4 py-12 sm:min-h-[68vh] sm:px-6 sm:py-16 md:px-10 lg:px-14"
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={isReversed ? fadeInLeft : fadeInRight}
          className="mx-auto w-full max-w-5xl"
        >
          <motion.h2
            variants={fadeInUp}
            className={`mb-3 font-bebasNeue text-[2.1rem] leading-[0.86] tracking-tight text-text-secondary sm:mb-4 sm:text-5xl md:text-6xl lg:text-[5rem] ${
              isReversed ? "sm:text-right" : ""
            }`}
          >
            {tour.name}

            {tour.subtitle && (
              <span className="mt-1 block text-base text-text-muted sm:text-2xl lg:text-3xl">
                {tour.subtitle}
              </span>
            )}
          </motion.h2>

          <motion.div
            variants={fadeInUp}
            className={`mb-4 flex flex-wrap gap-2 text-[10px] text-text-muted sm:mb-5 sm:text-xs ${
              isReversed ? "sm:justify-end" : ""
            }`}
          >
            {tour.location && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                <IoLocationSharp className="shrink-0 text-accent" />
                <span className="truncate">{tour.location}</span>
              </span>
            )}

            {tour.elevation && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                <FaMountain className="shrink-0 text-accent" />
                <span>{tour.elevation}</span>
              </span>
            )}

            {tour.latestVisitYear && (
              <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5">
                <FaLeaf className="shrink-0 text-accent" />
                <span>{tour.latestVisitYear}</span>
              </span>
            )}
          </motion.div>

          <div
            className={`grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 ${
              isReversed ? "sm:[direction:rtl]" : ""
            }`}
          >
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.96,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
                margin: "-40px",
              }}
              transition={{
                duration: 0.45,
              }}
              className="group relative col-span-2 aspect-video cursor-pointer overflow-hidden rounded-lg border border-border bg-surface sm:row-span-2 sm:min-h-[210px] sm:rounded-xl md:min-h-[250px] lg:min-h-[280px] sm:[direction:ltr]"
            >
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-80" />

              {tour.images[0]?.url ? (
                <Image
                  src={tour.images[0].url}
                  alt={tour.images[0].alt || tour.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 480px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-secondary">
                  <span className="text-xs text-text-muted">
                    No main image
                  </span>
                </div>
              )}

              {tour.latestVisitYear && (
                <span className="absolute bottom-2 left-2 z-20 rounded-full bg-accent/90 px-2.5 py-1 text-[9px] font-medium text-white backdrop-blur-sm sm:bottom-3 sm:left-3 sm:text-xs">
                  {tour.latestVisitYear}
                </span>
              )}
            </motion.div>

            <div className="contents sm:[direction:ltr]">
              {tour.images
                .slice(1, 3)
                .map((image, index) =>
                  renderTourImage(image, index),
                )}
            </div>
          </div>

          <div
            className={`mt-6 flex ${
              isReversed ? "sm:justify-end" : ""
            }`}
          >
            <Link
              href="/gallery?category=pictures"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-xs font-semibold text-white shadow-lg shadow-accent/15 transition-colors hover:bg-accent-hover"
            >
              View More
              <HiOutlineArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    );
  };

  if (loading) {
    return <PageLoader label="Loading tours" />;
  }

  return (
    <>
      {auth && (
        <motion.button
          initial={{
            opacity: 0,
            scale: 0,
          }}
          animate={{
            opacity: 1,
            scale: 1,
          }}
          transition={{
            delay: 0.5,
            type: "spring",
          }}
          onClick={handleEdit}
          className="fixed right-4 bottom-6 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-3 text-white shadow-lg transition-colors hover:bg-accent-hover sm:right-8 sm:bottom-8 sm:p-4"
          title="Edit tours"
        >
          <HiOutlinePencilAlt size={21} />
        </motion.button>
      )}

      {tours.length > 0 ? (
        <div
          ref={containerRef}
          className="relative w-full overflow-x-hidden bg-background"
        >
          <div className="pointer-events-none absolute inset-0 z-0 hidden opacity-20 sm:block">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 1920 30000"
              preserveAspectRatio="xMidYMid meet"
              className="h-full w-full"
            >
              <defs>
                <mask id="tour-footprint-mask">
                  <path
                    ref={maskPathRef}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="10"
                    strokeLinecap="round"
                    d={FOOTPRINT_PATH}
                  />
                </mask>
              </defs>

              <g>
                <path
                  fill="none"
                  stroke="var(--color-text-muted)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray="20 20"
                  mask="url(#tour-footprint-mask)"
                  d={FOOTPRINT_PATH}
                />
              </g>
            </svg>
          </div>

          <div className="relative w-full">
            {tours.map(renderTour)}
          </div>
        </div>
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
          <FaMountain className="mb-5 text-5xl text-accent/30 sm:text-6xl" />

          <h1 className="font-bebasNeue text-4xl tracking-wider text-text-secondary sm:text-5xl">
            No Tours Available
          </h1>

          <p className="mt-3 max-w-xl text-sm text-text-muted">
            There are currently no tours to display.
            Please check again later.
          </p>
        </div>
      )}

      {tours.length > 0 && (
        <motion.div
          initial={{
            opacity: 0,
          }}
          whileInView={{
            opacity: 1,
          }}
          viewport={{
            once: true,
          }}
          transition={{
            duration: 0.5,
          }}
          className="flex h-[30vh] items-center justify-center border-t border-border bg-background px-4 sm:h-[36vh]"
        >
          <h2 className="text-center font-bebasNeue text-3xl tracking-wider text-text-secondary sm:text-4xl">
            End of the Trail
          </h2>
        </motion.div>
      )}
    </>
  );
};

export default Tours;
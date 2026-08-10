"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
import { motion } from "framer-motion";
import { HiOutlinePencilAlt } from "react-icons/hi";
import {
  IoCalendarSharp,
  IoLocationSharp,
} from "react-icons/io5";
import {
  FaLeaf,
  FaMountain,
} from "react-icons/fa";
import { useAuth } from "@/app/context/AuthProvider";
import { useEditor } from "@/app/context/EditorContext";
import PageLoader from "@/app/components/ui/PageLoader";
import {
  fadeInLeft,
  fadeInRight,
  fadeInUp,
} from "@/lib/animations";

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
  gridLayout: "standard" | "reversed" | string;
  images: TourImage[];
}

function getImage(
  tour: Tour,
  index: number,
  fallbackAlt: string,
): TourImage {
  return (
    tour.images?.[index] || {
      type: index === 0 ? "main" : "small",
      alt: fallbackAlt,
      url: "",
    }
  );
}

function TourImageCard({
  image,
  className = "",
  primary = false,
  latestVisitYear,
  align = "left",
}: {
  image: TourImage;
  className?: string;
  primary?: boolean;
  latestVisitYear?: string;
  align?: "left" | "right";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.4 }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface shadow-xl ${className}`}
    >
      {image.url ? (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          sizes={
            primary
              ? "(max-width: 1024px) 100vw, 66vw"
              : "(max-width: 1024px) 50vw, 33vw"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-surface-secondary p-5 text-center text-text-muted">
          <span className="text-sm">{image.alt}</span>
        </div>
      )}

      {primary && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />

          <span
            className={`absolute bottom-4 z-20 rounded-full bg-accent/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm ${
              align === "left" ? "left-4" : "right-4"
            }`}
          >
            Latest Visit - {latestVisitYear}
          </span>
        </>
      )}

      <div className="pointer-events-none absolute inset-0 rounded-2xl border-2 border-transparent transition-colors duration-300 group-hover:border-accent/45" />
    </motion.div>
  );
}

function TourInfo({
  tour,
  align = "left",
}: {
  tour: Tour;
  align?: "left" | "right";
}) {
  const textAlign =
    align === "right" ? "text-right" : "text-left";

  const justify =
    align === "right" ? "justify-end" : "justify-start";

  return (
    <>
      <motion.h2
        variants={fadeInUp}
        className={`mb-6 font-bebasNeue text-6xl leading-none tracking-tight text-text-secondary sm:text-7xl md:text-8xl lg:text-9xl ${textAlign}`}
      >
        {tour.name}

        {tour.subtitle && (
          <span className="mt-2 block text-3xl text-text-muted sm:text-4xl md:text-5xl">
            {tour.subtitle}
          </span>
        )}
      </motion.h2>

      <motion.div
        variants={fadeInUp}
        className={`mb-6 flex flex-wrap gap-3 text-sm text-text-muted ${justify}`}
      >
        <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
          <IoLocationSharp className="text-accent" />
          {tour.location}
        </span>

        {tour.elevation && (
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
            <FaMountain className="text-accent" />
            {tour.elevation}
          </span>
        )}

        {tour.description && (
          <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
            <FaLeaf className="text-accent" />
            {tour.description}
          </span>
        )}

        <span className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 shadow-sm">
          <IoCalendarSharp className="text-accent" />
          Visited {tour.visitCount} times
        </span>
      </motion.div>
    </>
  );
}

function StandardTourLayout({
  tour,
}: {
  tour: Tour;
}) {
  const mainImage = getImage(
    tour,
    0,
    "Main tour image",
  );

  const smallImageOne = getImage(
    tour,
    1,
    "Tour image 2",
  );

  const smallImageTwo = getImage(
    tour,
    2,
    "Tour image 3",
  );

  return (
    <section className="relative z-10 flex min-h-[76svh] items-center py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInRight}
        >
          <TourInfo tour={tour} />

          <div className="grid h-[420px] grid-cols-3 grid-rows-2 gap-3 sm:h-[480px] lg:h-[520px] lg:gap-4">
            <TourImageCard
              image={mainImage}
              primary
              latestVisitYear={tour.latestVisitYear}
              className="col-span-2 row-span-2"
            />

            <TourImageCard image={smallImageOne} />

            <TourImageCard image={smallImageTwo} />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ReversedTourLayout({
  tour,
}: {
  tour: Tour;
}) {
  const smallImageOne = getImage(
    tour,
    0,
    "Tour image 1",
  );

  const smallImageTwo = getImage(
    tour,
    1,
    "Tour image 2",
  );

  const mainImage = getImage(
    tour,
    2,
    "Main tour image",
  );

  return (
    <section className="relative z-10 flex min-h-[76svh] items-center py-14 md:py-20">
      <div className="mx-auto w-full max-w-7xl px-6 lg:px-12">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeInLeft}
        >
          <TourInfo tour={tour} align="right" />

          <div className="grid h-[420px] grid-cols-3 grid-rows-2 gap-3 sm:h-[480px] lg:h-[520px] lg:gap-4">
            <TourImageCard image={smallImageOne} />

            <TourImageCard image={smallImageTwo} />

            <TourImageCard
              image={mainImage}
              primary
              latestVisitYear={tour.latestVisitYear}
              align="right"
              className="col-span-2 row-span-2 col-start-2 row-start-1"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  const { auth } = useAuth();
  const { openEditor } = useEditor();

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const response = await axios.get(
          "/api/content/tours",
        );

        setTours(response.data.tours || []);
      } catch (error) {
        console.error("Failed to fetch tours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTours();
  }, []);

  const handleEdit = () => {
    openEditor("tours", tours);
  };

  if (loading) {
    return <PageLoader label="Loading tours" />;
  }

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: 0.35,
            type: "spring",
          }}
          onClick={handleEdit}
          className="fixed right-8 bottom-8 z-50 flex cursor-pointer items-center gap-2 rounded-full bg-accent p-4 text-white shadow-lg shadow-accent/25 transition hover:bg-accent/90"
          title="Edit Tours"
        >
          <HiOutlinePencilAlt size={24} />
        </motion.button>
      )}

      <main className="page-shell relative min-h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.14]">
          <svg
            viewBox="0 0 100 1000"
            preserveAspectRatio="none"
            className="h-full w-full"
            aria-hidden="true"
          >
            <path
              d="M52 0 C8 70,92 120,52 190 C10 260,90 315,52 390 C12 465,88 520,52 600 C10 680,90 740,52 820 C15 890,82 940,52 1000"
              fill="none"
              stroke="var(--color-text-muted)"
              strokeWidth="0.45"
              strokeLinecap="round"
              strokeDasharray="2 2.5"
            />

            <path
              d="M52 0 C8 70,92 120,52 190 C10 260,90 315,52 390 C12 465,88 520,52 600 C10 680,90 740,52 820 C15 890,82 940,52 1000"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.14"
              strokeLinecap="round"
              strokeDasharray="0.6 3.2"
            />
          </svg>
        </div>

        {tours.length > 0 ? (
          <div className="relative">
            {tours.map((tour) =>
              tour.gridLayout === "reversed" ? (
                <ReversedTourLayout
                  key={tour.id}
                  tour={tour}
                />
              ) : (
                <StandardTourLayout
                  key={tour.id}
                  tour={tour}
                />
              ),
            )}
          </div>
        ) : (
          <div className="relative z-10 flex min-h-[70svh] flex-col items-center justify-center px-6 text-center">
            <FaMountain className="mb-5 text-6xl text-accent/30" />

            <h1 className="font-bebasNeue text-5xl tracking-wider text-text-secondary">
              No Tours Available
            </h1>

            <p className="mt-3 max-w-xl text-text-muted">
              There are currently no tours to display. Please check again
              later.
            </p>
          </div>
        )}

        {tours.length > 0 && (
          <section className="relative z-10 flex min-h-[38svh] items-center justify-center px-6 py-12 text-center">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.35em] text-accent">
                BUAC Trails
              </p>

              <h2 className="font-bebasNeue text-5xl tracking-wider text-text-secondary md:text-6xl">
                End of the Trail
              </h2>

              <p className="mt-3 text-sm text-text-muted">
                More adventures are waiting beyond the next horizon.
              </p>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  HiBookmark,
  HiChevronLeft,
  HiChevronRight,
  HiOutlinePencilAlt,
} from "react-icons/hi";
import { IoLocationSharp } from "react-icons/io5";
import { useEditor } from "../context/EditorContext";
import { useAuth } from "../context/AuthProvider";

interface HeroSlide {
  id?: string;
  place: string;
  image: string;
  description?: string;
  country?: string;
  tag?: string;
}

interface LocationItem {
  id: string;
  name: string;
  country: string;
  description: string;
  image: string;
  tag: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function DestinationCard({
  loc,
  active,
  onSelect,
  index,
}: {
  loc: LocationItem;
  active: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      whileHover={{ y: -10 }}
      className="group relative h-[200px] w-[135px] shrink-0 overflow-hidden rounded-[20px] text-left transition-all duration-500 sm:h-[300px] sm:w-[190px] sm:rounded-[26px] md:h-[330px] md:w-[210px]"
      style={{
        marginTop: active ? 0 : index % 2 ? 14 : 6,
        border: active
          ? "1px solid rgba(255, 98, 43, 0.85)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: active
          ? "0 0 0 1px rgba(255, 98, 43, 0.6), 0 18px 40px rgba(255, 98, 43, 0.22)"
          : "0 12px 30px rgba(0,0,0,0.38)",
      }}
      aria-label={`Select ${loc.name}`}
    >
      {loc.image ? (
        <Image
          src={loc.image}
          alt={loc.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 135px, 220px"
          className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary text-xs text-text-muted">
          No image
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />

      <span
        className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full shadow-md transition-colors sm:right-3 sm:top-3 sm:h-9 sm:w-9 ${
          active
            ? "bg-accent text-white"
            : "bg-background/90 text-text-secondary"
        }`}
      >
        <HiBookmark className="h-3 w-3 sm:h-4 sm:w-4" />
      </span>

      <span className="absolute left-2 top-2 rounded-full border border-white/15 bg-black/25 px-2 py-0.5 text-[8px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-md sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-[10px]">
        {loc.tag}
      </span>

      <div className="absolute bottom-0 left-0 w-full p-3 sm:p-4">
        <h3 className="font-bebasNeue text-lg leading-tight tracking-wide text-white sm:text-2xl">
          {loc.name}
        </h3>
        <div className="mt-0.5 line-clamp-1 text-[10px] text-white/75 sm:mt-1 sm:text-xs">
          {loc.country}
        </div>
      </div>
    </motion.button>
  );
}

function RoadMapTimeline({
  items,
  active,
  onChange,
}: {
  items: LocationItem[];
  active: number;
  onChange: (i: number) => void;
}) {
  const count = items.length;
  const uid = useId().replace(/:/g, "");
  const gradientId = `roadGrad-${uid}`;
  const glowId = `roadGlow-${uid}`;

  const points = useMemo(() => {
    return items.map((_, i) => {
      const t = count === 1 ? 0.5 : i / (count - 1);
      const x = 8 + t * 84;
      const y = 50 + Math.sin(t * Math.PI * 2.2) * 16;
      return { x, y };
    });
  }, [items, count]);

  const pathD = useMemo(() => {
    if (points.length < 2) return "";

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
    }

    return d;
  }, [points]);

  if (!items.length) return null;

  return (
    <div className="relative mt-5 h-32 w-full max-w-xl overflow-hidden sm:mt-8 sm:h-44">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop
              offset="0%"
              stopColor="var(--color-accent)"
              stopOpacity="0.95"
            />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
          </linearGradient>

          <filter id={glowId}>
            <feGaussianBlur stdDeviation="0.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={pathD}
          fill="none"
          stroke="rgba(255, 98, 43, 0.16)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.6, ease: "easeInOut" }}
        />

        <motion.path
          d={pathD}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.45"
          strokeLinecap="round"
          strokeDasharray="0.45 2.4"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.85 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />

        {points.map((p, i) => {
          const isActive = i === active;

          return (
            <g
              key={i}
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onChange(i);
              }}
            >
              <circle cx={p.x} cy={p.y} r={7} fill="transparent" />

              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 3 : 1.8}
                fill="none"
                stroke={
                  isActive ? "var(--color-accent)" : "rgba(255,255,255,0.6)"
                }
                strokeWidth="0.4"
                animate={{ r: isActive ? 3 : 1.8 }}
                transition={{ duration: 0.4 }}
              />

              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isActive ? 1.4 : 0.75}
                fill={isActive ? "var(--color-accent)" : "#ffffff"}
                filter={isActive ? `url(#${glowId})` : undefined}
              />

              {isActive && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="0.3"
                  initial={{ scale: 0.6, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.6, repeat: Infinity }}
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                />
              )}
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {points.map((p, i) => {
          const isActive = i === active;
          const placeAbove = p.y >= 50;

          return (
            <div
              key={i}
              className={`pointer-events-auto absolute -translate-x-1/2 cursor-pointer px-1 text-center ${
                placeAbove ? "-translate-y-full" : ""
              }`}
              style={{
                left: `${Math.min(Math.max(p.x, 12), 88)}%`,
                top: placeAbove ? `${p.y - 18}%` : `${p.y + 18}%`,
                maxWidth: "88px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(i);
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={`truncate text-[8px] font-semibold uppercase tracking-[0.12em] select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-[10px] sm:tracking-[0.18em] ${
                  isActive ? "text-accent" : "text-white/75"
                }`}
              >
                {items[i].name}
              </motion.div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="truncate text-[7px] tracking-wider text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-[8px]"
                >
                  {items[i].country}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="snap-section relative -mt-16 min-h-screen w-full overflow-hidden bg-black">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-secondary via-background to-surface-secondary" />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col items-start justify-center gap-5 px-4 pt-28 sm:px-6 sm:pt-32">
        <div className="h-4 w-40 animate-pulse rounded-full bg-white/10" />
        <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-white/10 sm:h-24" />
        <div className="h-4 w-1/2 animate-pulse rounded-full bg-white/10" />
      </div>
    </section>
  );
}

function HeroEmptyState() {
  return (
    <section className="snap-section relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden bg-black px-4">
      <div className="text-center">
        <p className="font-bebasNeue text-3xl tracking-wider text-white sm:text-5xl">
          No Destinations Yet
        </p>
        <p className="mt-3 text-sm text-white/60">
          Hero content has not been added yet.
        </p>
      </div>
    </section>
  );
}

export default function HeroComp({
  images = [],
  loading = false,
}: {
  images: HeroSlide[];
  loading?: boolean;
}) {
  const { auth } = useAuth();
  const { openEditor } = useEditor();
  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const locations = useMemo<LocationItem[]>(() => {
    const usableSlides = (images || []).filter(
      (slide) => slide?.image && slide?.place,
    );

    return usableSlides.map((slide, index) => {
      const name = slide.place?.trim() || `Trail ${index + 1}`;

      return {
        id: slide.id || `${slugify(name)}-${index}`,
        name,
        country: slide.country || "",
        description: slide.description || "",
        image: slide.image,
        tag: slide.tag || "",
      };
    });
  }, [images]);

  useEffect(() => {
    if (active >= locations.length) setActive(0);
  }, [active, locations.length]);

  const current = locations[active];

  const editorSlides = useMemo(
    () =>
      locations.map((loc) => ({
        id: loc.id,
        place: loc.name,
        image: loc.image,
        description: loc.description,
        country: loc.country,
        tag: loc.tag,
      })),
    [locations],
  );

  const goTo = useCallback(
    (index: number) => {
      const total = locations.length;
      if (!total) return;
      setActive(((index % total) + total) % total);
    },
    [locations.length],
  );

  const scrollCards = useCallback((dir: number) => {
    scrollerRef.current?.scrollBy({
      left: dir * 180,
      behavior: "smooth",
    });
  }, []);

  const goPrev = () => {
    goTo(active - 1);
    scrollCards(-1);
  };

  const goNext = () => {
    goTo(active + 1);
    scrollCards(1);
  };

  if (loading) {
    return <HeroSkeleton />;
  }

  if (!current) {
    return (
      <>
        {auth && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => openEditor("landing-hero", editorSlides)}
            className="absolute right-4 top-24 z-40 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover:bg-transparent hover:text-accent sm:right-6 sm:px-4 sm:text-sm"
          >
            <HiOutlinePencilAlt size={18} />
            Add Hero Content
          </motion.button>
        )}
        <HeroEmptyState />
      </>
    );
  }

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          onClick={() => openEditor("landing-hero", editorSlides)}
          className="absolute right-4 top-24 z-40 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-3 py-2 text-xs font-medium text-white transition-all duration-300 hover:bg-transparent hover:text-accent sm:right-6 sm:px-4 sm:text-sm"
          aria-label="Edit Landing Hero Slides"
        >
          <HiOutlinePencilAlt size={18} />
          Edit
        </motion.button>
      )}

      <section className="snap-section relative -mt-16 min-h-screen w-full overflow-hidden bg-black">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.image}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt=""
              fill
              loading="lazy"
              sizes="100vw"
              className="scale-110 object-cover opacity-70 blur-2xl"
            />

            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 16%, black 82%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 16%, black 82%, transparent 100%)",
              }}
            >
              <Image
                src={current.image}
                alt={current.name}
                fill
                priority
                sizes="100vw"
                className="object-cover sm:object-contain"
              />
            </div>

            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,98,43,0.28),transparent_34%)]" />

        <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-start justify-center gap-5 px-4 pt-28 pb-12 sm:gap-8 sm:px-6 sm:pt-32 sm:pb-16 md:px-10 lg:px-12">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                {current.country && (
                  <div className="mb-3 flex items-center gap-2 text-xs text-white/80 sm:mb-4 sm:text-sm">
                    <IoLocationSharp className="h-4 w-4 shrink-0 text-accent" />
                    <span className="truncate">{current.country}</span>
                  </div>
                )}

                <h1 className="font-bebasNeue text-[3.2rem] leading-[0.92] tracking-wide text-white drop-shadow-2xl sm:text-8xl md:text-9xl lg:text-[11rem]">
                  {current.name}
                </h1>

                {current.description && (
                  <p className="mt-4 max-w-xl text-xs leading-relaxed text-white/80 sm:mt-6 sm:text-sm md:text-base">
                    {current.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <RoadMapTimeline
              items={locations}
              active={active}
              onChange={goTo}
            />
          </div>

          <div className="relative -mx-4 w-[calc(100%+2rem)] overflow-hidden sm:mx-0 sm:w-full">
            <div
              ref={scrollerRef}
              className="no-scrollbar flex gap-3 overflow-x-auto px-4 pt-3 pb-4 sm:gap-5 sm:px-1 sm:pt-4 sm:pb-6"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%)",
              }}
            >
              {locations.map((loc, index) => (
                <DestinationCard
                  key={loc.id}
                  loc={loc}
                  index={index}
                  active={index === active}
                  onSelect={() => goTo(index)}
                />
              ))}
            </div>

            {locations.length > 1 && (
              <div className="mt-1 flex items-center justify-center gap-3 sm:mt-2">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:border-accent hover:bg-accent sm:h-10 sm:w-10"
                  aria-label="Previous destination"
                >
                  <HiChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {locations.map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => goTo(index)}
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${
                        index === active
                          ? "w-6 bg-accent"
                          : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:border-accent hover:bg-accent sm:h-10 sm:w-10"
                  aria-label="Next destination"
                >
                  <HiChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
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
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -6 }}
      className="group relative h-[118px] w-[84px] shrink-0 overflow-hidden rounded-xl text-left transition-all duration-500 sm:h-[210px] sm:w-[136px] sm:rounded-2xl md:h-[240px] md:w-[156px]"
      style={{
        marginTop: active ? 0 : index % 2 ? 8 : 3,
        border: active
          ? "1px solid rgba(255, 98, 43, 0.85)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: active
          ? "0 0 0 1px rgba(255, 98, 43, 0.5), 0 10px 24px rgba(255, 98, 43, 0.2)"
          : "0 8px 20px rgba(0,0,0,0.36)",
      }}
      aria-label={`Select ${loc.name}`}
    >
      {loc.image ? (
        <Image
          src={loc.image}
          alt={loc.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 84px, (max-width: 1024px) 136px, 156px"
          className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary px-1 text-center text-[8px] text-text-muted sm:text-[10px]">
          No image
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/5" />

      <span
        className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full shadow-md transition-colors sm:right-2 sm:top-2 sm:h-7 sm:w-7 ${
          active
            ? "bg-accent text-white"
            : "bg-background/90 text-text-secondary"
        }`}
      >
        <HiBookmark className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
      </span>

      {loc.tag && (
        <span className="absolute left-1 top-1 max-w-[58px] truncate rounded-full border border-white/15 bg-black/35 px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-md sm:left-2 sm:top-2 sm:max-w-[90px] sm:px-2 sm:text-[8px]">
          {loc.tag}
        </span>
      )}

      <div className="absolute bottom-0 left-0 w-full p-1.5 sm:p-3">
        <h3 className="line-clamp-2 font-bebasNeue text-[11px] leading-tight tracking-wide text-white sm:text-lg">
          {loc.name}
        </h3>

        {loc.country && (
          <div className="mt-0.5 line-clamp-1 text-[7px] text-white/75 sm:text-[10px]">
            {loc.country}
          </div>
        )}
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
      const x = 10 + t * 80;
      const y = 50 + Math.sin(t * Math.PI * 2.2) * 15;
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
    <div className="relative mt-3 h-24 w-full max-w-xl overflow-hidden sm:mt-8 sm:h-44">
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
          transition={{ duration: 1.5, ease: "easeInOut" }}
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
          transition={{ duration: 1.7, ease: "easeInOut" }}
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
              <circle cx={p.x} cy={p.y} r={8} fill="transparent" />

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
              className={`pointer-events-auto absolute -translate-x-1/2 cursor-pointer px-0.5 text-center ${
                placeAbove ? "-translate-y-full" : ""
              }`}
              style={{
                left: `${Math.min(Math.max(p.x, 14), 86)}%`,
                top: placeAbove ? `${p.y - 20}%` : `${p.y + 20}%`,
                maxWidth: "72px",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(i);
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                className={`truncate text-[7px] font-semibold uppercase tracking-[0.1em] select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:text-[10px] sm:tracking-[0.18em] ${
                  isActive ? "text-accent" : "text-white/70"
                }`}
              >
                {items[i].name}
              </motion.div>

              {isActive && items[i].country && (
                <motion.div
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="hidden truncate text-[8px] tracking-wider text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] sm:block"
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
    <section className="relative -mt-16 min-h-[100svh] w-full overflow-hidden bg-black sm:min-h-screen">
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-surface-secondary via-background to-surface-secondary" />

      <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-start justify-center gap-4 px-4 pt-24 sm:min-h-screen sm:px-6 sm:pt-32">
        <div className="h-3 w-32 animate-pulse rounded-full bg-white/10 sm:h-4 sm:w-40" />
        <div className="h-12 w-3/4 animate-pulse rounded-xl bg-white/10 sm:h-24" />
        <div className="h-3 w-1/2 animate-pulse rounded-full bg-white/10 sm:h-4" />
      </div>
    </section>
  );
}

function HeroEmptyState() {
  return (
    <section className="relative -mt-16 flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-black px-4 sm:min-h-screen">
      <div className="text-center">
        <p className="font-bebasNeue text-3xl tracking-wider text-white sm:text-5xl">
          No Destinations Yet
        </p>
        <p className="mt-3 text-xs text-white/60 sm:text-sm">
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
      left: dir * 120,
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
            Add Hero
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

      <section className="relative -mt-16 min-h-[100svh] w-full overflow-hidden bg-black sm:min-h-screen">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={current.image}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={current.image}
              alt=""
              fill
              loading="lazy"
              sizes="100vw"
              className="scale-110 object-cover opacity-60 blur-3xl"
            />

            <div
              className="absolute inset-0"
              style={{
                maskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
                WebkitMaskImage:
                  "linear-gradient(to bottom, transparent 0%, black 12%, black 86%, transparent 100%)",
              }}
            >
              <Image
                src={current.image}
                alt={current.name}
                fill
                priority
                sizes="100vw"
                className="object-contain object-center"
              />
            </div>

            <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 via-black/30 to-transparent sm:h-40" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background via-background/50 to-transparent sm:h-52" />
          </motion.div>
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20 sm:from-black/95 sm:via-black/70 sm:to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,98,43,0.24),transparent_34%)]" />

        <div className="relative z-20 mx-auto flex min-h-[100svh] max-w-7xl flex-col items-start justify-center gap-3 px-4 pt-24 pb-6 sm:min-h-screen sm:gap-8 sm:px-6 sm:pt-32 sm:pb-16 md:px-10 lg:px-12">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              >
                {current.country && (
                  <div className="mb-2 flex items-center gap-1.5 text-[11px] text-white/80 sm:mb-4 sm:gap-2 sm:text-sm">
                    <IoLocationSharp className="h-3.5 w-3.5 shrink-0 text-accent sm:h-4 sm:w-4" />
                    <span className="truncate">{current.country}</span>
                  </div>
                )}

                <h1 className="font-bebasNeue text-[clamp(2.4rem,11vw,3.6rem)] leading-[0.88] tracking-wide text-white drop-shadow-2xl sm:text-7xl md:text-8xl lg:text-[10rem]">
                  {current.name}
                </h1>

                {current.description && (
                  <p className="mt-3 line-clamp-3 max-w-xl text-[11px] leading-[1.6] text-white/80 sm:mt-6 sm:line-clamp-none sm:text-sm md:text-base">
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
              className="no-scrollbar flex gap-2 overflow-x-auto px-4 pt-2 pb-3 sm:gap-3 sm:px-1 sm:pt-4 sm:pb-6"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
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
              <div className="mt-1 flex items-center justify-center gap-2.5 sm:mt-2 sm:gap-3">
                <button
                  type="button"
                  onClick={goPrev}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:border-accent hover:bg-accent sm:h-10 sm:w-10"
                  aria-label="Previous destination"
                >
                  <HiChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>

                <div className="flex items-center gap-1.5">
                  {locations.map((_, index) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() => goTo(index)}
                      className={`h-1.5 cursor-pointer rounded-full transition-all ${
                        index === active
                          ? "w-5 bg-accent sm:w-6"
                          : "w-1.5 bg-white/40 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:border-accent hover:bg-accent sm:h-10 sm:w-10"
                  aria-label="Next destination"
                >
                  <HiChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
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

const FALLBACK_LOCATIONS: LocationItem[] = [
  {
    id: "buac",
    name: "BUAC",
    country: "BRAC University Adventure Club",
    description:
      "Step into the wild with BUAC — a community built around exploration, teamwork, courage, and unforgettable outdoor stories.",
    image: "/assets/footerbg.webp",
    tag: "Adventure",
  },
  {
    id: "trails",
    name: "Trails",
    country: "Bangladesh",
    description:
      "From misty hills to forest trails, every expedition becomes a memory, a challenge, and a story worth carrying forward.",
    image: "/assets/panelbg.jpg",
    tag: "Expedition",
  },
  {
    id: "explore",
    name: "Explore",
    country: "BUAC Family",
    description:
      "Explore beyond your comfort zone with people who believe that the best views come after the hardest climb.",
    image: "/assets/footerbg.webp",
    tag: "Community",
  },
];

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
      className="group relative h-[300px] w-[190px] shrink-0 overflow-hidden rounded-[26px] text-left transition-all duration-500 sm:h-[330px] sm:w-[210px]"
      style={{
        marginTop: active ? 0 : index % 2 ? 22 : 10,
        border: active
          ? "1px solid rgba(255, 98, 43, 0.85)"
          : "1px solid rgba(255, 255, 255, 0.08)",
        boxShadow: active
          ? "0 0 0 1px rgba(255, 98, 43, 0.6), 0 22px 55px rgba(255, 98, 43, 0.22), 0 25px 70px rgba(0,0,0,0.45)"
          : "0 18px 45px rgba(0,0,0,0.38)",
      }}
      aria-label={`Select ${loc.name}`}
    >
      {loc.image ? (
        <Image
          src={loc.image}
          alt={loc.name}
          fill
          sizes="220px"
          className="absolute inset-0 object-cover transition-transform duration-700 group-hover:scale-110"
        />
      ) : (
        <div className="absolute inset-0 bg-linear-to-br from-accent/40 via-black to-background" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/5" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/20 opacity-70" />

      <span
        className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-colors ${
          active
            ? "bg-accent text-white"
            : "bg-background/90 text-text-secondary"
        }`}
      >
        <HiBookmark className="h-4 w-4" />
      </span>

      <span className="absolute top-3 left-3 rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[10px] font-semibold tracking-widest text-white/80 uppercase backdrop-blur-md">
        {loc.tag}
      </span>

      <div className="absolute bottom-0 left-0 w-full p-4">
        <h3 className="font-bebasNeue text-2xl leading-tight tracking-wide text-white">
          {loc.name}
        </h3>
        <div className="mt-1 text-xs text-white/75">{loc.country}</div>
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
      const x = 6 + t * 88;
      const y = 50 + Math.sin(t * Math.PI * 2.2) * 18;
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
    <div className="relative mt-8 h-44 w-full max-w-xl">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full overflow-visible"
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

        {pathD && (
          <motion.circle
            r="0.9"
            fill="var(--color-accent)"
            filter={`url(#${glowId})`}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <animateMotion dur="6s" repeatCount="indefinite" path={pathD} />
          </motion.circle>
        )}

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
              <circle cx={p.x} cy={p.y} r={6} fill="transparent" />

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
                whileHover={{ scale: 1.6 }}
              />

              {isActive && (
                <>
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
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={3}
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="0.3"
                    initial={{ scale: 0.6, opacity: 0.9 }}
                    animate={{ scale: 2.4, opacity: 0 }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      delay: 0.8,
                    }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  />
                </>
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
              className={`pointer-events-auto absolute -translate-x-1/2 cursor-pointer text-center ${
                placeAbove ? "-translate-y-full" : ""
              }`}
              style={{
                left: `${p.x}%`,
                top: placeAbove ? `${p.y - 16}%` : `${p.y + 16}%`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onChange(i);
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.08 : 1 }}
                className={`text-[10px] font-semibold tracking-[0.18em] whitespace-nowrap uppercase select-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] ${
                  isActive ? "text-accent" : "text-white/75"
                }`}
              >
                {items[i].name}
              </motion.div>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: -2 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[8px] tracking-wider text-white/60 drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)]"
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

export default function HeroComp({ images = [] }: { images: HeroSlide[] }) {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const [active, setActive] = useState(0);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const locations = useMemo<LocationItem[]>(() => {
    const usableSlides = (images || []).filter(
      (slide) => slide?.place || slide?.image,
    );

    if (!usableSlides.length) return FALLBACK_LOCATIONS;

    return usableSlides.map((slide, index) => {
      const name = slide.place?.trim() || `Trail ${index + 1}`;

      return {
        id: slide.id || `${slugify(name)}-${index}`,
        name,
        country: slide.country || "BUAC Trail",
        description:
          slide.description ||
          "A highlight from BUAC's adventure trail — where every journey brings new challenges, memories, and stories.",
        image: slide.image || "",
        tag: slide.tag || "Adventure",
      };
    });
  }, [images]);

  useEffect(() => {
    if (active >= locations.length) setActive(0);
  }, [active, locations.length]);

  const current = locations[active] ?? locations[0];

  const editorSlides = useMemo(
    () =>
      locations.map((loc) => ({
        id: loc.id,
        place: loc.name,
        image: loc.image,
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
      left: dir * 240,
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

  if (!current) return null;

  return (
    <>
      {auth && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          onClick={() => openEditor("landing-hero", editorSlides)}
          className="absolute top-24 right-6 z-40 bg-accent text-white py-2 px-3 md:px-4 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
          aria-label="Edit Landing Hero Slides"
          title="Edit Landing Hero Slides"
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </motion.button>
      )}

      <section className="snap-section relative min-h-screen w-full overflow-hidden -mt-16">
        <AnimatePresence mode="popLayout">
          {current.image ? (
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
                alt={current.name}
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          ) : (
            <motion.div
              key="fallback-bg"
              initial={{ opacity: 0, scale: 1.08 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: [0.4, 0, 0.2, 1] }}
              className="absolute inset-0 bg-linear-to-br from-black via-stone-900 to-background"
            />
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/65 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_35%,rgba(255,98,43,0.28),transparent_34%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_85%,rgba(255,98,43,0.16),transparent_34%)]" />

        <div className="relative z-20 mx-auto flex min-h-screen max-w-7xl flex-col items-start justify-center gap-8 px-6 pt-32 pb-16 md:px-10 lg:px-12">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="mb-4 flex items-center gap-2 text-sm text-white/75">
                  <IoLocationSharp className="h-4 w-4 text-accent" />
                  {current.country}
                </div>

                <h1 className="font-bebasNeue text-7xl leading-none tracking-wide text-white drop-shadow-2xl sm:text-8xl md:text-9xl lg:text-[11rem]">
                  {current.name}
                </h1>

                <p className="mt-6 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
                  {current.description}
                </p>
              </motion.div>
            </AnimatePresence>

            <RoadMapTimeline
              items={locations}
              active={active}
              onChange={goTo}
            />
          </div>

          <div className="relative w-full overflow-hidden">
            <div
              ref={scrollerRef}
              className="no-scrollbar flex gap-5 overflow-x-auto px-1 pt-4 pb-6"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to right, transparent 0%, black 3%, black 96%, transparent 100%)",
                maskImage:
                  "linear-gradient(to right, transparent 0%, black 3%, black 96%, transparent 100%)",
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

            <div className="mt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-accent hover:border-accent cursor-pointer"
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
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
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
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition hover:bg-accent hover:border-accent cursor-pointer"
                aria-label="Next destination"
              >
                <HiChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
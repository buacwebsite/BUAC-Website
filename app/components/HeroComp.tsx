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
  location,
  active,
  onSelect,
  index,
}: {
  location: LocationItem;
  active: boolean;
  onSelect: () => void;
  index: number;
}) {
  return (
    <motion.button
      type="button"
      onClick={onSelect}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.35),
      }}
      whileHover={{ y: -5 }}
      className="group relative h-[116px] w-[82px] shrink-0 overflow-hidden rounded-xl text-left transition-all duration-300 sm:h-[210px] sm:w-[136px] sm:rounded-2xl md:h-[240px] md:w-[156px]"
      style={{
        border: active
          ? "1px solid rgba(255, 98, 43, 0.9)"
          : "1px solid var(--theme-border)",
        boxShadow: active
          ? "0 0 0 1px rgba(255, 98, 43, 0.4), 0 10px 24px rgba(255, 98, 43, 0.2)"
          : "0 8px 20px rgba(0,0,0,0.18)",
      }}
      aria-label={`Select ${location.name}`}
    >
      {location.image ? (
        <Image
          src={location.image}
          alt={location.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 82px, (max-width: 1024px) 136px, 156px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary px-2 text-center">
          <span className="text-[8px] text-text-muted">No image</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

      <span
        className={`absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full shadow-md sm:right-2 sm:top-2 sm:h-7 sm:w-7 ${
          active ? "bg-accent text-white" : "bg-black/70 text-white"
        }`}
      >
        <HiBookmark className="h-2 w-2 sm:h-3.5 sm:w-3.5" />
      </span>

      {location.tag && (
        <span className="absolute left-1 top-1 max-w-[52px] truncate rounded-full border border-white/15 bg-black/40 px-1.5 py-0.5 text-[6px] font-semibold uppercase tracking-wider text-white/85 backdrop-blur-md sm:left-2 sm:top-2 sm:max-w-[90px] sm:px-2 sm:text-[8px]">
          {location.tag}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-1.5 sm:p-3">
        <h3 className="line-clamp-2 font-bebasNeue text-[11px] leading-tight tracking-wide text-white sm:text-lg">
          {location.name}
        </h3>

        {location.country && (
          <p className="mt-0.5 line-clamp-1 text-[7px] text-white/70 sm:text-[10px]">
            {location.country}
          </p>
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
  onChange: (index: number) => void;
}) {
  const count = items.length;
  const uniqueId = useId().replace(/:/g, "");
  const gradientId = `road-gradient-${uniqueId}`;

  const points = useMemo(() => {
    return items.map((_, index) => {
      const progress = count === 1 ? 0.5 : index / (count - 1);

      return {
        x: 10 + progress * 80,
        y: 50 + Math.sin(progress * Math.PI * 2.2) * 15,
      };
    });
  }, [items, count]);

  const path = useMemo(() => {
    if (points.length < 2) return "";

    let value = `M ${points[0].x} ${points[0].y}`;

    for (let index = 0; index < points.length - 1; index += 1) {
      const current = points[index];
      const next = points[index + 1];
      const controlX = (current.x + next.x) / 2;

      value += ` C ${controlX} ${current.y}, ${controlX} ${next.y}, ${next.x} ${next.y}`;
    }

    return value;
  }, [points]);

  if (!items.length) return null;

  return (
    <div className="relative h-24 w-full overflow-hidden sm:h-40">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#ff622b" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff8a5b" stopOpacity="1" />
          </linearGradient>
        </defs>

        <motion.path
          d={path}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="0.9"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {points.map((point, index) => {
          const isActive = index === active;

          return (
            <g
              key={index}
              className="cursor-pointer"
              onClick={(event) => {
                event.stopPropagation();
                onChange(index);
              }}
            >
              <circle cx={point.x} cy={point.y} r={8} fill="transparent" />

              <motion.circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 3.2 : 2}
                fill="#ffffff"
                stroke="#ff622b"
                strokeWidth="0.55"
                animate={{ r: isActive ? 3.2 : 2 }}
                transition={{ duration: 0.3 }}
              />

              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? 1.4 : 0.75}
                fill="#ff622b"
              />
            </g>
          );
        })}
      </svg>

      <div className="pointer-events-none absolute inset-0">
        {points.map((point, index) => {
          const isActive = index === active;
          const placeAbove = point.y >= 50;

          return (
            <button
              key={index}
              type="button"
              className={`pointer-events-auto absolute -translate-x-1/2 cursor-pointer px-0.5 text-center ${
                placeAbove ? "-translate-y-full" : ""
              }`}
              style={{
                left: `${Math.min(Math.max(point.x, 14), 86)}%`,
                top: placeAbove ? `${point.y - 20}%` : `${point.y + 20}%`,
                maxWidth: "72px",
              }}
              onClick={() => onChange(index)}
            >
              <span
                className={`block truncate text-[7px] font-semibold uppercase tracking-[0.1em] sm:text-[9px] ${
                  isActive ? "text-accent" : "text-text-muted"
                }`}
              >
                {items[index].name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <section className="relative -mt-16 min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 animate-pulse bg-surface-secondary/40" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center gap-5 px-4 pt-28 pb-10 sm:px-6 sm:pt-32">
        <div className="h-3 w-32 rounded-full bg-border sm:h-4 sm:w-40" />
        <div className="h-12 w-3/4 rounded-xl bg-border sm:h-24" />
        <div className="h-3 w-1/2 rounded-full bg-border sm:h-4" />
      </div>
    </section>
  );
}

function HeroEmptyState() {
  return (
    <section className="relative -mt-16 flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4">
      <div className="text-center">
        <h1 className="font-bebasNeue text-3xl tracking-wider text-text-secondary sm:text-5xl">
          No Destinations Yet
        </h1>
        <p className="mt-3 text-xs text-text-muted sm:text-sm">
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
  const cardScrollerRef = useRef<HTMLDivElement>(null);

  const locations = useMemo<LocationItem[]>(() => {
    return (images || [])
      .filter((slide) => Boolean(slide?.image) && Boolean(slide?.place))
      .map((slide, index) => {
        const name = slide.place.trim() || `Trail ${index + 1}`;

        return {
          id: slide.id || `${slugify(name)}-${index}`,
          name,
          country: slide.country?.trim() || "",
          description: slide.description?.trim() || "",
          image: slide.image,
          tag: slide.tag?.trim() || "",
        };
      });
  }, [images]);

  useEffect(() => {
    if (active >= locations.length) {
      setActive(0);
    }
  }, [active, locations.length]);

  const current = locations[active];

  const editorSlides = useMemo(() => {
    return locations.map((location) => ({
      id: location.id,
      place: location.name,
      image: location.image,
      description: location.description,
      country: location.country,
      tag: location.tag,
    }));
  }, [locations]);

  const goTo = useCallback(
    (index: number) => {
      const total = locations.length;
      if (!total) return;
      setActive(((index % total) + total) % total);
    },
    [locations.length],
  );

  const scrollCards = useCallback((direction: number) => {
    cardScrollerRef.current?.scrollBy({
      left: direction * 120,
      behavior: "smooth",
    });
  }, []);

  const goPrevious = () => {
    goTo(active - 1);
    scrollCards(-1);
  };

  const goNext = () => {
    goTo(active + 1);
    scrollCards(1);
  };

  if (loading) return <HeroSkeleton />;

  if (!current) {
    return (
      <>
        {auth && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => openEditor("landing-hero", editorSlides)}
            className="absolute right-4 top-24 z-40 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-3 py-2 text-xs font-medium text-white transition hover:bg-transparent hover:text-accent sm:right-6 sm:px-4 sm:text-sm"
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
          className="absolute right-4 top-24 z-40 flex cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-3 py-2 text-xs font-medium text-white transition hover:bg-transparent hover:text-accent sm:right-6 sm:px-4 sm:text-sm"
          aria-label="Edit landing hero"
        >
          <HiOutlinePencilAlt size={18} />
          Edit
        </motion.button>
      )}

      <section className="relative -mt-16 min-h-screen w-full overflow-hidden bg-background">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,color-mix(in_srgb,var(--theme-accent)_18%,transparent),transparent_36%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,color-mix(in_srgb,var(--theme-accent)_10%,transparent),transparent_32%)]" />

        <div className="absolute inset-0 hidden sm:block">
          <AnimatePresence mode="popLayout">
            <motion.div
              key={current.image}
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={current.image}
                alt=""
                fill
                loading="lazy"
                sizes="100vw"
                className="scale-110 object-cover opacity-25 blur-3xl"
              />

              <div className="absolute inset-0">
                <Image
                  src={current.image}
                  alt={current.name}
                  fill
                  priority
                  sizes="100vw"
                  className="object-contain object-center"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-r from-background via-background/70 to-background/20 sm:block" />
        <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-background via-transparent to-background/40 sm:block" />

        <div className="relative z-20 mx-auto flex min-h-screen w-full flex-col px-4 pt-28 pb-10 sm:hidden">
          {current.country && (
            <motion.div
              key={`mobile-location-${current.id}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-[11px] text-text-muted"
            >
              <IoLocationSharp className="h-3.5 w-3.5 shrink-0 text-accent" />
              <span>{current.country}</span>
            </motion.div>
          )}

          <div className="h-4" />

          <AnimatePresence mode="wait">
            <motion.h1
              key={`mobile-title-${current.id}`}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.4 }}
              className="font-bebasNeue text-[clamp(2.35rem,11vw,3.4rem)] leading-[0.88] tracking-wide text-text-secondary"
            >
              {current.name}
            </motion.h1>
          </AnimatePresence>

          <div className="h-5" />

          {current.description && (
            <motion.p
              key={`mobile-description-${current.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] leading-[1.7] text-text-muted"
            >
              {current.description}
            </motion.p>
          )}

          <div className="h-6" />

          <AnimatePresence mode="wait">
            <motion.div
              key={`mobile-image-${current.image}`}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
              className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
            >
              <img
                src={current.image}
                alt={current.name}
                className="block h-auto w-full object-contain"
                decoding="async"
              />
            </motion.div>
          </AnimatePresence>

          <div className="h-7" />

          <RoadMapTimeline items={locations} active={active} onChange={goTo} />

          <div className="h-6" />

          <div
            ref={cardScrollerRef}
            className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2"
          >
            {locations.map((location, index) => (
              <DestinationCard
                key={location.id}
                location={location}
                active={index === active}
                index={index}
                onSelect={() => goTo(index)}
              />
            ))}
          </div>

          <div className="h-5" />

          {locations.length > 1 && (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrevious}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary"
                aria-label="Previous destination"
              >
                <HiChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-1.5">
                {locations.map((_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => goTo(index)}
                    className={`h-1.5 rounded-full transition-all ${
                      active === index ? "w-5 bg-accent" : "w-1.5 bg-border"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary"
                aria-label="Next destination"
              >
                <HiChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="relative z-20 mx-auto hidden min-h-screen max-w-7xl flex-col items-start justify-center gap-8 px-6 pt-32 pb-16 sm:flex md:px-10 lg:px-12">
          <div className="w-full max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                {current.country && (
                  <div className="mb-4 flex items-center gap-2 text-sm text-text-muted">
                    <IoLocationSharp className="h-4 w-4 text-accent" />
                    {current.country}
                  </div>
                )}

                <h1 className="font-bebasNeue text-7xl leading-[0.9] tracking-wide text-text-secondary md:text-8xl lg:text-[10rem]">
                  {current.name}
                </h1>

                {current.description && (
                  <p className="mt-6 max-w-xl text-sm leading-relaxed text-text-muted md:text-base">
                    {current.description}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8">
              <RoadMapTimeline items={locations} active={active} onChange={goTo} />
            </div>
          </div>

          <div className="w-full">
            <div
              ref={cardScrollerRef}
              className="no-scrollbar flex gap-3 overflow-x-auto px-1 pt-4 pb-5"
            >
              {locations.map((location, index) => (
                <DestinationCard
                  key={location.id}
                  location={location}
                  active={index === active}
                  index={index}
                  onSelect={() => goTo(index)}
                />
              ))}
            </div>

            {locations.length > 1 && (
              <div className="mt-2 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={goPrevious}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary backdrop-blur-md transition hover:border-accent hover:bg-accent hover:text-white"
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
                      className={`h-1.5 rounded-full transition-all ${
                        active === index ? "w-6 bg-accent" : "w-1.5 bg-border"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={goNext}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-secondary backdrop-blur-md transition hover:border-accent hover:bg-accent hover:text-white"
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
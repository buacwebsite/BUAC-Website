"use client";

import dynamic from "next/dynamic";
import { useAuth } from "../context/AuthProvider";
import { useEditor } from "../context/EditorContext";
import HeroComp from "../components/HeroComp";
import { useCallback, useEffect, useMemo, useState } from "react";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  MotionSection,
  StaggerGrid,
  StaggerItem,
  RevealHeading,
  AnimatedCounter,
  fadeInUp,
  scaleIn,
  staggerContainer,
} from "@/lib/animations";

const CampfireComp = dynamic(() => import("../components/CampfireComp"), {
  ssr: false,
  loading: () => (
    <section className="flex min-h-[50vh] items-center justify-center bg-black">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
        Loading campfire...
      </p>
    </section>
  ),
});

const HomeOrderEditor = dynamic(
  () => import("../components/editors/HomeOrderEditor"),
  { ssr: false },
);

interface Quote {
  name: string;
  designation: string;
  quote: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

interface Objective {
  title: string;
  description: string;
}

interface HeroImage {
  place: string;
  image: string;
  description?: string;
  country?: string;
  tag?: string;
  id?: string;
}

interface HomeClientProps {
  initialHeroImages: HeroImage[];
  initialAboutText: string;
  initialStats: Stat[];
  initialQuotes: Quote[];
  initialVisionText: string;
  initialObjectives: Objective[];
  initialSectionOrder: string[];
}

const belowFoldClass =
  "[content-visibility:auto] [contain-intrinsic-size:auto_100vh]";

function normalizeQuote(input: unknown): Quote | null {
  if (!input || typeof input !== "object") return null;

  const item = input as Record<string, unknown>;

  const name =
    typeof item.name === "string"
      ? item.name.trim()
      : typeof item.title === "string"
        ? item.title.trim()
        : "";

  const designation =
    typeof item.designation === "string"
      ? item.designation.trim()
      : typeof item.subtitle === "string"
        ? item.subtitle.trim()
        : "";

  const quote =
    typeof item.quote === "string"
      ? item.quote.trim()
      : typeof item.description === "string"
        ? item.description.trim()
        : "";

  const image =
    typeof item.image === "string"
      ? item.image.trim()
      : typeof item.imageUrl === "string"
        ? item.imageUrl.trim()
        : typeof item.img === "string"
          ? item.img.trim()
          : "";

  if (!name && !designation && !quote && !image) return null;

  return { name, designation, quote, image };
}

function normalizeQuotes(input: unknown): Quote[] {
  if (!input) return [];

  if (Array.isArray(input)) {
    return input
      .map((item) => normalizeQuote(item))
      .filter((item): item is Quote => Boolean(item));
  }

  if (typeof input === "object") {
    const obj = input as Record<string, unknown>;

    if (Array.isArray(obj.quotes)) return normalizeQuotes(obj.quotes);
    if (Array.isArray(obj.items)) return normalizeQuotes(obj.items);
    if (Array.isArray(obj.data)) return normalizeQuotes(obj.data);

    const single = normalizeQuote(input);
    return single ? [single] : [];
  }

  return [];
}

export default function HomeClient({
  initialHeroImages,
  initialAboutText,
  initialStats,
  initialQuotes,
  initialVisionText,
  initialObjectives,
  initialSectionOrder,
}: HomeClientProps) {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  const [heroImages] = useState<HeroImage[]>(initialHeroImages);
  const [aboutText] = useState(initialAboutText);
  const [stats] = useState<Stat[]>(initialStats);
  const [quotes] = useState<Quote[]>(initialQuotes);
  const [visionText] = useState(initialVisionText);
  const [objectives] = useState<Objective[]>(initialObjectives);
  const [sectionOrder, setSectionOrder] =
    useState<string[]>(initialSectionOrder);
  const [isOrderEditorOpen, setIsOrderEditorOpen] = useState(false);

  useEffect(() => {
    if (window.innerWidth < 768) return;

    let cancelled = false;
    const triggers: Array<{ kill: () => void }> = [];

    const timeoutId = window.setTimeout(async () => {
      const [{ default: gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);

      if (cancelled) return;

      const { ScrollTrigger } = scrollTriggerModule;
      gsap.registerPlugin(ScrollTrigger);

      gsap.utils.toArray(".snap-section").forEach((section) => {
        triggers.push(
          ScrollTrigger.create({
            trigger: section as Element,
            start: "top top",
            end: "bottom top",
            snap: {
              snapTo: 1,
              duration: { min: 0.6, max: 1.2 },
              delay: 0.1,
              ease: "power2.inOut",
            },
          }),
        );
      });

      ScrollTrigger.refresh();
    }, 2000);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      triggers.forEach((trigger) => trigger.kill());
    };
  }, [sectionOrder]);

  const safeQuotes = useMemo(() => normalizeQuotes(quotes), [quotes]);

  const openAboutEditor = () =>
    openEditor("aboutSection", { quotes: safeQuotes, aboutText, stats });

  const openVisionEditor = () =>
    openEditor("vision", { visionText, objectives });

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const renderAboutSection = () => (
    <MotionSection
      key="about"
      className={`snap-section relative min-h-screen overflow-hidden bg-background px-6 py-16 font-poppins lg:px-12 ${belowFoldClass}`}
    >
      {auth && (
        <button
          type="button"
          onClick={openAboutEditor}
          className="absolute top-8 right-8 z-20 flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-accent bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </button>
      )}

      <div className="relative mx-auto max-w-6xl">
        <RevealHeading className="mb-6 text-center font-bebasNeue text-5xl leading-none text-accent md:text-6xl lg:text-7xl">
          About Us
        </RevealHeading>

        {aboutText ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="mx-auto mb-14 max-w-3xl"
          >
            <p className="text-center text-base leading-relaxed text-text-muted">
              {aboutText}
            </p>
          </motion.div>
        ) : (
          <p className="mb-14 text-center text-text-muted">
            {auth
              ? "No about text added yet. Click Edit to add it."
              : "About information coming soon."}
          </p>
        )}

        <RevealHeading className="mb-8 text-center font-bebasNeue text-5xl leading-none text-accent md:text-6xl lg:text-7xl">
          Words of Wisdom
        </RevealHeading>

        {safeQuotes.length > 0 ? (
          <StaggerGrid className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {safeQuotes.map((quote, index) => (
              <StaggerItem key={`${quote.name}-${index}`}>
                <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-surface/80 p-6 text-center shadow-xl">
                  <div className="relative mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-accent/30 bg-surface-secondary">
                    {quote.image ? (
                      <Image
                        src={quote.image}
                        alt={quote.name || "Quote image"}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-accent/10">
                        <span className="font-bebasNeue text-4xl text-accent">
                          {(quote.name || "?").charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="mb-6 text-sm leading-relaxed text-text-secondary italic">
                    {quote.quote}
                  </p>

                  <h3 className="text-xl font-bold text-text-secondary">
                    {quote.name}
                  </h3>

                  {quote.designation && (
                    <p className="mt-1 text-sm text-accent">
                      {quote.designation}
                    </p>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <div className="mb-14 rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 p-10 text-center">
            <p className="font-bebasNeue text-3xl tracking-wide text-text-secondary">
              No Words of Wisdom Added Yet
            </p>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 gap-8 border-t border-border pt-12 lg:grid-cols-4"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={`${stat.label}-${index}`}
              variants={scaleIn}
              className="text-center"
            >
              <AnimatedCounter
                value={stat.value}
                className="mb-2 font-bebasNeue text-5xl text-accent lg:text-6xl"
              />
              <div className="text-sm tracking-wider text-text-secondary uppercase">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </MotionSection>
  );

  const renderVisionSection = () => (
    <MotionSection
      key="vision"
      className={`snap-section relative min-h-screen overflow-hidden bg-background px-6 py-16 font-poppins lg:px-12 ${belowFoldClass}`}
    >
      {auth && (
        <button
          type="button"
          onClick={openVisionEditor}
          className="absolute top-8 right-8 z-20 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-accent bg-accent px-4 py-2 text-sm font-medium text-white"
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </button>
      )}

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <RevealHeading className="mb-6 font-bebasNeue text-6xl leading-none text-accent md:text-7xl lg:text-8xl">
            Our Vision
          </RevealHeading>

          {visionText ? (
            <p className="mx-auto max-w-6xl text-lg leading-relaxed text-text-secondary">
              {visionText}
            </p>
          ) : (
            <p className="text-text-muted">Vision statement coming soon.</p>
          )}
        </div>

        <RevealHeading className="mb-12 text-center font-bebasNeue text-4xl text-text-secondary md:text-5xl">
          Our Objectives
        </RevealHeading>

        {objectives.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {objectives.map((objective, index) => (
              <StaggerItem key={`${objective.title}-${index}`}>
                <div className="h-full rounded-2xl border border-accent/30 bg-surface/80 p-8 shadow-xl">
                  <div className="font-bebasNeue text-5xl text-accent/20">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <h3 className="mt-4 mb-4 text-2xl font-bold text-text-secondary">
                    {objective.title}
                  </h3>
                  <p className="leading-relaxed text-text-muted">
                    {objective.description}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <p className="py-12 text-center text-text-muted">
            Objectives coming soon.
          </p>
        )}
      </div>
    </MotionSection>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    about: renderAboutSection,
    campfire: () => <CampfireComp key="campfire" />,
    vision: renderVisionSection,
  };

  return (
    <>
      <HeroComp images={heroImages} loading={false} />

      {auth && (
        <button
          type="button"
          onClick={() => setIsOrderEditorOpen(true)}
          className="fixed top-24 left-6 z-40 flex min-h-11 cursor-pointer items-center gap-2 rounded-full border-2 border-accent bg-black/80 px-4 py-2 text-sm font-medium text-white"
        >
          <HiOutlineBars3 size={18} />
          Reorder Sections
        </button>
      )}

      {isOrderEditorOpen && (
        <HomeOrderEditor
          order={sectionOrder}
          onClose={() => setIsOrderEditorOpen(false)}
          onSaved={(newOrder) => {
            setSectionOrder(newOrder);
            scrollToTop();
          }}
        />
      )}

      {sectionOrder.map((key) => sectionRenderers[key]?.())}
    </>
  );
}
"use client";

import { useAuth } from "../context/AuthProvider";
import { useEditor } from "../context/EditorContext";
import HeroComp from "../components/HeroComp";
import axios from "axios";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCallback, useEffect, useMemo, useState } from "react";
import CampfireComp from "../components/CampfireComp";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { HiOutlineBars3 } from "react-icons/hi2";
import Image from "next/image";
import { motion } from "framer-motion";
import HomeOrderEditor from "../components/editors/HomeOrderEditor";
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

gsap.registerPlugin(ScrollTrigger);

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

const defaultSectionOrder = ["about", "campfire", "vision"];

function normalizeQuote(input: unknown): Quote | null {
  if (!input || typeof input !== "object") return null;

  const item = input as Record<string, unknown>;

  const name =
    typeof item.name === "string"
      ? item.name.trim()
      : typeof item.title === "string"
        ? (item.title as string).trim()
        : "";

  const designation =
    typeof item.designation === "string"
      ? item.designation.trim()
      : typeof item.subtitle === "string"
        ? (item.subtitle as string).trim()
        : "";

  const quote =
    typeof item.quote === "string"
      ? item.quote.trim()
      : typeof item.description === "string"
        ? (item.description as string).trim()
        : "";

  const image =
    typeof item.image === "string"
      ? item.image.trim()
      : typeof item.imageUrl === "string"
        ? (item.imageUrl as string).trim()
        : typeof item.img === "string"
          ? (item.img as string).trim()
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

export default function Home() {
  const { auth } = useAuth();
  const { openEditor } = useEditor();

  /* ---------------- Hero ---------------- */
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [heroLoading, setHeroLoading] = useState(true);

  /* ---------------- About ---------------- */
  const [aboutLoading, setAboutLoading] = useState(true);
  const [aboutError, setAboutError] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [aboutText, setAboutText] = useState<string>("");
  const [stats, setStats] = useState<Stat[]>([]);

  /* ---------------- Vision ---------------- */
  const [visionLoading, setVisionLoading] = useState(true);
  const [visionError, setVisionError] = useState(false);
  const [visionText, setVisionText] = useState<string>("");
  const [objectives, setObjectives] = useState<Objective[]>([]);

  /* ---------------- Section order ---------------- */
  const [sectionOrder, setSectionOrder] =
    useState<string[]>(defaultSectionOrder);
  const [orderLoaded, setOrderLoaded] = useState(false);
  const [isOrderEditorOpen, setIsOrderEditorOpen] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get("/api/content/home-order");
        if (Array.isArray(res.data?.order)) {
          setSectionOrder(res.data.order);
        }
      } catch (err) {
        console.error("Failed to fetch section order:", err);
      } finally {
        setOrderLoaded(true);
      }
    };
    fetchOrder();
  }, []);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await axios.get("/api/content/landinghero");
        if (response.status === 200 && Array.isArray(response.data.images)) {
          setHeroImages(response.data.images);
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
      } finally {
        setHeroLoading(false);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await axios.get("/api/content/about");
        if (response.status === 200) {
          setAboutText(response.data.aboutText || "");
          setStats(Array.isArray(response.data.stats) ? response.data.stats : []);
          setQuotes(Array.isArray(response.data.quotes) ? response.data.quotes : []);
        } else {
          setAboutError(true);
        }
      } catch (error) {
        console.error("Error fetching about content:", error);
        setAboutError(true);
      } finally {
        setAboutLoading(false);
      }
    };
    fetchAboutContent();
  }, []);

  useEffect(() => {
    const fetchVisionContent = async () => {
      try {
        const response = await axios.get("/api/content/vision");
        if (response.status === 200) {
          setVisionText(response.data.visionText || "");
          setObjectives(
            Array.isArray(response.data.objectives)
              ? response.data.objectives
              : [],
          );
        } else {
          setVisionError(true);
        }
      } catch (error) {
        console.error("Error fetching vision content:", error);
        setVisionError(true);
      } finally {
        setVisionLoading(false);
      }
    };
    fetchVisionContent();
  }, []);

  useGSAP(
    () => {
      const sections = gsap.utils.toArray(".snap-section");

      sections.forEach((section) => {
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
        });
      });

      return () => {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    },
    { dependencies: [sectionOrder] },
  );

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
      className="snap-section relative min-h-screen bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden"
    >
      {auth && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={openAboutEditor}
          className="absolute top-8 right-8 z-20 bg-accent text-white py-2 px-4 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
          title="Edit Section"
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </motion.button>
      )}

      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-text-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <RevealHeading className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-6 text-center">
          About Us
        </RevealHeading>

        {aboutLoading ? (
          <div className="mx-auto mb-14 max-w-3xl animate-pulse space-y-3">
            <div className="mx-auto h-4 w-full rounded bg-surface-secondary" />
            <div className="mx-auto h-4 w-11/12 rounded bg-surface-secondary" />
            <div className="mx-auto h-4 w-3/4 rounded bg-surface-secondary" />
          </div>
        ) : aboutError ? (
          <p className="mb-14 text-center text-text-muted">
            Unable to load about information right now.
          </p>
        ) : aboutText ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="max-w-3xl mx-auto mb-14"
          >
            <p className="text-text-muted text-base leading-relaxed text-center font-poppins">
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

        <RevealHeading className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-8 text-center">
          Words of Wisdom
        </RevealHeading>

        {aboutLoading ? (
          <div className="mb-14 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-3xl bg-surface-secondary"
              />
            ))}
          </div>
        ) : safeQuotes.length > 0 ? (
          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 mb-14 relative z-10">
            {safeQuotes.map((quote, index) => (
              <StaggerItem key={`${quote.name}-${index}`}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.25 }}
                  className="group relative h-full overflow-hidden rounded-3xl border border-border bg-surface/80 p-6 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-accent/50 hover:shadow-accent/10"
                >
                  <div className="absolute top-5 left-5 text-accent text-6xl font-serif opacity-20">
                    &ldquo;
                  </div>

                  <div className="relative z-10 flex h-full flex-col items-center text-center">
                    <div className="relative mb-6 h-32 w-32 overflow-hidden rounded-full border-4 border-accent/30 bg-surface-secondary transition-colors duration-300 group-hover:border-accent">
                      {quote.image ? (
                        <Image
                          src={quote.image}
                          alt={quote.name || "Quote image"}
                          fill
                          className="object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-accent/10">
                          <span className="font-bebasNeue text-4xl text-accent">
                            {(quote.name || "?").charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="mb-6 text-sm italic leading-relaxed text-text-secondary">
                      {quote.quote}
                    </p>

                    <div className="mt-auto">
                      <h3 className="text-xl font-bold text-text-secondary">
                        {quote.name}
                      </h3>
                      {quote.designation && (
                        <p className="mt-1 text-sm text-accent">
                          {quote.designation}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="absolute bottom-5 right-5 text-accent text-6xl font-serif opacity-20">
                    &rdquo;
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>
        ) : (
          <div className="mb-14 rounded-3xl border-2 border-dashed border-accent/30 bg-accent/5 p-10 text-center">
            <p className="font-bebasNeue text-3xl tracking-wide text-text-secondary">
              No Words of Wisdom Added Yet
            </p>
            <p className="mt-2 text-sm text-text-muted">
              {auth
                ? "Click Edit and add quotes to display them here."
                : "Quotes will appear here soon."}
            </p>
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-border"
        >
          {aboutLoading ? (
            [0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-surface-secondary"
              />
            ))
          ) : stats.length > 0 ? (
            stats.map((stat, index) => (
              <motion.div
                key={`${stat.label}-${index}`}
                variants={scaleIn}
                className="text-center"
              >
                <AnimatedCounter
                  value={stat.value}
                  className="text-5xl lg:text-6xl font-bebasNeue text-accent mb-2"
                />
                <div className="text-text-secondary uppercase text-sm tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))
          ) : (
            <p className="col-span-full text-center text-sm text-text-muted">
              {auth ? "No stats added yet." : "Stats coming soon."}
            </p>
          )}
        </motion.div>
      </div>
    </MotionSection>
  );

  const renderCampfireSection = () => <CampfireComp key="campfire" />;

  const renderVisionSection = () => (
    <MotionSection
      key="vision"
      className="snap-section relative min-h-screen bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden"
    >
      {auth && (
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
          onClick={openVisionEditor}
          className="absolute top-8 right-8 z-20 bg-accent text-white py-2 px-4 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
          title="Edit Vision"
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </motion.button>
      )}

      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-text-secondary rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <RevealHeading className="text-6xl md:text-7xl lg:text-8xl font-bebasNeue text-accent leading-none mb-6">
            Our Vision
          </RevealHeading>

          {visionLoading ? (
            <div className="mx-auto max-w-6xl animate-pulse space-y-3">
              <div className="mx-auto h-4 w-full rounded bg-surface-secondary" />
              <div className="mx-auto h-4 w-4/5 rounded bg-surface-secondary" />
            </div>
          ) : visionError ? (
            <p className="text-text-muted">
              Unable to load the vision statement right now.
            </p>
          ) : visionText ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
              className="max-w-6xl mx-auto"
            >
              <p className="text-text-secondary text-lg leading-relaxed text-justify md:text-center md:text-balance">
                {visionText}
              </p>
            </motion.div>
          ) : (
            <p className="text-text-muted">
              {auth
                ? "No vision statement added yet."
                : "Vision statement coming soon."}
            </p>
          )}
        </div>

        <div className="mt-16">
          <RevealHeading className="text-4xl md:text-5xl font-bebasNeue text-center text-text-secondary mb-12">
            Our Objectives
          </RevealHeading>

          {visionLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="h-40 animate-pulse rounded-2xl bg-surface-secondary"
                />
              ))}
            </div>
          ) : objectives.length > 0 ? (
            <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {objectives.map((objective, index) => (
                <StaggerItem key={`${objective.title}-${index}`}>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.25 }}
                    className="group relative bg-surface/80 backdrop-blur-md border border-accent/30 rounded-2xl p-8 hover:border-accent transition-all duration-500 shadow-xl overflow-hidden h-full"
                  >
                    <div className="absolute top-4 left-4 text-accent/20 text-5xl font-bebasNeue">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="mt-8">
                      <h4 className="text-2xl font-bold text-text-secondary mb-4 group-hover:text-accent transition-colors duration-300">
                        {objective.title}
                      </h4>
                      <p className="text-text-muted leading-relaxed">
                        {objective.description}
                      </p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerGrid>
          ) : (
            <div className="text-center text-text-muted py-12">
              <p className="text-lg">
                {auth
                  ? "No objectives added yet. Click Edit to add some."
                  : "Objectives coming soon..."}
              </p>
            </div>
          )}
        </div>
      </div>
    </MotionSection>
  );

  const sectionRenderers: Record<string, () => React.ReactNode> = {
    about: renderAboutSection,
    campfire: renderCampfireSection,
    vision: renderVisionSection,
  };

  return (
    <>
      <HeroComp images={heroImages} loading={heroLoading} />

      {auth && orderLoaded && (
        <div className="relative z-20">
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            onClick={() => setIsOrderEditorOpen(true)}
            className="fixed top-24 left-6 z-40 flex items-center gap-2 rounded-full bg-black/80 border-2 border-accent text-white py-2 px-4 text-sm font-medium shadow-lg hover:bg-accent transition-all duration-300 cursor-pointer"
            title="Reorder Home Sections"
          >
            <HiOutlineBars3 size={18} />
            Reorder Sections
          </motion.button>
        </div>
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
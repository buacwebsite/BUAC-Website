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
import Link from "next/link";
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
import {
  STATIC_HERO_SLIDES,
  STATIC_ABOUT,
  STATIC_VISION,
  type Quote,
  type Stat,
  type Objective,
} from "@/lib/siteContent";

gsap.registerPlugin(ScrollTrigger);

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
  const { auth, logout, isLoggedIn, user } = useAuth();
  const { openEditor } = useEditor();

  const [images, setImages] = useState<HeroImage[]>(STATIC_HERO_SLIDES);
  const [quotes, setQuotes] = useState<Quote[]>(STATIC_ABOUT.quotes);
  const [aboutText, setAboutText] = useState<string>(STATIC_ABOUT.aboutText);
  const [stats, setStats] = useState<Stat[]>(STATIC_ABOUT.stats);
  const [visionText, setVisionText] = useState<string>(STATIC_VISION.visionText);
  const [objectives, setObjectives] = useState<Objective[]>(STATIC_VISION.objectives);
  const [sectionOrder, setSectionOrder] = useState<string[]>(defaultSectionOrder);
  const [orderLoaded, setOrderLoaded] = useState(false);

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
          if (response.data.images.length > 0) {
            setImages(response.data.images);
          }
        }
      } catch (error) {
        console.error("Error fetching hero images:", error);
      }
    };
    fetchHeroImages();
  }, []);

  useEffect(() => {
    const fetchAboutContent = async () => {
      try {
        const response = await axios.get("/api/content/about");

        if (response.status === 200) {
          if (response.data.aboutText) {
            setAboutText(response.data.aboutText);
          }

          if (Array.isArray(response.data.stats) && response.data.stats.length > 0) {
            setStats(response.data.stats);
          }

          const normalized = normalizeQuotes(response.data.quotes);
          if (normalized.length > 0) {
            setQuotes(normalized);
          }
        }
      } catch (error) {
        console.error("Error fetching about content:", error);
      }
    };
    fetchAboutContent();
  }, []);

  useEffect(() => {
    const fetchVisionContent = async () => {
      try {
        const response = await axios.get("/api/content/vision");

        if (response.status === 200) {
          if (response.data.visionText) {
            setVisionText(response.data.visionText);
          }

          if (Array.isArray(response.data.objectives) && response.data.objectives.length > 0) {
            setObjectives(response.data.objectives);
          }
        }
      } catch (error) {
        console.error("Error fetching vision content:", error);
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

  const openAboutEditor = () => {
    openEditor("aboutSection", { quotes: safeQuotes, aboutText, stats });
  };

  const openVisionEditor = () => {
    openEditor("vision", { visionText, objectives });
  };

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

        <RevealHeading className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-8 text-center">
          Words of Wisdom
        </RevealHeading>

        {safeQuotes.length > 0 ? (
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
                            {(quote.name || "B").charAt(0)}
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
                ? "Click the Edit button and add quotes to display them here."
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
          {stats.map((stat, index) => (
            <motion.div key={`${stat.label}-${index}`} variants={scaleIn} className="text-center">
              <AnimatedCounter
                value={stat.value}
                className="text-5xl lg:text-6xl font-bebasNeue text-accent mb-2"
              />
              <div className="text-text-secondary uppercase text-sm tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
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
        </div>

        <div className="mt-16">
          <RevealHeading className="text-4xl md:text-5xl font-bebasNeue text-center text-text-secondary mb-12">
            Our Objectives
          </RevealHeading>

          {objectives.length > 0 ? (
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
                  ? "No objectives added yet. Click the edit button to add some!"
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
      <HeroComp images={images} />

      {auth && orderLoaded && (
        <div className="relative z-20">
          <motion.button
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.3 }}
            onClick={() => openEditor("home-order", sectionOrder)}
            className="fixed top-24 left-6 z-40 flex items-center gap-2 rounded-full bg-black/80 border-2 border-accent text-white py-2 px-4 text-sm font-medium shadow-lg hover:bg-accent transition-all duration-300 cursor-pointer"
            title="Reorder Home Sections"
          >
            <HiOutlineBars3 size={18} />
            Reorder Sections
          </motion.button>
        </div>
      )}

      {sectionOrder.map((key) => sectionRenderers[key]?.())}

      {!isLoggedIn && (
        <MotionSection className="snap-section relative min-h-[55vh] bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: -30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              className="text-6xl md:text-7xl lg:text-8xl font-bebasNeue text-accent leading-none mb-10"
            >
              Be an Adventurer
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-5 justify-center items-center"
            >
              <Link
                href="/register"
                className="inline-flex min-w-[210px] items-center justify-center rounded-full bg-accent px-10 py-4 font-bebasNeue text-2xl tracking-wider text-white shadow-xl shadow-accent/25 transition-all duration-300 hover:-translate-y-1 hover:bg-accent/90 hover:shadow-accent/40"
              >
                Create Account
              </Link>

              <Link
                href="/login"
                className="inline-flex min-w-[170px] items-center justify-center rounded-full border-2 border-accent px-10 py-4 font-bebasNeue text-2xl tracking-wider text-accent transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:text-white"
              >
                Sign In
              </Link>
            </motion.div>
          </div>
        </MotionSection>
      )}

      {isLoggedIn && user && (
        <MotionSection className="snap-section relative min-h-[50vh] bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
              className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-4"
            >
              Welcome Back, {user.name}!
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-block mb-8"
            >
              <span
                className={`px-4 py-2 text-sm font-bold rounded-full border ${
                  user.role === "admin"
                    ? "bg-red-500/20 text-red-400 border-red-500/30"
                    : user.role === "alumni"
                      ? "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      : "bg-accent/20 text-accent border-accent/30"
                }`}
              >
                {user.role.toUpperCase()}
              </span>
            </motion.div>

            {user.role !== "admin" && (
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.4 }}
                className="text-text-muted text-lg max-w-2xl mx-auto mb-8"
              >
                {user.role === "alumni"
                  ? "Great to see you back! Stay connected with the adventure family."
                  : "Ready for your next adventure? Check out our upcoming tours and activities."}
              </motion.p>
            )}

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link
                href="/tours"
                className="inline-flex min-w-[170px] items-center justify-center rounded-full bg-accent px-8 py-4 font-bebasNeue text-xl tracking-wider text-white shadow-xl shadow-accent/25 transition-all duration-300 hover:-translate-y-1 hover:bg-accent/90"
              >
                Explore Tours
              </Link>

              <Link
                href="/activities"
                className="inline-flex min-w-[180px] items-center justify-center rounded-full border-2 border-accent px-8 py-4 font-bebasNeue text-xl tracking-wider text-accent transition-all duration-300 hover:-translate-y-1 hover:bg-accent hover:text-white"
              >
                View Activities
              </Link>

              <button
                type="button"
                onClick={logout}
                className="inline-flex min-w-[150px] items-center justify-center rounded-full border-2 border-red-500 px-8 py-4 font-bebasNeue text-xl tracking-wider text-red-400 transition-all duration-300 hover:-translate-y-1 hover:bg-red-500 hover:text-white"
              >
                Sign Out
              </button>
            </motion.div>
          </div>
        </MotionSection>
      )}
    </>
  );
}
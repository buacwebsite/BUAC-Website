"use client";

import { useAuth } from "../context/AuthProvider";
import { useEditor } from "../context/EditorContext";
import HeroComp from "../components/HeroComp";
import axios from "axios";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useState } from "react";
import CampfireComp from "../components/CampfireComp";
import { HiOutlinePencilAlt } from "react-icons/hi";
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

export default function Home() {
  const { auth, logout, isLoggedIn, user } = useAuth();
  const { openEditor } = useEditor();

  const [images, setImages] = useState<{ place: string; image: string }[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [aboutText, setAboutText] = useState<string>("");
  const [stats, setStats] = useState<Stat[]>([]);
  const [visionText, setVisionText] = useState<string>("");
  const [objectives, setObjectives] = useState<Objective[]>([]);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const response = await axios.get("/api/content/landinghero");

        if (response.status === 200) {
          setImages(response.data.images || []);
        } else {
          console.error("Failed to fetch hero images");
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
          setAboutText(response.data.aboutText || "");
          setStats(response.data.stats || []);
          setQuotes(response.data.quotes || []);
        } else {
          console.error("Failed to fetch about content");
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
          setVisionText(response.data.visionText || "");
          setObjectives(response.data.objectives || []);
        } else {
          console.error("Failed to fetch vision content");
        }
      } catch (error) {
        console.error("Error fetching vision content:", error);
      }
    };

    fetchVisionContent();
  }, []);

  useGSAP(() => {
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
  }, []);

  return (
    <>
      <HeroComp images={images} />

      {/* ABOUT */}
      <MotionSection className="snap-section relative min-h-screen bg-linear-to-b from-background via-background via-85% md:via-65% to-black py-12 px-6 lg:px-12 font-poppins overflow-hidden">
        {auth && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            onClick={() =>
              openEditor("aboutSection", { quotes, aboutText, stats })
            }
            className="absolute top-8 right-8 z-10 bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
            title="Edit Section"
          >
            <HiOutlinePencilAlt size={20} />
            Edit
          </motion.button>
        )}

        <div className="absolute inset-0 opacity-5">
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
            className="max-w-3xl mx-auto mb-12"
          >
            <p className="text-text-muted text-base leading-relaxed text-center font-poppins">
              {aboutText}
            </p>
          </motion.div>

          <RevealHeading className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-4 text-center">
            Words of Wisdom
          </RevealHeading>

          <StaggerGrid className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 z-50 relative">
            {quotes.map((quote, index) => (
              <StaggerItem key={index}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.25 }}
                  className="group relative bg-linear-to-br from-accent/10 to-white/30 backdrop-blur-sm border border-text-muted/20 rounded-3xl py-8 px-4 hover:border-accent/70 transition-all duration-500 shadow-xl overflow-hidden h-full"
                >
                  <div className="absolute top-6 left-6 text-accent text-6xl font-serif opacity-30">
                    &ldquo;
                  </div>

                  <div className="flex flex-col items-center text-center mt-4">
                    <div className="relative w-36 h-36 mb-6 rounded-full overflow-hidden border-4 border-accent/30 group-hover:border-accent transition-colors duration-500">
                      {quote.image ? (
                        <Image
                          src={quote.image}
                          alt={quote.name}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-text-secondary/20 flex items-center justify-center">
                          <span className="text-text-muted text-xs">
                            No Image
                          </span>
                        </div>
                      )}
                    </div>

                    <p className="text-text-secondary text-sm leading-tight mb-6 italic text-balance">
                      {quote.quote || "No quote provided yet."}
                    </p>

                    <div className="mt-auto">
                      <h3 className="text-xl font-bold text-text-secondary mb-1">
                        {quote.name || "Name"}
                      </h3>

                      <p className="text-sm text-accent">
                        {quote.designation || "Designation"}
                      </p>
                    </div>
                  </div>

                  <div className="absolute bottom-0 right-6 text-accent text-6xl font-serif opacity-30">
                    &rdquo;
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerGrid>

          {quotes.length === 0 && (
            <div className="text-center text-text-muted py-12 mb-20">
              <p className="text-lg">
                {auth
                  ? "No quotes added yet. Click the edit button to add some!"
                  : "No quotes available at the moment."}
              </p>
            </div>
          )}

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-text-muted"
          >
            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <motion.div key={index} variants={scaleIn} className="text-center">
                  <AnimatedCounter
                    value={stat.value}
                    className="text-5xl lg:text-6xl font-bebasNeue text-accent mb-2"
                  />

                  <div className="text-zinc-100 uppercase text-sm tracking-wider">
                    {stat.label}
                  </div>
                </motion.div>
              ))
            ) : (
              <h1 className="col-span-full text-xl text-center text-zinc-100 font-poppins">
                Stats Loading...
              </h1>
            )}
          </motion.div>
        </div>
      </MotionSection>

      {/* CAMPFIRE */}
      <CampfireComp />

      {/* VISION */}
      <MotionSection className="snap-section relative min-h-screen bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden">
        {auth && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.3 }}
            onClick={() => openEditor("vision", { visionText, objectives })}
            className="absolute top-8 right-8 z-10 bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
            title="Edit Vision"
          >
            <HiOutlinePencilAlt size={20} />
            Edit
          </motion.button>
        )}

        <div className="absolute inset-0 opacity-5">
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
              <p className="text-text-secondary text-lg md:text-lg leading-relaxed text-justify md:text-center md:text-balance">
                {visionText || "Loading vision statement..."}
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
                  <StaggerItem key={index}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.25 }}
                      className="group relative bg-linear-to-br from-accent/10 to-text-secondary/5 backdrop-blur-sm border border-accent/30 rounded-2xl p-8 hover:border-accent transition-all duration-500 shadow-xl overflow-hidden h-full"
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

      {/* AUTH CTA */}
      {!isLoggedIn && (
        <MotionSection className="snap-section relative min-h-[55vh] bg-linear-to-b from-background to-black py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
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

      {/* LOGGED IN CTA */}
      {isLoggedIn && user && (
        <MotionSection className="snap-section relative min-h-[50vh] bg-linear-to-b from-background to-black py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
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
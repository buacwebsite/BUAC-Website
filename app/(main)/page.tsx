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
          setImages(response.data.images);
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

    gsap.to("#box", {
      scrollTrigger: {
        trigger: "#header",
        start: "center center",
        end: "bottom center",
        scrub: true,
      },
      y: 500,
      rotation: 360,
      duration: 3,
      ease: "power1.inOut",
    });
  }, []);

  return (
    <>
      <HeroComp images={images} />

      {/* ===== ABOUT SECTION ===== */}
      <section className="snap-section relative min-h-screen bg-linear-to-b from-background via-background via-85% md:via-65% to-black py-12 px-6 lg:px-12 font-poppins overflow-hidden">
        {auth && (
          <button
            onClick={() =>
              openEditor("aboutSection", { quotes, aboutText, stats })
            }
            className="absolute top-8 right-8 z-10 bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
            title="Edit Section"
          >
            <HiOutlinePencilAlt size={20} />
            Edit
          </button>
        )}

        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-text-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-6">
              About Us
            </h2>
          </div>

          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-text-muted text-base leading-relaxed text-center font-poppins">
              {aboutText}
            </p>
          </div>

          <div className="text-center mb-4">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-4">
              Words of Wisdom
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-12 z-50 relative">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className="group relative bg-linear-to-br from-accent/10 to-white/30 backdrop-blur-sm border border-text-muted/20 rounded-3xl py-8 px-4 hover:border-accent/70 hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20"
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
              </div>
            ))}
          </div>

          {quotes.length === 0 && !auth && (
            <div className="text-center text-text-muted py-12 mb-20">
              <p className="text-lg">No quotes available at the moment.</p>
            </div>
          )}

          {quotes.length === 0 && auth && (
            <div className="text-center text-text-muted py-12 mb-20">
              <p className="text-lg mb-4">
                No quotes added yet. Click the edit button to add some!
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 border-t border-text-muted">
            {stats.length > 0 ? (
              stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl lg:text-6xl font-bebasNeue text-accent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-zinc-100 uppercase text-sm tracking-wider">
                    {stat.label}
                  </div>
                </div>
              ))
            ) : (
              <>
                <h1 className="col-span-full text-xl text-center text-zinc-100 font-poppins">
                  Stats Loading...
                </h1>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== CAMPFIRE SECTION ===== */}
      <CampfireComp />

      {/* ===== VISION SECTION ===== */}
      <section className="snap-section relative min-h-screen bg-background py-16 px-6 lg:px-12 font-poppins overflow-hidden">
        {auth && (
          <button
            onClick={() => openEditor("vision", { visionText, objectives })}
            className="absolute top-8 right-8 z-10 bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
            title="Edit Vision"
          >
            <HiOutlinePencilAlt size={20} />
            Edit
          </button>
        )}

        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-text-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bebasNeue text-accent leading-none mb-6">
              Our Vision
            </h2>
            <div className="max-w-6xl mx-auto">
              <p className="text-text-secondary text-lg md:text-lg leading-relaxed text-justify md:text-center md:text-balance">
                {visionText || "Loading vision statement..."}
              </p>
            </div>
          </div>

          <div className="mt-16">
            <h3 className="text-4xl md:text-5xl font-bebasNeue text-center text-text-secondary mb-12">
              Our Objectives
            </h3>

            {objectives.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {objectives.map((objective, index) => (
                  <div
                    key={index}
                    className="group relative bg-linear-to-br from-accent/10 to-text-secondary/5 backdrop-blur-sm border border-accent/30 rounded-2xl p-8 hover:border-accent hover:scale-105 transition-all duration-500 hover:shadow-2xl hover:shadow-accent/20"
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
                  </div>
                ))}
              </div>
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
      </section>

      {/* ===== AUTH CTA SECTION ===== */}
      {!isLoggedIn && (
        <section className="snap-section relative min-h-[70vh] bg-linear-to-b from-background to-black py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-6xl md:text-7xl lg:text-8xl font-bebasNeue text-accent leading-none mb-6">
              Be an Adventurer
            </h2>
            <p className="text-text-muted text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Join the BRAC University Adventure Club community. Whether you&apos;re a
              current student ready to explore, or an alumni wanting to stay connected
              — there&apos;s a place for you here.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/register"
                className="group relative px-12 py-5 bg-gradient-to-r from-accent via-orange-500 to-accent bg-[length:200%_100%] hover:bg-[100%_0] text-white font-bebasNeue text-2xl tracking-wider rounded-full transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-accent/40 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Create Account
                </span>
                <div className="absolute inset-0 bg-white/20 group-hover:bg-white/0 transition-colors duration-500" />
              </Link>
              <Link
                href="/login"
                className="group relative px-12 py-5 border-2 border-accent/60 text-accent hover:bg-accent hover:text-white font-bebasNeue text-2xl tracking-wider rounded-full transition-all duration-300 hover:border-accent hover:shadow-[0_0_30px_rgba(255,102,51,0.4)] hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ===== LOGGED IN WELCOME ===== */}
      {isLoggedIn && user && (
        <section className="snap-section relative min-h-[50vh] bg-linear-to-b from-background to-black py-16 px-6 lg:px-12 font-poppins overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl"></div>
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bebasNeue text-accent leading-none mb-4">
              Welcome Back, {user.name}!
            </h2>
            <div className="inline-block mb-6">
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
            </div>
            <p className="text-text-muted text-lg max-w-2xl mx-auto mb-8">
              {user.role === "admin"
                ? "You have full access to manage content. Look for Edit buttons throughout the site."
                : user.role === "alumni"
                ? "Great to see you back! Stay connected with the adventure family."
                : "Ready for your next adventure? Check out our upcoming tours and activities."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/tours"
                className="group relative px-10 py-4 bg-gradient-to-r from-accent via-orange-500 to-accent bg-[length:200%_100%] hover:bg-[100%_0] text-white font-bebasNeue text-xl tracking-wider rounded-full transition-all duration-500 shadow-lg hover:shadow-xl hover:shadow-accent/40 hover:scale-105 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Explore Tours
                </span>
              </Link>
              <Link
                href="/activities"
                className="group relative px-10 py-4 border-2 border-accent/60 text-accent hover:bg-accent hover:text-white font-bebasNeue text-xl tracking-wider rounded-full transition-all duration-300 hover:border-accent hover:shadow-[0_0_25px_rgba(255,102,51,0.35)] hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  View Activities
                </span>
              </Link>
              <button
                onClick={logout}
                className="group relative px-10 py-4 border-2 border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white font-bebasNeue text-xl tracking-wider rounded-full transition-all duration-300 hover:border-red-500 hover:shadow-[0_0_25px_rgba(239,68,68,0.35)] hover:scale-105 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign Out
                </span>
              </button>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
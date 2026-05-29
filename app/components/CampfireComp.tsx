"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import { gsap } from "gsap";
import torchFire from "@/public/assets/fire.json";

export default function CampfireComp() {
  const sectionRef = useRef<HTMLElement>(null);
  const torchRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<HTMLDivElement>(null);
  const sparksContainerRef = useRef<HTMLDivElement>(null);

  const [particles, setParticles] = useState<
    { x: number; delay: number; drift: number; size: number }[]
  >([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }).map(() => ({
        x: (Math.random() - 0.5) * 80,
        drift: (Math.random() - 0.5) * 40,
        delay: Math.random() * 1.2,
        size: 1 + Math.random() * 2,
      }))
    );
  }, []);

  const center = useRef({ x: 0, y: 0 });
  const torchPosition = useRef({ x: 0, y: 0 });
  const velocity = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const section = sectionRef.current;
    const torch = torchRef.current;
    const spotlight = spotlightRef.current;
    const glow = glowRef.current;
    const shadow = shadowRef.current;

    if (!section || !torch || !spotlight || !glow || !shadow) return;

    const sectionRect = section.getBoundingClientRect();
    const torchRect = torch.getBoundingClientRect();

    const initialCenter = {
      x: torchRect.left + torchRect.width / 2 - sectionRect.left,
      y: torchRect.top + torchRect.height / 2 - sectionRect.top,
    };
    center.current = initialCenter;

    const updateSpotlightPosition = () => {
      const spotX = initialCenter.x + torchPosition.current.x;
      const spotY = initialCenter.y + torchPosition.current.y;

      spotlight.style.setProperty("--x", `${spotX}px`);
      spotlight.style.setProperty("--y", `${spotY}px`);
      glow.style.setProperty("--x", `${spotX}px`);
      glow.style.setProperty("--y", `${spotY}px`);

      if (sparksContainerRef.current) {
        sparksContainerRef.current.style.setProperty(
          "--pushX",
          `${-velocity.current.x * 1}px`,
        );
        sparksContainerRef.current.style.setProperty(
          "--pushY",
          `${Math.max(0, -velocity.current.y * 0.2)}px`,
        );
      }
    };

    updateSpotlightPosition();
    spotlight.style.setProperty("--size", "600px");
    glow.style.setProperty("--size", "650px");

    const ticker = gsap.ticker.add(updateSpotlightPosition);

    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768);

    let rafId: number | null = null;
    let pendingEvent: MouseEvent | null = null;

    const processMove = () => {
      rafId = null;
      if (!pendingEvent) return;
      const e = pendingEvent;
      pendingEvent = null;

      const s = section.getBoundingClientRect();

      const inside =
        e.clientX >= s.left &&
        e.clientX <= s.right &&
        e.clientY >= s.top &&
        e.clientY <= s.bottom;

      const targetX = inside ? e.clientX - s.left - initialCenter.x : 0;
      const targetY = inside ? e.clientY - s.top - initialCenter.y : 0;

      velocity.current = {
        x: targetX - torchPosition.current.x,
        y: targetY - torchPosition.current.y,
      };

      gsap.to(torchPosition.current, {
        x: targetX,
        y: targetY,
        duration: inside ? 0.45 : 0.9,
        ease: inside ? "power2.out" : "elastic.out(1, 0.6)",
        onUpdate: () => {
          gsap.set(torch, {
            x: torchPosition.current.x,
            y: torchPosition.current.y,
          });
        },
      });

      if (inside) {
        spotlight.style.setProperty("--size", "500px");
        glow.style.setProperty("--size", "480px");
        shadow.style.animationPlayState = "running";
        shadow.classList.remove(
          "animate-[shadow_1s_linear_infinite_alternate]",
        );
      } else {
        spotlight.style.setProperty("--size", "800px");
        glow.style.setProperty("--size", "700px");
        shadow.classList.add("animate-[shadow_1s_linear_infinite_alternate]");
      }
    };

    const onMoveBatched = (e: MouseEvent) => {
      pendingEvent = e;
      if (rafId == null) rafId = window.requestAnimationFrame(processMove);
    };

    if (isTouchDevice) {
      spotlight.style.setProperty("--size", "1200px");
      glow.style.setProperty("--size", "1200px");
      shadow.style.animationPlayState = "paused";
      if (sparksContainerRef.current) {
        sparksContainerRef.current.style.display = "none";
      }
    } else {
      window.addEventListener("mousemove", onMoveBatched);
    }

    return () => {
      if (!isTouchDevice)
        window.removeEventListener("mousemove", onMoveBatched);
      if (rafId) cancelAnimationFrame(rafId);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return (
    <section
      id="campfireSection"
      ref={sectionRef}
      className="snap-section relative w-full h-screen bg-black flex items-center justify-center overflow-hidden cursor-none"
    >
      <div className="absolute inset-0 bg-black/85 z-5" />

      {/* Dark text layer (revealed parts) */}
      <div className="relative z-10 text-zinc-700 select-none py-12 px-4 md:py-8 md:px-12 w-full h-full flex items-center justify-center">
        <div className="grid grid-cols-12 gap-4 max-w-8xl w-full items-center">
          <h1 className="col-span-8 text-4xl lg:text-7xl font-bebasNeue leading-tight">
            The best views come after the hardest climb
          </h1>
          <h2 className="col-span-4 text-xl lg:text-6xl font-bebasNeue leading-tight">
            Embrace the unknown
          </h2>
          <h3 className="col-span-6 text-2xl lg:text-6xl font-bebasNeue leading-tight">
            Every step forward is a victory earned
          </h3>
          <h2 className="col-span-6 text-3xl lg:text-5xl font-bebasNeue leading-tight">
            Built by challenges, driven by purpose
          </h2>
          <h1 className="col-span-4 text-3xl lg:text-7xl font-bebasNeue leading-tight">
            Where limits end,
            <br />
            growth begins
          </h1>
          <h3 className="col-span-4 text-center text-xl lg:text-4xl font-bebasNeue leading-tight">
            Driven by courage
          </h3>
          <h2 className="col-span-4 text-2xl lg:text-5xl font-bebasNeue leading-tight">
            Comfort zones were never meant to last
          </h2>
          <h1 className="col-span-12 text-center text-3xl lg:text-6xl font-bebasNeue leading-tight">
            Winner of all barriers
          </h1>
        </div>
      </div>

      {/* Light text layer (torch-revealed parts) */}
      <div className="absolute inset-0 z-15 flex items-center justify-center pointer-events-none">
        <div className="text-amber-100 select-none py-12 px-4 md:py-8 md:px-12 w-full h-full flex items-center justify-center">
          <div className="grid grid-cols-12 gap-4 max-w-8xl w-full items-center">
            <h1 className="col-span-8 text-4xl lg:text-7xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)]">
              The best views come after the hardest climb
            </h1>
            <h2 className="col-span-4 text-xl lg:text-6xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)]">
              Embrace the unknown
            </h2>
            <h3 className="col-span-6 text-2xl lg:text-6xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)]">
              Every step forward is a victory earned
            </h3>
            <h2 className="col-span-6 text-3xl lg:text-5xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)]">
              Built by challenges, driven by purpose
            </h2>
            <h1 className="col-span-4 text-3xl lg:text-7xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)]">
              Where limits end,
              <br />
              growth begins
            </h1>
            <h3 className="col-span-4 text-center text-xl lg:text-4xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)]">
              Driven by courage
            </h3>
            <h2 className="col-span-4 text-2xl lg:text-5xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)]">
              Comfort zones were never meant to last
            </h2>
            <h1 className="col-span-12 text-center text-3xl lg:text-6xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)]">
              Winner of all barriers
            </h1>
          </div>
        </div>
      </div>

      <div
        ref={spotlightRef}
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-20"
        style={
          {
            "--size": "800px",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,1) 70%)",
            mixBlendMode: "multiply",
          } as React.CSSProperties
        }
      />

      <div
        ref={glowRef}
        className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out z-12"
        style={
          {
            "--size": "700px",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), rgba(255,160,50,0.18) 0%, rgba(255,100,30,0.1) 30%, transparent 55%)",
          } as React.CSSProperties
        }
      />

      <div
        ref={torchRef}
        className="absolute bottom-20 size-32 pointer-events-none z-30"
      >
        <Lottie animationData={torchFire} loop className="w-full h-full" />
        <div className="absolute top-1/2 left-1/2 inset-0 bg-red-500 blur-2xl animate-firepulse opacity-95" />

        <div
          ref={sparksContainerRef}
          className="absolute inset-0 pointer-events-none"
          style={
            {
              "--pushX": "0px",
              "--pushY": "0px",
            } as React.CSSProperties
          }
        >
          {particles.map((s, i) => (
            <span
              key={i}
              className="absolute bottom-1/3 rounded-full bg-orange-300 blur-[1px] animate-[spark_1s_ease-out_infinite]"
              style={
                {
                  width: s.size + "px",
                  height: s.size + "px",
                  left: `calc(50% + ${s.x}px)`,
                  animationDelay: `${s.delay}s`,
                  "--drift": `${s.drift}px`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 scale-200">
        <Image
          src="/assets/camp.svg"
          alt="Campfire Glow"
          width={240}
          height={180}
          className=" pointer-events-none z-15"
        />
        <div className="absolute z-15 translate-y-2 w-full h-full inset-0 bg-red-500 blur-2xl animate-fireGlow mask-[url('/assets/campfiremask.svg')] mask-luminance pointer-events-none" />
        <div
          ref={shadowRef}
          className="absolute z-5 w-full h-full inset-0 bg-zinc-800 animate-[shadow_1s_linear_infinite_alternate] mask-[url('/assets/camp.svg')] mix-blend-color pointer-events-none"
        ></div>
      </div>
    </section>
  );
}
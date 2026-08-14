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
      })),
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

    const setInitialCenter = () => {
      const sectionRect = section.getBoundingClientRect();
      const torchRect = torch.getBoundingClientRect();

      const initialCenter = {
        x: torchRect.left + torchRect.width / 2 - sectionRect.left,
        y: torchRect.top + torchRect.height / 2 - sectionRect.top,
      };

      center.current = initialCenter;

      spotlight.style.setProperty("--x", `${initialCenter.x}px`);
      spotlight.style.setProperty("--y", `${initialCenter.y}px`);
      glow.style.setProperty("--x", `${initialCenter.x}px`);
      glow.style.setProperty("--y", `${initialCenter.y}px`);
    };

    const updateSpotlightPosition = () => {
      const spotX = center.current.x + torchPosition.current.x;
      const spotY = center.current.y + torchPosition.current.y;

      spotlight.style.setProperty("--x", `${spotX}px`);
      spotlight.style.setProperty("--y", `${spotY}px`);
      glow.style.setProperty("--x", `${spotX}px`);
      glow.style.setProperty("--y", `${spotY}px`);

      if (sparksContainerRef.current) {
        sparksContainerRef.current.style.setProperty(
          "--pushX",
          `${-velocity.current.x}px`,
        );

        sparksContainerRef.current.style.setProperty(
          "--pushY",
          `${Math.max(0, -velocity.current.y * 0.2)}px`,
        );
      }
    };

    setInitialCenter();
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
    let pendingPoint: { x: number; y: number; inside: boolean } | null = null;

    const animateToPoint = () => {
      rafId = null;

      if (!pendingPoint) return;

      const point = pendingPoint;
      pendingPoint = null;

      const targetX = point.inside ? point.x - center.current.x : 0;
      const targetY = point.inside ? point.y - center.current.y : 0;

      velocity.current = {
        x: targetX - torchPosition.current.x,
        y: targetY - torchPosition.current.y,
      };

      gsap.killTweensOf(torchPosition.current);

      gsap.to(torchPosition.current, {
        x: targetX,
        y: targetY,
        duration: point.inside ? 0.45 : 0.9,
        ease: point.inside ? "power2.out" : "elastic.out(1, 0.6)",
        overwrite: true,
        onUpdate: () => {
          gsap.set(torch, {
            x: torchPosition.current.x,
            y: torchPosition.current.y,
          });
        },
      });

      if (point.inside) {
        spotlight.style.setProperty(
          "--size",
          isTouchDevice ? "650px" : "500px",
        );
        glow.style.setProperty("--size", isTouchDevice ? "600px" : "480px");
        shadow.style.animationPlayState = "running";
      } else {
        spotlight.style.setProperty(
          "--size",
          isTouchDevice ? "920px" : "800px",
        );
        glow.style.setProperty("--size", isTouchDevice ? "820px" : "700px");

        if (!isTouchDevice) {
          shadow.style.animationPlayState = "running";
        }
      }
    };

    const queuePoint = (clientX: number, clientY: number, inside: boolean) => {
      const rect = section.getBoundingClientRect();

      pendingPoint = {
        x: clientX - rect.left,
        y: clientY - rect.top,
        inside,
      };

      if (rafId === null) {
        rafId = window.requestAnimationFrame(animateToPoint);
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = section.getBoundingClientRect();

      const inside =
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom;

      queuePoint(event.clientX, event.clientY, inside);
    };

    const handleTouchStart = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      queuePoint(event.clientX, event.clientY, true);
    };

    const handleTouchMove = (event: PointerEvent) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;

      if (event.pressure > 0 || event.buttons > 0) {
        queuePoint(event.clientX, event.clientY, true);
      }
    };

    const handleResize = () => {
      setInitialCenter();
      updateSpotlightPosition();
    };

    if (isTouchDevice) {
      spotlight.style.setProperty("--size", "920px");
      glow.style.setProperty("--size", "820px");
      shadow.style.animationPlayState = "paused";

      section.addEventListener("pointerdown", handleTouchStart, {
        passive: true,
      });

      section.addEventListener("pointermove", handleTouchMove, {
        passive: true,
      });
    } else {
      window.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (isTouchDevice) {
        section.removeEventListener("pointerdown", handleTouchStart);
        section.removeEventListener("pointermove", handleTouchMove);
      } else {
        window.removeEventListener("mousemove", handleMouseMove);
      }

      window.removeEventListener("resize", handleResize);

      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }

      gsap.ticker.remove(ticker);
      gsap.killTweensOf(torchPosition.current);
    };
  }, []);

  return (
    <section
      id="campfireSection"
      ref={sectionRef}
      className="snap-section relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black px-4 sm:h-screen sm:px-8 md:cursor-none"
      style={{ touchAction: "pan-y" }}
    >
      <div className="absolute inset-0 z-[5] bg-black/85" />

      {/* Single clean text layer — no duplicated shadow text */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-12 text-zinc-500 select-none md:px-12 md:py-8">
        <div className="grid w-full max-w-8xl grid-cols-12 items-center gap-4">
          <h1 className="col-span-8 text-4xl font-bebasNeue leading-tight lg:text-7xl">
            The best views come after the hardest climb
          </h1>

          <h2 className="col-span-4 text-xl font-bebasNeue leading-tight lg:text-6xl">
            Embrace the unknown
          </h2>

          <h3 className="col-span-6 text-2xl font-bebasNeue leading-tight lg:text-6xl">
            Every step forward is a victory earned
          </h3>

          <h2 className="col-span-6 text-3xl font-bebasNeue leading-tight lg:text-5xl">
            Built by challenges, driven by purpose
          </h2>

          <h1 className="col-span-4 text-3xl font-bebasNeue leading-tight lg:text-7xl">
            Where limits end,
            <br />
            growth begins
          </h1>

          <h3 className="col-span-4 text-center text-xl font-bebasNeue leading-tight lg:text-4xl">
            Driven by courage
          </h3>

          <h2 className="col-span-4 text-2xl font-bebasNeue leading-tight lg:text-5xl">
            Comfort zones were never meant to last
          </h2>

          <h1 className="col-span-12 text-center text-3xl font-bebasNeue leading-tight lg:text-6xl">
            Winner of all barriers
          </h1>
        </div>
      </div>

      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-700 ease-out"
        style={
          {
            "--size": "800px",
            "--x": "50%",
            "--y": "80%",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,1) 70%)",
            mixBlendMode: "multiply",
          } as React.CSSProperties
        }
      />

      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[12] transition-all duration-700 ease-out"
        style={
          {
            "--size": "700px",
            "--x": "50%",
            "--y": "80%",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), rgba(255,160,50,0.18) 0%, rgba(255,100,30,0.1) 30%, transparent 55%)",
          } as React.CSSProperties
        }
      />

      <div
        ref={torchRef}
        className="pointer-events-none absolute bottom-20 z-30 size-32"
      >
        <Lottie animationData={torchFire} loop className="h-full w-full" />

        <div className="absolute top-1/2 left-1/2 inset-0 bg-red-500 blur-2xl animate-firepulse opacity-95" />

        <div
          ref={sparksContainerRef}
          className="pointer-events-none absolute inset-0"
          style={
            {
              "--pushX": "0px",
              "--pushY": "0px",
            } as React.CSSProperties
          }
        >
          {particles.map((particle, index) => (
            <span
              key={index}
              className="absolute bottom-1/3 rounded-full bg-orange-300 blur-[1px] animate-[spark_1s_ease-out_infinite]"
              style={
                {
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  left: `calc(50% + ${particle.x}px)`,
                  animationDelay: `${particle.delay}s`,
                  "--drift": `${particle.drift}px`,
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
          className="pointer-events-none z-[15]"
        />

        <div className="absolute z-[15] translate-y-2 h-full w-full inset-0 bg-red-500 blur-2xl animate-fireGlow mask-[url('/assets/campfiremask.svg')] mask-luminance pointer-events-none" />

        <div
          ref={shadowRef}
          className="absolute z-[5] h-full w-full inset-0 bg-zinc-800 animate-[shadow_1s_linear_infinite_alternate] mask-[url('/assets/camp.svg')] mix-blend-color pointer-events-none"
        />
      </div>
    </section>
  );
}
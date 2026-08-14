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

    const updateTicker = () => {
      updateSpotlightPosition();
    };

    gsap.ticker.add(updateTicker);

    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.innerWidth < 768);

    let rafId: number | null = null;
    let pendingEvent: MouseEvent | PointerEvent | null = null;

    const processMove = () => {
      rafId = null;
      if (!pendingEvent) return;

      const event = pendingEvent;
      pendingEvent = null;

      const sectionBounds = section.getBoundingClientRect();

      const inside =
        event.clientX >= sectionBounds.left &&
        event.clientX <= sectionBounds.right &&
        event.clientY >= sectionBounds.top &&
        event.clientY <= sectionBounds.bottom;

      const targetX = inside
        ? event.clientX - sectionBounds.left - initialCenter.x
        : 0;

      const targetY = inside
        ? event.clientY - sectionBounds.top - initialCenter.y
        : 0;

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
        shadow.classList.add(
          "animate-[shadow_1s_linear_infinite_alternate]",
        );
      }
    };

    const queueMove = (event: MouseEvent | PointerEvent) => {
      pendingEvent = event;
      if (rafId == null) {
        rafId = window.requestAnimationFrame(processMove);
      }
    };

    const handleTouchMove = (event: PointerEvent) => {
      queueMove(event);
    };

    if (isTouchDevice) {
      spotlight.style.setProperty("--size", "1000px");
      glow.style.setProperty("--size", "900px");
      shadow.style.animationPlayState = "paused";

      section.addEventListener("pointerdown", handleTouchMove, {
        passive: true,
      });
      section.addEventListener("pointermove", handleTouchMove, {
        passive: true,
      });
      section.addEventListener(
        "pointerleave",
        () => {
          pendingEvent = null;
          gsap.to(torchPosition.current, {
            x: 0,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            onUpdate: () => {
              gsap.set(torch, {
                x: torchPosition.current.x,
                y: torchPosition.current.y,
              });
            },
          });
        },
        { passive: true },
      );
    } else {
      window.addEventListener("mousemove", queueMove);
    }

    return () => {
      if (isTouchDevice) {
        section.removeEventListener("pointerdown", handleTouchMove);
        section.removeEventListener("pointermove", handleTouchMove);
      } else {
        window.removeEventListener("mousemove", queueMove);
      }

      if (rafId) cancelAnimationFrame(rafId);
      gsap.ticker.remove(updateTicker);
    };
  }, []);

  return (
    <section
      id="campfireSection"
      ref={sectionRef}
      className="snap-section relative h-screen w-full overflow-hidden bg-black flex items-center justify-center cursor-none"
    >
      <div className="absolute inset-0 z-5 bg-black/85" />

      {/* Dark text */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 py-12 text-zinc-700 select-none md:px-12 md:py-8">
        <div className="grid w-full max-w-8xl grid-cols-12 gap-4 items-center">
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

      {/* Light text */}
      <div className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center">
        <div className="flex h-full w-full items-center justify-center px-4 py-12 text-amber-100 select-none md:px-12 md:py-8">
          <div className="grid w-full max-w-8xl grid-cols-12 gap-4 items-center">
            <h1 className="col-span-8 text-4xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] lg:text-7xl">
              The best views come after the hardest climb
            </h1>
            <h2 className="col-span-4 text-xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] lg:text-6xl">
              Embrace the unknown
            </h2>
            <h3 className="col-span-6 text-2xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] lg:text-6xl">
              Every step forward is a victory earned
            </h3>
            <h2 className="col-span-6 text-3xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] lg:text-5xl">
              Built by challenges, driven by purpose
            </h2>
            <h1 className="col-span-4 text-3xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] lg:text-7xl">
              Where limits end,
              <br />
              growth begins
            </h1>
            <h3 className="col-span-4 text-center text-xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] lg:text-4xl">
              Driven by courage
            </h3>
            <h2 className="col-span-4 text-2xl font-bebasNeue leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] lg:text-5xl">
              Comfort zones were never meant to last
            </h2>
            <h1 className="col-span-12 text-center text-3xl font-bebasNeue leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] lg:text-6xl">
              Winner of all barriers
            </h1>
          </div>
        </div>
      </div>

      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-20 transition-all duration-700 ease-out"
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
        className="pointer-events-none absolute inset-0 z-12 transition-all duration-700 ease-out"
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
        className="pointer-events-none absolute bottom-20 z-30 size-32"
      >
        <Lottie animationData={torchFire} loop className="h-full w-full" />
        <div className="absolute inset-0 top-1/2 left-1/2 bg-red-500 blur-2xl animate-firepulse opacity-95" />
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
          {particles.map((s, i) => (
            <span
              key={i}
              className="absolute bottom-1/3 rounded-full bg-orange-300 blur-[1px] animate-[spark_1s_ease-out_infinite]"
              style={
                {
                  width: `${s.size}px`,
                  height: `${s.size}px`,
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
          className="pointer-events-none z-15"
        />
        <div className="absolute inset-0 z-15 h-full w-full translate-y-2 bg-red-500 blur-2xl animate-fireGlow mask-[url('/assets/campfiremask.svg')] mask-luminance pointer-events-none" />
        <div
          ref={shadowRef}
          className="absolute inset-0 z-5 h-full w-full bg-zinc-800 animate-[shadow_1s_linear_infinite_alternate] mask-[url('/assets/camp.svg')] mix-blend-color pointer-events-none"
        />
      </div>
    </section>
  );
}
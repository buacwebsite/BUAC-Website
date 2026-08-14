"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  PointerEvent as ReactPointerEvent,
} from "react";
import Image from "next/image";
import Lottie from "lottie-react";
import { gsap } from "gsap";
import torchFire from "@/public/assets/fire.json";

interface SparkParticle {
  id: number;
  x: number;
  delay: number;
  drift: number;
  size: number;
  duration: number;
}

interface Point {
  x: number;
  y: number;
}

interface PointerTarget {
  clientX: number;
  clientY: number;
  inside: boolean;
}

const MOBILE_BREAKPOINT = 768;

export default function CampfireComp() {
  const sectionRef =
    useRef<HTMLElement>(null);

  const torchRef =
    useRef<HTMLDivElement>(null);

  const spotlightRef =
    useRef<HTMLDivElement>(null);

  const glowRef =
    useRef<HTMLDivElement>(null);

  const shadowRef =
    useRef<HTMLDivElement>(null);

  const sparksContainerRef =
    useRef<HTMLDivElement>(null);

  const initialCenterRef =
    useRef<Point>({
      x: 0,
      y: 0,
    });

  const torchPositionRef =
    useRef<Point>({
      x: 0,
      y: 0,
    });

  const velocityRef =
    useRef<Point>({
      x: 0,
      y: 0,
    });

  const pendingPointerRef =
    useRef<PointerTarget | null>(
      null,
    );

  const frameRef =
    useRef<number | null>(null);

  const [particles, setParticles] =
    useState<SparkParticle[]>([]);

  const [isTouchMode, setIsTouchMode] =
    useState(false);

  useEffect(() => {
    const generatedParticles =
      Array.from({
        length: 20,
      }).map((_, index) => ({
        id: index,
        x:
          (Math.random() - 0.5) *
          80,
        drift:
          (Math.random() - 0.5) *
          40,
        delay: Math.random() * 1.2,
        size: 1 + Math.random() * 2,
        duration:
          0.8 + Math.random() * 0.7,
      }));

    setParticles(generatedParticles);
  }, []);

  const updateVisualPosition =
    useCallback(() => {
      const spotlight =
        spotlightRef.current;

      const glow = glowRef.current;

      const sparks =
        sparksContainerRef.current;

      if (!spotlight || !glow) {
        return;
      }

      const absoluteX =
        initialCenterRef.current.x +
        torchPositionRef.current.x;

      const absoluteY =
        initialCenterRef.current.y +
        torchPositionRef.current.y;

      spotlight.style.setProperty(
        "--x",
        `${absoluteX}px`,
      );

      spotlight.style.setProperty(
        "--y",
        `${absoluteY}px`,
      );

      glow.style.setProperty(
        "--x",
        `${absoluteX}px`,
      );

      glow.style.setProperty(
        "--y",
        `${absoluteY}px`,
      );

      if (sparks) {
        sparks.style.setProperty(
          "--push-x",
          `${-velocityRef.current.x}px`,
        );

        sparks.style.setProperty(
          "--push-y",
          `${Math.max(
            0,
            -velocityRef.current.y *
              0.2,
          )}px`,
        );
      }
    }, []);

  const moveTorchToPointer =
    useCallback(
      (
        clientX: number,
        clientY: number,
        inside = true,
      ) => {
        const section =
          sectionRef.current;

        const torch = torchRef.current;

        const spotlight =
          spotlightRef.current;

        const glow =
          glowRef.current;

        const shadow =
          shadowRef.current;

        if (
          !section ||
          !torch ||
          !spotlight ||
          !glow ||
          !shadow
        ) {
          return;
        }

        const bounds =
          section.getBoundingClientRect();

        const targetX = inside
          ? Math.max(
              0,
              Math.min(
                bounds.width,
                clientX - bounds.left,
              ),
            ) -
            initialCenterRef.current.x
          : 0;

        const targetY = inside
          ? Math.max(
              0,
              Math.min(
                bounds.height,
                clientY - bounds.top,
              ),
            ) -
            initialCenterRef.current.y
          : 0;

        velocityRef.current = {
          x:
            targetX -
            torchPositionRef.current.x,
          y:
            targetY -
            torchPositionRef.current.y,
        };

        gsap.killTweensOf(
          torchPositionRef.current,
        );

        gsap.to(
          torchPositionRef.current,
          {
            x: targetX,
            y: targetY,
            duration: inside
              ? 0.42
              : 0.85,
            ease: inside
              ? "power2.out"
              : "elastic.out(1, 0.6)",
            overwrite: true,
            onUpdate: () => {
              gsap.set(torch, {
                x: torchPositionRef.current.x,
                y: torchPositionRef.current.y,
              });

              updateVisualPosition();
            },
          },
        );

        if (inside) {
          spotlight.style.setProperty(
            "--size",
            isTouchMode
              ? "680px"
              : "500px",
          );

          glow.style.setProperty(
            "--size",
            isTouchMode
              ? "620px"
              : "480px",
          );

          shadow.style.animationPlayState =
            "running";
        } else {
          spotlight.style.setProperty(
            "--size",
            isTouchMode
              ? "920px"
              : "800px",
          );

          glow.style.setProperty(
            "--size",
            isTouchMode
              ? "820px"
              : "700px",
          );

          shadow.style.animationPlayState =
            isTouchMode
              ? "paused"
              : "running";
        }
      },
      [
        isTouchMode,
        updateVisualPosition,
      ],
    );

  const processPointerFrame =
    useCallback(() => {
      frameRef.current = null;

      const pointer =
        pendingPointerRef.current;

      pendingPointerRef.current =
        null;

      if (!pointer) return;

      moveTorchToPointer(
        pointer.clientX,
        pointer.clientY,
        pointer.inside,
      );
    }, [moveTorchToPointer]);

  const queuePointer =
    useCallback(
      (
        clientX: number,
        clientY: number,
        inside = true,
      ) => {
        pendingPointerRef.current = {
          clientX,
          clientY,
          inside,
        };

        if (
          frameRef.current === null
        ) {
          frameRef.current =
            window.requestAnimationFrame(
              processPointerFrame,
            );
        }
      },
      [processPointerFrame],
    );

  useEffect(() => {
    const section =
      sectionRef.current;

    const torch = torchRef.current;

    const spotlight =
      spotlightRef.current;

    const glow = glowRef.current;

    const shadow =
      shadowRef.current;

    if (
      !section ||
      !torch ||
      !spotlight ||
      !glow ||
      !shadow
    ) {
      return;
    }

    const updateDeviceMode = () => {
      const touch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints >
          0 ||
        window.innerWidth <
          MOBILE_BREAKPOINT;

      setIsTouchMode(touch);
    };

    const setInitialPosition = () => {
      const sectionBounds =
        section.getBoundingClientRect();

      const torchBounds =
        torch.getBoundingClientRect();

      const initialX =
        sectionBounds.width / 2;

      const initialY = Math.min(
        sectionBounds.height - 150,
        sectionBounds.height * 0.76,
      );

      initialCenterRef.current = {
        x: initialX,
        y: initialY,
      };

      torchPositionRef.current = {
        x: 0,
        y: 0,
      };

      gsap.set(torch, {
        left: initialX,
        top: initialY,
        x: 0,
        y: 0,
      });

      spotlight.style.setProperty(
        "--size",
        window.innerWidth <
          MOBILE_BREAKPOINT
          ? "920px"
          : "800px",
      );

      glow.style.setProperty(
        "--size",
        window.innerWidth <
          MOBILE_BREAKPOINT
          ? "820px"
          : "700px",
      );

      spotlight.style.setProperty(
        "--x",
        `${initialX}px`,
      );

      spotlight.style.setProperty(
        "--y",
        `${initialY}px`,
      );

      glow.style.setProperty(
        "--x",
        `${initialX}px`,
      );

      glow.style.setProperty(
        "--y",
        `${initialY}px`,
      );

      shadow.style.animationPlayState =
        window.innerWidth <
        MOBILE_BREAKPOINT
          ? "paused"
          : "running";

      void torchBounds;
    };

    updateDeviceMode();
    setInitialPosition();

    const handleMouseMove = (
      event: MouseEvent,
    ) => {
      const bounds =
        section.getBoundingClientRect();

      const inside =
        event.clientX >=
          bounds.left &&
        event.clientX <=
          bounds.right &&
        event.clientY >=
          bounds.top &&
        event.clientY <=
          bounds.bottom;

      queuePointer(
        event.clientX,
        event.clientY,
        inside,
      );
    };

    const handleWindowResize = () => {
      updateDeviceMode();
      setInitialPosition();
    };

    window.addEventListener(
      "mousemove",
      handleMouseMove,
      {
        passive: true,
      },
    );

    window.addEventListener(
      "resize",
      handleWindowResize,
    );

    return () => {
      window.removeEventListener(
        "mousemove",
        handleMouseMove,
      );

      window.removeEventListener(
        "resize",
        handleWindowResize,
      );

      if (
        frameRef.current !== null
      ) {
        window.cancelAnimationFrame(
          frameRef.current,
        );
      }

      gsap.killTweensOf(
        torchPositionRef.current,
      );
    };
  }, [queuePointer]);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (
      event.pointerType === "touch" ||
      event.pointerType === "pen"
    ) {
      queuePointer(
        event.clientX,
        event.clientY,
        true,
      );
    }
  };

  const handlePointerMove = (
    event: ReactPointerEvent<HTMLElement>,
  ) => {
    if (
      event.pointerType === "touch" ||
      event.pointerType === "pen"
    ) {
      if (
        event.pressure > 0 ||
        event.buttons > 0
      ) {
        queuePointer(
          event.clientX,
          event.clientY,
          true,
        );
      }
    }
  };

  return (
    <section
      id="campfireSection"
      ref={sectionRef}
      onPointerDown={
        handlePointerDown
      }
      onPointerMove={
        handlePointerMove
      }
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-black px-4 sm:h-screen sm:px-8 md:cursor-none"
      style={{
        touchAction: "pan-y",
      }}
    >
      <div className="absolute inset-0 z-[5] bg-black/85" />

      {/* Dark text layer */}
      <div className="relative z-10 flex h-full w-full items-center justify-center text-zinc-700 select-none">
        <div className="grid w-full max-w-8xl grid-cols-12 items-center gap-3 py-16 sm:gap-4 sm:py-12">
          <h1 className="col-span-8 font-bebasNeue text-3xl leading-tight sm:text-6xl lg:text-7xl">
            The best views come after the hardest climb
          </h1>

          <h2 className="col-span-4 font-bebasNeue text-xl leading-tight sm:text-5xl lg:text-6xl">
            Embrace the unknown
          </h2>

          <h3 className="col-span-6 font-bebasNeue text-2xl leading-tight sm:text-5xl lg:text-6xl">
            Every step forward is a victory earned
          </h3>

          <h2 className="col-span-6 font-bebasNeue text-2xl leading-tight sm:text-4xl lg:text-5xl">
            Built by challenges, driven by purpose
          </h2>

          <h1 className="col-span-5 font-bebasNeue text-2xl leading-tight sm:text-6xl lg:text-7xl">
            Where limits end,
            <br />
            growth begins
          </h1>

          <h3 className="col-span-3 text-center font-bebasNeue text-lg leading-tight sm:text-3xl lg:text-4xl">
            Driven by courage
          </h3>

          <h2 className="col-span-4 font-bebasNeue text-xl leading-tight sm:text-4xl lg:text-5xl">
            Comfort zones were never meant to last
          </h2>

          <h1 className="col-span-12 text-center font-bebasNeue text-2xl leading-tight sm:text-5xl lg:text-6xl">
            Winner of all barriers
          </h1>
        </div>
      </div>

      {/* Light text layer */}
      <div className="pointer-events-none absolute inset-0 z-[15] flex items-center justify-center">
        <div className="grid w-full max-w-8xl grid-cols-12 items-center gap-3 px-4 py-16 text-amber-100 select-none sm:gap-4 sm:px-8 sm:py-12">
          <h1 className="col-span-8 font-bebasNeue text-3xl leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] sm:text-6xl lg:text-7xl">
            The best views come after the hardest climb
          </h1>

          <h2 className="col-span-4 font-bebasNeue text-xl leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] sm:text-5xl lg:text-6xl">
            Embrace the unknown
          </h2>

          <h3 className="col-span-6 font-bebasNeue text-2xl leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] sm:text-5xl lg:text-6xl">
            Every step forward is a victory earned
          </h3>

          <h2 className="col-span-6 font-bebasNeue text-2xl leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] sm:text-4xl lg:text-5xl">
            Built by challenges, driven by purpose
          </h2>

          <h1 className="col-span-5 font-bebasNeue text-2xl leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] sm:text-6xl lg:text-7xl">
            Where limits end,
            <br />
            growth begins
          </h1>

          <h3 className="col-span-3 text-center font-bebasNeue text-lg leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] sm:text-3xl lg:text-4xl">
            Driven by courage
          </h3>

          <h2 className="col-span-4 font-bebasNeue text-xl leading-tight drop-shadow-[0_0_12px_rgba(255,200,100,0.5)] sm:text-4xl lg:text-5xl">
            Comfort zones were never meant to last
          </h2>

          <h1 className="col-span-12 text-center font-bebasNeue text-2xl leading-tight drop-shadow-[0_0_15px_rgba(255,200,100,0.6)] sm:text-5xl lg:text-6xl">
            Winner of all barriers
          </h1>
        </div>
      </div>

      <div
        ref={spotlightRef}
        className="pointer-events-none absolute inset-0 z-20 transition-[background] duration-300 ease-out"
        style={
          {
            "--size": "800px",
            "--x": "50%",
            "--y": "76%",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), transparent 0%, transparent 15%, rgba(0,0,0,0.6) 35%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,1) 70%)",
            mixBlendMode: "multiply",
          } as React.CSSProperties
        }
      />

      <div
        ref={glowRef}
        className="pointer-events-none absolute inset-0 z-[12] transition-[background] duration-300 ease-out"
        style={
          {
            "--size": "700px",
            "--x": "50%",
            "--y": "76%",
            background:
              "radial-gradient(circle var(--size) at var(--x) var(--y), rgba(255,160,50,0.18) 0%, rgba(255,100,30,0.1) 30%, transparent 55%)",
          } as React.CSSProperties
        }
      />

      <div
        ref={torchRef}
        className="pointer-events-none absolute z-30 h-24 w-24 -translate-x-1/2 -translate-y-1/2 sm:h-32 sm:w-32"
      >
        <Lottie
          animationData={torchFire}
          loop
          className="h-full w-full"
        />

        <div className="absolute inset-0 translate-y-1/3 rounded-full bg-red-500/80 blur-2xl animate-firepulse" />

        <div
          ref={sparksContainerRef}
          className="pointer-events-none absolute inset-0"
          style={
            {
              "--push-x": "0px",
              "--push-y": "0px",
            } as React.CSSProperties
          }
        >
          {particles.map(
            (particle) => (
              <span
                key={particle.id}
                className="absolute bottom-1/3 rounded-full bg-orange-300 blur-[1px] animate-[spark_1s_ease-out_infinite]"
                style={
                  {
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    left: `calc(50% + ${particle.x}px)`,
                    animationDelay: `${particle.delay}s`,
                    animationDuration: `${particle.duration}s`,
                    "--drift": `${particle.drift}px`,
                    transform:
                      "translate(var(--push-x), var(--push-y))",
                  } as React.CSSProperties
                }
              />
            ),
          )}
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 z-[25] w-40 -translate-x-1/2 sm:bottom-10 sm:w-56">
        <Image
          src="/assets/camp.svg"
          alt="Campfire"
          width={240}
          height={180}
          className="h-auto w-full"
        />

        <div className="absolute inset-0 translate-y-2 bg-red-500 blur-2xl animate-fireGlow mask-[url('/assets/campfiremask.svg')] mask-luminance" />

        <div
          ref={shadowRef}
          className="absolute inset-0 bg-zinc-800 animate-[shadow_1s_linear_infinite_alternate] mask-[url('/assets/camp.svg')] mix-blend-color"
        />
      </div>
    </section>
  );
}
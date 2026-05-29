"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useEditor } from "../context/EditorContext";
import { useAuth } from "../context/AuthProvider";

export default function HeroComp({
  images,
}: {
  images: { place: string; image: string }[];
}) {
  const { auth } = useAuth();
  const { openEditor } = useEditor();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    if (isAnimating) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [isAnimating, images.length]);

  const prevSlide = useCallback(() => {
    if (isAnimating) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [isAnimating, images.length]);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentIndex) return;
    setCurrentIndex(index);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [nextSlide]);

  const timeline = gsap.timeline();

  useGSAP(() => {
    if (
      !cardsContainerRef.current ||
      !backgroundRef.current ||
      !textContainerRef.current
    )
      return;
    if (!images || images.length === 0) return;
    setIsAnimating(true);

    const texts = textContainerRef.current.children;
    let y;
    if (window.innerWidth < 1024) {
      y = -currentIndex * 60;
    } else {
      y = -currentIndex * 160;
    }
    Array.from(texts).forEach((text) => {
      gsap.to(text, {
        opacity: 1,
        y: y,
        duration: 0.7,
        ease: "power2.inOut",
      });
    });

    const cards = cardsContainerRef.current.children;
    const radius = 180;
    const totalCards = images.length;

    Array.from(cards).forEach((card, index) => {
      const anglePerCard = (2 * Math.PI) / totalCards;

      const rotationOffset = -currentIndex * anglePerCard;
      const cardAngle = index * anglePerCard + rotationOffset;

      const targetAngle = -Math.PI + Math.PI / 4;
      const finalAngle = cardAngle + targetAngle;

      const x = Math.cos(finalAngle) * radius;
      const y = Math.sin(finalAngle) * radius;

      const isCurrent = index === currentIndex;
      const scale = isCurrent ? 1 : 0.8;
      const opacity = isCurrent ? 1 : 0.4;
      // const brightness = isCurrent ? 1 : 0.6;
      const zIndex = isCurrent ? 10 : 5;

      gsap.to(card, {
        x,
        y,
        scale,
        opacity,
        // filter: `brightness(${brightness})`,
        zIndex,
        duration: 0.7,
        ease: "power2.inOut",
      });
    });

    const backgrounds = backgroundRef.current.children;

    // gsap.to(backgrounds, {
    //     x: cardsContainerRef.current.children[currentIndex].getBoundingClientRect().x,
    //     y: cardsContainerRef.current.children[currentIndex].getBoundingClientRect().y,
    //     opacity: 0,
    //     scale: 0.1,
    //     width: '96px',
    //     height: '112px',
    //     duration: 0.3,
    //     ease: "power2.in"
    // });

    // Simpler Animation with just opacity
    gsap.to(backgrounds, {
      opacity: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.in",
    });

    // timeline.to(backgrounds[currentIndex], {
    //     x: cardsContainerRef.current.children[currentIndex].getBoundingClientRect().x,
    //     y: cardsContainerRef.current.children[currentIndex].getBoundingClientRect().y,
    //     // x: 1313,
    //     // y: 200,
    //     opacity: 0,
    //     scale: 0.1,
    //     width: '96px',
    //     height: '112px',
    //     duration: 0.4,
    //     ease: "power2.out"
    // });

    // This is for adding a transition moving in the center of the screen
    // timeline.to(backgrounds[currentIndex], {
    //     x: `${window.innerWidth/2}`,
    //     y: `${window.innerHeight/2}`,
    //     opacity: 1,
    //     scale: 1,
    //     // width: '96px',
    //     // height: '112px',
    //     duration: 0.4,
    //     ease: "power2.out"
    // });

    // timeline.to(backgrounds[currentIndex], {
    //     x: 0,
    //     y: 0,
    //     scale: 1,
    //     opacity: 1,
    //     duration: 0.4,
    //     width: '100%',
    //     height: '100%',
    //     ease: "power2.out",
    //     onComplete: () => setIsAnimating(false)
    // });

    // For Simpler Animation
    gsap.fromTo(
      backgrounds[currentIndex],
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration: 0.8,
        ease: "power2.out",
        delay: 0.2,
        onComplete: () => setIsAnimating(false),
      },
    );
  }, [currentIndex, images.length]);

  return (
    <>
      {auth && (
        // <button
        //   onClick={() => openEditor("landing-hero", images)}
        //   className="absolute top-20 right-20 z-10 bg-accent py-2 px-4"
        // >
        //   Edit
        // </button>
        <button
          onClick={() => openEditor("landing-hero", images)}
          className="absolute top-20 right-10 z-10 bg-accent text-white py-2 px-2 md:py-2 md:px-4 mb-2 flex items-center justify-center gap-2 text-sm md:text-base font-medium rounded-full border-2 border-accent hover:bg-transparent hover:text-accent transition-all duration-300 cursor-pointer"
          aria-label={`Edit Landing Hero Slides`}
        >
          <HiOutlinePencilAlt size={20} />
          Edit
        </button>
      )}
      <div
        ref={containerRef}
        className="snap-section relative w-full h-screen overflow-hidden -mt-16"
      >
        {/* Full-screen background images */}
        <div ref={backgroundRef} className="absolute inset-0">
          {images.map((img, index) => (
            <div
              key={index}
              className="absolute inset-0 opacity-0 -top-40 md:top-0"
              style={{ zIndex: index === currentIndex ? 1 : 0 }}
            >
              <Image
                src={img.image}
                alt={`Background ${index + 1}`}
                fill
                className="object-contain md:object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/40" />
            </div>
          ))}
        </div>

        {/* Place names */}
        {/* <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10">
        <div ref={textContainerRef} className="relative">
          {places.map((place, index) => (
            <h2
              key={index}
              className="absolute top-0 left-0 text-6xl md:text-8xl font-bold text-white opacity-0 font-bebasNeue text-shadow-[2px_2px_8px_rgba(0,0,0,0.5)]">
              {place}
            </h2>
          ))}
        </div>
      </div> */}
        {/* <div className="absolute left-12 top-1/2 -translate-y-1/2 z-10"> */}
        <div className="absolute left-12 bottom-36 z-10">
          <div
            className="flex flex-col items-start h-16 md:h-40 overflow-hidden"
            ref={textContainerRef}
          >
            {images.map((image, index) => (
              <h2
                key={index}
                className=" text-6xl md:text-[10rem] font-bold text-white font-bebasNeue text-shadow-[2px_2px_8px_rgba(0,0,0,0.5)]"
                aria-label="Place Name"
              >
                {image.place}
              </h2>
            ))}
          </div>
        </div>

        <div className="absolute bottom-0 right-0 z-10 pb-24 overflow-visible">
          {/* Polaroid preview container */}
          <div className="relative w-64 h-64">
            <div ref={cardsContainerRef} className="absolute bottom-0 right-0">
              {images.map((img, index) => (
                <div
                  key={img.image}
                  onClick={() => goToSlide(index)}
                  className="absolute bottom-0 right-0 cursor-pointer"
                  style={{ transformOrigin: "bottom right" }}
                >
                  {/* Polaroid-style snapshot */}
                  <div className="bg-white p-2 shadow-2xl rotate-3 hover:rotate-0 transition-transform">
                    <div className="relative w-24 h-28 bg-gray-100">
                      <Image
                        src={img.image}
                        alt={`Snapshot ${index + 1}`}
                        fill
                        sizes="10vw"
                        className="object-cover"
                        aria-label={`Snapshot of ${img.place}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation controls */}
          <div className="absolute bottom-28 right-4 flex flex-col gap-2 items-center">
            <div className="flex gap-8">
              <button
                onClick={prevSlide}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50 cursor-pointer"
                aria-label="Previous"
              >
                <FaChevronLeft className="w-4 h-4 text-white" />
              </button>

              <button
                onClick={nextSlide}
                disabled={isAnimating}
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/30 transition-all disabled:opacity-50 cursor-pointer"
                aria-label="Next"
              >
                <FaChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Dots */}
            <div className="flex gap-1.5">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    index === currentIndex
                      ? "bg-white w-6"
                      : "bg-white/50 hover:bg-white/75 w-1.5"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

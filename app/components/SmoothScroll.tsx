"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ReactLenis = dynamic(
  () => import("lenis/react").then((mod) => mod.ReactLenis),
  { ssr: false },
);

export default function SmoothScroll() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const enable = () => {
      if (window.innerWidth >= 1024) {
        setEnabled(true);
      }
    };

    const timeoutId = window.setTimeout(enable, 2500);

    return () => window.clearTimeout(timeoutId);
  }, []);

  if (!enabled) return null;

  return (
    <ReactLenis
      root
      options={{
        lerp: 0.12,
        smoothWheel: true,
        syncTouch: false,
      }}
    />
  );
}
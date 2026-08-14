"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

/**
 * Locks global smooth scrolling while modals/editors are open,
 * but preserves native wheel/touch scrolling inside modal content.
 */
export function useScrollLock(lock: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    if (lock) {
      lenis?.stop();

      body.style.overflow = "hidden";
      html.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      lenis?.start();

      body.style.overflow = "";
      html.style.overflow = "";
      body.style.touchAction = "";
    }

    return () => {
      lenis?.start();
      body.style.overflow = "";
      html.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [lock, lenis]);
}
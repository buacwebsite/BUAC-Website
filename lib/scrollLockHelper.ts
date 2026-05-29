"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

export function useScrollLock(lock: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;
    if (lock) {
      lenis.stop();
    } else {
      lenis.start();
    }
    return () => lenis.start();
  }, [lock, lenis]);
}

"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-9 w-[74px] rounded-full" />;
  }

  const current = theme === "system" ? resolvedTheme : theme;
  const isDark = current === "dark";

  const toggle = () => setTheme(isDark ? "light" : "dark");

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to day mode" : "Switch to night mode"}
      title={isDark ? "Switch to day mode" : "Switch to night mode"}
      className="relative h-9 w-[74px] cursor-pointer overflow-hidden rounded-full shadow-lg ring-1 ring-black/10 transition-colors duration-500"
      style={{
        background: isDark
          ? "linear-gradient(160deg, #1b2b52 0%, #0c1734 55%, #0a1226 100%)"
          : "linear-gradient(160deg, #67c1f5 0%, #3a9fe8 60%, #2b8fdd 100%)",
      }}
    >
      {/* ===== NIGHT SKY: stars ===== */}
      <AnimatePresence>
        {isDark && (
          <motion.div
            key="stars"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0"
          >
            {[
              { top: "22%", left: "48%", size: 2, delay: 0 },
              { top: "58%", left: "56%", size: 1.5, delay: 0.4 },
              { top: "35%", left: "68%", size: 2.5, delay: 0.8 },
              { top: "70%", left: "72%", size: 1.5, delay: 0.2 },
              { top: "20%", left: "80%", size: 2, delay: 0.6 },
              { top: "50%", left: "86%", size: 1.5, delay: 1 },
              { top: "72%", left: "60%", size: 1, delay: 0.5 },
              { top: "30%", left: "90%", size: 1.5, delay: 0.3 },
            ].map((star, i) => (
              <motion.span
                key={i}
                className="absolute rounded-full bg-white"
                style={{
                  top: star.top,
                  left: star.left,
                  width: star.size,
                  height: star.size,
                }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: star.delay,
                  ease: "easeInOut",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== DAY SKY: clouds ===== */}
      <AnimatePresence>
        {!isDark && (
          <motion.div
            key="clouds"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none absolute inset-0"
          >
            <motion.div
              className="absolute"
              style={{ bottom: "14%", left: "20%" }}
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cloud scale={1} />
            </motion.div>

            <motion.div
              className="absolute"
              style={{ top: "18%", left: "8%" }}
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <Cloud scale={0.7} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== KNOB: sun / moon ===== */}
      <motion.div
        className="absolute top-1/2 z-10 flex h-7 w-7 items-center justify-center rounded-full"
        style={{ marginTop: -14 }}
        animate={{ left: isDark ? 4 : 74 - 28 - 4 }}
        transition={{ type: "spring", stiffness: 380, damping: 28 }}
      >
        <AnimatePresence mode="wait">
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ scale: 0, rotate: -90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: 90, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative h-7 w-7 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 30%, #f4f7ff 0%, #cfd8ec 55%, #aeb9d6 100%)",
                boxShadow:
                  "0 0 8px 2px rgba(200,220,255,0.6), inset -2px -2px 4px rgba(120,140,180,0.5)",
              }}
            >
              {/* moon craters */}
              <span
                className="absolute rounded-full"
                style={{
                  top: "22%",
                  left: "26%",
                  width: 5,
                  height: 5,
                  background: "rgba(150,165,200,0.55)",
                }}
              />
              <span
                className="absolute rounded-full"
                style={{
                  top: "55%",
                  left: "50%",
                  width: 6,
                  height: 6,
                  background: "rgba(150,165,200,0.5)",
                }}
              />
              <span
                className="absolute rounded-full"
                style={{
                  top: "40%",
                  left: "62%",
                  width: 3,
                  height: 3,
                  background: "rgba(150,165,200,0.45)",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ scale: 0, rotate: 90, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0, rotate: -90, opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="h-7 w-7 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 40% 35%, #fff27a 0%, #ffe22e 45%, #ffd200 100%)",
                boxShadow:
                  "0 0 10px 3px rgba(255,220,60,0.75), 0 0 18px 6px rgba(255,210,0,0.35)",
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
}

function Cloud({ scale = 1 }: { scale?: number }) {
  return (
    <div
      style={{ transform: `scale(${scale})` }}
      className="relative"
    >
      <div className="flex items-end gap-[1px]">
        <span className="h-1.5 w-2 rounded-full bg-white/90" />
        <span className="h-2.5 w-3 rounded-full bg-white" />
        <span className="h-1.5 w-2 rounded-full bg-white/90" />
      </div>
      <div className="-mt-[3px] h-1.5 w-6 rounded-full bg-white" />
    </div>
  );
}
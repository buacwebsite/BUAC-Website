"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BUACLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  fullScreen?: boolean;
  label?: string;
}

const sizes = {
  sm: {
    frame: "h-16 w-16",
    box: "h-2.5 w-2.5",
    logo: 22,
  },
  md: {
    frame: "h-24 w-24",
    box: "h-3.5 w-3.5",
    logo: 32,
  },
  lg: {
    frame: "h-32 w-32",
    box: "h-4 w-4",
    logo: 44,
  },
} as const;

export default function BUACLoader({
  size = "md",
  className,
  fullScreen = false,
  label,
}: BUACLoaderProps) {
  const currentSize = sizes[size];

  const loader = (
    <div
      className={cn(
        "relative flex items-center justify-center",
        currentSize.frame,
        className,
      )}
      role="status"
      aria-label={label || "Loading"}
    >
      {[0, 1, 2, 3].map((index) => (
        <span
          key={index}
          className={cn(
            "absolute rounded-sm bg-accent shadow-lg shadow-accent/30",
            currentSize.box,
          )}
          style={{
            animation: `buac-loader-${index} 1.8s infinite ease-in-out`,
            animationDelay: `${index * 0.12}s`,
          }}
        />
      ))}

      <span className="relative z-10 flex items-center justify-center rounded-full bg-surface p-1.5 shadow-xl">
        <Image
          src="/assets/logos/buac.webp"
          alt=""
          width={currentSize.logo}
          height={currentSize.logo}
          className="object-contain"
          priority
        />
      </span>
    </div>
  );

  if (!fullScreen) {
    return loader;
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background px-6">
      {loader}

      {label && (
        <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-text-muted">
          {label}
        </p>
      )}
    </div>
  );
}
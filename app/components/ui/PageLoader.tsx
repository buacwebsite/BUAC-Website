"use client";

import BUACLoader from "./BUACLoader";

interface PageLoaderProps {
  label?: string;
}

export default function PageLoader({ label = "Loading" }: PageLoaderProps) {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-background px-6">
      <BUACLoader size="lg" />
      <p className="text-center text-xs font-semibold uppercase tracking-[0.3em] text-text-muted animate-pulse">
        {label}
      </p>
    </div>
  );
}
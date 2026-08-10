"use client";

import BUACLoader, {
  type BUACLoaderProps,
} from "./BUACLoader";

interface UniqueLoadingProps {
  variant?: "morph";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function UniqueLoading({
  size = "md",
  className,
}: UniqueLoadingProps) {
  return <BUACLoader size={size} className={className} />;
}
"use client";

import { cn } from "@/lib/utils";

interface UniqueLoadingProps {
  variant?: "morph";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const MORPH_STYLES = `
@keyframes morph-0 {
  0%, 100% { transform: translate(-12px, -12px) rotate(0deg); border-radius: 0%; background-color: var(--color-accent); }
  25% { transform: translate(12px, -12px) rotate(90deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  50% { transform: translate(12px, 12px) rotate(180deg); border-radius: 0%; background-color: var(--color-accent); }
  75% { transform: translate(-12px, 12px) rotate(270deg); border-radius: 50%; background-color: var(--color-text-secondary); }
}
@keyframes morph-1 {
  0%, 100% { transform: translate(12px, -12px) rotate(0deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  25% { transform: translate(12px, 12px) rotate(90deg); border-radius: 0%; background-color: var(--color-accent); }
  50% { transform: translate(-12px, 12px) rotate(180deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  75% { transform: translate(-12px, -12px) rotate(270deg); border-radius: 0%; background-color: var(--color-accent); }
}
@keyframes morph-2 {
  0%, 100% { transform: translate(12px, 12px) rotate(0deg); border-radius: 0%; background-color: var(--color-accent); }
  25% { transform: translate(-12px, 12px) rotate(90deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  50% { transform: translate(-12px, -12px) rotate(180deg); border-radius: 0%; background-color: var(--color-accent); }
  75% { transform: translate(12px, -12px) rotate(270deg); border-radius: 50%; background-color: var(--color-text-secondary); }
}
@keyframes morph-3 {
  0%, 100% { transform: translate(-12px, 12px) rotate(0deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  25% { transform: translate(-12px, -12px) rotate(90deg); border-radius: 0%; background-color: var(--color-accent); }
  50% { transform: translate(12px, -12px) rotate(180deg); border-radius: 50%; background-color: var(--color-text-secondary); }
  75% { transform: translate(12px, 12px) rotate(270deg); border-radius: 0%; background-color: var(--color-accent); }
}
`;

export default function UniqueLoading({
  variant = "morph",
  size = "md",
  className,
}: UniqueLoadingProps) {
  const containerSizes = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  if (variant === "morph") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: MORPH_STYLES }} />
        <div className={cn("relative", containerSizes[size], className)}>
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="absolute w-4 h-4 bg-accent"
                style={{
                  animation: `morph-${i} 2s infinite ease-in-out`,
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return null;
}
import { cn } from "@/lib/utils";

interface ClassicLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ClassicLoader({
  size = "md",
  className,
}: ClassicLoaderProps) {
  const sizes = {
    sm: "h-6 w-6 border-2",
    md: "h-10 w-10 border-4",
    lg: "h-16 w-16 border-[6px]",
  };

  return (
    <div
      className={cn(
        "border-accent flex animate-spin items-center justify-center rounded-full border-t-transparent",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
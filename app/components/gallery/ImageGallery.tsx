"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  columns?: 2 | 3 | 4;
}

export function ImageGallery({ images, columns = 3 }: ImageGalleryProps) {
  const columnData = React.useMemo(() => {
    const result: string[][] = Array.from({ length: columns }, () => []);

    images.forEach((image, index) => {
      result[index % columns].push(image);
    });

    return result;
  }, [images, columns]);

  if (!images.length) {
    return null;
  }

  const gridColsClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className="relative w-full">
      <div className={cn("mx-auto grid w-full max-w-6xl gap-6", gridColsClass)}>
        {columnData.map((column, colIndex) => (
          <div key={colIndex} className="flex flex-col gap-6">
            {column.map((imageSrc, index) => (
              <AnimatedImage
                key={`${colIndex}-${index}-${imageSrc}`}
                alt={`Gallery image ${colIndex}-${index}`}
                src={imageSrc}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

interface AnimatedImageProps {
  alt: string;
  src: string;
  className?: string;
}

function AnimatedImage({ alt, src, className }: AnimatedImageProps) {
  const [aspectRatio, setAspectRatio] = React.useState<number | null>(null);
  const [loaded, setLoaded] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);

  if (!src) {
    return null;
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalWidth && naturalHeight) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
    setLoaded(true);
  };

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-surface-secondary transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10",
        className,
      )}
      style={{
        aspectRatio: aspectRatio ? `${aspectRatio}` : "16 / 9", // smooth placeholder ratio before load
      }}
    >
      {!hasError ? (
        <img
          alt={alt}
          src={src}
          className={cn(
            "h-full w-full rounded-2xl object-cover transition-all duration-700 ease-out",
            loaded ? "scale-100 opacity-100" : "scale-105 opacity-0",
          )}
          onLoad={handleImageLoad}
          onError={() => setHasError(true)}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/20 to-accent/5 p-8 text-center">
          <span className="font-bebasNeue text-2xl text-text-secondary/40">
            BUAC
          </span>
        </div>
      )}

      {!loaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-surface-secondary" />
      )}
    </div>
  );
}
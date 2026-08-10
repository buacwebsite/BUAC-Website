"use client";

import { useMotionValue } from "framer-motion";
import * as React from "react";
import { useEffect, useMemo, useRef } from "react";

const useIsStaticRenderer = () => false;

export type GalleryCanvasImage = {
  src: string;
  srcSet?: string;
  alt?: string;
};

export interface InfiniteGalleryProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  images: GalleryCanvasImage[];
  density: number;
  imageWidth: number;
  imageHeight: number;
  rounded: number;
  dragSpeed: number;
  driftAmount: number;
  friction: number;
  backgroundColor: string;
  style?: React.CSSProperties;
}

const DEFAULT_IMAGES: GalleryCanvasImage[] = [
  {
    src: "/assets/footerbg.webp",
    alt: "BUAC adventure",
  },
];

function hash3(cx: number, cy: number, cz: number, salt: number) {
  let h = (cx | 0) * 0x8da6b343;
  h ^= Math.imul(cy | 0, 0xd8163841);
  h ^= Math.imul(cz | 0, 0xcb1ab31f);
  h ^= salt | 0;
  h ^= h >>> 16;
  h = Math.imul(h, 0x7feb352d);
  h ^= h >>> 15;
  h = Math.imul(h, 0x846ca68b);
  h ^= h >>> 16;
  return h >>> 0;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Tile = {
  wx: number;
  wy: number;
  cx: number;
  cy: number;
  slot: number;
  octave: number;
  imgIdx: number;
  w: number;
  h: number;
  rot: number;
  bakedScale: number;
};

const PX_PER_UNIT = 6;
const CELL_SIZE = 110;
const MAX_RANGE = 20;

const COMPONENT_DEFAULTS = {
  width: "100%",
  height: "100%",
  className: "",
  images: DEFAULT_IMAGES,
  density: 5,
  imageWidth: 150,
  imageHeight: 150,
  rounded: 3,
  dragSpeed: 20,
  driftAmount: 20,
  friction: 10,
  backgroundColor: "var(--theme-background)",
} satisfies Omit<InfiniteGalleryProps, "style">;

/**
 * Preloads each unique image source exactly once per page load.
 * The InfiniteGallery reuses the same image URLs across many DOM tiles;
 * without this the browser can trigger repeat requests until it caches them.
 */
const preloadedSources = new Set<string>();

function preloadImageOnce(src: string) {
  if (typeof window === "undefined") return;
  if (!src || preloadedSources.has(src)) return;

  preloadedSources.add(src);

  const img = new window.Image();
  img.decoding = "async";
  img.loading = "eager";
  img.src = src;
}

export default function InfiniteGallery(inputProps: InfiniteGalleryProps) {
  const props = { ...COMPONENT_DEFAULTS, ...inputProps };

  const {
    width,
    height,
    className,
    images,
    density,
    imageWidth,
    imageHeight,
    rounded,
    dragSpeed,
    driftAmount,
    friction,
    backgroundColor,
    style,
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const isStatic = useIsStaticRenderer();

  const safeImages = useMemo(() => {
    if (Array.isArray(images) && images.length > 0) {
      return images.filter((image) => image?.src);
    }
    return DEFAULT_IMAGES;
  }, [images]);

  // Preload every unique source once (avoids duplicate downloads for repeated tiles)
  useEffect(() => {
    safeImages.forEach((image) => {
      if (image.src) preloadImageOnce(image.src);
    });
  }, [safeImages]);

  const safeDensity = Math.max(1, Math.min(15, Math.floor(density || 5)));
  const safeImageWidth = Math.max(8, Math.min(4000, imageWidth || 150));
  const safeImageHeight = Math.max(8, Math.min(4000, imageHeight || 150));
  const safeRounded = Math.max(0, Math.min(20, rounded ?? 3));
  const safeDragSpeed = Math.max(0.1, Math.min(5, (dragSpeed || 20) / 20));
  const safeDriftAmount = Math.max(0, Math.min(20, driftAmount ?? 8));
  const safeFriction =
    1 - (Math.max(1, Math.min(20, friction ?? 10)) / 20) * 0.3;

  const targetX = useMotionValue(0);
  const targetY = useMotionValue(0);
  const camX = useMotionValue(0);
  const camY = useMotionValue(0);
  const velX = useMotionValue(0);
  const velY = useMotionValue(0);

  const targetLogZoom = useMotionValue(0);
  const logZoom = useMotionValue(0);
  const velLogZoom = useMotionValue(0);

  const driftTX = useMotionValue(0);
  const driftTY = useMotionValue(0);
  const driftX = useMotionValue(0);
  const driftY = useMotionValue(0);

  const subN = Math.max(1, Math.ceil(Math.sqrt(safeDensity)));
  const subSize = CELL_SIZE / subN;
  const subcellInnerPad = 0.1;
  const effectivePerCell = Math.min(safeDensity, subN * subN);

  const imagesCount = safeImages.length;

  const scaleMin = 0.45;
  const scaleMax = 1.6;

  const generateCell = useMemo(() => {
    return (gx: number, gy: number, octave: number): Tile[] => {
      const seed = hash3(gx, gy, octave | 0, 0x9e3779b1);
      const rand = mulberry32(seed);

      const totalSubs = subN * subN;
      const subs = new Array<number>(totalSubs);
      for (let i = 0; i < totalSubs; i += 1) subs[i] = i;

      for (let i = totalSubs - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        const temp = subs[i];
        subs[i] = subs[j];
        subs[j] = temp;
      }

      const tiles: Tile[] = [];
      const count = Math.min(effectivePerCell, totalSubs);

      const pad = subSize * subcellInnerPad;
      const innerRange = Math.max(0, subSize - pad * 2);

      const cellX0 = gx * CELL_SIZE;
      const cellY0 = gy * CELL_SIZE;

      const widthWorld = safeImageWidth / PX_PER_UNIT;
      const heightWorld = safeImageHeight / PX_PER_UNIT;

      for (let slot = 0; slot < count; slot += 1) {
        const subIndex = subs[slot];
        const sx = subIndex % subN;
        const sy = Math.floor(subIndex / subN);

        const wx = cellX0 + sx * subSize + pad + rand() * innerRange;
        const wy = cellY0 + sy * subSize + pad + rand() * innerRange;

        const bakedScale = scaleMin + rand() * (scaleMax - scaleMin);

        const imgIdx =
          imagesCount > 0
            ? Math.floor(rand() * imagesCount) % imagesCount
            : 0;

        tiles.push({
          wx,
          wy,
          cx: gx,
          cy: gy,
          slot,
          octave,
          imgIdx,
          w: widthWorld,
          h: heightWorld,
          rot: 0,
          bakedScale,
        });
      }

      return tiles;
    };
  }, [
    effectivePerCell,
    imagesCount,
    safeImageHeight,
    safeImageWidth,
    subN,
    subSize,
  ]);

  useEffect(() => {
    const scene = sceneRef.current;
    const container = containerRef.current;
    if (!scene) return;

    let containerWidth = container?.clientWidth || 900;
    let containerHeight = container?.clientHeight || 600;

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            if (!container) return;
            containerWidth = container.clientWidth || containerWidth;
            containerHeight = container.clientHeight || containerHeight;
          })
        : null;

    if (container && resizeObserver) {
      resizeObserver.observe(container);
    }

    const cellCache = new Map<string, Tile[]>();

    const getCachedCell = (gx: number, gy: number, octave: number) => {
      const key = `${gx}:${gy}:${octave}`;
      const existing = cellCache.get(key);
      if (existing) return existing;

      const generated = generateCell(gx, gy, octave);
      cellCache.set(key, generated);
      return generated;
    };

    const layerPools = new Map<
      number,
      {
        tileEls: Map<string, HTMLDivElement>;
        imgEls: Map<string, HTMLImageElement>;
      }
    >();

    const getPool = (octave: number) => {
      let pool = layerPools.get(octave);
      if (!pool) {
        pool = { tileEls: new Map(), imgEls: new Map() };
        layerPools.set(octave, pool);
      }
      return pool;
    };

    const disposeLayer = (octave: number) => {
      const pool = layerPools.get(octave);
      if (!pool) return;

      pool.tileEls.forEach((element) => {
        if (element.parentNode === scene) {
          scene.removeChild(element);
        }
      });

      pool.tileEls.clear();
      pool.imgEls.clear();
      layerPools.delete(octave);
    };

    const disposeAllLayers = () => {
      Array.from(layerPools.keys()).forEach(disposeLayer);
      cellCache.clear();
    };

    const removeTile = (octave: number, key: string) => {
      const pool = layerPools.get(octave);
      if (!pool) return;

      const element = pool.tileEls.get(key);
      if (element && element.parentNode === scene) {
        scene.removeChild(element);
      }

      pool.tileEls.delete(key);
      pool.imgEls.delete(key);
    };

    const ensureTile = (tile: Tile) => {
      const pool = getPool(tile.octave);
      const key = `${tile.cx},${tile.cy},${tile.slot}`;

      let element = pool.tileEls.get(key);
      if (element) return element;

      element = document.createElement("div");
      element.style.position = "absolute";
      element.style.left = "50%";
      element.style.top = "50%";
      element.style.transformOrigin = "0 0";
      element.style.willChange = "transform, opacity";
      element.style.pointerEvents = "none";
      element.dataset.tileKey = key;

      const imageElement = document.createElement("img");
      const source = safeImages[tile.imgIdx];

      imageElement.src = source?.src || "";
      if (source?.srcSet) imageElement.srcset = source.srcSet;
      imageElement.alt = source?.alt || "";
      imageElement.draggable = false;
      imageElement.loading = "lazy";
      imageElement.decoding = "async";
      imageElement.style.width = "100%";
      imageElement.style.height = "100%";
      imageElement.style.objectFit = "cover";
      imageElement.style.display = "block";
      imageElement.style.pointerEvents = "none";
      imageElement.style.userSelect = "none";

      element.appendChild(imageElement);
      scene.appendChild(element);

      pool.tileEls.set(key, element);
      pool.imgEls.set(key, imageElement);

      return element;
    };

    const projectLayer = (
      octave: number,
      layerScale: number,
      layerAlpha: number,
      layerZBase: number,
      centerX: number,
      centerY: number,
    ) => {
      const pool = getPool(octave);

      const cameraCellX = Math.floor(centerX / CELL_SIZE);
      const cameraCellY = Math.floor(centerY / CELL_SIZE);

      const worldHalfX = containerWidth / 2 / (PX_PER_UNIT * layerScale);
      const worldHalfY = containerHeight / 2 / (PX_PER_UNIT * layerScale);

      const rangeX = Math.min(MAX_RANGE, Math.ceil(worldHalfX / CELL_SIZE) + 1);
      const rangeY = Math.min(MAX_RANGE, Math.ceil(worldHalfY / CELL_SIZE) + 1);

      const visibleKeys = new Set<string>();
      const tilesThisFrame: Tile[] = [];

      for (let dy = -rangeY; dy <= rangeY; dy += 1) {
        for (let dx = -rangeX; dx <= rangeX; dx += 1) {
          const cellTiles = getCachedCell(
            cameraCellX + dx,
            cameraCellY + dy,
            octave,
          );

          for (let index = 0; index < cellTiles.length; index += 1) {
            tilesThisFrame.push(cellTiles[index]);
          }
        }
      }

      const orderKeys: string[] = new Array(tilesThisFrame.length);
      const orderScales: number[] = new Array(tilesThisFrame.length);

      for (let index = 0; index < tilesThisFrame.length; index += 1) {
        const tile = tilesThisFrame[index];
        const key = `${tile.cx},${tile.cy},${tile.slot}`;

        visibleKeys.add(key);

        const x = (tile.wx - centerX) * layerScale * PX_PER_UNIT;
        const y = (tile.wy - centerY) * layerScale * PX_PER_UNIT;
        const scale = tile.bakedScale * layerScale;

        const element = ensureTile(tile);
        const imageElement = pool.imgEls.get(key);

        const widthPixels = tile.w * PX_PER_UNIT;
        const heightPixels = tile.h * PX_PER_UNIT;

        element.style.transform = `
          translate3d(${x}px, ${y}px, 0)
          scale(${scale})
          rotate(${tile.rot}deg)
          translate(${-widthPixels / 2}px, ${-heightPixels / 2}px)
        `;

        element.style.width = `${widthPixels}px`;
        element.style.height = `${heightPixels}px`;
        element.style.opacity = String(layerAlpha);

        if (imageElement) {
          const radius =
            (safeRounded / 20) * (Math.min(widthPixels, heightPixels) / 2);

          imageElement.style.borderRadius = `${radius}px`;
        }

        orderKeys[index] = key;
        orderScales[index] = tile.bakedScale;
      }

      for (const key of Array.from(pool.tileEls.keys())) {
        if (!visibleKeys.has(key)) {
          removeTile(octave, key);
        }
      }

      const indexes = orderKeys.map((_, index) => index);
      indexes.sort(
        (first, second) => orderScales[first] - orderScales[second],
      );

      for (let index = 0; index < indexes.length; index += 1) {
        const element = pool.tileEls.get(orderKeys[indexes[index]]);
        if (element) {
          element.style.zIndex = String(layerZBase + index);
        }
      }
    };

    let lastOctaves = new Set<number>();

    const project = () => {
      const centerX = camX.get();
      const centerY = camY.get();
      const currentLogZoom = logZoom.get();

      const octave = Math.floor(currentLogZoom);
      const fraction = currentLogZoom - octave;

      const currentScale = Math.pow(2, fraction);
      const nextScale = Math.pow(2, fraction - 1);

      const currentAlpha = 1 - fraction;
      const nextAlpha = fraction;

      projectLayer(octave, currentScale, currentAlpha, 0, centerX, centerY);
      projectLayer(octave + 1, nextScale, nextAlpha, 100000, centerX, centerY);

      const activeOctaves = new Set<number>([octave, octave + 1]);

      for (const oldOctave of Array.from(lastOctaves)) {
        if (!activeOctaves.has(oldOctave)) {
          disposeLayer(oldOctave);
        }
      }

      for (const activeOctave of Array.from(layerPools.keys())) {
        if (!activeOctaves.has(activeOctave)) {
          disposeLayer(activeOctave);
        }
      }

      lastOctaves = activeOctaves;
    };

    project();

    if (isStatic) {
      resizeObserver?.disconnect();
      return () => {
        disposeAllLayers();
      };
    }

    let animationFrame = 0;

    const animationLoop = () => {
      const nextTargetX = targetX.get() + velX.get();
      const nextTargetY = targetY.get() + velY.get();

      targetX.set(nextTargetX);
      targetY.set(nextTargetY);

      velX.set(velX.get() * safeFriction);
      velY.set(velY.get() * safeFriction);

      const zoomVelocity = velLogZoom.get();
      if (zoomVelocity !== 0) {
        targetLogZoom.set(targetLogZoom.get() + zoomVelocity);
        velLogZoom.set(zoomVelocity * safeFriction);
      }

      driftX.set(
        lerp(driftX.get(), driftTX.get() * safeDriftAmount, 0.08),
      );
      driftY.set(
        lerp(driftY.get(), driftTY.get() * safeDriftAmount, 0.08),
      );

      camX.set(lerp(camX.get(), targetX.get() + driftX.get(), 0.18));
      camY.set(lerp(camY.get(), targetY.get() + driftY.get(), 0.18));
      logZoom.set(lerp(logZoom.get(), targetLogZoom.get(), 0.18));

      project();

      animationFrame = window.requestAnimationFrame(animationLoop);
    };

    animationFrame = window.requestAnimationFrame(animationLoop);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver?.disconnect();
      disposeAllLayers();
    };
  }, [
    camX,
    camY,
    driftTX,
    driftTY,
    generateCell,
    isStatic,
    logZoom,
    safeDriftAmount,
    safeFriction,
    safeImages,
    safeRounded,
    targetLogZoom,
    targetX,
    targetY,
    velLogZoom,
    velX,
    velY,
    driftX,
    driftY,
  ]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || isStatic) return;

    let dragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let lastTime = 0;
    let pointerId: number | null = null;

    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;

      dragging = true;
      pointerId = event.pointerId;
      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastTime = event.timeStamp;

      try {
        element.setPointerCapture(event.pointerId);
      } catch {
        // ignore
      }

      element.style.cursor = "grabbing";
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();

      const normalizedX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const normalizedY = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      driftTX.set(Math.max(-1, Math.min(1, normalizedX)));
      driftTY.set(Math.max(-1, Math.min(1, normalizedY)));

      if (!dragging || event.pointerId !== pointerId) return;

      const deltaX = event.clientX - lastPointerX;
      const deltaY = event.clientY - lastPointerY;

      const currentLogZoom = logZoom.get();
      const fraction = currentLogZoom - Math.floor(currentLogZoom);

      const effectiveScale =
        (1 - fraction) * Math.pow(2, fraction) +
        fraction * Math.pow(2, fraction - 1);

      const worldDeltaX =
        (-deltaX / (PX_PER_UNIT * effectiveScale)) * safeDragSpeed;

      const worldDeltaY =
        (-deltaY / (PX_PER_UNIT * effectiveScale)) * safeDragSpeed;

      targetX.set(targetX.get() + worldDeltaX);
      targetY.set(targetY.get() + worldDeltaY);

      const elapsed = Math.max(1, event.timeStamp - lastTime);
      const velocityMultiplier = 16 / elapsed;

      velX.set(worldDeltaX * velocityMultiplier);
      velY.set(worldDeltaY * velocityMultiplier);

      lastPointerX = event.clientX;
      lastPointerY = event.clientY;
      lastTime = event.timeStamp;
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!dragging || event.pointerId !== pointerId) return;

      dragging = false;
      pointerId = null;

      try {
        element.releasePointerCapture(event.pointerId);
      } catch {
        // ignore
      }

      element.style.cursor = "grab";
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 16;
      else if (event.deltaMode === 2) delta *= 400;

      const zoomStep = -delta * 0.0015 * safeDragSpeed;
      velLogZoom.set(velLogZoom.get() + zoomStep);
    };

    const handlePointerLeave = () => {
      driftTX.set(0);
      driftTY.set(0);
    };

    element.addEventListener("pointerdown", handlePointerDown);
    element.addEventListener("pointermove", handlePointerMove);
    element.addEventListener("pointerup", handlePointerUp);
    element.addEventListener("pointercancel", handlePointerUp);
    element.addEventListener("wheel", handleWheel, { passive: false });
    element.addEventListener("pointerleave", handlePointerLeave);

    element.style.cursor = "grab";

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown);
      element.removeEventListener("pointermove", handlePointerMove);
      element.removeEventListener("pointerup", handlePointerUp);
      element.removeEventListener("pointercancel", handlePointerUp);
      element.removeEventListener("wheel", handleWheel);
      element.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [
    driftTX,
    driftTY,
    isStatic,
    logZoom,
    safeDragSpeed,
    targetX,
    targetY,
    velLogZoom,
    velX,
    velY,
  ]);

  const resolveDimension = (
    value: string | number | undefined,
    fallback: string,
  ) => {
    if (value == null) return fallback;
    if (typeof value === "number") return `${value}px`;
    return value;
  };

  const wrapperStyle: React.CSSProperties = {
    position: "relative",
    width: resolveDimension(width, "100%"),
    height: resolveDimension(height, "100%"),
    minWidth: 0,
    minHeight: 0,
    overflow: "hidden",
    backgroundColor,
    touchAction: "none",
    userSelect: "none",
    cursor: "grab",
    ...style,
  };

  const sceneStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
  };

  return (
    <div
      ref={containerRef}
      className={className}
      style={wrapperStyle}
      aria-label="Interactive infinite image gallery"
    >
      <div ref={sceneRef} style={sceneStyle} />
    </div>
  );
}
import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type GalleryItemType = "image" | "video";

interface GalleryItem {
  id: number;
  type: GalleryItemType;
  url: string;
  youtubeUrl: string;
}

const defaultContent: GalleryItem[] = [
  {
    id: 1,
    type: "image",
    url: "",
    youtubeUrl: "",
  },
  {
    id: 2,
    type: "image",
    url: "",
    youtubeUrl: "",
  },
  {
    id: 3,
    type: "video",
    url: "",
    youtubeUrl: "",
  },
];

function normalizeGalleryItem(
  input: unknown,
  index: number,
): GalleryItem {
  const item =
    input && typeof input === "object"
      ? (input as Partial<
          GalleryItem & {
            youtube?: string;
            videoUrl?: string;
          }
        >)
      : {};

  const rawUrl =
    typeof item.url === "string"
      ? item.url.trim()
      : "";

  const rawYouTubeUrl =
    typeof item.youtubeUrl === "string"
      ? item.youtubeUrl.trim()
      : typeof item.videoUrl === "string"
        ? item.videoUrl.trim()
        : typeof item.youtube === "string"
          ? item.youtube.trim()
          : "";

  const isVideo =
    item.type === "video" ||
    Boolean(rawYouTubeUrl) ||
    rawUrl.includes("youtube.com") ||
    rawUrl.includes("youtu.be");

  const numericId = Number(item.id);

  return {
    id:
      Number.isFinite(numericId) && numericId > 0
        ? numericId
        : index + 1,
    type: isVideo ? "video" : "image",
    url: isVideo ? "" : rawUrl,
    youtubeUrl: isVideo
      ? rawYouTubeUrl || rawUrl
      : "",
  };
}

function normalizeGalleryItems(
  input: unknown,
): GalleryItem[] {
  if (!Array.isArray(input)) {
    return defaultContent;
  }

  return input.map((item, index) =>
    normalizeGalleryItem(item, index),
  );
}

export async function GET() {
  try {
    const savedGallery =
      await kv.get<unknown>("gallery");

    const images = Array.isArray(savedGallery)
      ? normalizeGalleryItems(savedGallery)
      : defaultContent;

    return NextResponse.json(
      { images },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Gallery GET error:",
      error,
    );

    return NextResponse.json(
      {
        images: defaultContent,
        warning: "Using default gallery content.",
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: Request) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.images)) {
      return NextResponse.json(
        { error: "images must be an array" },
        { status: 400 },
      );
    }

    const images = normalizeGalleryItems(
      body.images,
    );

    await kv.set("gallery", images);

    return NextResponse.json(
      {
        ok: true,
        images,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Gallery PUT error:",
      error,
    );

    return NextResponse.json(
      { error: "Failed to update gallery" },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface HeroSlide {
  id?: string;
  place: string;
  image: string;
  description?: string;
  country?: string;
  tag?: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSlides(input: unknown): HeroSlide[] {
  if (!Array.isArray(input)) return [];

  return input.map((slide, index) => {
    const item = slide as Partial<HeroSlide>;
    const place = String(item.place || "").trim();

    return {
      id: String(item.id || slugify(place) || `slide-${index + 1}`).trim(),
      place,
      image: String(item.image || "").trim(),
      description: String(item.description || "").trim(),
      country: String(item.country || "").trim(),
      tag: String(item.tag || "").trim(),
    };
  });
}

function validateSlides(slides: HeroSlide[]) {
  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];
    if (!slide.place) return `Slide ${i + 1}: place is required.`;
    if (!slide.image) return `Slide ${i + 1}: image is required.`;
  }
  return "";
}

export async function GET() {
  try {
    const images = await kv.get<HeroSlide[]>("hero-images");
    return NextResponse.json(
      { images: Array.isArray(images) ? images : [] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Landing hero GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await request.json();
    const rawSlides = Array.isArray(body) ? body : body?.images;

    if (!Array.isArray(rawSlides)) {
      return NextResponse.json(
        { error: "Missing hero slides data. Expected { images: [...] }." },
        { status: 400 },
      );
    }

    const slides = normalizeSlides(rawSlides);
    const validationError = validateSlides(slides);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    await kv.set("hero-images", slides);

    return NextResponse.json(
      { ok: true, message: "Hero slides updated successfully", images: slides },
      { status: 200 },
    );
  } catch (error) {
    console.error("Landing hero PUT error:", error);
    return NextResponse.json(
      { error: "Failed to update hero slides" },
      { status: 500 },
    );
  }
}
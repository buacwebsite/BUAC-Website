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

const defaultHeroSlides: HeroSlide[] = [
  {
    id: "buac",
    place: "BUAC",
    country: "BRAC University Adventure Club",
    tag: "Adventure",
    image: "/assets/footerbg.webp",
    description:
      "Step into the wild with BUAC — a community built around exploration, teamwork, courage, and unforgettable outdoor stories.",
  },
  {
    id: "trails",
    place: "Trails",
    country: "Bangladesh",
    tag: "Expedition",
    image: "/assets/panelbg.jpg",
    description:
      "From misty hills to forest trails, every expedition becomes a memory, a challenge, and a story worth carrying forward.",
  },
  {
    id: "explore",
    place: "Explore",
    country: "BUAC Family",
    tag: "Community",
    image: "/assets/footerbg.webp",
    description:
      "Explore beyond your comfort zone with people who believe that the best views come after the hardest climb.",
  },
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeSlides(input: unknown): HeroSlide[] {
  if (!Array.isArray(input)) {
    return defaultHeroSlides;
  }

  return input.map((slide, index) => {
    const item = slide as Partial<HeroSlide>;
    const place = String(item.place || `Slide ${index + 1}`).trim();

    return {
      id: String(item.id || slugify(place) || `slide-${index + 1}`).trim(),
      place,
      image: String(item.image || "").trim(),
      description: String(item.description || "").trim(),
      country: String(item.country || "BUAC Trail").trim(),
      tag: String(item.tag || "Adventure").trim(),
    };
  });
}

function validateSlides(slides: HeroSlide[]) {
  if (!slides.length) {
    return "At least one hero slide is required.";
  }

  for (let i = 0; i < slides.length; i += 1) {
    const slide = slides[i];

    if (!slide.place) {
      return `Slide ${i + 1}: place is required.`;
    }

    if (!slide.description) {
      return `Slide ${i + 1}: description is required.`;
    }

    if (!slide.country) {
      return `Slide ${i + 1}: country/location is required.`;
    }

    if (!slide.tag) {
      return `Slide ${i + 1}: tag is required.`;
    }
  }

  return "";
}

export async function GET() {
  try {
    const images = await kv.get<HeroSlide[]>("hero-images");

    return NextResponse.json(
      {
        images:
          Array.isArray(images) && images.length
            ? images
            : defaultHeroSlides,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Landing hero GET error:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch hero slides",
        details:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const isAdmin = await authenticateAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Unauthorized. Please login as admin again." },
        { status: 401 },
      );
    }

    const body = await request.json();

    /**
     * Supports both:
     * axios.put("/api/content/landinghero", slides)
     * axios.put("/api/content/landinghero", { images: slides })
     */
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
      {
        ok: true,
        message: "Hero slides updated successfully",
        images: slides,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Landing hero PUT error:", error);

    return NextResponse.json(
      {
        error: "Failed to update hero slides",
        details:
          error instanceof Error ? error.message : "Unknown server error",
      },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Quote {
  name: string;
  designation: string;
  quote: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

const defaultAboutText =
  "Founded in 2010 by passionate adventurers at BRACU, we started with 12 members exploring Bangladesh's hidden gems. Today, we're a community of explorers building a culture united by adventure, courage, teamwork, and the great outdoors.";

const defaultStats: Stat[] = [
  { value: "500+", label: "Active Members" },
  { value: "100+", label: "Expeditions" },
  { value: "50+", label: "Locations" },
  { value: "15+", label: "Years Strong" },
];

const defaultQuotes: Quote[] = [];

function normalizeQuote(input: unknown): Quote | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Partial<
    Quote & {
      title?: string;
      subtitle?: string;
      description?: string;
      imageUrl?: string;
      img?: string;
      photo?: string;
    }
  >;

  const name =
    typeof item.name === "string"
      ? item.name.trim()
      : typeof item.title === "string"
        ? item.title.trim()
        : "";

  const designation =
    typeof item.designation === "string"
      ? item.designation.trim()
      : typeof item.subtitle === "string"
        ? item.subtitle.trim()
        : "";

  const quote =
    typeof item.quote === "string"
      ? item.quote.trim()
      : typeof item.description === "string"
        ? item.description.trim()
        : "";

  const image =
    typeof item.image === "string"
      ? item.image.trim()
      : typeof item.imageUrl === "string"
        ? item.imageUrl.trim()
        : typeof item.img === "string"
          ? item.img.trim()
          : typeof item.photo === "string"
            ? item.photo.trim()
            : "";

  if (!name && !designation && !quote && !image) {
    return null;
  }

  return {
    name,
    designation,
    quote,
    image,
  };
}

function normalizeQuotes(input: unknown): Quote[] {
  if (!input) {
    return defaultQuotes;
  }

  if (Array.isArray(input)) {
    return input
      .map((item) => normalizeQuote(item))
      .filter((item): item is Quote => Boolean(item));
  }

  if (typeof input === "object") {
    const objectInput = input as {
      quotes?: unknown;
      items?: unknown;
      data?: unknown;
    };

    if (Array.isArray(objectInput.quotes)) {
      return normalizeQuotes(objectInput.quotes);
    }

    if (Array.isArray(objectInput.items)) {
      return normalizeQuotes(objectInput.items);
    }

    if (Array.isArray(objectInput.data)) {
      return normalizeQuotes(objectInput.data);
    }

    const singleQuote = normalizeQuote(input);

    return singleQuote ? [singleQuote] : defaultQuotes;
  }

  return defaultQuotes;
}

function normalizeStat(input: unknown): Stat | null {
  if (!input || typeof input !== "object") {
    return null;
  }

  const item = input as Partial<Stat>;

  const value =
    typeof item.value === "string"
      ? item.value.trim()
      : "";

  const label =
    typeof item.label === "string"
      ? item.label.trim()
      : "";

  if (!value && !label) {
    return null;
  }

  return {
    value,
    label,
  };
}

function normalizeStats(input: unknown): Stat[] {
  if (!Array.isArray(input)) {
    return defaultStats;
  }

  const stats = input
    .map((item) => normalizeStat(item))
    .filter((item): item is Stat => Boolean(item));

  return stats.length ? stats : defaultStats;
}

export async function GET() {
  try {
    const aboutText = await kv.get<string>("about:text");
    const stats = await kv.get<unknown>("about:stats");
    const quotes = await kv.get<unknown>("quotes");

    return NextResponse.json(
      {
        aboutText:
          typeof aboutText === "string" && aboutText.trim()
            ? aboutText
            : defaultAboutText,
        stats: normalizeStats(stats),
        quotes: normalizeQuotes(quotes),
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error fetching about content:", error);

    return NextResponse.json(
      {
        aboutText: defaultAboutText,
        stats: defaultStats,
        quotes: defaultQuotes,
        warning: "Using default about content because database fetch failed.",
      },
      {
        status: 200,
      },
    );
  }
}

export async function POST(request: Request) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const body = await request.json();

    const aboutText =
      typeof body?.aboutText === "string"
        ? body.aboutText
        : defaultAboutText;

    const stats = normalizeStats(body?.stats);
    const quotes = normalizeQuotes(body?.quotes);

    await kv.set("about:text", aboutText);
    await kv.set("about:stats", stats);
    await kv.set("quotes", quotes);

    return NextResponse.json(
      {
        success: true,
        message: "About content updated successfully",
        aboutText,
        stats,
        quotes,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("Error updating about content:", error);

    return NextResponse.json(
      {
        error: "Failed to update about content",
      },
      {
        status: 500,
      },
    );
  }
}

export async function PUT(request: Request) {
  return POST(request);
}
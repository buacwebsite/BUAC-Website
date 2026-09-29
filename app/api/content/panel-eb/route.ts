import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface PersonImage {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

interface ExecutiveDepartment {
  id: string;
  name: string;
  images: PersonImage[];
}

interface PanelEbContent {
  panel: PersonImage[];
  executiveBody: ExecutiveDepartment[];

  /*
   New separate YouTube video fields:
   - Panel video appears before Panel pictures.
   - Executive video appears before Executive Body pictures.
   */
  panelVideoUrl: string;
  executiveVideoUrl: string;
}

/*
 Supports old data already stored in Redis.
 The previous version used featuredVideoUrl.
 That old video automatically becomes the Panel video.
 */
interface OldPanelEbContent extends Partial<PanelEbContent> {
  featuredVideoUrl?: string;
}

function cleanString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function createEmptyPerson(
  id: string,
  title = "",
  subtitle = "",
): PersonImage {
  return {
    id,
    title,
    subtitle,
    image: "",
  };
}

const defaultContent: PanelEbContent = {
  panelVideoUrl: "",
  executiveVideoUrl: "",

  panel: [
    createEmptyPerson("panel-1", "Panel Member 1", "President"),
    createEmptyPerson("panel-2", "Panel Member 2", "Vice President"),
    createEmptyPerson("panel-3", "Panel Member 3", "General Secretary"),
    createEmptyPerson("panel-4", "Panel Member 4", "Treasurer"),
  ],

  executiveBody: [
    {
      id: "creative",
      name: "Creative",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(
          `creative-${index + 1}`,
          `Creative Member ${index + 1}`,
          "Creative Department",
        ),
      ),
    },
    {
      id: "event",
      name: "Event Management",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(
          `event-${index + 1}`,
          `Event Member ${index + 1}`,
          "Event Management",
        ),
      ),
    },
    {
      id: "hr",
      name: "Human Resources Management",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(
          `hr-${index + 1}`,
          `HR Member ${index + 1}`,
          "Human Resources Management",
        ),
      ),
    },
    {
      id: "itphoto",
      name: "IT & Photography",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(
          `itphoto-${index + 1}`,
          `IT & Photography Member ${index + 1}`,
          "IT & Photography",
        ),
      ),
    },
    {
      id: "pubandmarket",
      name: "Publication & Marketing",
      images: Array.from({ length: 5 }, (_, index) =>
        createEmptyPerson(
          `pubandmarket-${index + 1}`,
          `Publication Member ${index + 1}`,
          "Publication & Marketing",
        ),
      ),
    },
  ],
};

function normalizePerson(
  input: unknown,
  fallback: PersonImage,
): PersonImage {
  const data =
    input && typeof input === "object"
      ? (input as Partial<PersonImage>)
      : {};

  return {
    id: cleanString(data.id) || fallback.id,
    title: cleanString(data.title) || fallback.title,
    subtitle: cleanString(data.subtitle) || fallback.subtitle,
    image: cleanString(data.image),
  };
}

function normalizeDepartment(
  input: unknown,
  fallback: ExecutiveDepartment,
): ExecutiveDepartment {
  const data =
    input && typeof input === "object"
      ? (input as Partial<ExecutiveDepartment>)
      : {};

  const images = Array.isArray(data.images)
    ? data.images.map((person, index) => {
        const fallbackPerson =
          fallback.images[index] ||
          createEmptyPerson(
            `${fallback.id}-${index + 1}`,
            `${fallback.name} Member ${index + 1}`,
            fallback.name,
          );

        return normalizePerson(person, fallbackPerson);
      })
    : fallback.images;

  return {
    id: cleanString(data.id) || fallback.id,
    name: cleanString(data.name) || fallback.name,
    images,
  };
}

function normalizeContent(input: unknown): PanelEbContent {
  if (!input || typeof input !== "object") {
    return defaultContent;
  }

  const data = input as OldPanelEbContent;

  const panel = Array.isArray(data.panel)
    ? data.panel.map((person, index) => {
        const fallback =
          defaultContent.panel[index] ||
          createEmptyPerson(
            `panel-${index + 1}`,
            `Panel Member ${index + 1}`,
          );

        return normalizePerson(person, fallback);
      })
    : defaultContent.panel;

  const executiveBody = Array.isArray(data.executiveBody)
    ? data.executiveBody.map((department, index) => {
        const fallback =
          defaultContent.executiveBody[index] ||
          defaultContent.executiveBody[0];

        return normalizeDepartment(department, fallback);
      })
    : defaultContent.executiveBody;

  /*
   Old featuredVideoUrl is used as Panel video,
   if panelVideoUrl does not already exist.
   */
  const panelVideoUrl = cleanString(
    data.panelVideoUrl || data.featuredVideoUrl,
  );

  const executiveVideoUrl = cleanString(data.executiveVideoUrl);

  return {
    panel,
    executiveBody,
    panelVideoUrl,
    executiveVideoUrl,
  };
}

/* Public: Load Panel & EB content */
export async function GET() {
  try {
    const savedContent = await kv.get<unknown>("panel-eb");

    return NextResponse.json(
      {
        content: normalizeContent(savedContent),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Panel & EB GET error:", error);

    return NextResponse.json(
      {
        content: defaultContent,
        warning: "Could not load saved Panel & EB content.",
      },
      { status: 200 },
    );
  }
}

/* Admin only: Save Panel & EB content */
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

    /*
     Supports both:
     { content: {...} }
     and:
     {...}
    */
    const content = normalizeContent(body?.content || body);

    await kv.set("panel-eb", content);

    return NextResponse.json(
      {
        ok: true,
        content,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Panel & EB PUT error:", error);

    return NextResponse.json(
      {
        error: "Failed to update Panel & EB content.",
      },
      { status: 500 },
    );
  }
}
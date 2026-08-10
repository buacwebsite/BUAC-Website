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
  featuredVideoUrl: string;
}

function createEmptyPerson(
  id: string,
  title: string,
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
  featuredVideoUrl: "",
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
      images: Array.from({ length: 5 }).map((_, index) =>
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
      images: Array.from({ length: 5 }).map((_, index) =>
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
      images: Array.from({ length: 5 }).map((_, index) =>
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
      images: Array.from({ length: 5 }).map((_, index) =>
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
      images: Array.from({ length: 5 }).map((_, index) =>
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
  input: Partial<PersonImage>,
  fallbackId: string,
): PersonImage {
  return {
    id: String(input.id || fallbackId),
    title: String(input.title || "Name"),
    subtitle: String(input.subtitle || ""),
    image: String(input.image || ""),
  };
}

function normalizeContent(input: unknown): PanelEbContent {
  if (!input || typeof input !== "object") return defaultContent;

  const data = input as Partial<PanelEbContent>;

  const panel = Array.isArray(data.panel)
    ? data.panel.map((item, index) =>
        normalizePerson(item, `panel-${index + 1}`),
      )
    : defaultContent.panel;

  const executiveBody = Array.isArray(data.executiveBody)
    ? data.executiveBody.map((department, departmentIndex) => {
        const fallbackDepartment =
          defaultContent.executiveBody[departmentIndex] ||
          defaultContent.executiveBody[0];

        return {
          id: String(department.id || fallbackDepartment.id),
          name: String(department.name || fallbackDepartment.name),
          images: Array.isArray(department.images)
            ? department.images.map((item, imageIndex) =>
                normalizePerson(
                  item,
                  `${department.id || fallbackDepartment.id}-${imageIndex + 1}`,
                ),
              )
            : fallbackDepartment.images,
        };
      })
    : defaultContent.executiveBody;

  const featuredVideoUrl =
    typeof data.featuredVideoUrl === "string"
      ? data.featuredVideoUrl.trim()
      : "";

  return {
    panel,
    executiveBody,
    featuredVideoUrl,
  };
}

export async function GET() {
  try {
    const content = await kv.get<PanelEbContent>("panel-eb");

    return NextResponse.json(
      {
        content: content ? normalizeContent(content) : defaultContent,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Panel & EB GET error:", error);

    return NextResponse.json(
      {
        content: defaultContent,
        warning: "Using default content because database fetch failed.",
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: Request) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
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
      { error: "Failed to update Panel & EB content" },
      { status: 500 },
    );
  }
}
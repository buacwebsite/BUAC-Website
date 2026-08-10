import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type SemesterName = "Spring" | "Summer" | "Fall";

interface SemesterSettings {
  semester: SemesterName;
  year: string;
  label: string;
  updatedAt: string;
}

const validSemesters: SemesterName[] = ["Spring", "Summer", "Fall"];

function getDefaultSemesterSettings(): SemesterSettings {
  const now = new Date();
  const month = now.getMonth();
  const year = String(now.getFullYear());

  let semester: SemesterName = "Spring";

  if (month >= 4 && month <= 7) {
    semester = "Summer";
  } else if (month >= 8) {
    semester = "Fall";
  }

  return {
    semester,
    year,
    label: `${semester} ${year}`,
    updatedAt: new Date().toISOString(),
  };
}

function normalizeSettings(input: unknown): SemesterSettings {
  const fallback = getDefaultSemesterSettings();

  if (!input || typeof input !== "object") {
    return fallback;
  }

  const data = input as Partial<SemesterSettings>;

  const semester = validSemesters.includes(data.semester as SemesterName)
    ? (data.semester as SemesterName)
    : fallback.semester;

  const rawYear =
    typeof data.year === "string"
      ? data.year.trim()
      : typeof data.year === "number"
        ? String(data.year)
        : fallback.year;

  const year = /^\d{4}$/.test(rawYear) ? rawYear : fallback.year;

  return {
    semester,
    year,
    label: `${semester} ${year}`,
    updatedAt:
      typeof data.updatedAt === "string"
        ? data.updatedAt
        : new Date().toISOString(),
  };
}

export async function GET() {
  try {
    const saved = await kv.get<SemesterSettings>("semester:settings");

    return NextResponse.json(
      {
        settings: saved ? normalizeSettings(saved) : getDefaultSemesterSettings(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Semester settings GET error:", error);

    return NextResponse.json(
      {
        settings: getDefaultSemesterSettings(),
        warning: "Using default semester settings.",
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    const semester = String(body.semester || "").trim() as SemesterName;
    const year = String(body.year || "").trim();

    if (!validSemesters.includes(semester)) {
      return NextResponse.json(
        { error: "Invalid semester. Use Spring, Summer, or Fall." },
        { status: 400 },
      );
    }

    if (!/^\d{4}$/.test(year)) {
      return NextResponse.json(
        { error: "Invalid year. Use a 4 digit year." },
        { status: 400 },
      );
    }

    const settings: SemesterSettings = {
      semester,
      year,
      label: `${semester} ${year}`,
      updatedAt: new Date().toISOString(),
    };

    await kv.set("semester:settings", settings);

    return NextResponse.json({ ok: true, settings }, { status: 200 });
  } catch (error) {
    console.error("Semester settings PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update semester settings" },
      { status: 500 },
    );
  }
}
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
    updatedAt: now.toISOString(),
  };
}

async function getSettings(
  semesterParam?: unknown,
  yearParam?: unknown,
) {
  const savedSettings =
    await kv.get<SemesterSettings>("semester:settings");

  const currentSettings =
    savedSettings || getDefaultSemesterSettings();

  const requestedSemester =
    typeof semesterParam === "string"
      ? semesterParam.trim()
      : "";

  const requestedYear =
    typeof yearParam === "string"
      ? yearParam.trim()
      : "";

  const semester: SemesterName =
    requestedSemester === "Spring" ||
    requestedSemester === "Summer" ||
    requestedSemester === "Fall"
      ? requestedSemester
      : currentSettings.semester;

  const year = /^\d{4}$/.test(requestedYear)
    ? requestedYear
    : currentSettings.year;

  return {
    semester,
    year,
    label: `${semester} ${year}`,
  };
}

function semesterCountKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:count:${semester}:${year}`;
}

function databaseIndexKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:database:index:${year}:${semester}`;
}

export async function GET() {
  try {
    const settings = await getSettings();

    const count =
      (await kv.get<number>(
        semesterCountKey(
          settings.semester,
          settings.year,
        ),
      )) || 0;

    const totalCount =
      (await kv.get<number>(
        "club-fair:count",
      )) || 0;

    const databaseIndex =
      (await kv.get<string[]>(
        databaseIndexKey(
          settings.semester,
          settings.year,
        ),
      )) || [];

    return NextResponse.json(
      {
        count,
        totalCount,
        databaseRecords: databaseIndex.length,
        semester: settings.semester,
        year: settings.year,
        label: settings.label,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Club Fair count GET error:",
      error,
    );

    return NextResponse.json(
      {
        count: 0,
        totalCount: 0,
        databaseRecords: 0,
        semester: "Spring",
        year: String(new Date().getFullYear()),
        label: `Spring ${new Date().getFullYear()}`,
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const settings = await getSettings(
      body.semester,
      body.year,
    );

    const currentKey = semesterCountKey(
      settings.semester,
      settings.year,
    );

    const previousCount =
      (await kv.get<number>(currentKey)) || 0;

    const previousTotal =
      (await kv.get<number>(
        "club-fair:count",
      )) || 0;

    const action =
      body.action === "reset"
        ? "reset"
        : "set";

    let nextCount = 0;

    if (action === "set") {
      const numericCount = Number(body.count);

      if (
        !Number.isFinite(numericCount) ||
        numericCount < 0 ||
        !Number.isInteger(numericCount)
      ) {
        return NextResponse.json(
          {
            error:
              "Count must be a non-negative whole number.",
          },
          { status: 400 },
        );
      }

      nextCount = numericCount;
    }

    await kv.set(currentKey, nextCount);

    /*
     * Keep total count consistent with changes
     * to the selected semester count.
     *
     * If the admin provides totalCount manually,
     * use that exact value.
     */
    let nextTotal = previousTotal;

    if (
      body.totalCount !== undefined
    ) {
      const numericTotal = Number(
        body.totalCount,
      );

      if (
        !Number.isFinite(numericTotal) ||
        numericTotal < 0 ||
        !Number.isInteger(numericTotal)
      ) {
        return NextResponse.json(
          {
            error:
              "Total count must be a non-negative whole number.",
          },
          { status: 400 },
        );
      }

      nextTotal = numericTotal;
    } else {
      const difference =
        nextCount - previousCount;

      nextTotal = Math.max(
        0,
        previousTotal + difference,
      );
    }

    if (body.resetTotal === true) {
      nextTotal = 0;
    }

    await kv.set(
      "club-fair:count",
      nextTotal,
    );

    return NextResponse.json(
      {
        ok: true,
        message:
          action === "reset"
            ? "Club Fair count reset successfully."
            : "Club Fair count updated successfully.",
        count: nextCount,
        totalCount: nextTotal,
        semester: settings.semester,
        year: settings.year,
        label: settings.label,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "Club Fair count PUT error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to update Club Fair count.",
      },
      { status: 500 },
    );
  }
}
import {
  NextRequest,
  NextResponse,
} from "next/server";
import axios from "axios";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

type SemesterName =
  | "Spring"
  | "Summer"
  | "Fall";

interface SemesterSettings {
  semester: SemesterName;
  year: string;
  label: string;
  updatedAt: string;
}

interface ClubFairRecord {
  id: string;
  formType: "club-fair";
  semester: SemesterName;
  year: string;
  semesterLabel: string;
  submittedAt: string;
  name: string;
  email: string;
  studentId: string;
  address: string;
  gender: string;
  religion: string;
  contact: string;
  facebook: string;
  department: string;
  studentSemester: string;
  bloodGroup: string;
  bloodDonation: string;
}

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || "";

function getDefaultSettings(): SemesterSettings {
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
  semester?: string | null,
  year?: string | null,
) {
  const stored =
    await kv.get<SemesterSettings>(
      "semester:settings",
    );

  const settings =
    stored || getDefaultSettings();

  const selectedSemester =
    semester === "Spring" ||
    semester === "Summer" ||
    semester === "Fall"
      ? semester
      : settings.semester;

  const selectedYear =
    year && /^\d{4}$/.test(year)
      ? year
      : settings.year;

  return {
    semester: selectedSemester as SemesterName,
    year: selectedYear,
    label: `${selectedSemester} ${selectedYear}`,
  };
}

function databaseIndexKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:database:index:${year}:${semester}`;
}

function databaseRecordKey(
  semester: SemesterName,
  year: string,
  submissionId: string,
) {
  return `club-fair:database:${year}:${semester}:${submissionId}`;
}

function semesterCountKey(
  semester: SemesterName,
  year: string,
) {
  return `club-fair:count:${semester}:${year}`;
}

async function getRecords(
  semester: SemesterName,
  year: string,
) {
  const index =
    (await kv.get<string[]>(
      databaseIndexKey(semester, year),
    )) || [];

  const records = await Promise.all(
    index.map(async (submissionId) => {
      const record =
        await kv.get<ClubFairRecord>(
          databaseRecordKey(
            semester,
            year,
            submissionId,
          ),
        );

      return record;
    }),
  );

  return {
    index,
    records: records.filter(
      (record): record is ClubFairRecord =>
        Boolean(record),
    ),
  };
}

async function notifyGoogleSheetDelete(payload: {
  mode: "one" | "all";
  semester: SemesterName;
  year: string;
  submissionId?: string;
  email?: string;
}) {
  if (!GOOGLE_SCRIPT_URL) {
    throw new Error(
      "GOOGLE_SCRIPT_URL is not configured.",
    );
  }

  const response = await axios.post(
    GOOGLE_SCRIPT_URL,
    {
      formType: "club-fair-delete",
      deleteMode: payload.mode,
      semester: payload.semester,
      year: payload.year,
      tabName: `Club Fair ${payload.semester} ${payload.year}`,
      submissionId: payload.submissionId || "",
      Email: payload.email || "",
      email: payload.email || "",
      timestamp: new Date().toISOString(),
    },
    {
      timeout: 15000,
    },
  );

  if (
    response.data?.result ===
    "error"
  ) {
    throw new Error(
      response.data.message ||
        "Google Sheet deletion failed.",
    );
  }

  return response.data;
}

export async function GET(
  request: NextRequest,
) {
  const isAdmin =
    await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401 },
    );
  }

  try {
    const { searchParams } =
      new URL(request.url);

    const settings = await getSettings(
      searchParams.get("semester"),
      searchParams.get("year"),
    );

    const result = await getRecords(
      settings.semester,
      settings.year,
    );

    return NextResponse.json({
      settings,
      count: result.records.length,
      records: result.records,
    });
  } catch (error) {
    console.error(
      "Club Fair admin GET error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to load Club Fair submissions.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
) {
  const isAdmin =
    await authenticateAdmin();

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

    const deleteAll =
      body.deleteAll === true;

    const requestedSubmissionId =
      typeof body.submissionId === "string"
        ? body.submissionId.trim()
        : "";

    const result = await getRecords(
      settings.semester,
      settings.year,
    );

    if (!deleteAll && !requestedSubmissionId) {
      return NextResponse.json(
        {
          error:
            "Provide submissionId or deleteAll: true.",
        },
        { status: 400 },
      );
    }

    if (deleteAll) {
      if (result.records.length === 0) {
        return NextResponse.json({
          ok: true,
          deletedCount: 0,
          message:
            "No submissions were found.",
        });
      }

      await notifyGoogleSheetDelete({
        mode: "all",
        semester: settings.semester,
        year: settings.year,
      });

      for (const submissionId of result.index) {
        await kv.del(
          databaseRecordKey(
            settings.semester,
            settings.year,
            submissionId,
          ),
        );
      }

      await kv.set(
        databaseIndexKey(
          settings.semester,
          settings.year,
        ),
        [],
      );

      const currentSemesterCount =
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

      await kv.set(
        semesterCountKey(
          settings.semester,
          settings.year,
        ),
        0,
      );

      await kv.set(
        "club-fair:count",
        Math.max(
          0,
          totalCount -
            currentSemesterCount,
        ),
      );

      return NextResponse.json({
        ok: true,
        deletedCount: result.records.length,
        message:
          "All current-semester submissions were deleted from Redis and Google Sheets.",
      });
    }

    const record =
      result.records.find(
        (item) =>
          item.id ===
          requestedSubmissionId,
      );

    if (!record) {
      return NextResponse.json(
        {
          error:
            "Submission was not found.",
        },
        { status: 404 },
      );
    }

    await notifyGoogleSheetDelete({
      mode: "one",
      semester: settings.semester,
      year: settings.year,
      submissionId: record.id,
      email: record.email,
    });

    await kv.del(
      databaseRecordKey(
        settings.semester,
        settings.year,
        record.id,
      ),
    );

    const remainingIds =
      result.index.filter(
        (id) => id !== record.id,
      );

    await kv.set(
      databaseIndexKey(
        settings.semester,
        settings.year,
      ),
      remainingIds,
    );

    const currentSemesterCount =
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

    await kv.set(
      semesterCountKey(
        settings.semester,
        settings.year,
      ),
      Math.max(0, currentSemesterCount - 1),
    );

    await kv.set(
      "club-fair:count",
      Math.max(0, totalCount - 1),
    );

    return NextResponse.json({
      ok: true,
      deletedCount: 1,
      message:
        "Submission deleted from Redis and Google Sheets.",
    });
  } catch (error) {
    console.error(
      "Club Fair admin DELETE error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete submissions.",
      },
      { status: 500 },
    );
  }
}
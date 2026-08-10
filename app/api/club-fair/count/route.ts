import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

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
    updatedAt: new Date().toISOString(),
  };
}

async function getActiveSemesterSettings() {
  const settings = await kv.get<SemesterSettings>("semester:settings");
  return settings || getDefaultSemesterSettings();
}

export async function GET() {
  try {
    const settings = await getActiveSemesterSettings();

    const semesterKey = `club-fair:count:${settings.semester}:${settings.year}`;
    const count = (await kv.get<number>(semesterKey)) ?? 0;
    const totalCount = (await kv.get<number>("club-fair:count")) ?? 0;

    return NextResponse.json({
      count,
      totalCount,
      semester: settings.semester,
      year: settings.year,
      label: settings.label,
    });
  } catch (err) {
    console.error("Club fair count error:", err);

    return NextResponse.json({
      count: 0,
      totalCount: 0,
      semester: "Spring",
      year: String(new Date().getFullYear()),
      label: `Spring ${new Date().getFullYear()}`,
    });
  }
}
import { NextResponse } from "next/server";
import axios from "axios";
import { kv } from "../../../../lib/kv";
import { sendMail, buildClubFairThankYouEmail } from "../../../../lib/email";

export const dynamic = "force-dynamic";

type SemesterName = "Spring" | "Summer" | "Fall";

interface SemesterSettings {
  semester: SemesterName;
  year: string;
  label: string;
  updatedAt: string;
}

const DEFAULT_GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyO1YvRhGT92uK_n8XG7rsUz2zbQnqcvGgOgBIR27RUiAH0_0cR-XlEpROOtqi3M0J_/exec";

const CLUB_FAIR_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_CLUB_FAIR_URL ||
  process.env.GOOGLE_SCRIPT_URL ||
  DEFAULT_GOOGLE_SCRIPT_URL;

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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const settings = await getActiveSemesterSettings();

    const payload = {
      ...body,
      formType: "club-fair",
      semester: settings.semester,
      year: settings.year,
      activeSemesterLabel: settings.label,
      tabName: `Club Fair ${settings.semester} ${settings.year}`,
      timestamp: new Date().toISOString(),
    };

    if (CLUB_FAIR_SCRIPT_URL) {
      try {
        await axios.post(CLUB_FAIR_SCRIPT_URL, payload);
      } catch (sheetErr) {
        console.error(
          "Failed to forward payload to Google Apps Script:",
          sheetErr,
        );
      }
    }

    try {
      await kv.incr("club-fair:count");

      const semesterKey = `club-fair:count:${settings.semester}:${settings.year}`;
      await kv.incr(semesterKey);
    } catch (countError) {
      console.error("Failed to increment club fair count in Redis:", countError);
    }

    // Send thank-you email to the applicant
    try {
      const applicantName =
        String(body.Name || body.name || "").trim() || "Adventurer";

      const applicantEmail = String(
        body.Email || body.email || "",
      )
        .trim()
        .toLowerCase();

      if (applicantEmail) {
        const thankYouEmail =
          buildClubFairThankYouEmail(applicantName);

        await sendMail({
          to: applicantEmail,
          subject: thankYouEmail.subject,
          html: thankYouEmail.html,
          text: thankYouEmail.text,
        });
      }
    } catch (emailError) {
      console.error("Failed to send club fair thank-you email:", emailError);
    }

    return NextResponse.json(
      {
        result: "success",
        semester: settings.semester,
        year: settings.year,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("Club fair submission error:", err);

    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
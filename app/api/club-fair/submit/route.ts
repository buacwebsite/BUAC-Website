import { NextResponse } from "next/server";
import axios from "axios";
import { kv } from "@/lib/kv";
import {
  buildClubFairThankYouEmail,
  sendMail,
} from "@/lib/email";

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

interface ClubFairSubmission {
  Name?: string;
  StudentID?: string;
  Address?: string;
  Gender?: string;
  Religion?: string;
  Contact?: string;
  Facebook?: string;
  Department?: string;
  Semester?: string;
  BloodGroup?: string;
  BloodDonation?: string;
  Email?: string;
}

const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || "";

function clean(value: unknown): string {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeFacebookUrl(
  value: string,
): string {
  const input = String(value || "").trim();

  if (!input) {
    return "";
  }

  const valueWithProtocol =
    /^https?:\/\//i.test(input)
      ? input
      : `https://${input}`;

  try {
    const parsedUrl = new URL(
      valueWithProtocol,
    );

    const hostname = parsedUrl.hostname
      .toLowerCase()
      .replace(/^www\./, "");

    const validHostname =
      hostname === "facebook.com" ||
      hostname === "m.facebook.com" ||
      hostname === "fb.com" ||
      hostname.endsWith(".facebook.com");

    if (!validHostname) {
      return "";
    }

    return parsedUrl.toString();
  } catch {
    return "";
  }
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

async function getActiveSemesterSettings(): Promise<SemesterSettings> {
  const saved =
    await kv.get<SemesterSettings>(
      "semester:settings",
    );

  return (
    saved ||
    getDefaultSemesterSettings()
  );
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ClubFairSubmission;

    const settings =
      await getActiveSemesterSettings();

    const name =
      clean(body.Name) || "Student";

    const email =
      clean(body.Email).toLowerCase();

    const facebook =
      normalizeFacebookUrl(
        clean(body.Facebook),
      );

    if (!email) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!facebook) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid Facebook profile link, such as facebook.com/username.",
        },
        {
          status: 400,
        },
      );
    }

    const sequence =
      await kv.incr(
        "club-fair:database:sequence",
      );

    const submissionId =
      `club-fair-${settings.year}-${settings.semester.toLowerCase()}-${sequence}`;

    const timestamp =
      new Date().toISOString();

    const submission = {
      id: submissionId,
      formType: "club-fair",
      semester: settings.semester,
      year: settings.year,
      semesterLabel: settings.label,
      submittedAt: timestamp,
      name,
      email,
      studentId: clean(body.StudentID),
      address: clean(body.Address),
      gender: clean(body.Gender),
      religion: clean(body.Religion),
      contact: clean(body.Contact),
      facebook,
      department: clean(body.Department),
      studentSemester: clean(body.Semester),
      bloodGroup: clean(body.BloodGroup),
      bloodDonation: clean(body.BloodDonation),
    };

    await kv.set(
      `club-fair:database:${settings.year}:${settings.semester}:${submissionId}`,
      submission,
    );

    const indexKey =
      `club-fair:database:index:${settings.year}:${settings.semester}`;

    const previousIndex =
      (await kv.get<string[]>(indexKey)) ||
      [];

    await kv.set(indexKey, [
      submissionId,
      ...previousIndex,
    ]);

    await kv.incr("club-fair:count");

    await kv.incr(
      `club-fair:count:${settings.semester}:${settings.year}`,
    );

    if (GOOGLE_SCRIPT_URL) {
      try {
        await axios.post(
          GOOGLE_SCRIPT_URL,
          {
            formType: "club-fair",
            tabName: `Club Fair ${settings.semester} ${settings.year}`,
            semester: settings.semester,
            year: settings.year,
            activeSemesterLabel: settings.label,
            submissionId,
            timestamp,
            Name: submission.name,
            StudentID: submission.studentId,
            Address: submission.address,
            Gender: submission.gender,
            Religion: submission.religion,
            Contact: submission.contact,
            Facebook: submission.facebook,
            Department: submission.department,
            Semester: submission.studentSemester,
            BloodGroup: submission.bloodGroup,
            BloodDonation: submission.bloodDonation,
            Email: submission.email,
          },
          {
            timeout: 15000,
          },
        );
      } catch (sheetError) {
        console.error(
          "Google Sheet submission failed:",
          sheetError,
        );
      }
    }

    const emailTemplate =
      buildClubFairThankYouEmail(name);

    const emailResult = await sendMail({
      to: email,
      subject: emailTemplate.subject,
      html: emailTemplate.html,
      text: emailTemplate.text,
    });

    if (!emailResult.success) {
      console.error(
        "Club Fair email failed:",
        emailResult.error,
      );
    }

    return NextResponse.json(
      {
        result: "success",
        message: emailResult.success
          ? "Application submitted and confirmation email sent."
          : "Application submitted, but the confirmation email could not be sent.",
        emailSent: emailResult.success,
        submissionId,
        semester: settings.semester,
        year: settings.year,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error(
      "Club Fair submission error:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Failed to save Club Fair application.",
      },
      {
        status: 500,
      },
    );
  }
}
import {
  NextRequest,
  NextResponse,
} from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

import {
  buildClubFairThankYouEmail,
  sendMail,
} from "@/lib/email";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

async function getLoggedInEmail(): Promise<
  string | null
> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get(
      "admin-token",
    )?.value;

  if (!token) {
    return null;
  }

  const secret =
    process.env.adminJwtSecret || "";

  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(
      token,
      secret,
    ) as {
      sub?: string;
      role?: string;
    };

    if (payload.role !== "admin") {
      return null;
    }

    return payload.sub || null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
) {
  const loggedInEmail =
    await getLoggedInEmail();

  if (!loggedInEmail) {
    return NextResponse.json(
      {
        error:
          "You must be logged in as admin to test email.",
        hint:
          "Log in at /secure/admin/login first.",
      },
      { status: 401 },
    );
  }

  const { searchParams } =
    new URL(request.url);

  const requestedRecipient =
    searchParams.get("to")?.trim();

  const to =
    requestedRecipient ||
    loggedInEmail;

  const config = {
    loggedInAs:
      loggedInEmail,
    sendingTo: to,

    EMAIL_SERVICE:
      process.env.EMAIL_SERVICE ||
      "gmail",

    EMAIL_USER:
      process.env.EMAIL_USER
        ? "set"
        : "missing",

    GMAIL_APP_PASSWORD:
      process.env
        .GMAIL_APP_PASSWORD
        ? "set"
        : "missing",

    EMAIL_PASS:
      process.env.EMAIL_PASS
        ? "set"
        : "missing",
  };

  const template =
    buildClubFairThankYouEmail(
      "Test Candidate",
    );

  const result = await sendMail({
    to,
    subject:
      `[TEST] ${template.subject}`,
    html: template.html,
    text: template.text,
  });

  return NextResponse.json(
    {
      sentTo: to,
      result,
      config,
    },
    {
      status: result.success
        ? 200
        : 500,
    },
  );
}
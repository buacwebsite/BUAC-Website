import { NextRequest, NextResponse } from "next/server";
import { sendMail, buildClubFairThankYouEmail } from "@/lib/email";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

async function getLoggedInEmail(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(
      token,
      process.env.adminJwtSecret || "",
    ) as { sub?: string };

    return payload.sub || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const loggedInEmail = await getLoggedInEmail();

  if (!loggedInEmail) {
    return NextResponse.json(
      {
        error: "You must be logged in as admin to test email configurations.",
        hint: "Log in as admin at /secure/admin/login first.",
      },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const to = searchParams.get("to") || loggedInEmail;

  const config = {
    loggedInAs: loggedInEmail,
    sendingTo: to,
    EMAIL_USER: process.env.EMAIL_USER ? "set" : "missing",
    EMAIL_SERVICE: process.env.EMAIL_SERVICE || "gmail",
    EMAIL_PASS: process.env.EMAIL_PASS ? "set" : "missing",
  };

  const mail = buildClubFairThankYouEmail("Test Candidate");

  const result = await sendMail({
    to,
    subject: `[TEST] ${mail.subject}`,
    html: mail.html,
    text: mail.text,
  });

  return NextResponse.json({ sentTo: to, result, config });
}
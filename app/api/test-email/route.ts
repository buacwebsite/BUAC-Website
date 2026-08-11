import { NextRequest, NextResponse } from "next/server";
import { sendMail, buildMemberWelcomeEmail } from "@/lib/email";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

async function getLoggedInEmail(): Promise<string | null> {
  const cookieStore = await cookies();

  const token =
    cookieStore.get("user-token")?.value ||
    cookieStore.get("admin-token")?.value;

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
        error: "You must be logged in first.",
        hint: "Go to /login, sign in as any user, then visit this URL again.",
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
    GMAIL_APP_PASSWORD: process.env.GMAIL_APP_PASSWORD ? "set" : "missing",
    GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID ? "set" : "missing",
    GMAIL_CLIENT_SECRET: process.env.GMAIL_CLIENT_SECRET ? "set" : "missing",
    GMAIL_REFRESH_TOKEN: process.env.GMAIL_REFRESH_TOKEN ? "set" : "missing",
  };

  const mail = buildMemberWelcomeEmail("Test User");

  const result = await sendMail({
    to,
    subject: `[TEST] ${mail.subject}`,
    html: mail.html,
    text: mail.text,
  });

  return NextResponse.json({ sentTo: to, result, config });
}
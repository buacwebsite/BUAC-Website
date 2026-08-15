import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";
import {
  sendMail,
  buildPasswordResetEmail,
} from "@/lib/email";

export const dynamic = "force-dynamic";

interface StoredUser {
  name: string;
  email: string;
  passwordHash?: string;
  role: "member" | "alumni" | "admin";
  profile?: Record<string, unknown>;
  createdAt?: string;
}

function getSiteUrl(request: NextRequest) {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  const origin = request.headers.get("origin");

  if (origin) {
    return origin.replace(/\/$/, "");
  }

  const host = request.headers.get("host");

  if (host) {
    const protocol =
      host.includes("localhost") || host.startsWith("127.")
        ? "http"
        : "https";

    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}

async function findUser(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const directUser = await kv.get<StoredUser>(
    `user:${normalizedEmail}`,
  );

  if (directUser) {
    return {
      user: {
        ...directUser,
        email: normalizedEmail,
      },
      key: `user:${normalizedEmail}`,
    };
  }

  const usersList =
    (await kv.get<string[]>("users:list")) || [];

  const matchingEmail = usersList.find(
    (listedEmail) =>
      String(listedEmail).trim().toLowerCase() ===
      normalizedEmail,
  );

  if (!matchingEmail) {
    return null;
  }

  const legacyUser = await kv.get<StoredUser>(
    `user:${matchingEmail}`,
  );

  if (!legacyUser) {
    return null;
  }

  return {
    user: {
      ...legacyUser,
      email: normalizedEmail,
    },
    key: `user:${matchingEmail}`,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return NextResponse.json(
        { message: "Email is required." },
        { status: 400 },
      );
    }

    const found = await findUser(email);

    /*
     * Always return a generic success message
     * so attackers cannot check whether an email exists.
     */
    const genericResponse = NextResponse.json(
      {
        message:
          "If an account exists for this email, a password reset link has been sent.",
      },
      { status: 200 },
    );

    if (!found) {
      console.log(
        `[FORGOT PASSWORD] No account found for ${email}`,
      );
      return genericResponse;
    }

    if (found.user.role === "admin") {
      console.log(
        `[FORGOT PASSWORD] Admin account cannot use this reset flow: ${email}`,
      );
      return genericResponse;
    }

    const jwtSecret = process.env.adminJwtSecret || "";

    if (!jwtSecret) {
      console.error(
        "[FORGOT PASSWORD] adminJwtSecret is missing.",
      );

      return NextResponse.json(
        { message: "Failed to send password reset email." },
        { status: 500 },
      );
    }

    const token = jwt.sign(
      {
        sub: found.user.email,
        purpose: "password-reset",
        role: found.user.role,
      },
      jwtSecret,
      {
        expiresIn: "1h",
      },
    );

    await kv.set(
      `password-reset:${found.user.email}`,
      {
        token,
        createdAt: new Date().toISOString(),
      },
      {
        ex: 60 * 60,
      },
    );

    const siteUrl = getSiteUrl(request);
    const resetUrl = `${siteUrl}/reset-password?token=${encodeURIComponent(
      token,
    )}`;

    const mail = buildPasswordResetEmail(
      found.user.name || "Adventurer",
      resetUrl,
    );

    const result = await sendMail({
      to: found.user.email,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });

    if (!result.success) {
      console.error(
        "[FORGOT PASSWORD] Email send failed:",
        result.error,
      );

      return NextResponse.json(
        {
          message: "Failed to send password reset email.",
          detail:
            process.env.NODE_ENV !== "production"
              ? result.error
              : undefined,
        },
        { status: 500 },
      );
    }

    console.log(
      `[FORGOT PASSWORD] Reset email sent to ${found.user.email}`,
    );

    return genericResponse;
  } catch (error) {
    console.error("[FORGOT PASSWORD] Unexpected error:", error);

    return NextResponse.json(
      { message: "Failed to send password reset email." },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { kv } from "@/lib/kv";
import { env } from "@/env";

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "member" | "alumni" | "admin";
}

async function sendResetEmail({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name: string;
  resetUrl: string;
}) {
  const transporter = nodemailer.createTransport({
    service: env.EMAIL_SERVICE,
    auth: {
      type: "OAuth2",
      user: env.EMAIL_USER,
      clientId: env.GMAIL_CLIENT_ID,
      clientSecret: env.GMAIL_CLIENT_SECRET,
      refreshToken: env.GMAIL_REFRESH_TOKEN,
      accessToken: env.GMAIL_ACCESS_TOKEN || undefined,
    },
  });

  await transporter.sendMail({
    from: `"BUAC" <${env.EMAIL_USER}>`,
    to: email,
    subject: "Reset your BUAC password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#222">
        <h2>Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Click the button below to reset your BUAC account password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;background:#ff622b;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:bold">
            Reset Password
          </a>
        </p>
        <p>This link will expire in 30 minutes.</p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
    text: `Hi ${name}, reset your password here: ${resetUrl}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await kv.get<StoredUser>(`user:${normalizedEmail}`);

    // Do not reveal whether account exists.
    if (!user) {
      return NextResponse.json(
        {
          message:
            "If an account exists with this email, a reset link has been sent.",
        },
        { status: 200 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "This account uses Google login. Please sign in with Google.",
        },
        { status: 400 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await kv.set(
      `password-reset:${tokenHash}`,
      {
        email: normalizedEmail,
        createdAt: new Date().toISOString(),
      },
      {
        ex: 60 * 30,
      },
    );

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    await sendResetEmail({
      email: normalizedEmail,
      name: user.name || "BUAC Member",
      resetUrl,
    });

    return NextResponse.json(
      {
        message:
          "If an account exists with this email, a reset link has been sent.",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Forgot password error:", error);

    return NextResponse.json(
      { message: "Failed to send password reset email" },
      { status: 500 },
    );
  }
}
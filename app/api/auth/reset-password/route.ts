import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

interface StoredUser {
  name: string;
  email: string;
  passwordHash?: string;
  role: "member" | "alumni" | "admin";
  profile?: Record<string, unknown>;
  createdAt?: string;
}

interface ResetTokenPayload {
  sub: string;
  purpose?: string;
  role?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token =
      typeof body.token === "string" ? body.token.trim() : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    if (!token || !password) {
      return NextResponse.json(
        { message: "Reset token and new password are required." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const jwtSecret = process.env.adminJwtSecret || "";

    if (!jwtSecret) {
      return NextResponse.json(
        { message: "Server is missing JWT secret." },
        { status: 500 },
      );
    }

    let payload: ResetTokenPayload;

    try {
      payload = jwt.verify(token, jwtSecret) as ResetTokenPayload;
    } catch {
      return NextResponse.json(
        { message: "This reset link is invalid or has expired." },
        { status: 400 },
      );
    }

    const email = String(payload.sub || "")
      .trim()
      .toLowerCase();

    if (!email || payload.purpose !== "password-reset") {
      return NextResponse.json(
        { message: "This reset link is invalid." },
        { status: 400 },
      );
    }

    const storedReset = await kv.get<{ token?: string }>(
      `password-reset:${email}`,
    );

    if (!storedReset?.token || storedReset.token !== token) {
      return NextResponse.json(
        { message: "This reset link is invalid or has already been used." },
        { status: 400 },
      );
    }

    const user = await kv.get<StoredUser>(`user:${email}`);

    if (!user) {
      return NextResponse.json(
        { message: "Account not found." },
        { status: 404 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await kv.set(`user:${email}`, {
      ...user,
      email,
      passwordHash,
    });

    await kv.del(`password-reset:${email}`);

    return NextResponse.json(
      { message: "Password reset successfully. You can now sign in." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[RESET PASSWORD] Unexpected error:", error);

    return NextResponse.json(
      { message: "Failed to reset password." },
      { status: 500 },
    );
  }
}
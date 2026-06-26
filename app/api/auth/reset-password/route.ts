import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { kv } from "@/lib/kv";

interface ResetRecord {
  email: string;
  createdAt: string;
}

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "member" | "alumni" | "admin";
  profile?: Record<string, unknown>;
  createdAt: string;
  authProvider?: "google" | "password";
}

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and password are required" },
        { status: 400 },
      );
    }

    if (String(password).length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(String(token))
      .digest("hex");

    const resetRecord = await kv.get<ResetRecord>(
      `password-reset:${tokenHash}`,
    );

    if (!resetRecord?.email) {
      return NextResponse.json(
        { message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    const user = await kv.get<StoredUser>(`user:${resetRecord.email}`);

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await kv.set(`user:${resetRecord.email}`, {
      ...user,
      passwordHash,
      authProvider: "password",
    });

    await kv.del(`password-reset:${tokenHash}`);

    return NextResponse.json(
      { message: "Password reset successful" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Reset password error:", error);

    return NextResponse.json(
      { message: "Failed to reset password" },
      { status: 500 },
    );
  }
}
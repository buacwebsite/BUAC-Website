import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "member" | "alumni" | "admin";
  profile?: Record<string, unknown>;
  createdAt: string;
  authProvider?: string;
}

async function getSessionEmail(): Promise<string | null> {
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

export async function GET() {
  const email = await getSessionEmail();

  if (!email) {
    return NextResponse.json(
      { error: "Please log in first to view your profile." },
      { status: 401 },
    );
  }

  try {
    const user = await kv.get<StoredUser>(`user:${email}`);

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          profile: user.profile || {},
          createdAt: user.createdAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile GET error:", error);

    return NextResponse.json(
      { error: "Failed to load profile." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const email = await getSessionEmail();

  if (!email) {
    return NextResponse.json(
      { error: "Please log in first." },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    const user = await kv.get<StoredUser>(`user:${email}`);

    if (!user) {
      return NextResponse.json(
        { error: "User profile not found." },
        { status: 404 },
      );
    }

    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : user.name;

    const incomingProfile =
      body.profile && typeof body.profile === "object"
        ? body.profile
        : {};

    const updatedProfile = {
      ...(user.profile || {}),
      ...incomingProfile,
    };

    let passwordHash = user.passwordHash;

    if (body.newPassword) {
      if (String(body.newPassword).length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters." },
          { status: 400 },
        );
      }

      if (!body.currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to set a new password." },
          { status: 400 },
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Cannot change password for this account type." },
          { status: 400 },
        );
      }

      const validPassword = await bcrypt.compare(
        String(body.currentPassword),
        user.passwordHash,
      );

      if (!validPassword) {
        return NextResponse.json(
          { error: "Current password is incorrect." },
          { status: 400 },
        );
      }

      passwordHash = await bcrypt.hash(String(body.newPassword), 10);
    }

    const updatedUser: StoredUser = {
      ...user,
      name,
      passwordHash,
      profile: updatedProfile,
    };

    await kv.set(`user:${email}`, updatedUser);

    return NextResponse.json(
      {
        ok: true,
        message: "Profile updated successfully.",
        user: {
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          profile: updatedUser.profile,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Profile PUT error:", error);

    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}
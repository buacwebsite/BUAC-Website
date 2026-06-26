import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

interface GoogleTokenInfo {
  aud: string;
  email: string;
  email_verified: string;
  name?: string;
  picture?: string;
  sub: string;
}

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: "member" | "alumni" | "admin";
  profile?: Record<string, unknown>;
  createdAt: string;
  authProvider?: "google" | "password";
  picture?: string;
}

function getRoleFromEmail(email: string): "member" | "alumni" {
  if (email.endsWith("@g.bracu.ac.bd")) return "member";
  return "alumni";
}

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json();

    if (!credential) {
      return NextResponse.json(
        { message: "Google credential is required" },
        { status: 400 },
      );
    }

    const tokenInfoRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(
        credential,
      )}`,
    );

    if (!tokenInfoRes.ok) {
      return NextResponse.json(
        { message: "Invalid Google credential" },
        { status: 401 },
      );
    }

    const tokenInfo = (await tokenInfoRes.json()) as GoogleTokenInfo;

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

    if (!googleClientId || tokenInfo.aud !== googleClientId) {
      return NextResponse.json(
        { message: "Google client mismatch" },
        { status: 401 },
      );
    }

    if (tokenInfo.email_verified !== "true") {
      return NextResponse.json(
        { message: "Google email is not verified" },
        { status: 401 },
      );
    }

    const email = tokenInfo.email.trim().toLowerCase();
    const name = tokenInfo.name || email.split("@")[0];

    if (!process.env.adminJwtSecret) {
      return NextResponse.json(
        { message: "JWT secret is missing" },
        { status: 500 },
      );
    }

    let role: "admin" | "member" | "alumni" = getRoleFromEmail(email);

    if (email === process.env.adminMail) {
      role = "admin";
    }

    if (role !== "admin") {
      const existingUser = await kv.get<StoredUser>(`user:${email}`);

      if (!existingUser) {
        const newUser: StoredUser = {
          name,
          email,
          passwordHash: "",
          role,
          profile: {
            googleId: tokenInfo.sub,
            picture: tokenInfo.picture || "",
          },
          createdAt: new Date().toISOString(),
          authProvider: "google",
          picture: tokenInfo.picture || "",
        };

        await kv.set(`user:${email}`, newUser);

        const usersList = (await kv.get<string[]>("users:list")) || [];

        if (!usersList.includes(email)) {
          usersList.push(email);
          await kv.set("users:list", usersList);
        }
      }
    }

    const token = jwt.sign(
      {
        sub: email,
        role,
        name,
      },
      process.env.adminJwtSecret,
      { expiresIn: role === "admin" ? "1d" : "7d" },
    );

    const res = NextResponse.json(
      {
        message: "Google login successful",
        user: {
          name,
          email,
          role,
        },
      },
      { status: 200 },
    );

    res.cookies.set({
      name: "user-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: role === "admin" ? 60 * 60 * 6 : 60 * 60 * 24 * 7,
      path: "/",
    });

    if (role === "admin") {
      res.cookies.set({
        name: "admin-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 6,
        path: "/",
      });
    }

    return res;
  } catch (error) {
    console.error("Google auth error:", error);

    return NextResponse.json(
      { message: "Google authentication failed" },
      { status: 500 },
    );
  }
}
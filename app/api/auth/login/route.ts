import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

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

type LoginRole = "member" | "alumni" | "admin";

export async function POST(request: NextRequest) {
  try {
    const {
      email,
      password,
      role,
    }: {
      email?: string;
      password?: string;
      role?: LoginRole;
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    /**
     * Admin login
     */
    if (role === "admin") {
      const adminMail = process.env.adminMail;
      const adminPasswordHash = process.env.adminPassword;
      if (!adminMail || !adminPasswordHash || !process.env.adminJwtSecret) {
        return NextResponse.json(
          { message: "Admin environment variables are missing" },
          { status: 500 },
        );
      }

      if (normalizedEmail !== adminMail) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 },
        );
      }

      const decodedHash = Buffer.from(adminPasswordHash, "base64").toString();
      const isValid = await bcrypt.compare(password, decodedHash);
      if (!isValid) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 },
        );
      }

      const token = jwt.sign(
        {
          sub: normalizedEmail,
          role: "admin",
          name: "Admin",
        },
        process.env.adminJwtSecret,
        { expiresIn: "1d" },
      );

      const res = NextResponse.json(
        {
          message: "Login successful",
          user: {
            name: "Admin",
            email: normalizedEmail,
            role: "admin",
          },
        },
        { status: 200 },
      );

      res.cookies.set({
        name: "admin-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 6,
        path: "/",
      });

      res.cookies.set({
        name: "user-token",
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60 * 6,
        path: "/",
      });

      return res;
    }

    /**
     * Member / Alumni login
     */
    const user = await kv.get<StoredUser>(`user:${normalizedEmail}`);
    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          message:
            "This account uses Google login. Please sign in with Google.",
        },
        { status: 401 },
      );
    }

    if (role && user.role !== role) {
      return NextResponse.json(
        { message: `This account is registered as ${user.role}, not ${role}` },
        { status: 401 },
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!process.env.adminJwtSecret) {
      return NextResponse.json(
        { message: "JWT secret is missing" },
        { status: 500 },
      );
    }

    const token = jwt.sign(
      {
        sub: normalizedEmail,
        role: user.role,
        name: user.name,
      },
      process.env.adminJwtSecret,
      { expiresIn: "7d" },
    );

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
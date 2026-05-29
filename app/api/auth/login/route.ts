import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

interface StoredUser {
  name: string;
  email: string;
  passwordHash: string;
  role: string;
  createdAt: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password, role } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Admin login
    if (role === "admin") {
      const adminMail = process.env.adminMail;
      const adminPasswordHash = process.env.adminPassword;

      if (email !== adminMail) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      const decodedHash = Buffer.from(adminPasswordHash || "", "base64").toString();
      const isValid = await bcrypt.compare(password, decodedHash);

      if (!isValid) {
        return NextResponse.json(
          { message: "Invalid email or password" },
          { status: 401 }
        );
      }

      const token = jwt.sign(
        { sub: email, role: "admin", name: "Admin" },
        process.env.adminJwtSecret || "",
        { expiresIn: "1d" }
      );

      const res = NextResponse.json(
        { message: "Login successful", user: { name: "Admin", email, role: "admin" } },
        { status: 200 }
      );

      res.cookies.set({
        name: "admin-token",
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 6,
      });

      res.cookies.set({
        name: "user-token",
        value: token,
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 60 * 60 * 6,
      });

      return res;
    }

    // Member / Alumni login
    const user = await kv.get<StoredUser>(`user:${email}`);

    if (!user) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check role matches
    if (role && user.role !== role) {
      return NextResponse.json(
        { message: `This account is registered as ${user.role}, not ${role}` },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const token = jwt.sign(
      { sub: email, role: user.role, name: user.name },
      process.env.adminJwtSecret || "",
      { expiresIn: "7d" }
    );

    const res = NextResponse.json(
      {
        message: "Login successful",
        user: { name: user.name, email: user.email, role: user.role },
      },
      { status: 200 }
    );

    res.cookies.set({
      name: "user-token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
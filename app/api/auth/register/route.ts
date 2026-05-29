import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    if (!["member", "alumni"].includes(role)) {
      return NextResponse.json(
        { message: "Invalid role" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await kv.get(`user:${email}`);
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Store user in Redis
    const user = {
      name,
      email,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${email}`, user);

    // Add to users list
    const usersList = (await kv.get<string[]>("users:list")) || [];
    usersList.push(email);
    await kv.set("users:list", usersList);

    // Generate JWT
    const token = jwt.sign(
      { sub: email, role, name },
      process.env.adminJwtSecret || "",
      { expiresIn: "7d" }
    );

    const res = NextResponse.json(
      { message: "Account created successfully", user: { name, email, role } },
      { status: 201 }
    );

    res.cookies.set({
      name: "user-token",
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}
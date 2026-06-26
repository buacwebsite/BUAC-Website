import { NextRequest, NextResponse } from "next/server";
import { env } from "../../../../env";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function POST(request: NextRequest) {
  try {
    const { adminMail, adminPassword } = await request.json();

    if (!adminMail || !adminPassword) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    if (adminMail !== env.adminMail) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const decodedHash = Buffer.from(env.adminPassword, "base64").toString();
    const isPasswordValid = await bcrypt.compare(adminPassword, decodedHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: 401 },
      );
    }

    const token = jwt.sign(
      {
        sub: adminMail,
        role: "admin",
        name: "Admin",
      },
      env.adminJwtSecret,
      { expiresIn: "1d" },
    );

    const res = NextResponse.json(
      { message: "Login successful" },
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
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
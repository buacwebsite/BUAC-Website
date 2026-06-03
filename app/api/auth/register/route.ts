import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { kv } from "@/lib/kv";

type RoleType = "member" | "alumni";

interface UserProfile {
  contact?: string;
  facebook?: string;
  varsityDepartment?: string;
  joinSemester?: string;
  buacDepartment?: string;
  buacPosition?: string;
  buacExDepartment?: string;
  buacExPosition?: string;
  panelPosition?: string;
}

const departments = [
  "Creative",
  "Event Management",
  "Human Resources and Management",
  "IT and Photography",
  "Publication and Marketing",
  "Panel",
];

const memberPositions = [
  "General Member",
  "Executive",
  "Coordinator",
  "Assistant Director",
  "Director",
];

const alumniPositions = ["Coordinator", "Assistant Director", "Director"];

const memberPanelPositions = [
  "President",
  "Vice President",
  "General Secretary",
  "Treasurer",
];

const alumniPanelPositions = [
  "President",
  "Vice President",
  "General Secretary",
  "Treasurer",
  "Chief of Execution",
  "Chief of Finance",
  "Chief of Tour Operation",
  "Chief of Risk Management",
];

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      email,
      password,
      role,
      profile,
    }: {
      name?: string;
      email?: string;
      password?: string;
      role?: RoleType;
      profile?: UserProfile;
    } = await request.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    if (!["member", "alumni"].includes(role)) {
      return NextResponse.json({ message: "Invalid role" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "member" && !normalizedEmail.endsWith("@g.bracu.ac.bd")) {
      return NextResponse.json(
        { message: "Members must use a valid BRACU G Suite email" },
        { status: 400 },
      );
    }

    if (role === "alumni" && !normalizedEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { message: "Alumni must use a Gmail address" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    if (!profile?.contact || !profile?.facebook) {
      return NextResponse.json(
        { message: "Contact number and Facebook ID link are required" },
        { status: 400 },
      );
    }

    if (role === "member") {
      if (
        !profile.varsityDepartment ||
        !profile.joinSemester ||
        !profile.buacDepartment
      ) {
        return NextResponse.json(
          { message: "Missing member profile information" },
          { status: 400 },
        );
      }

      if (!departments.includes(profile.buacDepartment)) {
        return NextResponse.json(
          { message: "Invalid BUAC department" },
          { status: 400 },
        );
      }

      if (profile.buacDepartment === "Panel") {
        if (
          !profile.panelPosition ||
          !memberPanelPositions.includes(profile.panelPosition)
        ) {
          return NextResponse.json(
            { message: "Invalid member panel position" },
            { status: 400 },
          );
        }
      } else {
        if (
          !profile.buacPosition ||
          !memberPositions.includes(profile.buacPosition)
        ) {
          return NextResponse.json(
            { message: "Invalid BUAC position" },
            { status: 400 },
          );
        }
      }
    }

    if (role === "alumni") {
      if (!profile.buacExDepartment) {
        return NextResponse.json(
          { message: "Missing alumni profile information" },
          { status: 400 },
        );
      }

      if (!departments.includes(profile.buacExDepartment)) {
        return NextResponse.json(
          { message: "Invalid BUAC ex department" },
          { status: 400 },
        );
      }

      if (profile.buacExDepartment === "Panel") {
        if (
          !profile.panelPosition ||
          !alumniPanelPositions.includes(profile.panelPosition)
        ) {
          return NextResponse.json(
            { message: "Invalid alumni panel position" },
            { status: 400 },
          );
        }
      } else {
        if (
          !profile.buacExPosition ||
          !alumniPositions.includes(profile.buacExPosition)
        ) {
          return NextResponse.json(
            { message: "Invalid BUAC ex position" },
            { status: 400 },
          );
        }
      }
    }

    const existingUser = await kv.get(`user:${normalizedEmail}`);

    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      name,
      email: normalizedEmail,
      passwordHash,
      role,
      profile: profile || {},
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${normalizedEmail}`, user);

    const usersList = (await kv.get<string[]>("users:list")) || [];

    if (!usersList.includes(normalizedEmail)) {
      usersList.push(normalizedEmail);
      await kv.set("users:list", usersList);
    }

    const token = jwt.sign(
      { sub: normalizedEmail, role, name },
      process.env.adminJwtSecret || "",
      { expiresIn: "7d" },
    );

    const res = NextResponse.json(
      {
        message: "Account created successfully",
        user: { name, email: normalizedEmail, role },
      },
      { status: 201 },
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
    console.error("Registration error:", error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
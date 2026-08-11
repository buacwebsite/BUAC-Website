import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import { kv } from "@/lib/kv";
import {
  sendMail,
  buildMemberWelcomeEmail,
  buildAlumniWelcomeEmail,
} from "@/lib/email";

type RoleType = "member" | "alumni";
type SemesterName = "Spring" | "Summer" | "Fall";

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
  bloodGroup?: string;
  donateBlood?: string;
}

interface SemesterSettings {
  semester: SemesterName;
  year: string;
  label: string;
  updatedAt: string;
}

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || "";

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

function getDefaultSemesterSettings(): SemesterSettings {
  const now = new Date();
  const month = now.getMonth();
  const year = String(now.getFullYear());

  let semester: SemesterName = "Spring";
  if (month >= 4 && month <= 7) {
    semester = "Summer";
  } else if (month >= 8) {
    semester = "Fall";
  }

  return {
    semester,
    year,
    label: `${semester} ${year}`,
    updatedAt: new Date().toISOString(),
  };
}

async function getActiveSemesterSettings() {
  const settings = await kv.get<SemesterSettings>("semester:settings");
  return settings || getDefaultSemesterSettings();
}

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
        { message: "All required fields must be filled" },
        { status: 400 },
      );
    }

    if (!["member", "alumni"].includes(role)) {
      return NextResponse.json({ message: "Invalid role selected" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (role === "member" && !normalizedEmail.endsWith("@g.bracu.ac.bd")) {
      return NextResponse.json(
        { message: "Members must register with a valid BRACU G Suite email (@g.bracu.ac.bd)" },
        { status: 400 },
      );
    }

    if (role === "alumni" && !normalizedEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { message: "Alumni must register with a valid Gmail address (@gmail.com)" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Password must be at least 6 characters long" },
        { status: 400 },
      );
    }

    if (!profile?.contact || !profile?.facebook) {
      return NextResponse.json(
        { message: "Contact number and Facebook profile link are required" },
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
          { message: "Missing member profile details" },
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
      } else if (
        !profile.buacPosition ||
        !memberPositions.includes(profile.buacPosition)
      ) {
        return NextResponse.json(
          { message: "Invalid BUAC position" },
          { status: 400 },
        );
      }
    }

    if (role === "alumni") {
      if (!profile.buacExDepartment) {
        return NextResponse.json(
          { message: "Missing alumni profile details" },
          { status: 400 },
        );
      }

      if (!departments.includes(profile.buacExDepartment)) {
        return NextResponse.json(
          { message: "Invalid BUAC ex-department" },
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
      } else if (
        !profile.buacExPosition ||
        !alumniPositions.includes(profile.buacExPosition)
      ) {
        return NextResponse.json(
          { message: "Invalid BUAC ex-position" },
          { status: 400 },
        );
      }
    }

    const existingUser = await kv.get(`user:${normalizedEmail}`);
    if (existingUser) {
      return NextResponse.json(
        { message: "An account with this email address already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role,
      profile: profile || {},
      createdAt: new Date().toISOString(),
      authProvider: "password",
    };

    await kv.set(`user:${normalizedEmail}`, user);

    const usersList = (await kv.get<string[]>("users:list")) || [];
    if (!usersList.includes(normalizedEmail)) {
      usersList.push(normalizedEmail);
      await kv.set("users:list", usersList);
    }

    const settings = await getActiveSemesterSettings();

    // 1. Sync registration payload to Google Sheets Apps Script
    if (GOOGLE_SCRIPT_URL) {
      try {
        await axios.post(GOOGLE_SCRIPT_URL, {
          formType: role === "member" ? "member-register" : "alumni-register",
          userType: role,
          semester: settings.semester,
          year: settings.year,
          activeSemesterLabel: settings.label,
          tabName:
            role === "member"
              ? `Members ${settings.semester} ${settings.year}`
              : `Alumni ${settings.semester} ${settings.year}`,
          name: name.trim(),
          email: normalizedEmail,
          contact: profile?.contact || "",
          facebook: profile?.facebook || "",
          varsityDepartment: profile?.varsityDepartment || "",
          joinSemester: profile?.joinSemester || "",
          buacDepartment:
            profile?.buacDepartment || profile?.buacExDepartment || "",
          buacPosition:
            profile?.buacPosition ||
            profile?.buacExPosition ||
            profile?.panelPosition ||
            "",
          bloodGroup: profile?.bloodGroup || "Unknown",
          donateBlood: profile?.donateBlood || "no",
          timestamp: new Date().toISOString(),
        });
      } catch (sheetError) {
        console.error("Google Sheets sync failed:", sheetError);
      }
    }

    // 2. Dispatch Welcome Email
    try {
      const welcomeMailData =
        role === "member"
          ? buildMemberWelcomeEmail(name.trim())
          : buildAlumniWelcomeEmail(name.trim());

      await sendMail({
        to: normalizedEmail,
        subject: welcomeMailData.subject,
        html: welcomeMailData.html,
        text: welcomeMailData.text,
      });
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
    }

    // 3. Generate JWT Token
    const token = jwt.sign(
      { sub: normalizedEmail, role, name: name.trim() },
      process.env.adminJwtSecret || "buac_secret_key_2026",
      { expiresIn: "7d" },
    );

    const response = NextResponse.json(
      {
        message: "Account created successfully",
        user: { name: name.trim(), email: normalizedEmail, role },
      },
      { status: 201 },
    );

    response.cookies.set({
      name: "user-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Something went wrong during registration" },
      { status: 500 },
    );
  }
}
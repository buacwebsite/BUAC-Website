import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "@/env";

function isBcryptHash(value: string) {
  return /^\$2[aby]\$\d{2}\$/.test(value);
}

function getPossiblePasswordHashes(
  configuredPassword: string,
) {
  const hashes: string[] = [];

  const rawValue = configuredPassword.trim();

  if (isBcryptHash(rawValue)) {
    hashes.push(rawValue);
  }

  try {
    const decoded = Buffer.from(
      rawValue,
      "base64",
    ).toString("utf8");

    if (
      decoded &&
      isBcryptHash(decoded)
    ) {
      hashes.push(decoded);
    }
  } catch {
    // Invalid base64 is ignored.
  }

  return Array.from(new Set(hashes));
}

export async function POST(
  request: NextRequest,
) {
  try {
    const body = await request.json();

    const adminMail = String(
      body.adminMail || "",
    )
      .trim()
      .toLowerCase();

    const adminPassword = String(
      body.adminPassword || "",
    );

    if (!adminMail || !adminPassword) {
      return NextResponse.json(
        {
          message:
            "Email and password are required.",
        },
        {
          status: 400,
        },
      );
    }

    const configuredAdminMail =
      env.adminMail.trim().toLowerCase();

    if (
      adminMail !== configuredAdminMail
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    const possibleHashes =
      getPossiblePasswordHashes(
        env.adminPassword,
      );

    if (!possibleHashes.length) {
      console.error(
        "Admin password is not a valid bcrypt or base64 bcrypt hash.",
      );

      return NextResponse.json(
        {
          message:
            "Admin password configuration is invalid.",
        },
        {
          status: 500,
        },
      );
    }

    let passwordValid = false;

    for (const hash of possibleHashes) {
      const matches = await bcrypt.compare(
        adminPassword,
        hash,
      );

      if (matches) {
        passwordValid = true;
        break;
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        {
          message:
            "Invalid email or password.",
        },
        {
          status: 401,
        },
      );
    }

    const secret = env.adminJwtSecret;

    const token = jwt.sign(
      {
        sub: adminMail,
        role: "admin",
        name: "Admin",
      },
      secret,
      {
        expiresIn: "1d",
      },
    );

    const response = NextResponse.json(
      {
        message: "Admin login successful.",
        user: {
          email: adminMail,
          name: "Admin",
          role: "admin",
        },
      },
      {
        status: 200,
      },
    );

    response.cookies.set({
      name: "admin-token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    response.cookies.delete("user-token");

    return response;
  } catch (error) {
    console.error("Admin login error:", error);

    return NextResponse.json(
      {
        message:
          "Something went wrong during admin login.",
      },
      {
        status: 500,
      },
    );
  }
}
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

interface TokenPayload {
  sub: string;
  role: string;
  name: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const adminToken = cookieStore.get("admin-token")?.value;

    if (!adminToken) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const secret = process.env.adminJwtSecret || "";
    if (!secret) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = jwt.verify(adminToken, secret) as TokenPayload;

    if (payload && payload.role === "admin") {
      return NextResponse.json(
        {
          user: {
            email: payload.sub || process.env.adminMail || "admin@example.com",
            name: payload.name || "Admin",
            role: "admin" as const,
          },
        },
        { status: 200 },
      );
    }

    return NextResponse.json({ user: null }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userToken = cookieStore.get("user-token")?.value;
    const adminToken = cookieStore.get("admin-token")?.value;

    const token = adminToken || userToken;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const payload = jwt.verify(token, process.env.adminJwtSecret || "") as {
      sub: string;
      role: string;
      name: string;
    };

    return NextResponse.json(
      {
        user: {
          email: payload.sub,
          name: payload.name,
          role: payload.role,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}
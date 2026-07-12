import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

interface StoredUser {
  name: string;
  email: string;
  role: "member" | "alumni" | "admin";
  profile?: {
    contact?: string;
    bloodGroup?: string;
    donateBlood?: string;
    facebook?: string;
  };
}

// Only logged-in users can view the blood donation directory
async function isAuthenticated() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("user-token")?.value ||
    cookieStore.get("admin-token")?.value;
  if (!token) return false;
  try {
    jwt.verify(token, process.env.adminJwtSecret || "");
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const usersList = (await kv.get<string[]>("users:list")) || [];
    const donors: Array<{
      name: string;
      bloodGroup: string;
      contact: string;
      facebook: string;
      role: string;
    }> = [];

    for (const email of usersList) {
      const user = await kv.get<StoredUser>(`user:${email}`);
      if (!user) continue;
      if (user.profile?.donateBlood === "yes") {
        donors.push({
          name: user.name,
          bloodGroup: user.profile?.bloodGroup || "Unknown",
          contact: user.profile?.contact || "",
          facebook: user.profile?.facebook || "",
          role: user.role,
        });
      }
    }

    return NextResponse.json({ donors });
  } catch (err) {
    console.error("Blood donation fetch error:", err);
    return NextResponse.json(
      { error: "internal error" },
      { status: 500 },
    );
  }
}
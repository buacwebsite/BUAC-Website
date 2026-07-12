import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = "force-dynamic";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "event" | "update" | "general";
  createdAt: string;
}

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

// GET — any logged-in user can read notifications
export async function GET() {
  const authed = await isAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const notifications =
      (await kv.get<Notification[]>("notifications")) || [];
    return NextResponse.json({ notifications });
  } catch (err) {
    console.error("Notifications fetch error:", err);
    return NextResponse.json({ notifications: [] });
  }
}

// PUT — only admin can update the full list
export async function PUT(req: Request) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (!Array.isArray(body.notifications)) {
      return NextResponse.json(
        { error: "notifications must be an array" },
        { status: 400 },
      );
    }
    await kv.set("notifications", body.notifications);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notifications update error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
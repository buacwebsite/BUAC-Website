import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const res = await kv.get("tours");
    return NextResponse.json({ tours: Array.isArray(res) ? res : [] });
  } catch (err) {
    console.error("Tours GET error:", err);
    return NextResponse.json({ error: "Failed to fetch tours" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.tours)) {
      return NextResponse.json({ error: "missing tours data" }, { status: 400 });
    }

    await kv.set("tours", body.tours);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Tours PUT error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
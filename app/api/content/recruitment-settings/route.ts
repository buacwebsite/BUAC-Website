import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await kv.get("recruitment:settings") as { isActive: boolean } | null;
    return NextResponse.json({ 
      isActive: settings?.isActive ?? false 
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    if (body.isActive === undefined) {
      return NextResponse.json({ error: "missing isActive field" }, { status: 400 });
    }
    await kv.set("recruitment:settings", { isActive: body.isActive });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

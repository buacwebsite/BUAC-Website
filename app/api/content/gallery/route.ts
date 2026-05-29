import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

const defaultContent = [
  {
    id: 1,
    url: "",
    caption: "Adventure Expedition 2025",
  },
  {
    id: 2,
    url: "",
    caption: "Team Building Camp",
  },
  {
    id: 3,
    url: "",
    caption: "Summit Success",
  },
];

export async function GET() {
  try {
    const res = await kv.get("gallery");
    return NextResponse.json({ images: res || defaultContent });
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
    if (!body || !body.images) {
      return NextResponse.json(
        { error: "missing images data" },
        { status: 400 }
      );
    }
    await kv.set("gallery", body.images);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

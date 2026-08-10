import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface GalleryVideo {
  id: number;
  url: string;
  title: string;
}

const defaultContent: GalleryVideo[] = [];

export async function GET() {
  try {
    const res = await kv.get<GalleryVideo[]>("gallery-videos");
    return NextResponse.json({
      videos: Array.isArray(res) ? res : defaultContent,
    });
  } catch (err) {
    console.error("Failed to fetch gallery videos:", err);
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
    if (!body || !Array.isArray(body.videos)) {
      return NextResponse.json(
        { error: "missing videos data" },
        { status: 400 },
      );
    }

    await kv.set("gallery-videos", body.videos);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Failed to update gallery videos:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
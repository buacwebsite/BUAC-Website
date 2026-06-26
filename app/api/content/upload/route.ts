import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  const refererHeader = req.headers.get("referer");

  let refererPath = "";

  if (refererHeader) {
    try {
      refererPath = new URL(refererHeader).pathname;
    } catch {
      refererPath = "";
    }
  }

  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "missing file" }, { status: 400 });
    }

    let folder = "general_uploads";

    if (refererPath === "/") {
      folder = "landing_hero_images";
    } else if (refererPath === "/about") {
      folder = "about_page_images";
    } else if (refererPath === "/tours") {
      folder = "tours_images";
    } else if (refererPath === "/activities") {
      folder = "activities_images";
    } else if (refererPath === "/gallery") {
      folder = "gallery_images";
    } else if (refererPath === "/panel-eb") {
      folder = "panel_eb_images";
    }

    const safeFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");

    const blob = await put(`${folder}/${Date.now()}_${safeFileName}`, file, {
      access: "public",
    });

    return NextResponse.json({ ok: true, url: blob.url });
  } catch (err) {
    console.error("Upload error:", err);

    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
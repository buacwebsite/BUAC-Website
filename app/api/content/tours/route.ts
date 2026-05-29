import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

const defaultContent = [
    {
      id: 1,
      name: "AMIYAKHUM",
      subtitle: "",
      location: "Bandarban, Bangladesh",
      icon: "🏔️",
      elevation: "1,800 ft elevation",
      visitCount: 5,
      latestVisitYear: "2025",
      layoutType: "left",
      gridLayout: "standard",
      images: [
        { type: "main", alt: "Main Image", url: "" },
        { type: "small", alt: "Image 2", url: "" },
        { type: "small", alt: "Image 3", url: "" }
      ]
    },
    {
      id: 2,
      name: "BANDARBAN",
      subtitle: "HILLS",
      location: "Bandarban, Bangladesh",
      icon: "🏔️",
      elevation: "3,500 ft elevation",
      visitCount: 8,
      latestVisitYear: "2024",
      layoutType: "right",
      gridLayout: "standard",
      images: [
        { type: "main", alt: "Main Image", url: "" },
        { type: "small", alt: "Image 2", url: "" },
        { type: "small", alt: "Image 3", url: "" }
      ]
    },
    {
      id: 3,
      name: "COX'S",
      subtitle: "BAZAR",
      location: "Cox's Bazar, Bangladesh",
      icon: "🏖️",
      description: "World's longest beach",
      visitCount: 12,
      latestVisitYear: "2025",
      layoutType: "left",
      gridLayout: "standard",
      images: [
        { type: "main", alt: "Beach Panorama", url: "" },
        { type: "small", alt: "Sunset", url: "" },
        { type: "small", alt: "Camp", url: "" }
      ]
    },
    {
      id: 4,
      name: "SREEMANGAL",
      subtitle: "TEA GARDENS",
      location: "Sylhet, Bangladesh",
      icon: "🍃",
      description: "Tea Capital",
      visitCount: 6,
      latestVisitYear: "2024",
      layoutType: "right",
      gridLayout: "standard",
      images: [
        { type: "main", alt: "Tea Garden Panorama", url: "" },
        { type: "small", alt: "Garden", url: "" },
        { type: "small", alt: "Trail", url: "" }
      ]
    }
  ];

export async function GET() {
  try {
    const res = await kv.get("tours");
    // console.log("Tours content fetched:", res);
    return NextResponse.json({ tours: res || defaultContent });
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
    if (!body || !body.tours) {
      return NextResponse.json({ error: "missing tours data" }, { status: 400 });
    }
    // Store the tours array directly
    await kv.set("tours", body.tours);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

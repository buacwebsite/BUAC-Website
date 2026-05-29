import { NextResponse } from "next/server";
import {kv} from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const aboutText = await kv.get<string>("about:text");
    const stats = await kv.get<Array<{ value: string; label: string }>>("about:stats");
    const quotes = await kv.get("quotes");

    return NextResponse.json({
      aboutText: aboutText || "Founded in 2015 by passionate adventurers at BRACU, we started with 12 members exploring Bangladesh's hidden gems. Today, we're a family of 200+ explorers who've completed 100+ expeditions across 50+ locations, building a community united by our love for adventure and the great outdoors.",
      stats: stats || [
        { value: "200+", label: "Active Members" },
        { value: "100+", label: "Expeditions" },
        { value: "50+", label: "Locations" },
        { value: "9+", label: "Years Strong" },
      ],
      quotes: quotes || [],
    });
  } catch (error) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      { error: "Failed to fetch about content" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { aboutText, stats, quotes } = await request.json();

    if (aboutText !== undefined) {
      await kv.set("about:text", aboutText);
    }

    if (stats !== undefined) {
      await kv.set("about:stats", stats);
    }

    if (quotes !== undefined) {
      await kv.set("quotes", quotes);
    }

    return NextResponse.json({
      success: true,
      message: "About content updated successfully",
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    return NextResponse.json(
      { error: "Failed to update about content" },
      { status: 500 }
    );
  }
}

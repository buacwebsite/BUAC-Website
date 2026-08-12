import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface Quote {
  name: string;
  designation: string;
  quote: string;
  image: string;
}

interface Stat {
  value: string;
  label: string;
}

export async function GET() {
  try {
    const aboutText = await kv.get<string>("about:text");
    const stats = await kv.get<Stat[]>("about:stats");
    const quotes = await kv.get<Quote[]>("quotes");

    return NextResponse.json({
      aboutText: typeof aboutText === "string" ? aboutText : "",
      stats: Array.isArray(stats) ? stats : [],
      quotes: Array.isArray(quotes) ? quotes : [],
    });
  } catch (error) {
    console.error("Error fetching about content:", error);
    return NextResponse.json(
      { error: "Failed to fetch about content" },
      { status: 500 },
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

    if (aboutText !== undefined) await kv.set("about:text", aboutText);
    if (stats !== undefined) await kv.set("about:stats", stats);
    if (quotes !== undefined) await kv.set("quotes", quotes);

    return NextResponse.json({
      success: true,
      message: "About content updated successfully",
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    return NextResponse.json(
      { error: "Failed to update about content" },
      { status: 500 },
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface Objective {
  title: string;
  description: string;
}

export async function GET() {
  try {
    const visionText = await kv.get<string>("vision:text");
    const objectives = await kv.get<Objective[]>("vision:objectives");

    return NextResponse.json({
      visionText: typeof visionText === "string" ? visionText : "",
      objectives: Array.isArray(objectives) ? objectives : [],
    });
  } catch (error) {
    console.error("Error fetching vision content:", error);
    return NextResponse.json(
      { error: "Failed to fetch vision content" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await authenticateAdmin();
  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { visionText, objectives } = await request.json();

    await kv.set("vision:text", visionText || "");
    await kv.set("vision:objectives", Array.isArray(objectives) ? objectives : []);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating vision content:", error);
    return NextResponse.json(
      { error: "Failed to update vision content" },
      { status: 500 },
    );
  }
}
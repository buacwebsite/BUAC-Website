import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

function normalizeActivity(input: unknown, index: number): Activity {
  const item = (input && typeof input === "object" ? input : {}) as Partial<Activity>;
  const numericId = Number(item.id);

  return {
    id: Number.isFinite(numericId) && numericId > 0 ? numericId : index + 1,
    name: typeof item.name === "string" ? item.name.trim() : "",
    description: typeof item.description === "string" ? item.description.trim() : "",
    category: typeof item.category === "string" ? item.category.trim() : "",
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.trim() : "",
  };
}

function normalizeActivities(input: unknown): Activity[] {
  if (!Array.isArray(input)) return [];
  return input.map((item, index) => normalizeActivity(item, index));
}

export async function GET() {
  try {
    const saved = await kv.get<unknown>("activities");
    const activities = Array.isArray(saved) ? normalizeActivities(saved) : [];

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("Activities GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body || !Array.isArray(body.activities)) {
      return NextResponse.json(
        { error: "missing activities data" },
        { status: 400 },
      );
    }

    const activities = normalizeActivities(body.activities);
    await kv.set("activities", activities);

    return NextResponse.json({ ok: true, activities }, { status: 200 });
  } catch (error) {
    console.error("Activities PUT error:", error);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
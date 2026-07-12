import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const validKeys = ["about", "campfire", "vision"];
const defaultOrder = ["about", "campfire", "vision"];

export async function GET() {
  try {
    const order = await kv.get<string[]>("home:section-order");
    const clean =
      Array.isArray(order) && order.length
        ? order.filter((k) => validKeys.includes(k))
        : defaultOrder;

    // ensure every valid section is present even if missing from stored data
    validKeys.forEach((k) => {
      if (!clean.includes(k)) clean.push(k);
    });

    return NextResponse.json({ order: clean });
  } catch (err) {
    console.error("Home order fetch error:", err);
    return NextResponse.json({ order: defaultOrder });
  }
}

export async function PUT(req: NextRequest) {
  const isAdmin = await authenticateAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!Array.isArray(body.order)) {
      return NextResponse.json(
        { error: "order must be an array" },
        { status: 400 },
      );
    }

    const cleaned = body.order.filter((k: string) => validKeys.includes(k));
    validKeys.forEach((k) => {
      if (!cleaned.includes(k)) cleaned.push(k);
    });

    await kv.set("home:section-order", cleaned);
    return NextResponse.json({ ok: true, order: cleaned });
  } catch (err) {
    console.error("Home order update error:", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
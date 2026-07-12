import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const count = (await kv.get<number>("club-fair:count")) ?? 0;
    return NextResponse.json({ count });
  } catch (err) {
    console.error("Club fair count error:", err);
    return NextResponse.json({ count: 0 });
  }
}
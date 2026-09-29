import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";
import {
  CLUB_FAIR_WINDOW_KEY,
  defaultClubFairWindow,
  getClubFairWindowStatus,
  normalizeClubFairWindow,
  type ClubFairWindow,
} from "@/lib/clubFairWindow";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const stored = await kv.get<ClubFairWindow>(CLUB_FAIR_WINDOW_KEY);
    const window = normalizeClubFairWindow(stored);

    return NextResponse.json(
      {
        window,
        status: getClubFairWindowStatus(window),
        serverTime: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Club Fair window GET error:", error);

    return NextResponse.json(
      {
        window: defaultClubFairWindow,
        status: "open",
        serverTime: new Date().toISOString(),
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const window = normalizeClubFairWindow(body);

    if (window.enabled) {
      if (!window.startAt || !window.endAt) {
        return NextResponse.json(
          { error: "Please set both a start date and an end date." },
          { status: 400 },
        );
      }

      if (Date.parse(window.endAt) <= Date.parse(window.startAt)) {
        return NextResponse.json(
          { error: "The end date must be after the start date." },
          { status: 400 },
        );
      }
    }

    const saved: ClubFairWindow = {
      ...window,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(CLUB_FAIR_WINDOW_KEY, saved);

    return NextResponse.json(
      {
        ok: true,
        window: saved,
        status: getClubFairWindowStatus(saved),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Club Fair window PUT error:", error);

    return NextResponse.json(
      { error: "Failed to save the registration window." },
      { status: 500 },
    );
  }
}
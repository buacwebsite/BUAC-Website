import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export type ClubFairSectionId =
  | "counter"
  | "looking"
  | "application"
  | "whyJoin"
  | "cta";

const validSectionIds: ClubFairSectionId[] = [
  "counter",
  "looking",
  "application",
  "whyJoin",
  "cta",
];

const defaultOrder: ClubFairSectionId[] = [
  "counter",
  "looking",
  "application",
  "whyJoin",
  "cta",
];

function normalizeOrder(input: unknown): ClubFairSectionId[] {
  const incoming = Array.isArray(input) ? input : [];

  const validItems = incoming.filter(
    (item): item is ClubFairSectionId =>
      typeof item === "string" &&
      validSectionIds.includes(item as ClubFairSectionId),
  );

  const uniqueItems = Array.from(new Set(validItems));

  validSectionIds.forEach((sectionId) => {
    if (!uniqueItems.includes(sectionId)) {
      uniqueItems.push(sectionId);
    }
  });

  return uniqueItems.length > 0 ? uniqueItems : [...defaultOrder];
}

export async function GET() {
  try {
    const storedOrder = await kv.get<unknown>(
      "club-fair:section-order",
    );

    return NextResponse.json(
      {
        order: normalizeOrder(storedOrder),
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Club Fair order GET error:", error);

    return NextResponse.json(
      {
        order: defaultOrder,
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json(
      {
        error: "unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const body = await request.json();

    if (!Array.isArray(body.order)) {
      return NextResponse.json(
        {
          error: "order must be an array",
        },
        { status: 400 },
      );
    }

    const order = normalizeOrder(body.order);

    await kv.set("club-fair:section-order", order);

    return NextResponse.json(
      {
        ok: true,
        order,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Club Fair order PUT error:", error);

    return NextResponse.json(
      {
        error: "Failed to save Club Fair section order.",
      },
      { status: 500 },
    );
  }
}
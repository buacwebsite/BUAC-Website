import { NextResponse } from "next/server";
import { z } from "zod";

import { authenticateAdmin } from "@/lib/auth";
import { kv } from "@/lib/kv";
import {
  DEFAULT_PANEL_HISTORY,
  PANEL_HISTORY_KEY,
} from "@/lib/panelHistory";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const responseHeaders = {
  "Cache-Control": "no-store",
};

const panelSchema = z.object({
  id: z.string().trim().min(1).max(100),

  number: z
    .number()
    .int("Panel number must be a whole number.")
    .min(1, "Panel number must be at least 1.")
    .max(999, "Panel number cannot exceed 999."),

  members: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Member names cannot be empty.")
        .max(150, "Each member name must be 150 characters or fewer."),
    )
    .min(1, "Each panel must have at least one member.")
    .max(50, "Each panel can have up to 50 members."),
});

const panelsSchema = z
  .array(panelSchema)
  .max(100, "You can save up to 100 panels.")
  .refine(
    (panels) =>
      new Set(panels.map((panel) => panel.number)).size ===
      panels.length,
    {
      message: "Each panel must have a different panel number.",
    },
  )
  .refine(
    (panels) =>
      new Set(panels.map((panel) => panel.id)).size ===
      panels.length,
    {
      message: "Each panel must have a unique ID.",
    },
  );

const updateSchema = z.object({
  panels: panelsSchema,
});

/* Public: load previous panels */
export async function GET() {
  try {
    const stored = await kv.get<unknown>(PANEL_HISTORY_KEY);

    // Missing data uses the initial list.
    // A saved [] is preserved and does not restore the defaults.
    const validated = panelsSchema.parse(
      stored ?? DEFAULT_PANEL_HISTORY,
    );

    const panels = [...validated].sort(
      (first, second) => first.number - second.number,
    );

    return NextResponse.json(
      { panels },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Panel history GET error:", error);

    return NextResponse.json(
      {
        error: "Unable to load previous panels.",
      },
      {
        status: 500,
        headers: responseHeaders,
      },
    );
  }
}

/* Admin only: save previous panels */
export async function PUT(request: Request) {
  try {
    const isAdmin = await authenticateAdmin();

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Please sign in as admin to edit previous panels.",
        },
        { status: 401 },
      );
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON request." },
        { status: 400 },
      );
    }

    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error:
            validation.error.issues[0]?.message ||
            "Invalid panel history data.",
        },
        { status: 400 },
      );
    }

    const panels = [...validation.data.panels].sort(
      (first, second) => first.number - second.number,
    );

    await kv.set(PANEL_HISTORY_KEY, panels);

    return NextResponse.json(
      {
        ok: true,
        panels,
      },
      { headers: responseHeaders },
    );
  } catch (error) {
    console.error("Panel history PUT error:", error);

    return NextResponse.json(
      {
        error: "Unable to save previous panels. Please try again.",
      },
      { status: 500 },
    );
  }
}
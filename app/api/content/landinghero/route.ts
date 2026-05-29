import {NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const images = await kv.get("hero-images");
        return NextResponse.json({ images: images ?? [] }, { status: 200 });    
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch hero images", err }, { status: 500 });
    }
}

export async function PUT(request: NextRequest) {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const body = await request.json();
        if (!body) {
            return NextResponse.json({ error: "missing body" }, { status: 400 });
        }
        await kv.set("hero-images", body);
        return NextResponse.json({ message: "Hero images updated successfully" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: "Failed to update hero images", err }, { status: 500 });
    }
}
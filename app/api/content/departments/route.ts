import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export async function GET() {
    try {
        const res = await kv.get("departments");
        return NextResponse.json({ departments: res });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const isAdmin = await authenticateAdmin();
    if (!isAdmin) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    try {
        const body = await req.json();
        if (!body) {
            return NextResponse.json({ error: "missing body" }, { status: 400 });
        }
        await kv.set("departments", body);
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}
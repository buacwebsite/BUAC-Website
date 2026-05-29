import {NextResponse} from "next/server";
import {put} from "@vercel/blob";
import { authenticateAdmin } from "@/lib/auth";

export async function POST(req: Request) {
    const refererHeader = req.headers.get('referer');
    let refererPath = '';
    if (refererHeader) {
        try {
            refererPath = new URL(refererHeader).pathname;
        } catch {
            refererPath = '';
        }
    }

    const isAdmin = await authenticateAdmin();
    console.log("isAdmin:", isAdmin);
    if (!isAdmin) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "missing file" }, { status: 400 });
        }

        let folder = ""
        if (refererPath === "/") {
            folder = `landing_hero_images`;
        } else if (refererPath === "/about") {
            folder = `about_page_images`;
        } else if (refererPath === "/tours") {
            folder = `tours_images`;
        }
        const blob = await put(`${folder}/${Date.now()}_${file.name}`, file, {
            access: 'public',
        });

        return NextResponse.json({ ok: true, url: blob.url });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "internal error" }, { status: 500 });
    }
}
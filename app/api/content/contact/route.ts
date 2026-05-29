import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

const defaultContent = {
  heading: "GET IN TOUCH",
  subheading: "Ready to embark on your next adventure? Reach out to us and let's start planning your journey into the wild.",
  location: {
    line1: "BRAC University",
    line2: "Kha 224 Pragati Sarani, Merul Badda , Dhaka 1212",
    line3: "Bangladesh"
  },
  email: "club.buac@g.bracu.ac.bd",
  phone: "+880 1 something something",
  socialLinks: {
    facebook: "https://facebook.com/buacofficial",
    instagram: "https://instagram.com/brac_university_adventure_club",
    linkedin: "https://linkedin.com/company/buac"
  },
  ctaHeading: "Ready for Adventure?",
  ctaDescription: "Join BUAC and explore the breathtaking landscapes of Bangladesh. From misty mountains to lush valleys, every trek is a new story waiting to unfold."
};

export async function GET() {
  try {
    const res = await kv.get("contact");
    console.log("Contact content fetched:", res);
    return NextResponse.json({ contact: res || defaultContent });
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
    await kv.set("contact", body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

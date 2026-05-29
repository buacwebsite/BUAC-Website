import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

const defaultContent = [
  {
    id: 1,
    slug: "bootcamp",
    name: "Bootcamp",
    description: "Intensive outdoor training program for new members to build skills and teamwork.",
    date: "March 15-17, 2026",
    category: "Training",
    imageUrl: "",
    images: [],
    content: "Our bootcamp is an immersive three-day experience designed to introduce new members to the fundamentals of outdoor adventure. Participants will learn essential skills including camping techniques, navigation, wilderness survival, and team coordination.\n\nThe program features expert-led workshops, hands-on practice sessions, and challenging group activities that build confidence and camaraderie. Whether you're a complete beginner or have some outdoor experience, our bootcamp will prepare you for future adventures with BUAC.\n\nJoin us for an unforgettable journey of learning, growth, and connection with nature and fellow adventurers.",
  },
  {
    id: 2,
    slug: "school-to-globe",
    name: "S2G - School to Globe",
    description: "Our signature club orientation program introducing newcomers to outdoor adventure culture.",
    date: "February 20, 2026",
    category: "Orientation",
    imageUrl: "",
    images: [],
    content: "School to Globe (S2G) is our comprehensive orientation program that bridges the gap between campus life and the wider world of outdoor adventure. This program is specially designed for newcomers to understand our club's mission, values, and the incredible opportunities that await.\n\nDuring S2G, you'll meet current members, hear inspiring stories from past expeditions, learn about upcoming events, and discover how you can contribute to our vibrant community. We cover everything from club structure and membership benefits to safety protocols and environmental conservation practices.\n\nThis is more than just an orientation—it's your first step toward becoming part of a global network of adventure enthusiasts.",
  },
  {
    id: 3,
    slug: "mountain-marathon",
    name: "Mountain Marathon",
    description: "Annual marathon event through scenic mountain trails, open to all adventure enthusiasts.",
    date: "April 10, 2026",
    category: "National Event",
    imageUrl: "",
    images: [],
    content: "The BUAC Mountain Marathon is one of our flagship national events, attracting runners and adventure enthusiasts from across the country. This challenging course winds through breathtaking mountain terrain, offering participants stunning views and an unforgettable experience.\n\nWith multiple distance categories available—including 5K, 10K, half marathon, and full marathon—there's a challenge suitable for every fitness level. The event promotes physical fitness, environmental awareness, and community spirit.\n\nAll proceeds support our conservation initiatives and youth outdoor education programs. Whether you're a competitive runner or a casual participant, the Mountain Marathon promises an exhilarating day in nature.",
  },
  {
    id: 4,
    slug: "club-fair",
    name: "Club Fair",
    description: "Showcase of outdoor activities, equipment demos, and club membership drive.",
    date: "September 5, 2026",
    category: "National Event",
    imageUrl: "",
    images: [],
    content: "The BUAC Club Fair is an exciting annual event where we open our doors to the entire community. This vibrant gathering features interactive demonstrations of various outdoor activities, equipment showcases from leading brands, and presentations by experienced adventurers.\n\nVisitors can try rock climbing on our portable wall, learn about camping gear, participate in navigation workshops, and hear firsthand accounts from club members who've conquered peaks and explored remote trails. It's also the perfect opportunity to learn about membership benefits and sign up for upcoming trips.\n\nFamily-friendly and free to attend, the Club Fair celebrates outdoor adventure culture and welcomes everyone interested in exploring nature, regardless of experience level.",
  },
];

export async function GET() {
  try {
    const res = await kv.get("activities");
    return NextResponse.json({ activities: res || defaultContent });
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
    if (!body || !body.activities) {
      return NextResponse.json(
        { error: "missing activities data" },
        { status: 400 }
      );
    }
    await kv.set("activities", body.activities);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

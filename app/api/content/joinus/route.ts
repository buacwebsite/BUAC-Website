import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

const defaultContent = {
  heading: "JOIN THE ADVENTURE",
  subheading: "Are you ready to step out of your comfort zone and into the wild? BUAC is looking for passionate adventurers who want to explore, learn, and grow. Be part of something extraordinary.",
  whyJoinHeading: "Why Join BUAC?",
  benefits: [
    {
      title: "Epic Adventures",
      description: "Explore breathtaking mountains, valleys, and trails across Bangladesh"
    },
    {
      title: "Skill Development",
      description: "Learn trekking, camping, navigation, and survival skills from experts"
    },
    {
      title: "Leadership",
      description: "Develop leadership qualities by organizing and leading expeditions"
    },
    {
      title: "Unforgettable Memories",
      description: "Create lasting bonds and memories around campfires under starry skies"
    },
    {
      title: "Vibrant Community",
      description: "Join a passionate community of adventure seekers and outdoor enthusiasts"
    },
    {
      title: "Personal Growth",
      description: "Push your limits, build resilience, and discover your true potential"
    }
  ],
  lookingForHeading: "What We're Looking For",
  essentialQualitiesHeading: "Essential Qualities",
  essentialQualities: [
    "Current BRAC University student with valid student ID",
    "Passion for outdoor activities and adventure",
    "Commitment to attend regular club activities",
    "Team player with positive attitude"
  ],
  bonusPointsHeading: "Bonus Points",
  bonusPoints: [
    "Previous trekking or camping experience",
    "Photography or videography skills",
    "Social media management experience",
    "Event organization or leadership roles"
  ],
  applyHeading: "Apply Now",
  applySubheading: "Fill out the form below and take the first step towards unforgettable adventures with BUAC. We'll review your application and get back to you soon.",
  ctaHeading: "Questions About Recruitment?",
  ctaDescription: "Feel free to reach out to us. We're here to help and answer any questions you might have about joining BUAC."
};

export async function GET() {
  try {
    const res = await kv.get("joinus");
    return NextResponse.json({ joinus: res || defaultContent });
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
    await kv.set("joinus", body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}

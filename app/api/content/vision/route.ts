import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface Objective {
  title: string;
  description: string;
}

const defaultVisionText =
  "The BRAC University Adventure Club (BUAC) envisions a generation of fearless, resilient, and purpose-driven individuals who embrace challenges as opportunities for growth. As a dynamic, student-led community, BUAC inspires a spirit of exploration, courage, and teamwork through transformative outdoor adventures and sports that test endurance, cultivate leadership, and strengthen character. United by an unbreakable spirit of exploration, BUAC serves as a movement that inspires individuals to challenge limits, embrace uncertainty, and turn every adventure into a journey of personal growth, leadership, and fortitude. Through every summit conquered and every horizon explored, BUAC strives to shape compassionate, confident, and globally minded leaders who inspire others through action and purpose.";

const defaultObjectives: Objective[] = [
  {
    title: "Build Skills. Break Limits. Become More.",
    description:
      "At BUAC, adventure extends far beyond the thrill of the journey. Through hands-on seminars, specialized training sessions, and workshops on first aid, leadership, wilderness survival, and environmental stewardship, we equip our members with practical skills that transcend the outdoors. These experiences are designed to cultivate confidence, enhance decision-making, and empower students to lead with composure and purpose - on the trail, on campus, and throughout life.",
  },
  {
    title: "One Community. Endless Adventures.",
    description:
      "From curious beginners to seasoned adventurers, BUAC provides a gateway for everyone driven by the spirit of exploration. We proudly foster an inclusive and vibrant community that welcomes students of all backgrounds and experience levels. Built on companionship, support, and a shared passion for exploration, BUAC offers experiences ranging from adrenaline-fueled expeditions to serene escapes into nature - creating opportunities for everyone who strives to discover, grow, and explore.",
  },
];

export async function GET() {
  try {
    const visionText = await kv.get<string>("vision:text");
    const objectives = await kv.get<Objective[]>("vision:objectives");

    return NextResponse.json({
      visionText: visionText || defaultVisionText,
      objectives:
        Array.isArray(objectives) && objectives.length
          ? objectives
          : defaultObjectives,
    });
  } catch (error) {
    console.error("Error fetching vision content:", error);

    return NextResponse.json(
      {
        visionText: defaultVisionText,
        objectives: defaultObjectives,
        warning: "Using default vision content because database fetch failed.",
      },
      { status: 200 },
    );
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await authenticateAdmin();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { visionText, objectives } = await request.json();

    await kv.set("vision:text", visionText || defaultVisionText);
    await kv.set(
      "vision:objectives",
      Array.isArray(objectives) ? objectives : defaultObjectives,
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating vision content:", error);

    return NextResponse.json(
      { error: "Failed to update vision content" },
      { status: 500 },
    );
  }
}
import { NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { authenticateAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

interface Activity {
  id: number;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

const defaultContent: Activity[] = [
  {
    id: 1,
    name: "Step To Glee",
    description:
      "BUAC's signature orientation program welcoming new members through entertainment, performances and bonding.",
    category: "Orientation",
    imageUrl: "",
  },
  {
    id: 2,
    name: "Club Fair",
    description:
      "BUAC showcases its activities, recruits new members and inspires students to join the adventure.",
    category: "Recruitment",
    imageUrl: "",
  },
  {
    id: 3,
    name: "Bootcamp",
    description:
      "Outdoor training program members to build skills, confidence, leadership and teamwork.",
    category: "Training",
    imageUrl: "",
  },
  {
    id: 4,
    name: "Run Fusion",
    description:
      "BUAC's flagship running event promoting fitness, endurance and community through an exciting themed marathon.",
    category: "Flagship Event",
    imageUrl: "",
  },
  {
    id: 5,
    name: "Football Tournament",
    description:
      "An inter-club football competition encouraging healthy competition and teamwork.",
    category: "Sports",
    imageUrl: "",
  },
  {
    id: 6,
    name: "Badminton Tournament",
    description:
      "A badminton competition bringing members together through sports and healthy rivalry.",
    category: "Sports",
    imageUrl: "",
  },
  {
    id: 7,
    name: "Cricket Tournament",
    description:
      "A competitive cricket event that strengthens BUAC’s sportsmanship and teamwork.",
    category: "Sports",
    imageUrl: "",
  },
  {
    id: 8,
    name: "Creative Workshop",
    description:
      "An interactive workshop designed to exhibit creativity and develop practical skills among members.",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: 9,
    name: "IT Workshop",
    description:
      "A skill-development workshop teaching graphic design, photography, video editing and other digital creative skills.",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: 10,
    name: "First Aid Workshop",
    description:
      "A training session teaching members essential first aid and emergency response skills for safe adventures.",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: 11,
    name: "Swimming Workshop",
    description:
      "A practical training program teaching swimming and promotes water safety and fitness.",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: 12,
    name: "Student Tourism Security Workshop",
    description:
      "An awareness seminar focusing on safe risk management, responsible tourism and travel practices.",
    category: "Workshop",
    imageUrl: "",
  },
  {
    id: 13,
    name: "IT Photowalk",
    description:
      "A photography quest where members explore the city, enhance photography skills and capture meaningful stories.",
    category: "Expedition",
    imageUrl: "",
  },
  {
    id: 14,
    name: "Iftar Mahfil",
    description:
      "A Ramadan gathering bringing existing members and alumni together to share Iftar and strengthen bonds.",
    category: "Social Event",
    imageUrl: "",
  },
  {
    id: 15,
    name: "Get-together",
    description:
      "A recreational outing that strengthens connections and creates lasting memories.",
    category: "Social Event",
    imageUrl: "",
  },
  {
    id: 16,
    name: "Short Tour",
    description:
      "A brief adventure trip offering members the opportunity to explore nature, bond and gain outdoor experience.",
    category: "Tour",
    imageUrl: "",
  },
  {
    id: 17,
    name: "Long Tour",
    description:
      "A multi-day voyage featuring trekking, exploration and unforgettable memories in nature.",
    category: "Tour",
    imageUrl: "",
  },
  {
    id: 18,
    name: "University Adventra",
    description:
      "BUAC's national inter-university adventure competition promoting leadership, strategy and collaboration.",
    category: "Flagship Event",
    imageUrl: "",
  },
  {
    id: 19,
    name: "Aquaventure",
    description:
      "A BUAC-led club fair highlighting marine conservation while promoting environmental responsibility and student engagement.",
    category: "Flagship Event",
    imageUrl: "",
  },
  {
    id: 20,
    name: "Recruitment",
    description:
      "BUAC's recruiting process where eager students are interviewed and selected to become club members.",
    category: "Recruitment",
    imageUrl: "",
  },
  {
    id: 21,
    name: "General Body Meeting (GBM)",
    description:
      "A meeting where members provide and receive updates, discuss upcoming events and strengthen communication.",
    category: "Meeting",
    imageUrl: "",
  },
  {
    id: 22,
    name: "Unconquerable: Beyond The Limit",
    description:
      "A digital skill-based competition challenging participants in planning, data management, problem-solving and creative presentation.",
    category: "Competition",
    imageUrl: "",
  },
  {
    id: 23,
    name: "Movie Meetup",
    description:
      "A casual social event bringing BUAC members together through films and laughter.",
    category: "Social Event",
    imageUrl: "",
  },
];

function normalizeName(name: string) {
  return name.trim().toLowerCase();
}

function normalizeActivity(input: unknown, index: number): Activity {
  const item =
    input && typeof input === "object"
      ? (input as Partial<Activity>)
      : {};

  const numericId = Number(item.id);

  return {
    id:
      Number.isFinite(numericId) && numericId > 0
        ? numericId
        : index + 1,
    name: typeof item.name === "string" ? item.name.trim() : "",
    description:
      typeof item.description === "string" ? item.description.trim() : "",
    category: typeof item.category === "string" ? item.category.trim() : "",
    imageUrl: typeof item.imageUrl === "string" ? item.imageUrl.trim() : "",
  };
}

function normalizeActivities(input: unknown): Activity[] {
  if (!Array.isArray(input)) {
    return defaultContent;
  }

  return input.map((item, index) => normalizeActivity(item, index));
}

function mergeSavedWithDefaults(saved: Activity[]) {
  if (!saved.length) {
    return defaultContent;
  }

  const usedSavedNames = new Set<string>();

  const mergedDefaults = defaultContent.map((defaultActivity) => {
    const matchedSaved = saved.find(
      (activity) =>
        normalizeName(activity.name) === normalizeName(defaultActivity.name),
    );

    if (matchedSaved) {
      usedSavedNames.add(normalizeName(matchedSaved.name));
    }

    return {
      ...defaultActivity,
      imageUrl: matchedSaved?.imageUrl || defaultActivity.imageUrl,
    };
  });

  const customSaved = saved.filter(
    (activity) =>
      activity.name &&
      !usedSavedNames.has(normalizeName(activity.name)) &&
      !defaultContent.some(
        (defaultActivity) =>
          normalizeName(defaultActivity.name) === normalizeName(activity.name),
      ),
  );

  return [
    ...mergedDefaults,
    ...customSaved.map((activity, index) => ({
      ...activity,
      id: defaultContent.length + index + 1,
    })),
  ];
}

export async function GET() {
  try {
    const saved = await kv.get<unknown>("activities");
    const normalizedSaved = normalizeActivities(saved);
    const activities = mergeSavedWithDefaults(normalizedSaved);

    return NextResponse.json({ activities }, { status: 200 });
  } catch (error) {
    console.error("Activities GET error:", error);

    return NextResponse.json(
      {
        activities: defaultContent,
        warning: "Using default activities because database fetch failed.",
      },
      { status: 200 },
    );
  }
}

export async function PUT(request: Request) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    if (!body || !Array.isArray(body.activities)) {
      return NextResponse.json(
        { error: "missing activities data" },
        { status: 400 },
      );
    }

    const activities = normalizeActivities(body.activities);

    await kv.set("activities", activities);

    return NextResponse.json({ ok: true, activities }, { status: 200 });
  } catch (error) {
    console.error("Activities PUT error:", error);

    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { kv } from "../../../../lib/kv";
import { authenticateAdmin } from "@/lib/auth";

interface Department {
  id: string;
  name: string;
  description: string;
  image: string;
  number: string;
  logo?: string;
}

const defaultDepartments: Department[] = [
  {
    id: "creative",
    name: "Creative",
    number: "01",
    image: "/assets/footerbg.webp",
    logo: "",
    description:
      "The Creative Department of BRAC University Adventure Club (BUAC) is responsible for transforming ideas into immersive experiences through program décor, thematic planning, and handcrafted props. This department shapes the atmosphere of every event, ensuring that each program reflects the adventurous identity and vision of the club. From designing event themes and visual setups to crafting creative elements that enhance participant engagement, the department plays a vital role in bringing BUAC’s programs to life. Through innovation, teamwork, and attention to detail, the Creative Department elevates every adventure beyond execution turning it into a memorable experience.",
  },
  {
    id: "event",
    name: "Event Management",
    number: "02",
    image: "/assets/footerbg.webp",
    logo: "",
    description:
      "The Event Management Department of BRAC University Adventure Club (BUAC) serves as the backbone of all club activities and initiatives. This department is responsible for planning, coordinating, and executing a wide range of events that reflect the adventurous spirit and core values of the club. From large-scale adventure programs and national-level events to in-campus activities, workshops, and orientation sessions, the team ensures that every event is strategically designed, well-organized, and seamlessly delivered. The department works closely with logistics, finance, and safety teams to maintain high standards of professionalism, safety, and participant engagement. Beyond execution, the Event Management Department focuses on innovation, teamwork, and leadership development providing members with hands-on experience in project planning, communication, crisis management, and operational excellence. Through meticulous coordination and creative execution, the department plays a vital role in strengthening the club’s impact and enhancing the overall adventure culture at BRAC University.",
  },
  {
    id: "hr",
    name: "Human Resources Management",
    number: "03",
    image: "/assets/footerbg.webp",
    logo: "",
    description:
      "The Human Resources Management Department of BRAC University Adventure Club (BUAC) is responsible for building, managing, and empowering the people who drive the club forward. This department oversees recruitment, member development, internal coordination, and performance management to ensure a motivated, skilled, and well-structured team. From onboarding new adventurers to maintaining discipline, teamwork, and organizational efficiency, the department plays a crucial role in sustaining a healthy club culture. By fostering leadership, accountability, and collaboration, the Human Resources Management Department ensures that every member is prepared to take on challenges and contribute effectively to BUAC’s mission.",
  },
  {
    id: "itphoto",
    name: "IT & Photography",
    number: "04",
    image: "/assets/footerbg.webp",
    logo: "",
    description:
      "The IT & Photography Department of BRAC University Adventure Club (BUAC) is responsible for managing the club’s digital operations while capturing the essence of every adventure. This department ensures seamless technical support, digital communication, and visual documentation across all club activities. From maintaining digital platforms to capturing powerful moments from events, expeditions, and in-campus programs, the department bridges technology and storytelling. Through innovation, creativity, and precision, the IT & Photography Department preserves BUAC’s journey, strengthens its digital presence, and showcases the adventurous spirit of the club to a wider audience.",
  },
  {
    id: "pubandmarket",
    name: "Publication & Marketing",
    number: "05",
    image: "/assets/footerbg.webp",
    logo: "",
    description:
      "The Publication & Marketing Department of BRAC University Adventure Club (BUAC) is responsible for documenting, organizing, and presenting the club’s activities through written and published content. This department ensures that every adventure, achievement, and milestone is accurately recorded and professionally communicated. From preparing official documents, proposal letters, and event publications to curating written content for digital and print platforms, the department plays a key role in preserving BUAC’s journey. Through clarity, consistency, and strong storytelling, the Publication & Marketing Department strengthens the club’s identity and ensures its adventures are remembered beyond the trail.",
  },
];

function normalizeDepartments(input: unknown): Department[] {
  if (!Array.isArray(input)) return defaultDepartments;

  return input.map((department, index) => {
    const item = department as Partial<Department>;

    return {
      id: item.id || `department-${index + 1}`,
      name: item.name || `Department ${index + 1}`,
      description: item.description || "",
      image: item.image || "/assets/footerbg.webp",
      number: item.number || String(index + 1).padStart(2, "0"),
      logo: item.logo || "",
    };
  });
}

export async function GET() {
  try {
    const res = await kv.get<Department[]>("departments");

    return NextResponse.json({
      departments:
        Array.isArray(res) && res.length ? normalizeDepartments(res) : defaultDepartments,
    });
  } catch (err) {
    console.error("Error fetching departments:", err);

    return NextResponse.json({
      departments: defaultDepartments,
      warning: "Using default departments because database fetch failed.",
    });
  }
}

export async function PUT(req: Request) {
  const isAdmin = await authenticateAdmin();

  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    if (!Array.isArray(body)) {
      return NextResponse.json(
        { error: "departments must be an array" },
        { status: 400 },
      );
    }

    const departments = normalizeDepartments(body);

    await kv.set("departments", departments);

    return NextResponse.json({ ok: true, departments });
  } catch (err) {
    console.error("Error updating departments:", err);

    return NextResponse.json(
      { error: "internal error" },
      { status: 500 },
    );
  }
}
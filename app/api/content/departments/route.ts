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

function normalizeDepartments(input: unknown): Department[] {
  if (!Array.isArray(input)) return [];

  return input.map((department, index) => {
    const item = department as Partial<Department>;
    return {
      id: item.id || `department-${index + 1}`,
      name: item.name || "",
      description: item.description || "",
      image: item.image || "",
      number: item.number || String(index + 1).padStart(2, "0"),
      logo: item.logo || "",
    };
  });
}

export async function GET() {
  try {
    const res = await kv.get<Department[]>("departments");
    return NextResponse.json({
      departments: Array.isArray(res) ? normalizeDepartments(res) : [],
    });
  } catch (err) {
    console.error("Error fetching departments:", err);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 },
    );
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
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
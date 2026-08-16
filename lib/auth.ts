import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

interface AdminTokenPayload {
  sub?: string;
  role?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export async function authenticateAdmin() {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("admin-token")?.value || "";

  if (!token) {
    return false;
  }

  const secret = process.env.adminJwtSecret || "";

  if (!secret) {
    return false;
  }

  try {
    const payload = jwt.verify(
      token,
      secret,
    ) as AdminTokenPayload;

    return payload.role === "admin";
  } catch {
    return false;
  }
}
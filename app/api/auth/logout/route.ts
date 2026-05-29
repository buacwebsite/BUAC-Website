import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const res = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
  res.cookies.delete("admin-token");
  res.cookies.delete("user-token");
  return res;
}
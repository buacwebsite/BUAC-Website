import { NextResponse } from "next/server";

export async function GET(): Promise<NextResponse> {
  const response = NextResponse.json(
    {
      message: "Logged out successfully",
    },
    {
      status: 200,
    },
  );

  response.cookies.delete("admin-token");
  response.cookies.delete("user-token");

  return response;
}
import { NextRequest, NextResponse } from "next/server";
import { destroySession, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) destroySession(token);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return response;
}

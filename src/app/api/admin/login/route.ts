import { NextRequest, NextResponse } from "next/server";
import {
  checkPassword,
  createSession,
  isRateLimited,
  recordFailedAttempt,
  clearFailedAttempts,
  COOKIE_NAME,
  COOKIE_MAX_AGE,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  // Rate limit check
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many failed attempts. Please try again in 15 minutes." },
      { status: 429 }
    );
  }

  const { password } = await request.json();

  if (!checkPassword(password)) {
    recordFailedAttempt(ip);
    return NextResponse.json({ error: "Incorrect password." }, { status: 401 });
  }

  // Correct password — create a random session token
  clearFailedAttempts(ip);
  const token    = createSession();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly : true,
    sameSite : "lax",
    path     : "/",
    maxAge   : COOKIE_MAX_AGE,
    secure   : process.env.NODE_ENV === "production",
  });

  return response;
}

import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "subscribers.json");

type Subscriber = { email: string; date: string };

function readSubscribers(): Subscriber[] {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8")) as Subscriber[];
  } catch {
    return [];
  }
}

export async function POST(request: NextRequest) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const clean = email.trim().toLowerCase();
  const subscribers = readSubscribers();

  if (subscribers.some((s) => s.email === clean)) {
    return NextResponse.json({ ok: true, already: true });
  }

  subscribers.push({ email: clean, date: new Date().toISOString() });
  writeFileSync(filePath, JSON.stringify(subscribers, null, 2), "utf-8");

  return NextResponse.json({ ok: true });
}

export async function GET(request: NextRequest) {
  const { verifySession, COOKIE_NAME } = await import("@/lib/auth");
  if (!verifySession(request.cookies.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(readSubscribers());
}

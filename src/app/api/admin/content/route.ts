import { NextRequest, NextResponse } from "next/server";
import { readContent, writeContent } from "@/lib/content";
import { verifySession, COOKIE_NAME } from "@/lib/auth";
import { revalidatePath } from "next/cache";

function isAuthenticated(request: NextRequest): boolean {
  return verifySession(request.cookies.get(COOKIE_NAME)?.value);
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(readContent());
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section, data } = await request.json();
  const content = readContent();

  if (section.startsWith("en.")) {
    (content.en as Record<string, unknown>)[section.slice(3)] = data;
  } else if (section.startsWith("hk.")) {
    (content.hk as Record<string, unknown>)[section.slice(3)] = data;
  } else if (section === "events_items") {
    content.events_items = data;
  } else if (section === "leaders_items") {
    content.leaders_items = data;
  } else if (section === "buildings_items") {
    content.buildings_items = data;
  } else if (section === "bulletin_items") {
    content.bulletin_items = data;
  } else if (section === "mission_items") {
    content.mission_items = data;
  } else if (section === "gallery_items") {
    content.gallery_items = data;
  } else if (section === "activeTheme") {
    content.activeTheme = data;
  } else if (section === "branding") {
    content.branding = data;
  }

  writeContent(content);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

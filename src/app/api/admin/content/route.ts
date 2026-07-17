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
  return NextResponse.json(await readContent());
}

function applySection(content: Awaited<ReturnType<typeof readContent>>, section: string, data: unknown) {
  if (section.startsWith("en.")) {
    (content.en as Record<string, unknown>)[section.slice(3)] = data;
  } else if (section.startsWith("hk.")) {
    (content.hk as Record<string, unknown>)[section.slice(3)] = data;
  } else if (section === "events_items") {
    content.events_items = data as typeof content.events_items;
  } else if (section === "leaders_items") {
    content.leaders_items = data as typeof content.leaders_items;
  } else if (section === "buildings_items") {
    content.buildings_items = data as typeof content.buildings_items;
  } else if (section === "bulletin_items") {
    content.bulletin_items = data as typeof content.bulletin_items;
  } else if (section === "mission_items") {
    content.mission_items = data as typeof content.mission_items;
  } else if (section === "gallery_items") {
    content.gallery_items = data as typeof content.gallery_items;
  } else if (section === "activeTheme") {
    content.activeTheme = data as typeof content.activeTheme;
  } else if (section === "branding") {
    content.branding = data as typeof content.branding;
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const content = await readContent();

  // Batched form: { updates: [{ section, data }, ...] } — applied atomically
  // in a single read-modify-write so multi-section saves (e.g. en + hk of
  // the same page) can't race each other and clobber one another's write.
  if (Array.isArray(body.updates)) {
    for (const { section, data } of body.updates) {
      applySection(content, section, data);
    }
  } else {
    applySection(content, body.section, body.data);
  }

  await writeContent(content);
  revalidatePath("/");
  return NextResponse.json({ ok: true });
}

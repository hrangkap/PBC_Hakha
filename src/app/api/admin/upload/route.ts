import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { verifySession, COOKIE_NAME } from "@/lib/auth";

export async function POST(request: NextRequest) {
  if (!verifySession(request.cookies.get(COOKIE_NAME)?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (e) {
    return NextResponse.json({ error: `Failed to parse upload: ${e}` }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  const rawFolder = (formData.get("folder") as string) || "uploads";

  if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

  if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
    return NextResponse.json({ error: `File type "${file.type}" is not allowed` }, { status: 400 });
  }

  const folder = rawFolder.replace(/[^a-z0-9_\-/]/g, "-").replace(/\.\.+/g, "").replace(/^\/|\/$/g, "");
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const base = file.name
    .replace(/\.[^.]+$/, "").toLowerCase()
    .replace(/[^a-z0-9_-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  const filename = `${Date.now()}-${base}.${ext}`;
  const blobPath = `images/${folder}/${filename}`;

  // Use Vercel Blob in production, local filesystem in dev
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const bytes = await file.arrayBuffer();
      const blob = await put(blobPath, bytes, {
        access: "public",
        contentType: file.type,
      });
      return NextResponse.json({ path: blob.url });
    } catch (e) {
      return NextResponse.json({ error: `Upload failed: ${e}` }, { status: 500 });
    }
  }

  // Local dev: write to public/images/
  const destDir = path.join(process.cwd(), "public", "images", folder);
  try {
    await mkdir(destDir, { recursive: true });
  } catch (e) {
    return NextResponse.json({ error: `Cannot create folder: ${e}` }, { status: 500 });
  }
  const dest = path.join(destDir, filename);
  try {
    const bytes = await file.arrayBuffer();
    await writeFile(dest, Buffer.from(bytes));
  } catch (e) {
    return NextResponse.json({ error: `Cannot write file: ${e}` }, { status: 500 });
  }
  return NextResponse.json({ path: `/images/${folder}/${filename}` });
}

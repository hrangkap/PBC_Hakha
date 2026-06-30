import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import JSZip from "jszip";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "bulletin";
  const files = searchParams.getAll("file");

  if (files.length === 0) {
    return NextResponse.json({ error: "No files" }, { status: 400 });
  }

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    // Only allow files under public/ — strip leading slash and resolve safely
    const relative = filePath.replace(/^\//, "");
    const abs = path.join(process.cwd(), "public", relative);
    // Guard against path traversal
    if (!abs.startsWith(path.join(process.cwd(), "public"))) continue;

    try {
      const data = await readFile(abs);
      const ext = path.extname(filePath) || ".jpg";
      zip.file(`page-${i + 1}${ext}`, data);
    } catch {
      // skip missing files
    }
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  const safeName = title.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "bulletin";

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeName}.zip"`,
    },
  });
}

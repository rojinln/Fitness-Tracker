import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

/** Meal photos are written here and served statically from /uploads/*. */
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Decode a base64 image data URL and store it; returns the public URL. */
export async function savePhoto(dataUrl: string): Promise<string> {
  const match = /^data:image\/(png|jpe?g|webp);base64,(.+)$/s.exec(dataUrl);
  if (!match) throw new Error("Invalid image data URL");
  const ext = match[1] === "jpeg" ? "jpg" : match[1];
  const buffer = Buffer.from(match[2], "base64");
  await mkdir(UPLOAD_DIR, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await writeFile(path.join(UPLOAD_DIR, filename), buffer);
  return `/uploads/${filename}`;
}

/** Best-effort delete of a previously saved photo. */
export async function deletePhoto(url: string | null | undefined): Promise<void> {
  if (!url || !url.startsWith("/uploads/")) return;
  try {
    await unlink(path.join(UPLOAD_DIR, path.basename(url)));
  } catch {
    // file already gone — ignore
  }
}

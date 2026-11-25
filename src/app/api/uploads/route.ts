import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { savePhoto } from "@/lib/server/services/photoService";
import { uploadSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** POST /api/uploads { dataUrl } -> { url }. Image is already compressed client-side. */
export async function POST(req: NextRequest) {
  return handle(async () => {
    await requireUser();
    const { dataUrl } = await parseBody(req, uploadSchema);
    const url = await savePhoto(dataUrl);
    return created({ url });
  });
}

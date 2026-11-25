import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { optionalQuery } from "@/lib/server/request";
import { buildProgress } from "@/lib/server/services/progressService";

export const dynamic = "force-dynamic";

/** GET /api/progress?exerciseId=... (exerciseId optional) */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const exerciseId = optionalQuery(req, "exerciseId");
    return ok(await buildProgress(user.id, exerciseId));
  });
}

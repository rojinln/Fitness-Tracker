import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle, ok } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { getWeights, upsertWeight } from "@/lib/server/services/weightService";
import { weightUpsertSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    return ok(await getWeights(user.id));
  });
}

/** Upsert (one weight per day). */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, weightUpsertSchema);
    return created(await upsertWeight(user.id, input));
  });
}

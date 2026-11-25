import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle, ok } from "@/lib/server/http";
import { parseBody, requireQuery } from "@/lib/server/request";
import { createCardio, getCardioByDate } from "@/lib/server/services/cardioService";
import { cardioCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const date = requireQuery(req, "date");
    return ok(await getCardioByDate(user.id, date));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, cardioCreateSchema);
    return created(await createCardio(user.id, input));
  });
}

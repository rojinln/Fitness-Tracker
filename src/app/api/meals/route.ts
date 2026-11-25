import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle, ok } from "@/lib/server/http";
import { parseBody, requireQuery } from "@/lib/server/request";
import { createMeal, getMealsByDate } from "@/lib/server/services/mealService";
import { mealCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const date = requireQuery(req, "date");
    return ok(await getMealsByDate(user.id, date));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, mealCreateSchema);
    return created(await createMeal(user.id, input));
  });
}

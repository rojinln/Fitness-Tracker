import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { addEntry } from "@/lib/server/services/workoutService";
import { workoutEntryCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** POST /api/workouts/entries -> adds an exercise entry, returns the day's WorkoutDTO */
export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, workoutEntryCreateSchema);
    return created(await addEntry(user.id, input));
  });
}

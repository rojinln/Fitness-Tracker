import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { requireQuery } from "@/lib/server/request";
import { getWorkoutByDate } from "@/lib/server/services/workoutService";

export const dynamic = "force-dynamic";

/** GET /api/workouts?date=YYYY-MM-DD -> WorkoutDTO | null */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const date = requireQuery(req, "date");
    return ok(await getWorkoutByDate(user.id, date));
  });
}

import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { created, handle, ok } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import {
  createExercise,
  listExercises,
} from "@/lib/server/services/exerciseService";
import { exerciseCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    return ok(await listExercises(user.id));
  });
}

export async function POST(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, exerciseCreateSchema);
    return created(await createExercise(user.id, input));
  });
}

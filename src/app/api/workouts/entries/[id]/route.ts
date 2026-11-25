import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, noContent, ok } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { deleteEntry, updateEntry } from "@/lib/server/services/workoutService";
import { workoutEntryUpdateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handle(async () => {
    const user = await requireUser();
    const input = await parseBody(req, workoutEntryUpdateSchema);
    return ok(await updateEntry(user.id, params.id, input));
  });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handle(async () => {
    const user = await requireUser();
    await deleteEntry(user.id, params.id);
    return noContent();
  });
}

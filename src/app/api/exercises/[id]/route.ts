import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, noContent } from "@/lib/server/http";
import { deleteExercise } from "@/lib/server/services/exerciseService";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handle(async () => {
    const user = await requireUser();
    await deleteExercise(user.id, params.id);
    return noContent();
  });
}

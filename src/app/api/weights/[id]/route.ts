import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, noContent } from "@/lib/server/http";
import { deleteWeight } from "@/lib/server/services/weightService";

export const dynamic = "force-dynamic";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  return handle(async () => {
    const user = await requireUser();
    await deleteWeight(user.id, params.id);
    return noContent();
  });
}

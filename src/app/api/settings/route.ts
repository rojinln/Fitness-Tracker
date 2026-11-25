import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { getSettings, updateSettings } from "@/lib/server/services/settingsService";
import { settingsUpdateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function GET() {
  return handle(async () => {
    const user = await requireUser();
    return ok(await getSettings(user.id));
  });
}

export async function PATCH(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const patch = await parseBody(req, settingsUpdateSchema);
    return ok(await updateSettings(user.id, patch));
  });
}

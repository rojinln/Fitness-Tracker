import type { NextRequest } from "next/server";
import { startSession } from "@/lib/server/auth";
import { created, fail, handle } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { createUser, emailExists } from "@/lib/server/services/userService";
import { registerSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const { email, password, name } = await parseBody(req, registerSchema);
    if (await emailExists(email)) {
      return fail("An account with this email already exists", 409);
    }
    const user = await createUser(email, password, name);
    await startSession(user.id);
    return created({ user });
  });
}

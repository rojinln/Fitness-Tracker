import type { NextRequest } from "next/server";
import { startSession } from "@/lib/server/auth";
import { fail, handle, ok } from "@/lib/server/http";
import { parseBody } from "@/lib/server/request";
import { verifyCredentials } from "@/lib/server/services/userService";
import { loginSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  return handle(async () => {
    const { email, password } = await parseBody(req, loginSchema);
    const user = await verifyCredentials(email, password);
    if (!user) return fail("Invalid email or password", 401);
    await startSession(user.id);
    return ok({ user });
  });
}

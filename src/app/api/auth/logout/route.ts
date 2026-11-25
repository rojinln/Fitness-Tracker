import { endSession } from "@/lib/server/auth";
import { handle, noContent } from "@/lib/server/http";

export const dynamic = "force-dynamic";

export async function POST() {
  return handle(async () => {
    endSession();
    return noContent();
  });
}

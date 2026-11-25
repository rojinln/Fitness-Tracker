import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/server/auth";
import { handle, ok } from "@/lib/server/http";
import { optionalQuery, requireQuery } from "@/lib/server/request";
import { buildDashboard } from "@/lib/server/services/dashboardService";
import type { DashboardView } from "@/lib/shared/contracts";

export const dynamic = "force-dynamic";

const VIEWS: DashboardView[] = ["day", "week", "month"];

/** GET /api/dashboard?date=YYYY-MM-DD&view=day|week|month */
export async function GET(req: NextRequest) {
  return handle(async () => {
    const user = await requireUser();
    const date = requireQuery(req, "date");
    const rawView = optionalQuery(req, "view");
    const view: DashboardView = VIEWS.includes(rawView as DashboardView)
      ? (rawView as DashboardView)
      : "day";
    return ok(await buildDashboard(user.id, date, view));
  });
}

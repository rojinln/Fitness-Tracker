import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { getCurrentUser } from "@/lib/server/auth";
import { getSettings } from "@/lib/server/services/settingsService";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const settings = await getSettings(user.id);
  return (
    <AppShell user={user} initialSettings={settings}>
      {children}
    </AppShell>
  );
}

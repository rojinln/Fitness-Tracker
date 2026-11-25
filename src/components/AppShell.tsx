"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { getPreset, resolveTheme } from "@/lib/domain";
import type { SettingsDTO, UserDTO } from "@/lib/domain";
import { AppContextProvider, useApp } from "./providers";
import { BottomNav } from "./BottomNav";
import { ToastProvider } from "./Toast";

function applyTheme(settings: SettingsDTO) {
  const preset = getPreset(settings.themePreset);
  const accent = settings.accent || preset.accent;
  const accent2 = settings.accent2 || preset.accent2;
  const { vars } = resolveTheme(accent, accent2, settings.themeMode);
  const root = document.documentElement;
  for (const [key, val] of Object.entries(vars)) {
    root.style.setProperty(key, val);
  }
  root.style.colorScheme = settings.themeMode;
}

function ThemeApplier() {
  const { settings } = useApp();
  useEffect(() => {
    applyTheme(settings);
  }, [settings]);
  return null;
}

export function AppShell({
  user,
  initialSettings,
  children,
}: {
  user: UserDTO;
  initialSettings: SettingsDTO;
  children: ReactNode;
}) {
  return (
    <AppContextProvider user={user} initialSettings={initialSettings}>
      <ToastProvider>
        <ThemeApplier />
        <main className="px-4 pb-28 pt-4">{children}</main>
        <BottomNav />
      </ToastProvider>
    </AppContextProvider>
  );
}

"use client";
import { createContext, useCallback, useContext, useState } from "react";
import type { ReactNode } from "react";
import type { SettingsDTO, UserDTO } from "@/lib/domain";
import { api } from "@/lib/client/api";

interface AppContextValue {
  user: UserDTO;
  settings: SettingsDTO;
  setSettings: (settings: SettingsDTO) => void;
  reloadSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within <AppContextProvider>");
  return ctx;
}

export function AppContextProvider({
  user,
  initialSettings,
  children,
}: {
  user: UserDTO;
  initialSettings: SettingsDTO;
  children: ReactNode;
}) {
  const [settings, setSettings] = useState<SettingsDTO>(initialSettings);

  const reloadSettings = useCallback(async () => {
    setSettings(await api.get<SettingsDTO>("/api/settings"));
  }, []);

  return (
    <AppContext.Provider value={{ user, settings, setSettings, reloadSettings }}>
      {children}
    </AppContext.Provider>
  );
}

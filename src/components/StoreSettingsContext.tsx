"use client";

import { createContext, useContext } from "react";
import type { StoreSettings } from "@/types/commerce";

const StoreSettingsContext = createContext<StoreSettings | null>(null);

export function StoreSettingsProvider({
  settings,
  children,
}: {
  settings: StoreSettings;
  children: React.ReactNode;
}) {
  return (
    <StoreSettingsContext.Provider value={settings}>
      {children}
    </StoreSettingsContext.Provider>
  );
}

export function useStoreSettings() {
  const settings = useContext(StoreSettingsContext);
  if (!settings) {
    throw new Error("StoreSettingsProvider is missing.");
  }
  return settings;
}

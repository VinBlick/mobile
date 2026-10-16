import { createContext, useContext } from "react";
import type { Locale, TFn } from "./store";

export const I18nContext = createContext<{ locale: Locale; t: TFn } | null>(null);

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export const useT = () => useI18n().t;

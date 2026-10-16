import { useCallback, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { I18nContext } from "./context";
import { getLocale, subscribe, translate, type TFn } from "./store";

export function I18nProvider({ children }: { children: ReactNode }) {
  const locale = useSyncExternalStore(subscribe, getLocale, getLocale);
  const t = useCallback<TFn>((key, vars) => translate(locale, key, vars), [locale]);
  const value = useMemo(() => ({ locale, t }), [locale, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

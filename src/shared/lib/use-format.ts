import { useMemo } from "react";
import { useI18n } from "@/shared/i18n";
import * as f from "./format";

export function useFormat() {
  const { locale } = useI18n();
  return useMemo(
    () => ({
      money: (c: number | null | undefined, cur?: string) => f.formatMoney(c, cur, locale),
      date: (d: string | Date | null | undefined) => f.formatDate(d, locale),
      dateTime: (d: string | Date | null | undefined) => f.formatDateTime(d, locale),
      number: (n: number | null | undefined) => f.formatNumber(n, locale),
    }),
    [locale],
  );
}

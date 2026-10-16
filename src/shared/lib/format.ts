import type { Locale } from "@/shared/i18n";

const tag = (l: Locale) => (l === "en" ? "en-GB" : "de-DE");

export const formatMoney = (cents: number | null | undefined, currency = "EUR", locale: Locale = "de") =>
  cents === null || cents === undefined
    ? "—"
    : new Intl.NumberFormat(tag(locale), { style: "currency", currency }).format(cents / 100);

export const formatDate = (d: string | Date | null | undefined, locale: Locale = "de") => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(+date) ? "—" : new Intl.DateTimeFormat(tag(locale), { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
};

export const formatDateTime = (d: string | Date | null | undefined, locale: Locale = "de") => {
  if (!d) return "—";
  const date = new Date(d);
  return isNaN(+date)
    ? "—"
    : new Intl.DateTimeFormat(tag(locale), { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(date);
};

export const formatNumber = (n: number | null | undefined, locale: Locale = "de") =>
  n === null || n === undefined ? "—" : new Intl.NumberFormat(tag(locale)).format(n);

export const localized = (v: Record<string, string> | string | null | undefined, locale: string) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return v[locale] ?? v.de ?? v.en ?? Object.values(v)[0] ?? "";
};

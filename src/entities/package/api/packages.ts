import { queryOptions } from "@tanstack/react-query";
import { request } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import type { ReportPackage } from "../model/types";

export const packagesQuery = (locale: Locale) =>
  queryOptions({
    queryKey: ["packages", locale],
    queryFn: ({ signal }) =>
      request<{ packages: ReportPackage[] }>("/packages", { query: { locale }, signal }).then((d) => d.packages),
    staleTime: 10 * 60_000,
  });

export const validatePromo = (code: string, packageCode: string) =>
  request<
    | { valid: true; subtotalCents: number; discountCents: number; totalCents: number; currency: string }
    | { valid: false; reason: string }
  >("/promo-codes/validate", { method: "POST", body: { code, packageCode } });

import type { CategoryKey } from "@/shared/config/categories";

/** package as returned by GET /packages (prices in cents, gross incl. VAT) */
export type ReportPackage = {
  code: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  features: string[];
  categories: CategoryKey[];
  reportValidityDays: number;
};

/** package highlighted in the UI */
export const RECOMMENDED_PACKAGE = "STANDARD";

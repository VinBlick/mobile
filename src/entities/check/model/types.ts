import type { CategoryKey } from "@/shared/config/categories";
export type { CategoryKey };

export type CheckCategory = {
  category: CategoryKey;
  found: boolean;
  count: number | null;
  label: string;
};

export type VinCheck = {
  id: string;
  vin: string;
  vehicle: {
    manufacturer: string | null;
    model: string | null;
    modelYear: number | null;
  };
  categories: CheckCategory[];
  summary: string;
  anyDataFound: boolean;
  cached: { providers: number; fetchedAt: string; validUntil: string } | null;
  packageCoverage: { code: string; coveredCategories: CategoryKey[] }[];
  createdAt: string;
};

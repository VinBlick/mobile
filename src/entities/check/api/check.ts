import { request } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import type { VinCheck } from "../model/types";

export const runVinCheck = (input: { vin?: string; listingUrl?: string; locale: Locale }) =>
  request<VinCheck>("/checks", { method: "POST", body: input });

export const checkKey = (vin: string) => ["check", vin] as const;

import type { CategoryKey } from "@/shared/config/categories";

export type Severity = "low" | "medium" | "high";
export type SourceType =
  "INDEPENDENT_API" | "OFFICIAL_DOCUMENT" | "SELLER_PROVIDED";

export type ReportRecord = {
  id: string;
  category: CategoryKey;
  date?: string;
  mileageKm?: number;
  title: string;
  description?: string;
  amountCents?: number;
  currency?: string;
  country?: string;
  location?: string;
  severity?: Severity;
  photos?: string[];
  attributes?: Record<string, string | number | boolean | null>;
  sourceType: SourceType;
  providerKey?: string;
};

export type ReportSection = { category: CategoryKey; records: ReportRecord[] };

export type Finding = {
  type: string;
  severity: Severity;
  title: string;
  explanation: string;
  evidence: string[];
};

export type Report = {
  id?: string;
  vin: string;
  vinMasked?: boolean;
  status: "pending" | "ready" | "failed";
  locale: string;
  package: { code: string; name: string };
  generatedAt: string | null;
  dataAsOf: string | null;
  validUntil: string | null;
  isCurrent: boolean;
  vehicle: Record<string, string | number | boolean | undefined> | null;
  equipment: string[];
  scores: {
    completeness: number;
    reliability: number;
    categoriesFound: CategoryKey[];
    categoriesMissing: CategoryKey[];
  } | null;
  analysis: {
    summary: string;
    overallRisk: Severity;
    findings: Finding[];
    risks: { title: string; severity: Severity; evidence: string[] }[];
    sellerQuestions: string[];
    mileage: {
      readings: number;
      lastKm: number | null;
      lastDate: string | null;
      avgKmPerYear: number | null;
      rollbackSuspected: boolean;
    };
    service: {
      records: number;
      avgIntervalDays: number | null;
      maxGapDays: number | null;
      regular: boolean | null;
    };
    damage: {
      records: number;
      totalAmountCents: number;
      maxSeverity: Severity | null;
    };
    absenceNotes: string[];
  } | null;
  photos: { url: string; recordId: string; date: string | null }[];
  groups: {
    independent: ReportSection[];
    official: ReportSection[];
    seller: ReportSection[];
  };
  sources: {
    name: string;
    sourceType: SourceType;
    status: string;
    fetchedAt: string | null;
    recordCount: number;
  }[];
  shareLink?: { expiresAt: string; shortCode: string };
};

export type ReportListItem = {
  id: string;
  orderId: string;
  orderNumber: string;
  vin: string;
  packageCode: string;
  status: "pending" | "ready" | "failed";
  generatedAt: string | null;
  dataAsOf: string | null;
  validUntil: string | null;
  isCurrent: boolean;
  overallRisk: Severity | null;
  shareLinks: number;
};

export type ShareLink = {
  id: string;
  reportId: string;
  url: string;
  shortUrl: string;
  shortCode: string;
  expiresAt: string;
  revokedAt: string | null;
  active: boolean;
  views: number;
  lastViewedAt: string | null;
  createdAt: string;
};


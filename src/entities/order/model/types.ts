export type OrderStatus =
  | "awaiting_payment"
  | "paid"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled"
  | "refunded"
  | "partially_refunded";

export type StepName = "FETCH" | "ANALYZE" | "PDF" | "NOTIFY";

export type Order = {
  id: string;
  number: string;
  status: OrderStatus;
  vin: string;
  email: string;
  package: { code: string; name: Record<string, string> | string };
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  currency: string;
  forceRefresh: boolean;
  listingUrl: string | null;
  createdAt: string;
  paidAt: string | null;
  completedAt: string | null;
  progress: {
    completedSteps: number;
    totalSteps: number;
    steps: {
      step: StepName;
      status: "pending" | "running" | "completed" | "failed";
    }[];
  };
  report: {
    id: string;
    status: "pending" | "ready" | "failed";
    generatedAt: string | null;
    validUntil: string | null;
    dataAsOf: string | null;
  } | null;
  invoices: {
    id: string;
    number: string;
    type: "INVOICE" | "CREDIT_NOTE";
    grossCents: number;
    issuedAt: string;
  }[];
  payment: { status: string; checkoutUrl: string | null } | null;
  refundedCents: number;
};

export const isOrderInProgress = (status: OrderStatus) => status === "paid" || status === "processing";

export const packageName = (order: Pick<Order, "package">, locale = "de") => {
  const n = order.package.name;
  return typeof n === "string" ? n : (n[locale] ?? n.de ?? Object.values(n)[0] ?? order.package.code);
};

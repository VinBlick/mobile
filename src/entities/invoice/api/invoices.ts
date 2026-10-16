import { queryOptions } from "@tanstack/react-query";
import { request } from "@/shared/api";

export type InvoiceListItem = {
  id: string;
  number: string;
  type: "INVOICE" | "CREDIT_NOTE";
  orderId: string;
  orderNumber?: string;
  grossCents: number;
  currency: string;
  issuedAt: string;
};

export const myInvoicesQuery = queryOptions({
  queryKey: ["invoices", "mine"],
  queryFn: ({ signal }) => request<{ invoices: InvoiceListItem[] }>("/me/invoices", { query: { limit: 50 }, signal }).then((d) => d.invoices),
});

export const invoicePdfPath = (invoiceId: string) => `/me/invoices/${encodeURIComponent(invoiceId)}/pdf`;

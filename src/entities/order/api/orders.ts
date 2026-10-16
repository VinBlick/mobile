import { queryOptions } from "@tanstack/react-query";
import { request } from "@/shared/api";
import type { Locale } from "@/shared/i18n";
import { orderAccessStore } from "../model/access-store";
import type { Order } from "../model/types";

export type Billing = { name?: string; company?: string; street?: string; zip?: string; city?: string; country?: string; vatId?: string };

export type CreateOrderInput = {
  packageCode: string;
  vin?: string;
  checkId?: string;
  email?: string;
  promoCode?: string;
  billing?: Billing;
  locale: Locale;
};

const id = encodeURIComponent;
const access = (orderId: string) => orderAccessStore.get(orderId);

export const orderKeys = {
  all: ["orders"] as const,
  detail: (orderId: string) => ["orders", orderId] as const,
  mine: ["orders", "mine"] as const,
};

export async function createOrder(input: CreateOrderInput) {
  const res = await request<{ order: Order; accessToken: string; checkoutUrl: string | null }>("/orders", {
    method: "POST",
    body: input,
  });
  await orderAccessStore.add({ orderId: res.order.id, token: res.accessToken, vin: res.order.vin, createdAt: res.order.createdAt });
  return res;
}

export const orderQuery = (orderId: string) =>
  queryOptions({
    queryKey: orderKeys.detail(orderId),
    queryFn: async ({ signal }) =>
      request<{ order: Order }>(`/orders/${id(orderId)}`, { orderAccess: await access(orderId), signal }).then((d) => d.order),
    refetchInterval: (q) => {
      const s = q.state.data?.status;
      return s === "paid" || s === "processing" ? 3000 : false;
    },
  });

export const myOrdersQuery = queryOptions({
  queryKey: orderKeys.mine,
  queryFn: ({ signal }) => request<{ orders: Order[]; total: number }>("/orders", { query: { limit: 50 }, signal }).then((d) => d.orders),
});

/** guest orders from the keychain (works without account and offline-first) */
export const guestOrdersQuery = queryOptions({
  queryKey: ["orders", "guest"],
  queryFn: async ({ signal }) => {
    const stored = await orderAccessStore.list();
    const results = await Promise.allSettled(
      stored.map((s) => request<{ order: Order }>(`/orders/${id(s.orderId)}`, { orderAccess: s.token, signal }).then((d) => d.order)),
    );
    return results.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
  },
});

export const orderApi = {
  reconcile: async (orderId: string) =>
    request<{ order: Order }>(`/orders/${id(orderId)}/reconcile`, { method: "POST", body: {}, orderAccess: await access(orderId) }).then((d) => d.order),
  checkout: async (orderId: string) =>
    request<{ checkoutUrl: string }>(`/orders/${id(orderId)}/checkout`, { method: "POST", body: {}, orderAccess: await access(orderId) }).then(
      (d) => d.checkoutUrl,
    ),
  cancel: async (orderId: string) =>
    request<{ order: Order }>(`/orders/${id(orderId)}/cancel`, { method: "POST", body: {}, orderAccess: await access(orderId) }).then((d) => d.order),
  reportPdfPath: (orderId: string) => `/orders/${id(orderId)}/report/pdf`,
  invoicePdfPath: (orderId: string, invoiceId: string) => `/orders/${id(orderId)}/invoices/${id(invoiceId)}/pdf`,
  accessFor: access,
};

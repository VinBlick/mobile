import { queryOptions } from "@tanstack/react-query";
import { request } from "@/shared/api";
import type { Report, ReportListItem, ShareLink } from "../model/types";

const id = encodeURIComponent;

export const reportKeys = { all: ["reports"] as const };

export const myReportsQuery = queryOptions({
  queryKey: ["reports", "mine"],
  queryFn: ({ signal }) => request<{ reports: ReportListItem[] }>("/me/reports", { query: { limit: 50 }, signal }).then((d) => d.reports),
});

export const orderReportQuery = (orderId: string, getAccess: (orderId: string) => Promise<string | null>) =>
  queryOptions({
    queryKey: ["reports", "order", orderId],
    queryFn: async ({ signal }) =>
      request<{ report: Report }>(`/orders/${id(orderId)}/report`, { orderAccess: await getAccess(orderId), signal }).then((d) => d.report),
    staleTime: 5 * 60_000,
    // keep purchased reports for offline viewing (persisted cache)
    gcTime: 30 * 86_400_000,
  });

export const publicReportQuery = (link: { token?: string; code?: string }) =>
  queryOptions({
    queryKey: ["reports", "public", link.token ?? link.code],
    queryFn: ({ signal }) =>
      request<{ report: Report }>(link.token ? `/public/r/${id(link.token)}` : `/public/code/${id(link.code!)}`, { signal, anonymous: true }).then(
        (d) => d.report,
      ),
  });

export const shareLinksQuery = (reportId: string) =>
  queryOptions({
    queryKey: ["reports", reportId, "share-links"],
    queryFn: ({ signal }) => request<{ shareLinks: ShareLink[] }>(`/me/reports/${id(reportId)}/share-links`, { signal }).then((d) => d.shareLinks),
  });

export const reportApi = {
  createShareLink: (reportId: string, ttlHours: number) =>
    request<{ shareLink: ShareLink }>(`/me/reports/${id(reportId)}/share-links`, { method: "POST", body: { ttlHours } }).then((d) => d.shareLink),
  revokeShareLink: (linkId: string) => request(`/me/share-links/${id(linkId)}`, { method: "DELETE" }),
  renew: (reportId: string) =>
    request<{ order: { id: string; vin: string; createdAt: string }; accessToken: string; checkoutUrl: string | null }>(
      `/me/reports/${id(reportId)}/renew`,
      { method: "POST", body: {} },
    ),
};

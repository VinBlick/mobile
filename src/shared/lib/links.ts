import { env } from "@/shared/config/env";

export type AppLink =
  | { type: "share"; token: string }
  | { type: "code"; code: string }
  | { type: "order"; orderId: string; access?: string }
  | { type: "vin"; vin: string };

/**
 * Understands links that may come from a QR code, the clipboard or a deep link:
 * https://<site>/r/<token>, /check/<code>, /orders/<id>?access=…
 */
export const parseAppLink = (raw: string): AppLink | null => {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const site = new URL(env.siteUrl);
  const ownHost = url.host === site.host || url.protocol === "vinblick:";
  if (!ownHost) return null;
  const parts = (url.protocol === "vinblick:" ? `${url.host}${url.pathname}` : url.pathname).split("/").filter(Boolean);
  if (parts[0] === "r" && parts[1]) return { type: "share", token: parts[1] };
  if (parts[0] === "check" && parts[1]) return { type: "code", code: parts[1].toUpperCase() };
  if (parts[0] === "orders" && parts[1]) return { type: "order", orderId: parts[1], access: url.searchParams.get("access") ?? undefined };
  return null;
};

/** supported marketplaces for "check from listing" */
export const isListingUrl = (raw: string) => /^https?:\/\/(www\.|suchen\.)?(mobile\.de|autoscout24\.[a-z.]+)\//i.test(raw.trim());

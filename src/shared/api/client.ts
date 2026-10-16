import { env } from "@/shared/config/env";
import { ApiError, toApiError } from "./errors";
import { sessionStore } from "./session-store";

type Primitive = string | number | boolean | null | undefined;
export type Query = Record<string, Primitive>;

export interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Query;
  /** guest access token of an order (X-Order-Access) */
  orderAccess?: string | null;
  anonymous?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export const apiUrl = (path: string, query?: Query) => {
  const qs = Object.entries(query ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    .join("&");
  return `${env.apiBaseUrl}${path}${qs ? `?${qs}` : ""}`;
};

let onSessionExpired: () => void = () => undefined;
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

let refreshing: Promise<string | null> | null = null;

/** single-flight refresh using the keychain refresh token */
export const refreshAccessToken = () => {
  if (!refreshing)
    refreshing = (async () => {
      const refreshToken = await sessionStore.getRefresh();
      if (!refreshToken) return null;
      try {
        const res = await fetch(apiUrl("/auth/refresh-token"), {
          method: "POST",
          headers: { "Content-Type": "application/json", "X-Client": "mobile" },
          body: JSON.stringify({ refreshToken }),
        });
        if (res.status === 401 || res.status === 400) {
          await sessionStore.clear();
          return null;
        }
        if (!res.ok) return null;
        const data = (await res.json()) as { accessToken?: string };
        sessionStore.setAccess(data.accessToken ?? null);
        return data.accessToken ?? null;
      } catch {
        return null; // offline: keep the refresh token for later
      } finally {
        setTimeout(() => {
          refreshing = null;
        }, 0);
      }
    })();
  return refreshing;
};

const timeoutSignal = (ms: number, outer?: AbortSignal) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  outer?.addEventListener("abort", () => ctrl.abort());
  return { signal: ctrl.signal, done: () => clearTimeout(timer), timedOut: () => ctrl.signal.aborted && !outer?.aborted };
};

async function send(path: string, opts: RequestOptions, token: string | null) {
  const headers: Record<string, string> = { Accept: "application/json", "X-Client": "mobile" };
  if (opts.body !== undefined) headers["Content-Type"] = "application/json";
  if (token && !opts.anonymous) headers.Authorization = `Bearer ${token}`;
  if (opts.orderAccess) headers["X-Order-Access"] = opts.orderAccess;
  const t = timeoutSignal(opts.timeoutMs ?? 20_000, opts.signal);
  try {
    return await fetch(apiUrl(path, opts.query), {
      method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: t.signal,
    });
  } catch (error) {
    if (opts.signal?.aborted) throw error;
    throw new ApiError(0, t.timedOut() ? "Timeout" : "NetworkError", t.timedOut() ? "timeout" : "network");
  } finally {
    t.done();
  }
}

export async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  let res = await send(path, opts, sessionStore.getAccess());
  if (res.status === 401 && !opts.anonymous && (await sessionStore.getRefresh())) {
    const token = await refreshAccessToken();
    if (token) res = await send(path, opts, token);
    else onSessionExpired();
  }
  if (!res.ok) throw toApiError(res.status, await res.json().catch(() => null));
  if (res.status === 204) return undefined as T;
  const type = res.headers.get("content-type") ?? "";
  return (type.includes("json") ? res.json() : res.text()) as Promise<T>;
}

/** headers for native downloads (PDF) */
export const authHeaders = (orderAccess?: string | null): Record<string, string> => {
  const h: Record<string, string> = { "X-Client": "mobile" };
  const token = sessionStore.getAccess();
  if (token) h.Authorization = `Bearer ${token}`;
  if (orderAccess) h["X-Order-Access"] = orderAccess;
  return h;
};

import { isApiError } from "@/shared/api";
import type { TFn } from "./store";

/** user facing message for any thrown error */
export const errorMessage = (t: TFn, e: unknown) => {
  if (isApiError(e)) {
    if (e.code === "NetworkError") return t("errors.network");
    if (e.code === "Timeout") return t("errors.timeout");
    if (e.status === 429) return t("errors.rateLimit");
    if (e.status >= 500) return t("errors.server");
    return e.message;
  }
  return e instanceof Error ? e.message : String(e);
};

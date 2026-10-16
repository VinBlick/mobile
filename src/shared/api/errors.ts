export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fieldErrors: Record<string, string>;
  readonly details: unknown;

  constructor(status: number, code: string, message: string, fieldErrors: Record<string, string> = {}, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
    this.details = details;
  }

  get isNetwork() {
    return this.status === 0;
  }
}

export const isApiError = (e: unknown): e is ApiError => e instanceof ApiError;

type Body = { code?: string; message?: string; details?: unknown; errors?: Record<string, { msg?: string }> };

export const toApiError = (status: number, body: unknown) => {
  const b = (body && typeof body === "object" ? body : {}) as Body;
  const fieldErrors: Record<string, string> = {};
  for (const [k, v] of Object.entries(b.errors ?? {})) if (v?.msg) fieldErrors[k] = v.msg;
  return new ApiError(
    status,
    b.code ?? "Error",
    b.message ?? Object.values(fieldErrors)[0] ?? `Request failed (${status})`,
    fieldErrors,
    b.details,
  );
};

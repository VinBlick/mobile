import { queryOptions } from "@tanstack/react-query";
import { refreshAccessToken, request, sessionStore } from "@/shared/api";
import type { User } from "../model/types";

type AuthResponse = { accessToken: string; refreshToken?: string };

const store = async (data: AuthResponse) => {
  sessionStore.setAccess(data.accessToken);
  if (data.refreshToken) await sessionStore.setRefresh(data.refreshToken);
};

export const fetchCurrentUser = (signal?: AbortSignal) => request<{ user: User }>("/user/current", { signal }).then((d) => d.user);

/** null when signed out; restores the session from the keychain */
export const sessionQuery = queryOptions({
  queryKey: ["session"],
  queryFn: async ({ signal }) => {
    if (!sessionStore.getAccess()) {
      if (!(await sessionStore.getRefresh())) return null;
      if (!(await refreshAccessToken())) return null;
    }
    try {
      return await fetchCurrentUser(signal);
    } catch {
      return null;
    }
  },
  staleTime: 5 * 60_000,
  retry: false,
});

export async function signIn(email: string, password: string) {
  await store(await request<AuthResponse>("/auth/sign-in", { method: "POST", body: { email, password }, anonymous: true }));
  return fetchCurrentUser();
}

export async function signUp(input: { firstName: string; lastName: string; email: string; password: string }) {
  const name = `${input.firstName} ${input.lastName}`.trim();
  await store(await request<AuthResponse>("/auth/sign-up", { method: "POST", body: { name, email: input.email, password: input.password }, anonymous: true }));
  await request("/user/current", { method: "PUT", body: { first_name: input.firstName, last_name: input.lastName } }).catch(() => undefined);
  return fetchCurrentUser();
}

export async function signOut(pushToken?: string | null) {
  const refreshToken = await sessionStore.getRefresh();
  try {
    if (pushToken) await request(`/me/devices/${encodeURIComponent(pushToken)}`, { method: "DELETE" }).catch(() => undefined);
    if (sessionStore.getAccess()) await request("/auth/logout", { method: "POST", body: { refreshToken } });
  } catch {
    /* offline: the token simply expires */
  } finally {
    await sessionStore.clear();
  }
}

export const requestPasswordReset = (email: string) =>
  request("/auth/forgot-password", { method: "POST", body: { email }, anonymous: true });

export const setPassword = (token: string, password: string) =>
  request("/auth/set-password", { method: "POST", body: { token, password }, anonymous: true });

export const updateProfile = (input: { firstName: string; lastName: string }) =>
  request<{ user: User }>("/user/current", {
    method: "PUT",
    body: { first_name: input.firstName, last_name: input.lastName, name: `${input.firstName} ${input.lastName}`.trim() },
  }).then((d) => d.user);

/** GDPR: account deletion is required in-app by the App Store */
export const deleteAccount = async (password: string) => {
  await request("/user/current", { method: "DELETE", body: { password } });
  await sessionStore.clear();
};

export const registerDevice = (token: string, platform: "IOS" | "ANDROID") =>
  request("/me/devices", { method: "POST", body: { token, platform } });

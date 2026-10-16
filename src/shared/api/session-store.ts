import { secure } from "@/shared/lib/storage";

const REFRESH_KEY = "vinblick.refresh";

/** access token in memory, refresh token in the keychain */
let accessToken: string | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export const sessionStore = {
  getAccess: () => accessToken,
  setAccess(token: string | null) {
    accessToken = token;
    emit();
  },
  getRefresh: () => secure.get(REFRESH_KEY),
  setRefresh: (token: string | null) => secure.set(REFRESH_KEY, token),
  async clear() {
    accessToken = null;
    await secure.set(REFRESH_KEY, null);
    emit();
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

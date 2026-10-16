import { secure } from "@/shared/lib/storage";

/**
 * Guest orders are opened with an access token returned when the order is
 * created. We keep the latest ones in the keychain so guests find their
 * reports again ("Meine Berichte") without an account.
 */
const KEY = "vinblick.orders";
const MAX = 20;

export type StoredOrder = { orderId: string; token: string; vin: string; createdAt: string };

let cache: StoredOrder[] | null = null;
const listeners = new Set<() => void>();

const load = async () => {
  if (cache) return cache;
  try {
    cache = JSON.parse((await secure.get(KEY)) ?? "[]") as StoredOrder[];
  } catch {
    cache = [];
  }
  return cache;
};

export const orderAccessStore = {
  list: load,
  async get(orderId: string) {
    return (await load()).find((o) => o.orderId === orderId)?.token ?? null;
  },
  async add(entry: StoredOrder) {
    const list = (await load()).filter((o) => o.orderId !== entry.orderId);
    cache = [entry, ...list].slice(0, MAX);
    await secure.set(KEY, JSON.stringify(cache));
    listeners.forEach((l) => l());
  },
  async clear() {
    cache = [];
    await secure.set(KEY, null);
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

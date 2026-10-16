import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

/**
 * Secrets (refresh token, guest order tokens) go to the Keychain / Keystore.
 * On web (dev preview only) SecureStore is unavailable → AsyncStorage.
 */
const secureAvailable = Platform.OS !== "web";

export const secure = {
  async get(key: string) {
    try {
      return secureAvailable ? await SecureStore.getItemAsync(key) : await AsyncStorage.getItem(`secure:${key}`);
    } catch {
      return null;
    }
  },
  async set(key: string, value: string | null) {
    try {
      if (value === null) {
        if (secureAvailable) await SecureStore.deleteItemAsync(key);
        else await AsyncStorage.removeItem(`secure:${key}`);
      } else if (secureAvailable) await SecureStore.setItemAsync(key, value);
      else await AsyncStorage.setItem(`secure:${key}`, value);
    } catch {
      /* storage unavailable: session simply isn't persisted */
    }
  },
};

/** non-secret preferences */
export const prefs = {
  async get<T>(key: string, fallback: T): Promise<T> {
    try {
      const raw = await AsyncStorage.getItem(key);
      return raw === null ? fallback : (JSON.parse(raw) as T);
    } catch {
      return fallback;
    }
  },
  async set(key: string, value: unknown) {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};

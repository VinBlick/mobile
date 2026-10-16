import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { AppState, Platform, StyleSheet, View } from "react-native";
import * as LocalAuthentication from "expo-local-authentication";
import { useT } from "@/shared/i18n";
import { prefs } from "@/shared/lib/storage";
import { colors } from "@/shared/theme";
import { Button, LogoMark, Text } from "@/shared/ui";

const KEY = "vinblick.biometricLock";
const LOCK_AFTER_MS = 60_000;

export const biometricLock = {
  isEnabled: () => prefs.get<boolean>(KEY, false),
  setEnabled: (v: boolean) => prefs.set(KEY, v),
  async isAvailable() {
    if (Platform.OS === "web") return false;
    return (await LocalAuthentication.hasHardwareAsync()) && (await LocalAuthentication.isEnrolledAsync());
  },
  async verify(prompt: string) {
    const r = await LocalAuthentication.authenticateAsync({ promptMessage: prompt, disableDeviceFallback: false });
    return r.success;
  },
};

/** optional Face ID / fingerprint lock when the app returns from background */
export function AppLock({ children }: { children: ReactNode }) {
  const t = useT();
  const [locked, setLocked] = useState(false);
  const background = useRef<number | null>(null);

  const unlock = useCallback(async () => {
    if (await biometricLock.verify(t("lock.prompt"))) setLocked(false);
  }, [t]);

  useEffect(() => {
    const lock = () => {
      setLocked(true);
      void unlock();
    };
    void biometricLock.isEnabled().then((on) => {
      if (on) lock();
    });
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "background") background.current = Date.now();
      if (state === "active" && background.current && Date.now() - background.current > LOCK_AFTER_MS && (await biometricLock.isEnabled()))
        lock();
    });
    return () => sub.remove();
  }, [unlock]);

  return (
    <View style={{ flex: 1 }}>
      {children}
      {locked ? (
        <View style={styles.lock}>
          <LogoMark size={72} />
          <Text variant="h2">{t("lock.title")}</Text>
          <Button title={t("lock.unlock")} onPress={() => void unlock()} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  lock: { ...StyleSheet.absoluteFill, backgroundColor: colors.white, alignItems: "center", justifyContent: "center", gap: 20, padding: 32 },
});

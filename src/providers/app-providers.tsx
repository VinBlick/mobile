import { useEffect, useState, type ReactNode } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import * as SplashScreen from "expo-splash-screen";
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold } from "@expo-google-fonts/inter";
import { sessionQuery } from "@/entities/session";
import { AppLock } from "@/features/app-lock";
import { usePushNotifications } from "@/features/push";
import { isApiError, setSessionExpiredHandler } from "@/shared/api";
import { I18nProvider, loadLocale } from "@/shared/i18n";

void SplashScreen.preventAutoHideAsync().catch(() => undefined);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 24 * 60 * 60_000,
      retry: (count, e) => count < 2 && !(isApiError(e) && e.status >= 400 && e.status < 500),
    },
    mutations: { retry: false },
  },
});

/** reports and orders stay readable offline (e.g. at the car dealer without signal) */
const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: "vinblick.cache", throttleTime: 2000 });
const PERSISTED = new Set(["orders", "reports", "packages", "invoices"]);

function SessionEffects() {
  const client = useQueryClient();
  const session = useQuery(sessionQuery);
  useEffect(() => {
    setSessionExpiredHandler(() => {
      client.setQueryData(sessionQuery.queryKey, null);
      client.removeQueries({ queryKey: ["orders", "mine"] });
    });
  }, [client]);
  usePushNotifications(Boolean(session.data));
  return null;
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [localeReady, setLocaleReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, Inter_800ExtraBold });
  useEffect(() => {
    void loadLocale().finally(() => setLocaleReady(true));
  }, []);
  const ready = localeReady && (fontsLoaded || Boolean(fontError));
  useEffect(() => {
    if (ready) void SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);
  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PersistQueryClientProvider
          client={queryClient}
          persistOptions={{
            persister,
            maxAge: 30 * 24 * 60 * 60_000,
            buster: "1",
            dehydrateOptions: {
              shouldDehydrateQuery: (q) => q.state.status === "success" && PERSISTED.has(String(q.queryKey[0])),
            },
          }}
        >
          <I18nProvider>
            <SessionEffects />
            <AppLock>{children}</AppLock>
          </I18nProvider>
        </PersistQueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

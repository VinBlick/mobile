import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AppProviders } from "@/providers";
import { useT } from "@/shared/i18n";
import { colors, fonts } from "@/shared/theme";

function RootStack() {
  const t = useT();
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerTintColor: colors.brand,
          headerTitleStyle: { fontFamily: fonts.bold, color: colors.ink },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.surface },
          headerBackButtonDisplayMode: "minimal",
          contentStyle: { backgroundColor: colors.surface },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="vin/[vin]" options={{ title: t("nav.result") }} />
        <Stack.Screen name="checkout" options={{ title: t("nav.checkout") }} />
        <Stack.Screen name="orders/[id]/index" options={{ title: t("nav.order") }} />
        <Stack.Screen name="orders/[id]/report" options={{ title: t("report.title") }} />
        <Stack.Screen name="r/[token]" options={{ title: t("report.title") }} />
        <Stack.Screen name="check/[code]" options={{ title: t("report.title") }} />
        <Stack.Screen name="scan" options={{ presentation: "fullScreenModal", headerShown: false }} />
        <Stack.Screen name="auth/sign-in" options={{ title: t("auth.signIn"), presentation: "modal" }} />
        <Stack.Screen name="auth/sign-up" options={{ title: t("auth.signUp"), presentation: "modal" }} />
        <Stack.Screen name="auth/forgot-password" options={{ title: t("auth.forgot") }} />
        <Stack.Screen name="konto/passwort-festlegen" options={{ title: t("auth.setPasswordTitle") }} />
        <Stack.Screen name="invoices" options={{ title: t("account.invoices") }} />
        <Stack.Screen name="account/invoices" options={{ title: t("account.invoices") }} />
        <Stack.Screen name="account/set-password" options={{ title: t("auth.setPasswordTitle") }} />
        <Stack.Screen name="+not-found" options={{ title: "" }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}

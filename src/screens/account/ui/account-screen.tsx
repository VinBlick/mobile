import { useEffect, useState } from "react";
import { Switch, View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { FileText, Globe, LogOut, Receipt, Scale, ShieldCheck, UserPlus, Fingerprint, Mail } from "lucide-react-native";
import { sessionQuery, signOut } from "@/entities/session";
import { biometricLock } from "@/features/app-lock";
import { DeleteAccount, ProfileForm } from "@/features/profile";
import { getStoredPushToken } from "@/features/push";
import { env } from "@/shared/config/env";
import { LOCALES, setLocale, useI18n } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, Card, Divider, FadeIn, Loading, Row, Screen, Segmented, Text } from "@/shared/ui";

const openSite = (path: string) =>
  WebBrowser.openBrowserAsync(`${env.siteUrl}${path}`, { presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET });

export function AccountScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const client = useQueryClient();
  const session = useQuery(sessionQuery);
  const user = session.data;
  const [lockAvailable, setLockAvailable] = useState(false);
  const [lockOn, setLockOn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    void biometricLock.isAvailable().then(setLockAvailable);
    void biometricLock.isEnabled().then(setLockOn);
  }, []);

  if (session.isLoading) return <Loading />;

  const toggleLock = async (v: boolean) => {
    if (v && !(await biometricLock.verify(t("lock.prompt")))) return;
    setLockOn(v);
    await biometricLock.setEnabled(v);
  };

  const logout = async () => {
    setSigningOut(true);
    await signOut(await getStoredPushToken());
    client.setQueryData(sessionQuery.queryKey, null);
    client.removeQueries({ queryKey: ["orders", "mine"] });
    client.removeQueries({ queryKey: ["invoices"] });
    client.removeQueries({ queryKey: ["reports"] });
    setSigningOut(false);
  };

  return (
    <Screen edges={["top", "left", "right"]} background={colors.surface}>
      <Text variant="h1">{t("account.title")}</Text>

      {user ? (
        <FadeIn>
          <Card>
            <Text variant="small">{t("account.signedInAs")}</Text>
            <Text variant="h3">{user.email}</Text>
            <Divider />
            <ProfileForm user={user} />
          </Card>
        </FadeIn>
      ) : (
        <FadeIn>
          <Card elevated>
            <Text variant="h2">{t("account.guestTitle")}</Text>
            <Text variant="bodyMuted">{t("account.guestText")}</Text>
            <Button title={t("auth.signIn")} onPress={() => router.push("/auth/sign-in")} />
            <Button title={t("auth.signUp")} variant="outline" onPress={() => router.push("/auth/sign-up")} />
          </Card>
        </FadeIn>
      )}

      <FadeIn index={1}>
        <Card>
          {user ? (
            <Row icon={<Receipt color={colors.brand} size={18} />} title={t("account.invoices")} onPress={() => router.push("/invoices")} />
          ) : (
            <Row icon={<UserPlus color={colors.brand} size={18} />} title={t("account.createAccount")} onPress={() => router.push("/auth/sign-up")} />
          )}
          {lockAvailable ? (
            <Row
              icon={<Fingerprint color={colors.brand} size={18} />}
              title={t("account.biometric")}
              subtitle={t("account.biometricText")}
              right={<Switch value={lockOn} onValueChange={(v) => void toggleLock(v)} trackColor={{ true: colors.brand }} />}
            />
          ) : null}
          <View style={{ gap: 8, paddingVertical: 6 }}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
              <Globe color={colors.brand} size={18} />
              <Text variant="label">{t("account.language")}</Text>
            </View>
            <Segmented value={locale} options={LOCALES} onChange={setLocale} />
          </View>
        </Card>
      </FadeIn>

      <FadeIn index={2}>
        <Card>
          <Row icon={<Scale color={colors.brand} size={18} />} title={t("legal.imprint")} onPress={() => void openSite("/impressum")} />
          <Row icon={<ShieldCheck color={colors.brand} size={18} />} title={t("legal.privacy")} onPress={() => void openSite("/datenschutz")} />
          <Row icon={<FileText color={colors.brand} size={18} />} title={t("legal.terms")} onPress={() => void openSite("/agb")} />
          <Row icon={<Mail color={colors.brand} size={18} />} title={t("legal.contact")} onPress={() => void openSite("/kontakt")} />
        </Card>
      </FadeIn>

      {user ? (
        <FadeIn index={3} style={{ gap: 12 }}>
          <Button title={t("account.signOut")} variant="outline" icon={<LogOut color={colors.brand} size={18} />} loading={signingOut} onPress={() => void logout()} />
          <Card>
            <DeleteAccount onDeleted={() => router.navigate("/")} />
          </Card>
        </FadeIn>
      ) : null}

      <View style={{ alignItems: "center", gap: 4, marginTop: 8 }}>
        <Text variant="small">VINblick {Constants.expoConfig?.version ?? ""}</Text>
      </View>
    </Screen>
  );
}

import { useRouter, useLocalSearchParams } from "expo-router";
import { ForgotPasswordForm, SetPasswordForm, SignInForm, SignUpForm } from "@/features/auth";
import { useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, Card, FadeIn, Logo, Notice, Screen, Text } from "@/shared/ui";
import { useState } from "react";

const useDone = () => {
  const router = useRouter();
  return () => (router.canGoBack() ? router.back() : router.replace("/"));
};

export function SignInScreen() {
  const t = useT();
  const router = useRouter();
  const done = useDone();
  return (
    <Screen background={colors.surface}>
      <FadeIn style={{ gap: 8 }}>
        <Logo />
        <Text variant="h1">{t("auth.signInTitle")}</Text>
        <Text variant="bodyMuted">{t("auth.signInText")}</Text>
      </FadeIn>
      <FadeIn index={1}>
        <Card elevated>
          <SignInForm onDone={done} />
        </Card>
      </FadeIn>
      <Button title={t("auth.forgot")} variant="ghost" onPress={() => router.push("/auth/forgot-password")} />
      <Button title={t("auth.noAccount")} variant="outline" onPress={() => router.replace("/auth/sign-up")} />
    </Screen>
  );
}

export function SignUpScreen() {
  const t = useT();
  const router = useRouter();
  const done = useDone();
  return (
    <Screen background={colors.surface}>
      <FadeIn style={{ gap: 8 }}>
        <Text variant="h1">{t("auth.signUpTitle")}</Text>
        <Text variant="bodyMuted">{t("auth.signUpText")}</Text>
      </FadeIn>
      <FadeIn index={1}>
        <Card elevated>
          <SignUpForm onDone={done} />
        </Card>
      </FadeIn>
      <Button title={t("auth.haveAccount")} variant="ghost" onPress={() => router.replace("/auth/sign-in")} />
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  const t = useT();
  return (
    <Screen background={colors.surface}>
      <Text variant="h1">{t("auth.forgotTitle")}</Text>
      <Card elevated>
        <ForgotPasswordForm />
      </Card>
    </Screen>
  );
}

/** link from the e-mail: /konto/passwort-festlegen?token=… (also used for resets) */
export function SetPasswordScreen() {
  const t = useT();
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [saved, setSaved] = useState(false);
  return (
    <Screen background={colors.surface}>
      <Text variant="h1">{t("auth.setPasswordTitle")}</Text>
      {!token ? (
        <Notice tone="danger">{t("auth.linkInvalid")}</Notice>
      ) : saved ? (
        <>
          <Notice tone="success">{t("auth.passwordSaved")}</Notice>
          <Button title={t("auth.signIn")} onPress={() => router.replace("/auth/sign-in")} />
        </>
      ) : (
        <Card elevated>
          <SetPasswordForm token={token} onDone={() => setSaved(true)} />
        </Card>
      )}
    </Screen>
  );
}

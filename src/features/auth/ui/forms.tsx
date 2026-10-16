import { useState } from "react";
import { Linking, View } from "react-native";
import { Controller, useForm, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { requestPasswordReset, setPassword, signIn, signUp } from "@/entities/session";
import { isApiError } from "@/shared/api";
import { env } from "@/shared/config/env";
import { errorMessage, isTKey, useT, type TFn } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, Checkbox, Input, Notice, Text } from "@/shared/ui";
import {
  forgotSchema,
  setPasswordSchema,
  signInSchema,
  signUpSchema,
  type SignInValues,
  type SignUpValues,
} from "../model/schemas";

function Field<T extends FieldValues>({
  control,
  name,
  label,
  secure,
  kind,
}: {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  secure?: boolean;
  kind?: "email" | "name" | "newPassword" | "password";
}) {
  const t = useT();
  const [hidden, setHidden] = useState(true);
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Input
          label={label}
          value={String(field.value ?? "")}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          secureTextEntry={secure && hidden}
          autoCapitalize={kind === "name" ? "words" : "none"}
          autoCorrect={false}
          keyboardType={kind === "email" ? "email-address" : "default"}
          autoComplete={kind === "email" ? "email" : kind === "newPassword" ? "new-password" : kind === "password" ? "current-password" : kind === "name" ? "name" : "off"}
          textContentType={kind === "email" ? "emailAddress" : kind === "newPassword" ? "newPassword" : kind === "password" ? "password" : undefined}
          error={fieldState.error?.message ? (isTKey(fieldState.error.message) ? t(fieldState.error.message) : fieldState.error.message) : null}
          right={
            secure ? (
              <Text variant="small" style={{ color: colors.brand, padding: 6 }} onPress={() => setHidden((h) => !h)}>
                {hidden ? t("auth.show") : t("auth.hide")}
              </Text>
            ) : undefined
          }
        />
      )}
    />
  );
}

/** sign-in errors: short passwords and unknown users read the same way, but say why */
const authError = (t: TFn, e: unknown) => {
  if (isApiError(e) && e.status === 400) {
    if (e.fieldErrors.password?.includes("8 characters")) return t("auth.passwordMin");
    if (e.fieldErrors.password?.includes("blocked")) return t("auth.blocked");
    if (e.fieldErrors.email?.includes("exists")) return t("auth.emailExists");
    if (e.fieldErrors.email?.includes("checkout")) return t("auth.guestExists");
    return t("auth.invalid");
  }
  return errorMessage(t, e);
};

export function SignInForm({ onDone }: { onDone: () => void }) {
  const t = useT();
  const client = useQueryClient();
  const form = useForm<SignInValues>({ resolver: zodResolver(signInSchema), defaultValues: { email: "", password: "" } });
  const m = useMutation({
    mutationFn: (v: SignInValues) => signIn(v.email.trim(), v.password),
    onSuccess: (user) => {
      client.setQueryData(["session"], user);
      void client.invalidateQueries({ predicate: (q) => q.queryKey[0] !== "session" });
      onDone();
    },
  });
  return (
    <View style={{ gap: 14 }}>
      <Field control={form.control} name="email" label={t("auth.email")} kind="email" />
      <Field control={form.control} name="password" label={t("auth.password")} secure kind="password" />
      {m.error ? <Notice tone="danger">{authError(t, m.error)}</Notice> : null}
      <Button title={t("auth.signIn")} loading={m.isPending} onPress={form.handleSubmit((v) => m.mutate(v))} />
    </View>
  );
}

export function SignUpForm({ onDone }: { onDone: () => void }) {
  const t = useT();
  const client = useQueryClient();
  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", terms: false },
  });
  const m = useMutation({
    mutationFn: (v: SignUpValues) => signUp(v),
    onSuccess: (user) => {
      client.setQueryData(["session"], user);
      onDone();
    },
  });
  return (
    <View style={{ gap: 14 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Field control={form.control} name="firstName" label={t("auth.firstName")} kind="name" />
        </View>
        <View style={{ flex: 1 }}>
          <Field control={form.control} name="lastName" label={t("auth.lastName")} kind="name" />
        </View>
      </View>
      <Field control={form.control} name="email" label={t("auth.email")} kind="email" />
      <Field control={form.control} name="password" label={t("auth.password")} secure kind="newPassword" />
      <Controller
        control={form.control}
        name="terms"
        render={({ field, fieldState }) => (
          <View style={{ gap: 4 }}>
            <Checkbox
              checked={field.value}
              onChange={field.onChange}
              label={
                <Text variant="small" style={{ color: colors.ink }}>
                  {t("checkout.termsPrefix")}{" "}
                  <Text variant="small" style={{ color: colors.brand, textDecorationLine: "underline" }} onPress={() => void Linking.openURL(`${env.siteUrl}/agb`)}>
                    {t("legal.terms")}
                  </Text>{" "}
                  {t("checkout.termsMiddle")}{" "}
                  <Text variant="small" style={{ color: colors.brand, textDecorationLine: "underline" }} onPress={() => void Linking.openURL(`${env.siteUrl}/datenschutz`)}>
                    {t("legal.privacy")}
                  </Text>
                  .
                </Text>
              }
            />
            {fieldState.error ? (
              <Text variant="small" style={{ color: colors.danger }}>
                {t("checkout.termsRequired")}
              </Text>
            ) : null}
          </View>
        )}
      />
      {m.error ? <Notice tone="danger">{authError(t, m.error)}</Notice> : null}
      <Button title={t("auth.signUp")} loading={m.isPending} onPress={form.handleSubmit((v) => m.mutate(v))} />
    </View>
  );
}

export function ForgotPasswordForm() {
  const t = useT();
  const form = useForm<{ email: string }>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });
  const m = useMutation({ mutationFn: (v: { email: string }) => requestPasswordReset(v.email.trim()) });
  if (m.isSuccess) return <Notice tone="success">{t("auth.resetSent")}</Notice>;
  return (
    <View style={{ gap: 14 }}>
      <Text variant="bodyMuted">{t("auth.resetIntro")}</Text>
      <Field control={form.control} name="email" label={t("auth.email")} kind="email" />
      {m.error ? <Notice tone="danger">{errorMessage(t, m.error)}</Notice> : null}
      <Button title={t("auth.sendReset")} loading={m.isPending} onPress={form.handleSubmit((v) => m.mutate(v))} />
    </View>
  );
}

export function SetPasswordForm({ token, onDone }: { token: string; onDone: () => void }) {
  const t = useT();
  const form = useForm<{ password: string; repeat: string }>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: "", repeat: "" },
  });
  const m = useMutation({ mutationFn: (v: { password: string }) => setPassword(token, v.password), onSuccess: onDone });
  return (
    <View style={{ gap: 14 }}>
      <Field control={form.control} name="password" label={t("auth.newPassword")} secure kind="newPassword" />
      <Field control={form.control} name="repeat" label={t("auth.repeatPassword")} secure kind="newPassword" />
      {m.error ? <Notice tone="danger">{isApiError(m.error) && m.error.status === 400 ? t("auth.linkInvalid") : errorMessage(t, m.error)}</Notice> : null}
      <Button title={t("auth.savePassword")} loading={m.isPending} onPress={form.handleSubmit((v) => m.mutate(v))} />
    </View>
  );
}

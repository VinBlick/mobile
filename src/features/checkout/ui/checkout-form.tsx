import { useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Lock } from "lucide-react-native";
import { createOrder, orderKeys } from "@/entities/order";
import { validatePromo, type ReportPackage } from "@/entities/package";
import { env } from "@/shared/config/env";
import { errorMessage, isTKey, useI18n } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Button, Card, Checkbox, Input, Notice, Text } from "@/shared/ui";
import { checkoutSchema, defaultCheckoutValues, type CheckoutValues } from "../model/schema";

export function CheckoutForm({
  pkg,
  vin,
  checkId,
  userEmail,
}: {
  pkg: ReportPackage;
  vin: string;
  checkId?: string;
  userEmail?: string | null;
}) {
  const { t, locale } = useI18n();
  const f = useFormat();
  const router = useRouter();
  const client = useQueryClient();
  const [promo, setPromo] = useState<{ code: string; totalCents: number; discountCents: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const form = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: defaultCheckoutValues(userEmail ?? "", !userEmail),
  });
  const withBilling = useWatch({ control: form.control, name: "withBilling" });
  const msg = (m?: string) => (m ? (isTKey(m) ? t(m) : m) : null);

  const checkPromo = useMutation({
    mutationFn: (code: string) => validatePromo(code, pkg.code),
    onSuccess: (r, code) => {
      if (r.valid) {
        setPromo({ code, totalCents: r.totalCents, discountCents: r.discountCents });
        setPromoError(null);
      } else {
        setPromo(null);
        setPromoError(t("checkout.promoInvalid"));
      }
    },
    onError: (e) => setPromoError(errorMessage(t, e)),
  });

  const order = useMutation({
    mutationFn: (v: CheckoutValues) =>
      createOrder({
        packageCode: pkg.code,
        vin: checkId ? undefined : vin,
        checkId,
        email: v.requireEmail ? v.email : undefined,
        promoCode: promo?.code,
        billing: v.withBilling ? { name: v.name, street: v.street, zip: v.zip, city: v.city, country: "Deutschland" } : undefined,
        locale,
      }),
    onSuccess: async (res) => {
      await client.invalidateQueries({ queryKey: orderKeys.all });
      router.replace({ pathname: "/orders/[id]", params: { id: res.order.id, pay: res.checkoutUrl ? "1" : "0" } });
    },
  });

  const total = promo?.totalCents ?? pkg.priceCents;

  return (
    <View style={{ gap: 16 }}>
      <Card>
        <View style={styles.sumRow}>
          <Text variant="h3">{pkg.name}</Text>
          <Text variant="h3">{f.money(pkg.priceCents, pkg.currency)}</Text>
        </View>
        <Text variant="mono" style={{ color: colors.muted, fontSize: 13 }}>
          {vin}
        </Text>
        {promo ? (
          <View style={styles.sumRow}>
            <Text variant="small">{t("checkout.discount", { code: promo.code })}</Text>
            <Text variant="small" style={{ color: colors.success }}>
              −{f.money(promo.discountCents, pkg.currency)}
            </Text>
          </View>
        ) : null}
        <View style={[styles.sumRow, styles.total]}>
          <Text variant="label">{t("checkout.total")}</Text>
          <Text variant="h2">{f.money(total, pkg.currency)}</Text>
        </View>
        <Text variant="small">{t("checkout.vatHint")}</Text>
      </Card>

      {!userEmail ? (
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <Input
              label={t("checkout.email")}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              hint={t("checkout.emailHint")}
              error={msg(fieldState.error?.message)}
            />
          )}
        />
      ) : (
        <Notice>{t("checkout.signedInAs", { email: userEmail })}</Notice>
      )}

      <Controller
        control={form.control}
        name="promoCode"
        render={({ field }) => (
          <View style={styles.promo}>
            <View style={{ flex: 1 }}>
              <Input
                label={t("checkout.promo")}
                value={field.value}
                onChangeText={(v) => {
                  field.onChange(v.toUpperCase());
                  setPromo(null);
                  setPromoError(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                error={promoError}
              />
            </View>
            <Button
              title={t("checkout.apply")}
              variant="outline"
              size="md"
              style={{ marginTop: 26 }}
              loading={checkPromo.isPending}
              disabled={!field.value}
              onPress={() => checkPromo.mutate(field.value)}
            />
          </View>
        )}
      />

      <Controller
        control={form.control}
        name="withBilling"
        render={({ field }) => <Checkbox checked={field.value} onChange={field.onChange} label={t("checkout.withBilling")} />}
      />
      {withBilling ? (
        <View style={{ gap: 12 }}>
          {(["name", "street", "zip", "city"] as const).map((name) => (
            <Controller
              key={name}
              control={form.control}
              name={name}
              render={({ field, fieldState }) => (
                <Input
                  label={t(`checkout.billing.${name}`)}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  keyboardType={name === "zip" ? "number-pad" : "default"}
                  autoComplete={name === "name" ? "name" : name === "zip" ? "postal-code" : name === "street" ? "street-address" : "off"}
                  error={msg(fieldState.error?.message)}
                />
              )}
            />
          ))}
        </View>
      ) : null}

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
                  <Text variant="small" style={styles.link} onPress={() => void Linking.openURL(`${env.siteUrl}/agb`)}>
                    {t("legal.terms")}
                  </Text>{" "}
                  {t("checkout.termsMiddle")}{" "}
                  <Text variant="small" style={styles.link} onPress={() => void Linking.openURL(`${env.siteUrl}/datenschutz`)}>
                    {t("legal.privacy")}
                  </Text>
                  .
                </Text>
              }
            />
            {fieldState.error ? <Text variant="small" style={{ color: colors.danger }}>{msg(fieldState.error.message)}</Text> : null}
          </View>
        )}
      />
      <Controller
        control={form.control}
        name="immediate"
        render={({ field, fieldState }) => (
          <View style={{ gap: 4 }}>
            <Checkbox checked={field.value} onChange={field.onChange} label={t("checkout.immediate")} />
            {fieldState.error ? <Text variant="small" style={{ color: colors.danger }}>{msg(fieldState.error.message)}</Text> : null}
          </View>
        )}
      />

      {order.error ? <Notice tone="danger">{errorMessage(t, order.error)}</Notice> : null}
      <Button
        title={t("checkout.pay", { amount: f.money(total, pkg.currency) })}
        icon={<Lock color={colors.ink} size={16} />}
        loading={order.isPending}
        onPress={form.handleSubmit((v) => order.mutate(v))}
      />
      <Text variant="small" style={{ textAlign: "center" }}>
        {t("checkout.secure")}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sumRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
  total: { borderTopWidth: 1, borderTopColor: "#DDE1E5", paddingTop: 12 },
  promo: { flexDirection: "row", gap: 8, alignItems: "flex-start" },
  link: { color: "#003B7A", textDecorationLine: "underline" },
});

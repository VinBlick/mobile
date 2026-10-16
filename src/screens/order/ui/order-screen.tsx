import { useCallback, useEffect, useRef } from "react";
import { AppState, StyleSheet, View } from "react-native";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FileText, Receipt } from "lucide-react-native";
import { OrderStatusBadge, isOrderInProgress, orderAccessStore, orderApi, orderKeys, orderQuery, packageName, type Order } from "@/entities/order";
import { paymentAdapter } from "@/features/checkout";
import { usePdfDownload } from "@/features/report-files";
import { errorMessage, useI18n } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Button, Card, ErrorState, FadeIn, Loading, Notice, Row, Screen, Text } from "@/shared/ui";
import { OrderProgress } from "@/widgets/order-progress";

export function OrderScreen() {
  const { t, locale } = useI18n();
  const f = useFormat();
  const router = useRouter();
  const client = useQueryClient();
  const { id, pay, access } = useLocalSearchParams<{ id: string; pay?: string; access?: string }>();
  const startedPayment = useRef(false);
  const pdf = usePdfDownload();

  // order links from e-mails carry ?access=… — remember them for later
  useEffect(() => {
    if (access) void orderAccessStore.add({ orderId: id, token: access, vin: "", createdAt: new Date().toISOString() });
  }, [access, id]);

  const query = useQuery(orderQuery(id));
  const order = query.data;
  const setOrder = useCallback((o: Order) => client.setQueryData(orderKeys.detail(id), o), [client, id]);

  const reconcile = useMutation({ mutationFn: () => orderApi.reconcile(id), onSuccess: setOrder });
  const checkout = useMutation({
    mutationFn: async () => {
      const url = await orderApi.checkout(id);
      await paymentAdapter.pay({ orderId: id, checkoutUrl: url });
    },
    onSettled: () => reconcile.mutate(),
  });
  const cancel = useMutation({ mutationFn: () => orderApi.cancel(id), onSuccess: setOrder });

  // start the payment right after the order was created
  useEffect(() => {
    if (pay === "1" && order?.status === "awaiting_payment" && !startedPayment.current) {
      startedPayment.current = true;
      checkout.mutate();
    }
  }, [pay, order?.status, checkout]);

  // returning from the browser / store: ask the API for the real payment state
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) => {
      if (s === "active" && client.getQueryData<Order>(orderKeys.detail(id))?.status === "awaiting_payment") reconcile.mutate();
    });
    return () => sub.remove();
  }, [client, id, reconcile]);

  if (query.isLoading) return <Loading />;
  if (!order) return <ErrorState error={query.error} onRetry={() => query.refetch()} />;

  const ready = order.report?.status === "ready";
  const inProgress = isOrderInProgress(order.status);
  const orderAccess = () => orderApi.accessFor(order.id);

  return (
    <Screen background={colors.surface} refreshing={query.isRefetching} onRefresh={() => void query.refetch()}>
      <FadeIn style={{ gap: 6 }}>
        <Text variant="small">{t("order.number", { n: order.number })}</Text>
        <Text variant="h1">
          {ready ? t("order.ready") : order.status === "awaiting_payment" ? t("order.awaitingPayment") : inProgress ? t("order.processing") : t(`orderStatus.${order.status}`)}
        </Text>
        <OrderStatusBadge status={order.status} />
      </FadeIn>

      <Card>
        <View style={styles.kv}>
          <Text variant="small">{t("order.vin")}</Text>
          <Text variant="mono">{order.vin}</Text>
        </View>
        <View style={styles.kv}>
          <Text variant="small">{t("order.package")}</Text>
          <Text variant="label">{packageName(order, locale)}</Text>
        </View>
        <View style={styles.kv}>
          <Text variant="small">{t("order.total")}</Text>
          <Text variant="label">{f.money(order.totalCents, order.currency)}</Text>
        </View>
        <View style={styles.kv}>
          <Text variant="small">{t("order.date")}</Text>
          <Text>{f.dateTime(order.createdAt)}</Text>
        </View>
      </Card>

      {order.status !== "awaiting_payment" && order.status !== "cancelled" ? (
        <Card>
          <OrderProgress order={order} />
          {inProgress ? <Text variant="small">{t("order.autoRefresh")}</Text> : null}
        </Card>
      ) : null}

      {order.status === "failed" ? <Notice tone="warning">{t("order.delayed")}</Notice> : null}

      {order.status === "awaiting_payment" ? (
        <View style={{ gap: 10 }}>
          {checkout.isPending || reconcile.isPending ? <Notice>{t("order.verifying")}</Notice> : null}
          {checkout.error ? <Notice tone="danger">{errorMessage(t, checkout.error)}</Notice> : null}
          <Button title={t("order.pay")} loading={checkout.isPending} onPress={() => checkout.mutate()} />
          <Button title={t("order.cancel")} variant="ghost" loading={cancel.isPending} onPress={() => cancel.mutate()} />
        </View>
      ) : null}

      {ready ? (
        <View style={{ gap: 10 }}>
          <Button title={t("order.viewReport")} onPress={() => router.push({ pathname: "/orders/[id]/report", params: { id: order.id } })} />
          <Button
            title={t("order.pdf")}
            variant="outline"
            loading={pdf.pending === orderApi.reportPdfPath(order.id)}
            onPress={async () =>
              pdf.download({ path: orderApi.reportPdfPath(order.id), filename: `VINblick-${order.vin}.pdf`, orderAccess: await orderAccess() })
            }
          />
          {order.report?.validUntil ? <Text variant="small">{t("order.validUntil", { date: f.date(order.report.validUntil) })}</Text> : null}
        </View>
      ) : null}
      {pdf.error ? <Notice tone="danger">{errorMessage(t, pdf.error)}</Notice> : null}

      {order.invoices.length ? (
        <Card>
          <Text variant="h3">{t("order.invoices")}</Text>
          {order.invoices.map((inv) => (
            <Row
              key={inv.id}
              icon={inv.type === "INVOICE" ? <Receipt color={colors.brand} size={18} /> : <FileText color={colors.brand} size={18} />}
              title={inv.number}
              subtitle={`${inv.type === "INVOICE" ? t("order.invoice") : t("order.creditNote")} · ${f.date(inv.issuedAt)} · ${f.money(inv.grossCents, order.currency)}`}
              onPress={async () =>
                pdf.download({ path: orderApi.invoicePdfPath(order.id, inv.id), filename: `${inv.number}.pdf`, orderAccess: await orderAccess() })
              }
            />
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
});

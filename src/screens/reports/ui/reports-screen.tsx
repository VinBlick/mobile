import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Car, FileSearch } from "lucide-react-native";
import { guestOrdersQuery, myOrdersQuery, OrderStatusBadge, packageName, type Order } from "@/entities/order";
import { sessionQuery } from "@/entities/session";
import { useI18n } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Button, Card, EmptyState, ErrorState, FadeIn, Loading, Notice, PressableScale, Screen, Text } from "@/shared/ui";
import { StyleSheet, View } from "react-native";

function OrderCard({ order, index }: { order: Order; index: number }) {
  const { locale } = useI18n();
  const f = useFormat();
  const router = useRouter();
  return (
    <FadeIn index={index}>
      <PressableScale accessibilityRole="button" onPress={() => router.push({ pathname: "/orders/[id]", params: { id: order.id } })}>
        <Card>
          <View style={styles.head}>
            <View style={styles.icon}>
              <Car color={colors.brand} size={20} />
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="mono">{order.vin}</Text>
              <Text variant="small">
                {packageName(order, locale)} · {f.date(order.createdAt)}
              </Text>
            </View>
          </View>
          <View style={styles.foot}>
            <OrderStatusBadge status={order.status} />
            <Text variant="small">#{order.number}</Text>
          </View>
        </Card>
      </PressableScale>
    </FadeIn>
  );
}

export function ReportsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const session = useQuery(sessionQuery);
  const signedIn = Boolean(session.data);
  const mine = useQuery({ ...myOrdersQuery, enabled: signedIn });
  const guest = useQuery(guestOrdersQuery);

  if (session.isLoading || (signedIn && mine.isLoading) || guest.isLoading) return <Loading />;
  if (signedIn && mine.error && !mine.data) return <ErrorState error={mine.error} onRetry={() => mine.refetch()} />;

  const ids = new Set((mine.data ?? []).map((o) => o.id));
  const orders = [...(mine.data ?? []), ...(guest.data ?? []).filter((o) => !ids.has(o.id))].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <Screen
      edges={["top", "left", "right"]}
      background={colors.surface}
      refreshing={mine.isRefetching || guest.isRefetching}
      onRefresh={() => {
        void guest.refetch();
        if (signedIn) void mine.refetch();
      }}
    >
      <Text variant="h1">{t("reports.title")}</Text>
      {!signedIn ? (
        <Notice>
          {t("reports.guestHint")}
        </Notice>
      ) : null}
      {orders.length === 0 ? (
        <EmptyState
          icon={<FileSearch color={colors.brand} size={32} />}
          title={t("reports.empty")}
          description={t("reports.emptyText")}
          action={<Button title={t("reports.startCheck")} onPress={() => router.navigate("/")} />}
        />
      ) : (
        orders.map((o, i) => <OrderCard key={o.id} order={o} index={i} />)
      )}
      {!signedIn ? <Button title={t("auth.signIn")} variant="outline" onPress={() => router.push("/auth/sign-in")} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", gap: 12, alignItems: "center" },
  icon: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  foot: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});

import { StyleSheet, View } from "react-native";
import { CircleCheck, CircleMinus, Info } from "lucide-react-native";
import type { VinCheck } from "@/entities/check";
import { useT, type TKey } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors, fonts } from "@/shared/theme";
import { Card, FadeIn, Text } from "@/shared/ui";

export function CheckResult({ check }: { check: VinCheck }) {
  const t = useT();
  const f = useFormat();
  const found = check.categories.filter((c) => c.found);
  const vehicle = [check.vehicle.manufacturer, check.vehicle.model, check.vehicle.modelYear].filter(Boolean).join(" ");
  return (
    <Card elevated>
      <View style={styles.head}>
        {check.anyDataFound ? <CircleCheck color={colors.success} size={22} /> : <CircleMinus color={colors.muted} size={22} />}
        <Text variant="h3" style={{ flex: 1 }}>
          {check.anyDataFound ? t("check.found") : t("check.notFound")}
        </Text>
      </View>
      <Text variant="mono" style={{ color: colors.muted, fontSize: 13 }}>
        {check.vin}
        {vehicle ? ` · ${vehicle}` : ""}
      </Text>
      {found.length ? (
        <View style={styles.grid}>
          {found.map((c, i) => (
            <FadeIn key={c.category} index={i} style={styles.item}>
              <View style={styles.count}>
                <Text style={styles.countText}>{c.count ?? "✓"}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 15 }}>{t(`categories.${c.category}` as TKey)}</Text>
            </FadeIn>
          ))}
        </View>
      ) : (
        <Text variant="bodyMuted">{t("check.notFoundHint")}</Text>
      )}
      {check.cached ? (
        <View style={styles.cached}>
          <Info color={colors.muted} size={14} />
          <Text variant="small" style={{ flex: 1 }}>
            {t("check.cached", { date: f.date(check.cached.fetchedAt) })}
          </Text>
        </View>
      ) : null}
      <Text variant="small">{t("check.freeHint")}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  grid: { gap: 8 },
  item: { flexDirection: "row", alignItems: "center", gap: 10 },
  count: { minWidth: 30, alignItems: "center", backgroundColor: colors.accent, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  countText: { fontFamily: fonts.bold, fontSize: 13, color: colors.brand },
  cached: { flexDirection: "row", gap: 6, alignItems: "flex-start" },
});

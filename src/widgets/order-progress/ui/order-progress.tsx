import { StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { CircleCheck, CircleDashed, CircleX, LoaderCircle } from "lucide-react-native";
import type { Order } from "@/entities/order";
import { useT, type TKey } from "@/shared/i18n";
import { colors, fonts } from "@/shared/theme";
import { Text } from "@/shared/ui";

const ORDER = ["FETCH", "ANALYZE", "PDF", "NOTIFY"] as const;

export function OrderProgress({ order }: { order: Order }) {
  const t = useT();
  const done = order.progress.completedSteps;
  const total = order.progress.totalSteps || ORDER.length;
  const bar = useAnimatedStyle(() => ({ width: withTiming(`${Math.round((done / total) * 100)}%`, { duration: 500 }) }));
  return (
    <View style={{ gap: 14 }}>
      <View style={styles.track} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: done }}>
        <Animated.View style={[styles.fill, bar]} />
      </View>
      {ORDER.map((name) => {
        const s = order.progress.steps.find((x) => x.step === name)?.status ?? "pending";
        return (
          <View key={name} style={styles.row}>
            {s === "completed" ? (
              <CircleCheck color={colors.success} size={20} />
            ) : s === "failed" ? (
              <CircleX color={colors.warning} size={20} />
            ) : s === "running" ? (
              <LoaderCircle color={colors.brand} size={20} />
            ) : (
              <CircleDashed color={colors.subtle} size={20} />
            )}
            <Text style={[styles.label, s !== "completed" && { color: colors.muted }]}>
              {t(`steps.${name}` as TKey)}
              {s === "failed" ? ` – ${t("steps.retrying")}` : ""}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.accent, borderRadius: 4 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  label: { fontFamily: fonts.medium, fontSize: 15 },
});

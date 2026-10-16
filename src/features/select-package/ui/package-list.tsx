import { StyleSheet, View } from "react-native";
import { Check, CircleDot, Circle } from "lucide-react-native";
import { RECOMMENDED_PACKAGE, type ReportPackage } from "@/entities/package";
import { useT, type TKey } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors, fonts, radius } from "@/shared/theme";
import { Badge, FadeIn, PressableScale, Text } from "@/shared/ui";

/** radio list of packages; marks categories the free check found for this VIN */
export function PackageList({
  packages,
  selected,
  onSelect,
  foundCategories,
}: {
  packages: ReportPackage[];
  selected: string | null;
  onSelect: (code: string) => void;
  foundCategories?: string[];
}) {
  const t = useT();
  const f = useFormat();
  return (
    <View style={{ gap: 12 }} accessibilityRole="radiogroup">
      {packages.map((p, i) => {
        const active = p.code === selected;
        const covered = foundCategories ? p.categories.filter((c) => foundCategories.includes(c)).length : null;
        return (
          <FadeIn key={p.code} index={i}>
            <PressableScale
              haptic
              accessibilityRole="radio"
              accessibilityState={{ checked: active }}
              accessibilityLabel={`${p.name}, ${f.money(p.priceCents, p.currency)}`}
              onPress={() => onSelect(p.code)}
              style={[styles.card, active && styles.active]}
            >
              <View style={styles.head}>
                {active ? <CircleDot color={colors.brand} size={22} /> : <Circle color={colors.inputBorder} size={22} />}
                <View style={{ flex: 1, gap: 4 }}>
                  {p.code === RECOMMENDED_PACKAGE ? <Badge label={t("packages.popular")} tone="accent" /> : null}
                  <Text variant="h2" style={{ color: colors.brandDark }}>
                    {p.name}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.price}>{f.money(p.priceCents, p.currency)}</Text>
                  <Text variant="small">{t("packages.inclVat")}</Text>
                </View>
              </View>
              <Text variant="bodyMuted">{p.description}</Text>
              {covered !== null ? (
                <Text variant="small" style={{ color: colors.brand, fontFamily: fonts.semibold }}>
                  {t("packages.coverage", { n: covered, total: foundCategories!.length })}
                </Text>
              ) : null}
              {active ? (
                <View style={styles.list}>
                  {p.categories.map((c) => (
                    <View key={c} style={styles.li}>
                      <Check color={foundCategories?.includes(c) ? colors.success : colors.brand} size={16} />
                      <Text style={{ fontSize: 14 }}>{t(`categories.${c}` as TKey)}</Text>
                    </View>
                  ))}
                  {p.features.map((ft) => (
                    <View key={ft} style={styles.li}>
                      <Check color={colors.brand} size={16} />
                      <Text style={{ fontSize: 14 }}>{t(`features.${ft}` as TKey)}</Text>
                    </View>
                  ))}
                  <Text variant="small">{t("packages.validity", { n: p.reportValidityDays })}</Text>
                </View>
              ) : null}
            </PressableScale>
          </FadeIn>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: colors.line, borderRadius: radius.lg, padding: 16, gap: 10, backgroundColor: colors.white },
  active: { borderColor: colors.accent, borderWidth: 2, padding: 15, backgroundColor: "#FFFDF0" },
  head: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  price: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.ink, letterSpacing: -0.5 },
  list: { gap: 6, paddingTop: 4 },
  li: { flexDirection: "row", gap: 8, alignItems: "center" },
});

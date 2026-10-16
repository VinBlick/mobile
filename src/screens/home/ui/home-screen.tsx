import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import { BadgeCheck, Clock, Handshake, QrCode, ScanLine } from "lucide-react-native";
import { VinForm } from "@/features/check-vin";
import { useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Card, FadeIn, Logo, PressableScale, Screen, Text } from "@/shared/ui";

export function HomeScreen() {
  const t = useT();
  const router = useRouter();
  const benefits = [
    { icon: BadgeCheck, title: t("home.benefit1"), text: t("home.benefit1Text") },
    { icon: Clock, title: t("home.benefit2"), text: t("home.benefit2Text") },
    { icon: Handshake, title: t("home.benefit3"), text: t("home.benefit3Text") },
  ];
  return (
    <Screen edges={["top", "left", "right"]} background={colors.surface}>
      <FadeIn>
        <Logo />
      </FadeIn>
      <FadeIn index={1} style={{ gap: 12, marginTop: 8 }}>
        <Text variant="overline">{t("home.overline")}</Text>
        <Text variant="display">{t("home.title")}</Text>
        <Text variant="bodyMuted">{t("home.subtitle")}</Text>
      </FadeIn>
      <FadeIn index={2}>
        <Card elevated>
          <VinForm />
        </Card>
      </FadeIn>
      <FadeIn index={3}>
        <View style={styles.quick}>
          <PressableScale accessibilityRole="button" style={styles.quickItem} onPress={() => router.push("/scan")} haptic>
            <ScanLine color={colors.brand} size={24} />
            <Text variant="label">{t("home.scanVin")}</Text>
            <Text variant="small">{t("home.scanVinText")}</Text>
          </PressableScale>
          <PressableScale accessibilityRole="button" style={styles.quickItem} onPress={() => router.push({ pathname: "/scan", params: { mode: "code" } })} haptic>
            <QrCode color={colors.brand} size={24} />
            <Text variant="label">{t("home.scanCode")}</Text>
            <Text variant="small">{t("home.scanCodeText")}</Text>
          </PressableScale>
        </View>
      </FadeIn>
      {benefits.map((b, i) => (
        <FadeIn key={b.title} index={4 + i}>
          <View style={styles.benefit}>
            <View style={styles.benefitIcon}>
              <b.icon color={colors.brand} size={20} />
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="h3">{b.title}</Text>
              <Text variant="small">{b.text}</Text>
            </View>
          </View>
        </FadeIn>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quick: { flexDirection: "row", gap: 12 },
  quickItem: { flex: 1, backgroundColor: colors.white, borderRadius: 8, borderWidth: 1, borderColor: colors.line, padding: 14, gap: 6 },
  benefit: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  benefitIcon: { width: 40, height: 40, borderRadius: 8, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
});

import { StyleSheet, View } from "react-native";
import { colors, fonts, radius } from "@/shared/theme";
import { Text } from "./text";

export type BadgeTone = "accent" | "brand" | "success" | "warning" | "danger" | "muted";

const tones: Record<BadgeTone, { bg: string; fg: string }> = {
  accent: { bg: colors.accent, fg: colors.brand },
  brand: { bg: "#E6EEF7", fg: colors.brand },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  muted: { bg: colors.surface, fg: colors.muted },
};

export function Badge({ label, tone = "muted" }: { label: string; tone?: BadgeTone }) {
  const t = tones[tone];
  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: "flex-start", borderRadius: radius.sm, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontFamily: fonts.semibold, fontSize: 12, lineHeight: 16 },
});

import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius, shadow } from "@/shared/theme";

export function Card({ children, style, elevated = false }: { children: ReactNode; style?: StyleProp<ViewStyle>; elevated?: boolean }) {
  return <View style={[styles.card, elevated && shadow.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 12 },
});

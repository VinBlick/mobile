import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, fonts, radius } from "@/shared/theme";
import { PressableScale } from "./pressable-scale";
import { Text } from "./text";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  iconRight,
  style,
  size = "lg",
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
  style?: StyleProp<ViewStyle>;
  size?: "md" | "lg";
  accessibilityLabel?: string;
}) {
  const v = styles[variant];
  const text = textColor[variant];
  return (
    <PressableScale
      haptic
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, size === "md" && styles.md, v, (disabled || loading) && styles.disabled, style]}
    >
      {loading ? <ActivityIndicator color={text} /> : icon ? <View>{icon}</View> : null}
      <Text style={[styles.label, { color: text }]} numberOfLines={1}>
        {title}
      </Text>
      {iconRight && !loading ? <View>{iconRight}</View> : null}
    </PressableScale>
  );
}

const textColor: Record<Variant, string> = {
  primary: colors.ink,
  secondary: colors.white,
  outline: colors.brand,
  ghost: colors.brand,
  danger: colors.danger,
};

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.md,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  md: { minHeight: 44, paddingHorizontal: 16 },
  primary: { backgroundColor: colors.accent },
  secondary: { backgroundColor: colors.brand },
  outline: { borderWidth: 1, borderColor: colors.line, backgroundColor: colors.white },
  ghost: { backgroundColor: "transparent" },
  danger: { borderWidth: 1, borderColor: "#FECACA", backgroundColor: colors.dangerBg },
  disabled: { opacity: 0.6 },
  label: { fontFamily: fonts.bold, fontSize: 15 },
});

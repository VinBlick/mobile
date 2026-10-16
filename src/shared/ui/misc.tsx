import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Check, ChevronRight } from "lucide-react-native";
import { colors, fonts, radius } from "@/shared/theme";
import { PressableScale } from "./pressable-scale";
import { Text } from "./text";

/** entrance animation for list items / sections */
export function FadeIn({ children, index = 0, style }: { children: ReactNode; index?: number; style?: StyleProp<ViewStyle> }) {
  return (
    <Animated.View entering={FadeInDown.duration(320).delay(Math.min(index, 8) * 50)} style={style}>
      {children}
    </Animated.View>
  );
}

export function Skeleton({ height = 16, width = "100%", style }: { height?: number; width?: number | `${number}%`; style?: StyleProp<ViewStyle> }) {
  const opacity = useSharedValue(0.5);
  useEffect(() => {
    opacity.set(withRepeat(withTiming(1, { duration: 700 }), -1, true));
  }, [opacity]);
  const animated = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[{ height, width, borderRadius: 6, backgroundColor: colors.surface }, animated, style]} />;
}

export function Divider() {
  return <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: colors.line }} />;
}

/** settings / menu row */
export function Row({
  title,
  subtitle,
  icon,
  right,
  onPress,
  destructive,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
}) {
  const content = (
    <View style={styles.row}>
      {icon ? <View style={styles.rowIcon}>{icon}</View> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.rowTitle, destructive && { color: colors.danger }]}>{title}</Text>
        {subtitle ? <Text variant="small">{subtitle}</Text> : null}
      </View>
      {right ?? (onPress ? <ChevronRight color={colors.subtle} size={18} /> : null)}
    </View>
  );
  return onPress ? (
    <PressableScale accessibilityRole="button" onPress={onPress}>
      {content}
    </PressableScale>
  ) : (
    content
  );
}

export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={styles.checkRow}
      hitSlop={6}
    >
      <View style={[styles.box, checked && styles.boxOn]}>{checked ? <Check color={colors.white} size={14} strokeWidth={3} /> : null}</View>
      <View style={{ flex: 1 }}>{typeof label === "string" ? <Text variant="small" style={{ color: colors.ink }}>{label}</Text> : label}</View>
    </Pressable>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segment} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segmentItem, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && { color: colors.ink }]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 14 },
  rowIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontFamily: fonts.semibold, fontSize: 15, color: colors.ink },
  checkRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  box: { width: 22, height: 22, borderRadius: 5, borderWidth: 1.5, borderColor: colors.inputBorder, alignItems: "center", justifyContent: "center", marginTop: 1 },
  boxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  segment: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.md, padding: 3 },
  segmentItem: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: radius.sm },
  segmentActive: { backgroundColor: colors.white, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  segmentText: { fontFamily: fonts.semibold, fontSize: 13, color: colors.muted },
});

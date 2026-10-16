import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";
import { colors } from "@/shared/theme";

/** page container: safe area, scroll, pull-to-refresh, keyboard avoiding */
export function Screen({
  children,
  scroll = true,
  background = colors.white,
  edges = ["left", "right"],
  contentStyle,
  refreshing,
  onRefresh,
  footer,
}: {
  children: ReactNode;
  scroll?: boolean;
  background?: string;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  refreshing?: boolean;
  onRefresh?: () => void;
  footer?: ReactNode;
}) {
  return (
    <SafeAreaView edges={edges} style={[styles.flex, { backgroundColor: background }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.content, contentStyle]}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              onRefresh ? <RefreshControl refreshing={Boolean(refreshing)} onRefresh={onRefresh} tintColor={colors.brand} /> : undefined
            }
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.flex, styles.content, contentStyle]}>{children}</View>
        )}
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  footer: { padding: 16, paddingBottom: 24, borderTopWidth: 1, borderTopColor: colors.line, backgroundColor: colors.white },
});

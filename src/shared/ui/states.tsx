import type { ReactNode } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { CircleAlert, Inbox } from "lucide-react-native";
import { errorMessage, useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button } from "./button";
import { Text } from "./text";

export function Loading({ label }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar" accessibilityLabel={label}>
      <ActivityIndicator color={colors.brand} size="large" />
      {label ? <Text variant="small">{label}</Text> : null}
    </View>
  );
}

export function EmptyState({ title, description, icon, action }: { title: string; description?: string; icon?: ReactNode; action?: ReactNode }) {
  return (
    <View style={styles.center}>
      <View style={styles.icon}>{icon ?? <Inbox color={colors.muted} size={22} />}</View>
      <Text variant="h3" style={styles.text}>
        {title}
      </Text>
      {description ? (
        <Text variant="bodyMuted" style={styles.text}>
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const t = useT();
  return (
    <EmptyState
      icon={<CircleAlert color={colors.danger} size={22} />}
      title={t("errors.title")}
      description={errorMessage(t, error)}
      action={onRetry ? <Button title={t("common.retry")} variant="outline" size="md" onPress={onRetry} /> : null}
    />
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "danger" | "success" | "warning"; children: ReactNode }) {
  const map = {
    info: { bg: colors.surface, fg: colors.muted },
    danger: { bg: colors.dangerBg, fg: colors.danger },
    success: { bg: colors.successBg, fg: colors.success },
    warning: { bg: colors.warningBg, fg: colors.warning },
  }[tone];
  return (
    <View style={[styles.notice, { backgroundColor: map.bg }]} accessibilityLiveRegion="polite">
      {typeof children === "string" ? <Text style={{ color: map.fg, fontSize: 14, lineHeight: 20 }}>{children}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 48, paddingHorizontal: 24 },
  icon: { backgroundColor: colors.surface, borderRadius: 999, padding: 12, marginBottom: 4 },
  text: { textAlign: "center" },
  notice: { borderRadius: 6, padding: 12 },
});

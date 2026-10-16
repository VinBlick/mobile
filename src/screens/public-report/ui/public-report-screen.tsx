import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { ShieldCheck } from "lucide-react-native";
import { View } from "react-native";
import { publicReportQuery } from "@/entities/report";
import { useFormat } from "@/shared/lib";
import { useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { ErrorState, Loading, Notice, Screen, Text } from "@/shared/ui";
import { ReportView } from "@/widgets/report-view";

/** report opened via public link (/r/<token>) or seller check code (/check/<code>) */
export function PublicReportScreen() {
  const t = useT();
  const f = useFormat();
  const { token, code } = useLocalSearchParams<{ token?: string; code?: string }>();
  const report = useQuery(publicReportQuery({ token, code }));
  if (report.isLoading) return <Loading />;
  if (!report.data) return <ErrorState error={report.error} onRetry={() => report.refetch()} />;
  return (
    <Screen background={colors.surface}>
      <Notice tone="success">
        <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
          <ShieldCheck color={colors.success} size={18} />
          <Text variant="small" style={{ color: colors.success, flex: 1 }}>
            {code
              ? t("public.verifiedCode", { code })
              : t("public.shared", { date: f.date(report.data.shareLink?.expiresAt) })}
          </Text>
        </View>
      </Notice>
      <ReportView report={report.data} />
    </Screen>
  );
}

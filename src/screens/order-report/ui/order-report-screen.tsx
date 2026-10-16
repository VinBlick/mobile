import { useEffect } from "react";
import { View } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { orderAccessStore, orderApi } from "@/entities/order";
import { orderReportQuery } from "@/entities/report";
import { sessionQuery } from "@/entities/session";
import { usePdfDownload } from "@/features/report-files";
import { SharePanel } from "@/features/share-report";
import { errorMessage, useT } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, ErrorState, Loading, Notice, Screen } from "@/shared/ui";
import { ReportView } from "@/widgets/report-view";

export function OrderReportScreen() {
  const t = useT();
  const { id, access } = useLocalSearchParams<{ id: string; access?: string }>();
  // e-mail links carry ?access=… — use it right away and keep it for later
  const getAccess = async (orderId: string) => access ?? orderApi.accessFor(orderId);
  useEffect(() => {
    if (access) void orderAccessStore.add({ orderId: id, token: access, vin: "", createdAt: new Date().toISOString() });
  }, [access, id]);
  const report = useQuery(orderReportQuery(id, getAccess));
  const session = useQuery(sessionQuery);
  const pdf = usePdfDownload();
  if (report.isLoading) return <Loading />;
  if (!report.data) return <ErrorState error={report.error} onRetry={() => report.refetch()} />;
  return (
    <Screen background={colors.surface} refreshing={report.isRefetching} onRefresh={() => void report.refetch()}>
      {report.isError && report.data ? <Notice tone="warning">{t("report.offline")}</Notice> : null}
      <ReportView report={report.data} />
      <View style={{ gap: 10 }}>
        <Button
          title={t("order.pdf")}
          variant="outline"
          loading={Boolean(pdf.pending)}
          onPress={async () =>
            pdf.download({ path: orderApi.reportPdfPath(id), filename: `VINblick-${report.data!.vin}.pdf`, orderAccess: await getAccess(id) })
          }
        />
        {pdf.error ? <Notice tone="danger">{errorMessage(t, pdf.error)}</Notice> : null}
      </View>
      {session.data && report.data.id ? <SharePanel reportId={report.data.id} /> : <Notice>{t("share.signInHint")}</Notice>}
    </Screen>
  );
}

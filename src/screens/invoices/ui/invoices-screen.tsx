import { useQuery } from "@tanstack/react-query";
import { FileText, Receipt } from "lucide-react-native";
import { invoicePdfPath, myInvoicesQuery } from "@/entities/invoice";
import { usePdfDownload } from "@/features/report-files";
import { errorMessage, useT } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Card, EmptyState, ErrorState, Loading, Notice, Row, Screen } from "@/shared/ui";

export function InvoicesScreen() {
  const t = useT();
  const f = useFormat();
  const pdf = usePdfDownload();
  const q = useQuery(myInvoicesQuery);
  if (q.isLoading) return <Loading />;
  if (!q.data) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  return (
    <Screen background={colors.surface} refreshing={q.isRefetching} onRefresh={() => void q.refetch()}>
      {pdf.error ? <Notice tone="danger">{errorMessage(t, pdf.error)}</Notice> : null}
      {q.data.length === 0 ? (
        <EmptyState icon={<Receipt color={colors.brand} size={32} />} title={t("invoices.empty")} />
      ) : (
        <Card>
          {q.data.map((inv) => (
            <Row
              key={inv.id}
              icon={inv.type === "INVOICE" ? <Receipt color={colors.brand} size={18} /> : <FileText color={colors.brand} size={18} />}
              title={inv.number}
              subtitle={`${inv.type === "INVOICE" ? t("order.invoice") : t("order.creditNote")} · ${f.date(inv.issuedAt)} · ${f.money(inv.grossCents, inv.currency)}`}
              onPress={() => void pdf.download({ path: invoicePdfPath(inv.id), filename: `${inv.number}.pdf` })}
            />
          ))}
        </Card>
      )}
    </Screen>
  );
}

import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { packagesQuery } from "@/entities/package";
import { sessionQuery } from "@/entities/session";
import { CheckoutForm } from "@/features/checkout";
import { useI18n } from "@/shared/i18n";
import { ErrorState, Loading, Screen } from "@/shared/ui";

export function CheckoutScreen() {
  const { locale } = useI18n();
  const { vin, pkg, checkId } = useLocalSearchParams<{ vin: string; pkg: string; checkId?: string }>();
  const packages = useQuery(packagesQuery(locale));
  const session = useQuery(sessionQuery);
  const selected = packages.data?.find((p) => p.code === pkg);
  if (packages.isLoading || session.isLoading) return <Loading />;
  if (!selected) return <ErrorState error={packages.error ?? new Error("Paket nicht gefunden")} onRetry={() => packages.refetch()} />;
  return (
    <Screen>
      <CheckoutForm pkg={selected} vin={vin} checkId={checkId} userEmail={session.data?.email} />
    </Screen>
  );
}

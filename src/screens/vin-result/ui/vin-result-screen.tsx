import { useEffect, useState } from "react";
import { View } from "react-native";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { checkKey, type VinCheck } from "@/entities/check";
import { packagesQuery, RECOMMENDED_PACKAGE } from "@/entities/package";
import { CheckResult, useVinCheck } from "@/features/check-vin";
import { PackageList } from "@/features/select-package";
import { useI18n } from "@/shared/i18n";
import { colors } from "@/shared/theme";
import { Button, ErrorState, Loading, Screen, Skeleton, Text } from "@/shared/ui";

export function VinResultScreen() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { vin } = useLocalSearchParams<{ vin: string }>();
  const client = useQueryClient();
  const cached = client.getQueryData<VinCheck>(checkKey(vin));
  const check = useVinCheck();
  const data = cached ?? check.data;
  const packages = useQuery(packagesQuery(locale));
  const [picked, setSelected] = useState<string | null>(null);
  const selected = picked ?? packages.data?.find((p) => p.code === RECOMMENDED_PACKAGE)?.code ?? packages.data?.[0]?.code ?? null;

  useEffect(() => {
    if (!cached && !check.isPending && !check.data && !check.error) check.mutate({ vin });
  }, [cached, check, vin]);

  if (!data) return check.error ? <ErrorState error={check.error} onRetry={() => check.mutate({ vin })} /> : <Loading label={t("vin.checking")} />;

  const found = data.categories.filter((c) => c.found).map((c) => c.category);

  return (
    <Screen
      background={colors.surface}
      footer={
        data.anyDataFound && selected ? (
          <Button
            title={t("packages.continue")}
            iconRight={<ArrowRight color={colors.ink} size={18} />}
            onPress={() => router.push({ pathname: "/checkout", params: { vin: data.vin, pkg: selected, checkId: data.id } })}
          />
        ) : undefined
      }
    >
      <CheckResult check={data} />
      {data.anyDataFound ? (
        <View style={{ gap: 12 }}>
          <Text variant="h2">{t("packages.title")}</Text>
          {packages.isLoading ? (
            <>
              <Skeleton height={120} />
              <Skeleton height={120} />
            </>
          ) : packages.error ? (
            <ErrorState error={packages.error} onRetry={() => packages.refetch()} />
          ) : (
            <PackageList packages={packages.data ?? []} selected={selected} onSelect={setSelected} foundCategories={found} />
          )}
        </View>
      ) : (
        <Button title={t("vin.another")} variant="outline" onPress={() => router.back()} />
      )}
    </Screen>
  );
}

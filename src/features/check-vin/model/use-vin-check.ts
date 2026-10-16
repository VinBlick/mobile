import { useMutation, useQueryClient } from "@tanstack/react-query";
import { checkKey, runVinCheck } from "@/entities/check";
import { useI18n } from "@/shared/i18n";

export function useVinCheck() {
  const { locale } = useI18n();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { vin?: string; listingUrl?: string }) => runVinCheck({ ...input, locale }),
    onSuccess: (data) => client.setQueryData(checkKey(data.vin), data),
  });
}

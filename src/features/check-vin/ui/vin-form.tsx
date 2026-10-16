import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ArrowRight, ClipboardPaste, ScanLine } from "lucide-react-native";
import { errorMessage, useT, type TKey } from "@/shared/i18n";
import { isListingUrl, normalizeVin, parseAppLink, validateVin } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Button, Input, Notice, PressableScale, Text } from "@/shared/ui";
import { useVinCheck } from "../model/use-vin-check";

/** VIN / FIN entry with camera scan and "paste listing link" */
export function VinForm({ initialVin = "" }: { initialVin?: string }) {
  const t = useT();
  const router = useRouter();
  const [vin, setVin] = useState(initialVin);
  const [problem, setProblem] = useState<string | null>(null);
  const check = useVinCheck();
  const length = normalizeVin(vin).length;

  const goToResult = (v: string) => router.push({ pathname: "/vin/[vin]", params: { vin: v } });

  const submit = () => {
    const p = validateVin(vin);
    if (p) return setProblem(t(`vin.problem.${p}` as TKey, { n: length }));
    setProblem(null);
    const value = normalizeVin(vin);
    check.mutate({ vin: value }, { onSuccess: (d) => goToResult(d.vin) });
  };

  const paste = async () => {
    const text = (await Clipboard.getStringAsync()).trim();
    if (!text) return setProblem(t("vin.clipboardEmpty"));
    const link = parseAppLink(text);
    if (link?.type === "share") return router.push({ pathname: "/r/[token]", params: { token: link.token } });
    if (link?.type === "code") return router.push({ pathname: "/check/[code]", params: { code: link.code } });
    if (isListingUrl(text)) {
      setProblem(null);
      return check.mutate({ listingUrl: text }, { onSuccess: (d) => goToResult(d.vin) });
    }
    const candidate = normalizeVin(text);
    if (!validateVin(candidate)) {
      setVin(candidate);
      setProblem(null);
      return;
    }
    setProblem(t("vin.clipboardUnknown"));
  };

  return (
    <View style={styles.wrap}>
      <Input
        label={t("vin.label")}
        value={vin}
        onChangeText={(v) => {
          setVin(v.toUpperCase());
          setProblem(null);
          check.reset();
        }}
        placeholder={t("vin.placeholder")}
        autoCapitalize="characters"
        autoCorrect={false}
        autoComplete="off"
        maxLength={40}
        mono
        returnKeyType="search"
        onSubmitEditing={submit}
        error={problem}
        hint={t("vin.hint") + (length ? ` ${t("vin.count", { n: length })}` : "")}
        right={
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t("scan.open")}
            onPress={() => router.push("/scan")}
            style={styles.scan}
            haptic
          >
            <ScanLine color={colors.brand} size={22} />
          </PressableScale>
        }
      />
      <Button
        title={check.isPending ? t("vin.checking") : t("vin.submit")}
        loading={check.isPending}
        onPress={submit}
        iconRight={<ArrowRight color={colors.ink} size={18} />}
      />
      <PressableScale accessibilityRole="button" onPress={paste} style={styles.paste}>
        <ClipboardPaste color={colors.brand} size={16} />
        <Text style={styles.pasteText}>{t("vin.paste")}</Text>
      </PressableScale>
      {check.error ? <Notice tone="danger">{errorMessage(t, check.error)}</Notice> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  scan: { padding: 6, marginRight: -4 },
  paste: { flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "center", padding: 6 },
  pasteText: { color: colors.brand, fontSize: 14, textDecorationLine: "underline" },
});

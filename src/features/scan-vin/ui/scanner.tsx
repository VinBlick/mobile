import { useCallback, useEffect, useRef, useState } from "react";
import { Linking, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from "react-native-reanimated";
import { Flashlight, FlashlightOff } from "lucide-react-native";
import { useT } from "@/shared/i18n";
import { parseAppLink, vinFromBarcode, type AppLink } from "@/shared/lib";
import { colors, fonts } from "@/shared/theme";
import { Button, Loading, PressableScale, Text } from "@/shared/ui";

export type ScanResult = { type: "vin"; vin: string } | AppLink;

/**
 * Scans VIN barcodes (Code 39 / 128 / DataMatrix on door frames and documents)
 * and VINblick QR codes (shared reports, seller check codes).
 */
export function Scanner({ onResult }: { onResult: (r: ScanResult) => void }) {
  const t = useT();
  const [permission, requestPermission] = useCameraPermissions();
  const [torch, setTorch] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const handled = useRef(false);
  const line = useSharedValue(0);
  useEffect(() => {
    line.set(withRepeat(withTiming(1, { duration: 1600 }), -1, true));
  }, [line]);
  const lineStyle = useAnimatedStyle(() => ({ transform: [{ translateY: line.value * 180 }] }));

  const onScan = useCallback(
    ({ data, type }: BarcodeScanningResult) => {
      if (handled.current) return;
      const link = type === "qr" ? parseAppLink(data) : null;
      const vin = link ? null : vinFromBarcode(data);
      if (!link && !vin) {
        setHint(t("scan.unknown"));
        return;
      }
      handled.current = true;
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      onResult(link ?? { type: "vin", vin: vin! });
    },
    [onResult, t],
  );

  if (!permission) return <Loading />;
  if (!permission.granted)
    return (
      <View style={styles.permission}>
        <Text variant="h2" style={{ color: colors.white, textAlign: "center" }}>
          {t("scan.permissionTitle")}
        </Text>
        <Text style={{ color: "#C9D1DC", textAlign: "center" }}>{t("scan.permissionText")}</Text>
        {permission.canAskAgain ? (
          <Button title={t("scan.allow")} onPress={requestPermission} />
        ) : (
          <Button title={t("scan.openSettings")} onPress={() => void Linking.openSettings()} />
        )}
      </View>
    );

  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ["code39", "code128", "datamatrix", "qr", "pdf417"] }}
        onBarcodeScanned={onScan}
      />
      <View style={styles.overlay} pointerEvents="box-none">
        <Text style={styles.title}>{t("scan.title")}</Text>
        <View style={styles.frame}>
          <Animated.View style={[styles.line, lineStyle]} />
        </View>
        <Text style={styles.hint}>{hint ?? t("scan.hint")}</Text>
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={torch ? t("scan.torchOff") : t("scan.torchOn")}
          onPress={() => setTorch((v) => !v)}
          style={styles.torch}
          haptic
        >
          {torch ? <FlashlightOff color={colors.ink} size={22} /> : <Flashlight color={colors.ink} size={22} />}
        </PressableScale>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#000" },
  permission: { flex: 1, backgroundColor: colors.ink, padding: 28, gap: 16, justifyContent: "center" },
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", gap: 24, padding: 24 },
  title: { fontFamily: fonts.bold, fontSize: 18, color: colors.white },
  frame: { width: "90%", height: 200, borderRadius: 14, borderWidth: 3, borderColor: colors.accent, overflow: "hidden" },
  line: { height: 2, backgroundColor: colors.accent, opacity: 0.9, marginTop: 8 },
  hint: { color: colors.white, textAlign: "center", fontSize: 14, lineHeight: 20, maxWidth: 300 },
  torch: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
});

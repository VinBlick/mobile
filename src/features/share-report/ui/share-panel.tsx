import { useState } from "react";
import { Share, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link2, QrCode, Share2, X } from "lucide-react-native";
import { reportApi, shareLinksQuery, type ShareLink } from "@/entities/report";
import { apiUrl, authHeaders } from "@/shared/api";
import { errorMessage, useT } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors } from "@/shared/theme";
import { Badge, Button, Card, Notice, PressableScale, Segmented, Text } from "@/shared/ui";

const TTL = [
  { value: "24", label: "24 h" },
  { value: "168", label: "7 d" },
  { value: "720", label: "30 d" },
] as const;

/** public link + QR code for a report (signed-in owners only) */
export function SharePanel({ reportId }: { reportId: string }) {
  const t = useT();
  const f = useFormat();
  const client = useQueryClient();
  const [ttl, setTtl] = useState<(typeof TTL)[number]["value"]>("168");
  const [qrFor, setQrFor] = useState<string | null>(null);
  const links = useQuery(shareLinksQuery(reportId));
  const invalidate = () => client.invalidateQueries({ queryKey: ["reports", reportId, "share-links"] });

  const create = useMutation({
    mutationFn: () => reportApi.createShareLink(reportId, Number(ttl)),
    onSuccess: async (link) => {
      await invalidate();
      setQrFor(link.id);
    },
  });
  const revoke = useMutation({ mutationFn: (id: string) => reportApi.revokeShareLink(id), onSuccess: invalidate });

  const share = (l: ShareLink) =>
    Share.share({ message: t("share.message", { url: l.shortUrl, code: l.shortCode }), url: l.shortUrl }).catch(() => undefined);

  const active = (links.data ?? []).filter((l) => l.active);

  return (
    <Card>
      <View style={styles.head}>
        <Link2 color={colors.brand} size={20} />
        <Text variant="h3">{t("share.title")}</Text>
      </View>
      <Text variant="small">{t("share.intro")}</Text>
      <Segmented value={ttl} onChange={setTtl} options={TTL.map((o) => ({ value: o.value, label: o.label }))} />
      <Button title={t("share.create")} variant="secondary" loading={create.isPending} onPress={() => create.mutate()} />
      {create.error ? <Notice tone="danger">{errorMessage(t, create.error)}</Notice> : null}

      {active.map((l) => (
        <View key={l.id} style={styles.link}>
          <View style={styles.linkHead}>
            <Text variant="mono" style={{ flex: 1 }}>
              {l.shortCode}
            </Text>
            <Badge label={t("share.until", { date: f.date(l.expiresAt) })} tone="brand" />
          </View>
          <Text variant="small">{t("share.views", { n: l.views })}</Text>
          {qrFor === l.id ? (
            <Image
              source={{ uri: apiUrl(`/me/share-links/${l.id}/qr.png`), headers: authHeaders() }}
              style={styles.qr}
              contentFit="contain"
              accessibilityLabel={t("share.qr")}
            />
          ) : null}
          <View style={styles.actions}>
            <PressableScale accessibilityRole="button" style={styles.action} onPress={() => void share(l)}>
              <Share2 color={colors.brand} size={16} />
              <Text style={styles.actionText}>{t("share.share")}</Text>
            </PressableScale>
            <PressableScale accessibilityRole="button" style={styles.action} onPress={() => setQrFor(qrFor === l.id ? null : l.id)}>
              <QrCode color={colors.brand} size={16} />
              <Text style={styles.actionText}>{t("share.qr")}</Text>
            </PressableScale>
            <PressableScale accessibilityRole="button" style={styles.action} onPress={() => revoke.mutate(l.id)}>
              <X color={colors.danger} size={16} />
              <Text style={[styles.actionText, { color: colors.danger }]}>{t("share.revoke")}</Text>
            </PressableScale>
          </View>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 8 },
  link: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 12, gap: 6 },
  linkHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  qr: { width: 200, height: 200, alignSelf: "center", marginVertical: 8 },
  actions: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  action: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 6 },
  actionText: { color: colors.brand, fontSize: 14 },
});

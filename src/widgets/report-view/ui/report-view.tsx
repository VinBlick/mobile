import { ScrollView, StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { AlertTriangle, CircleHelp, Info, ShieldCheck } from "lucide-react-native";
import type { Report, ReportRecord, Severity } from "@/entities/report";
import { isTKey, useT, type TKey } from "@/shared/i18n";
import { useFormat } from "@/shared/lib";
import { colors, fonts } from "@/shared/theme";
import { Badge, Card, FadeIn, Text, type BadgeTone } from "@/shared/ui";

const riskTone: Record<Severity, BadgeTone> = { low: "success", medium: "warning", high: "danger" };

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <View style={{ flex: 1, gap: 6 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <Text variant="small">{label}</Text>
        <Text style={{ fontFamily: fonts.bold, fontSize: 13 }}>{value}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${value}%` }]} />
      </View>
    </View>
  );
}

function RecordRow({ r }: { r: ReportRecord }) {
  const f = useFormat();
  const meta = [r.date ? f.date(r.date) : null, r.mileageKm ? `${f.number(r.mileageKm)} km` : null, r.location ?? null, r.country ?? null].filter(Boolean);
  return (
    <View style={styles.record}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
        <Text style={{ fontFamily: fonts.semibold, fontSize: 15, flex: 1 }}>{r.title}</Text>
        {r.amountCents ? <Text variant="small">{f.money(r.amountCents, r.currency ?? "EUR")}</Text> : null}
      </View>
      {meta.length ? <Text variant="small">{meta.join(" · ")}</Text> : null}
      {r.description ? <Text variant="small">{r.description}</Text> : null}
    </View>
  );
}

/** native rendering of the report (same structure as the website) */
export function ReportView({ report }: { report: Report }) {
  const t = useT();
  const f = useFormat();
  const v = report.vehicle ?? {};
  const title = [v.make, v.model, v.variant].filter(Boolean).join(" ");
  const a = report.analysis;
  const groups = (["independent", "official", "seller"] as const).filter((g) => report.groups[g].length);

  return (
    <View style={{ gap: 16 }}>
      <FadeIn>
        <Card style={{ backgroundColor: colors.brandDark, borderColor: colors.brandDark }}>
          <Text variant="overline" style={{ color: colors.accent }}>
            {t("report.title")}
          </Text>
          <Text variant="h1" style={{ color: colors.white }}>
            {title || t("report.vehicle")}
          </Text>
          <Text variant="mono" style={{ color: "#C9D1DC" }}>
            {report.vin}
          </Text>
          <Text variant="small" style={{ color: "#C9D1DC" }}>
            {report.package.name} · {t("report.dataAsOf", { date: f.date(report.dataAsOf) })}
          </Text>
          {!report.isCurrent ? <Badge label={t("report.outdated")} tone="warning" /> : null}
        </Card>
      </FadeIn>

      {report.scores ? (
        <FadeIn index={1}>
          <Card>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Meter label={t("report.completeness")} value={report.scores.completeness} />
              <Meter label={t("report.reliability")} value={report.scores.reliability} />
            </View>
          </Card>
        </FadeIn>
      ) : null}

      {a ? (
        <FadeIn index={2}>
          <Card>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <ShieldCheck color={colors.brand} size={20} />
              <Text variant="h3" style={{ flex: 1 }}>
                {t("report.analysis")}
              </Text>
              <Badge label={t(`severity.${a.overallRisk}` as TKey)} tone={riskTone[a.overallRisk]} />
            </View>
            <Text>{a.summary}</Text>
            {a.findings.map((fd, i) => (
              <View key={i} style={[styles.finding, { borderLeftColor: fd.severity === "high" ? colors.danger : fd.severity === "medium" ? colors.warning : colors.line }]}>
                <View style={{ flexDirection: "row", gap: 6, alignItems: "center" }}>
                  <AlertTriangle color={fd.severity === "high" ? colors.danger : colors.warning} size={16} />
                  <Text style={{ fontFamily: fonts.bold, fontSize: 15, flex: 1 }}>{fd.title}</Text>
                </View>
                <Text variant="small" style={{ color: colors.ink }}>
                  {fd.explanation}
                </Text>
              </View>
            ))}
            {a.sellerQuestions.length ? (
              <View style={{ gap: 8 }}>
                <Text variant="label">{t("report.questions")}</Text>
                {a.sellerQuestions.map((q, i) => (
                  <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                    <CircleHelp color={colors.brand} size={16} style={{ marginTop: 2 }} />
                    <Text variant="small" style={{ color: colors.ink, flex: 1 }}>
                      {q}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
          </Card>
        </FadeIn>
      ) : null}

      {report.photos.length ? (
        <FadeIn index={3}>
          <Text variant="h3">{t("report.photos")}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 8 }}>
            {report.photos.map((p) => (
              <Image key={p.url} source={{ uri: p.url }} style={styles.photo} contentFit="cover" transition={200} accessibilityLabel={p.date ?? ""} />
            ))}
          </ScrollView>
        </FadeIn>
      ) : null}

      {Object.keys(v).length ? (
        <Card>
          <Text variant="h3">{t("report.vehicleData")}</Text>
          {Object.entries(v)
            .filter(([, val]) => val !== undefined && val !== null && val !== "")
            .map(([k, val]) => (
              <View key={k} style={styles.kv}>
                <Text variant="small">{isTKey(`vehicle.${k}`) ? t(`vehicle.${k}` as TKey) : k}</Text>
                <Text style={{ fontSize: 15, fontFamily: fonts.medium }}>{String(val)}</Text>
              </View>
            ))}
          {report.equipment.length ? (
            <View style={styles.chips}>
              {report.equipment.map((e) => (
                <Badge key={e} label={e} tone="muted" />
              ))}
            </View>
          ) : null}
        </Card>
      ) : null}

      {groups.map((g) => (
        <View key={g} style={{ gap: 12 }}>
          <Text variant="overline">{t(`report.group.${g}` as TKey)}</Text>
          {report.groups[g].map((section) => (
            <Card key={section.category}>
              <Text variant="h3">
                {t(`categories.${section.category}` as TKey)} · {section.records.length}
              </Text>
              {section.records.map((r) => (
                <RecordRow key={r.id} r={r} />
              ))}
            </Card>
          ))}
        </View>
      ))}

      {a?.absenceNotes.length ? (
        <Card style={{ backgroundColor: colors.surface }}>
          {a.absenceNotes.map((n, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <Info color={colors.muted} size={16} style={{ marginTop: 2 }} />
              <Text variant="small" style={{ flex: 1 }}>
                {n}
              </Text>
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text variant="h3">{t("report.sources")}</Text>
        {report.sources.map((s, i) => (
          <View key={i} style={styles.kv}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: fonts.medium, fontSize: 15 }}>{s.name}</Text>
              <Text variant="small">{t(`source.${s.sourceType}` as TKey)}</Text>
            </View>
            <Badge label={t(`sourceStatus.${s.status}` as TKey)} tone={s.status === "completed" ? "success" : "muted"} />
          </View>
        ))}
      </Card>
      <Text variant="small">{t("report.disclaimer")}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4, backgroundColor: colors.brand },
  finding: { borderLeftWidth: 3, paddingLeft: 10, gap: 4 },
  photo: { width: 220, height: 150, borderRadius: 8, backgroundColor: colors.surface },
  kv: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, paddingVertical: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  record: { gap: 3, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.line, paddingTop: 10 },
});

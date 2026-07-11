import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { fmtMoney, WD_SHORT } from "../../lib/format";
import { Analytics, masterConfigured, useMasterAnalytics } from "../../lib/master-api";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

const PERIODS: { key: number; label: string }[] = [
  { key: 7, label: "Неделя" },
  { key: 30, label: "Месяц" },
  { key: 365, label: "Год" },
];

const DEMO: Analytics = {
  total: 12400000,
  count: 96,
  by_day: [],
  by_service: [
    { name: "Консультация", count: 20, total: 5000000 },
    { name: "Маникюр", count: 18, total: 3200000 },
    { name: "Стрижка", count: 12, total: 2100000 },
  ],
};

export default function AnalyticsScreen() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [days, setDays] = useState(30);
  const { data: remote, loading } = useMasterAnalytics(days);

  const a: Analytics = masterConfigured && remote ? remote : DEMO;
  const showLoading = masterConfigured && remote === null && loading;
  const maxService = Math.max(1, ...a.by_service.map((s) => s.total));
  const maxDay = Math.max(1, ...a.by_day.map((d) => d.amount));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Аналитика")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {/* Период */}
        <View style={styles.segment}>
          {PERIODS.map((p) => {
            const on = p.key === days;
            return (
              <Pressable key={p.key} onPress={() => setDays(p.key)} style={[styles.seg, on && styles.segOn]}>
                <AppText variant="labelMd" color={on ? colors.onAccent : colors.secondary}>{t(p.label)}</AppText>
              </Pressable>
            );
          })}
        </View>

        {showLoading ? <Loading /> : (
          <>
            {/* Выручка */}
            <View style={[styles.hero, cardShadow]}>
              <AppText variant="labelMd" color={colors.secondary} style={styles.upper}>{t("Выручка за период")}</AppText>
              <AppText variant="displayLg" color={colors.accent} style={{ marginTop: 6, fontSize: 32 }}>{fmtMoney(a.total)}</AppText>
            </View>

            {/* Счётчики */}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[styles.statCard, cardShadow]}>
                <AppText variant="labelMd" color={colors.secondary}>{t("Выполнено")}</AppText>
                <AppText variant="headlineMd" color={colors.accent}>{a.count}</AppText>
              </View>
              <View style={[styles.statCard, cardShadow]}>
                <AppText variant="labelMd" color={colors.secondary}>{t("Средний чек")}</AppText>
                <AppText variant="headlineMd" color={colors.accent}>{a.count ? fmtMoney(Math.round(a.total / a.count)) : "—"}</AppText>
              </View>
            </View>

            {/* Топ услуги */}
            <View style={{ gap: space.md }}>
              <AppText variant="labelMd" color={colors.accent} style={styles.upperWide}>{t("Топ услуги")}</AppText>
              {a.by_service.length === 0 ? (
                <AppText variant="bodyMd" color={colors.secondary}>{t("Пока нет завершённых визитов.")}</AppText>
              ) : a.by_service.slice(0, 5).map((s, i) => (
                <View key={i} style={{ gap: 6 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <AppText variant="labelMd" color={colors.ink}>{i + 1}. {t(s.name)}</AppText>
                    <AppText variant="labelMd" color={colors.accent}>{fmtMoney(s.total)}</AppText>
                  </View>
                  <View style={styles.track}><View style={[styles.fill, { width: `${(s.total / maxService) * 100}%` }]} /></View>
                </View>
              ))}
            </View>

            {/* Загрузка по дням */}
            {a.by_day.length > 0 && (
              <View style={{ gap: space.md }}>
                <AppText variant="labelMd" color={colors.accent} style={styles.upperWide}>{t("Выручка по дням")}</AppText>
                <View style={[styles.chart, cardShadow]}>
                  {a.by_day.slice(-7).map((d, i) => {
                    const dt = new Date(d.date);
                    return (
                      <View key={i} style={styles.barCol}>
                        <View style={styles.barTrack}>
                          <View style={[styles.bar, { height: `${Math.max(6, (d.amount / maxDay) * 100)}%` }]} />
                        </View>
                        <AppText variant="labelSm" color={colors.secondary} style={{ fontSize: 10 }}>{isNaN(dt.getTime()) ? "" : WD_SHORT[dt.getDay()]}</AppText>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4 },
  seg: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: "center" },
  segOn: { backgroundColor: colors.accent },
  hero: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 },
  upper: { textTransform: "uppercase", letterSpacing: 1 },
  upperWide: { textTransform: "uppercase", letterSpacing: 1.5 },
  statCard: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, gap: 4 },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surfaceMid, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 4, backgroundColor: colors.accent },
  chart: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 160, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, gap: 8 },
  barCol: { flex: 1, alignItems: "center", gap: 8, height: "100%" },
  barTrack: { flex: 1, width: "100%", justifyContent: "flex-end" },
  bar: { width: "100%", borderTopLeftRadius: 4, borderTopRightRadius: 4, backgroundColor: colors.accent },
});

import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { masterConfigured, setAvailability, useMyMaster } from "../../lib/master-api";
import { minutesToTime } from "../../lib/slots";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

// dow: 0=Пн … 6=Вс (как в slots/availability)
const LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
type DayState = { on: boolean; start: number; end: number };
const DEFAULT: DayState[] = LABELS.map((_, i) => ({ on: i < 5, start: 540, end: i === 4 ? 1020 : 1080 }));

export default function Schedule() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { data: master, loading } = useMyMaster();
  const [days, setDays] = useState<DayState[]>(DEFAULT);
  const [busy, setBusy] = useState(false);

  // Подгружаем реальный график, когда мастер загрузился.
  useEffect(() => {
    if (!masterConfigured || !master) return;
    const next = DEFAULT.map((d) => ({ ...d }));
    for (const a of master.availability) {
      if (a.day_of_week >= 0 && a.day_of_week < 7) {
        next[a.day_of_week] = { on: !a.is_day_off, start: a.start_min, end: a.end_min };
      }
    }
    setDays(next);
  }, [master]);

  const toggle = (i: number) => setDays((d) => d.map((x, idx) => (idx === i ? { ...x, on: !x.on } : x)));

  async function save() {
    if (busy) return;
    if (masterConfigured) {
      setBusy(true);
      try {
        for (let i = 0; i < 7; i++) {
          await setAvailability(i, days[i].start, days[i].end, !days[i].on);
        }
      } catch (e) {
        setBusy(false);
        Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось сохранить график."));
        return;
      }
      setBusy(false);
    }
    router.back();
  }

  const showLoading = masterConfigured && master === null && loading;

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("График работы")}</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {showLoading ? <Loading /> : (
          <>
            <View style={{ gap: space.sm }}>
              <View style={styles.sectionRow}>
                <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Дни недели")}</AppText>
                <AppText variant="labelSm" color={colors.accent}>{t("Режим работы")}</AppText>
              </View>
              <View style={[styles.card, cardShadow]}>
                {days.map((d, i) => (
                  <View key={i} style={[styles.dayRow, i < days.length - 1 && styles.divider, !d.on && { opacity: 0.6 }]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                      <Switch value={d.on} onValueChange={() => toggle(i)} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
                      <AppText variant="labelMd" color={colors.ink}>{t(LABELS[i])}</AppText>
                    </View>
                    {d.on ? (
                      <View style={styles.hoursBtn}><AppText variant="bodyMd" color={colors.accent}>{minutesToTime(d.start)} – {minutesToTime(d.end)}</AppText></View>
                    ) : (
                      <AppText variant="bodyMd" color={colors.secondary} style={{ fontStyle: "italic" }}>{t("Выходной")}</AppText>
                    )}
                  </View>
                ))}
              </View>
            </View>

            <View style={{ gap: space.sm }}>
              <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Обед и перерывы")}</AppText>
              <View style={[styles.card, styles.breakRow, cardShadow]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <View style={styles.coffee}><Sym name="coffee" size={20} color={colors.successText} /></View>
                  <AppText variant="labelMd" color={colors.ink}>{t("Перерыв")}</AppText>
                </View>
                <View style={styles.hoursBtn}><AppText variant="bodyMd" color={colors.accent}>13:00 – 14:00</AppText></View>
              </View>
            </View>

            <View style={styles.hero}>
              <AppText variant="headlineMd" color="#FFFFFF">{t("Эффективное время")}</AppText>
              <AppText variant="bodyMd" color="#FFD9DD" style={{ marginTop: 6, maxWidth: 240 }}>
                {t("Точный график повышает доверие клиентов.")}
              </AppText>
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Сохранить изменения")} onPress={save} loading={busy} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4 },
  upper: { textTransform: "uppercase", letterSpacing: 1.5 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: "hidden" },
  dayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  hoursBtn: { backgroundColor: colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg },
  breakRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  coffee: { backgroundColor: colors.successBg, padding: 8, borderRadius: radius.full },
  hero: { backgroundColor: colors.accentDeep, borderRadius: radius.xl, padding: 24, overflow: "hidden" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { WD_SHORT } from "../../../lib/format";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type Slot =
  | { kind: "free"; time: string }
  | { kind: "confirmed"; time: string; title: string }
  | { kind: "pending"; time: string; title: string };

const SLOTS: Slot[] = [
  { kind: "free", time: "09:00" },
  { kind: "confirmed", time: "10:00 – 11:00", title: "Азиза · Консультация" },
  { kind: "pending", time: "11:30 – 12:30", title: "Фаррух · Стрижка" },
  { kind: "free", time: "13:00" },
  { kind: "confirmed", time: "14:00 – 15:00", title: "Елена · Маникюр" },
  { kind: "free", time: "15:30" },
  { kind: "free", time: "16:30" },
];

export default function Calendar() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [view, setView] = useState<"day" | "week">("day");

  // Неделя вокруг сегодняшнего дня.
  const days = useMemo(() => {
    const base = new Date();
    const monday = new Date(base);
    monday.setDate(base.getDate() - ((base.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, []);
  const [sel, setSel] = useState(() => (new Date().getDay() + 6) % 7);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Календарь")}</AppText>
        <Sym name="search" size={24} color={colors.accent} />
      </View>

      {/* Сегмент День/Неделя */}
      <View style={styles.segment}>
        {(["day", "week"] as const).map((v) => (
          <Pressable key={v} onPress={() => setView(v)} style={[styles.seg, v === view && styles.segOn]}>
            <AppText variant="labelMd" color={v === view ? colors.ink : colors.secondary}>{v === "day" ? t("День") : t("Неделя")}</AppText>
          </Pressable>
        ))}
      </View>

      {/* Полоса недели */}
      <View style={styles.weekRow}>
        {days.map((d, i) => {
          const on = i === sel;
          const sun = i === 6;
          return (
            <Pressable key={i} onPress={() => setSel(i)} style={[styles.dayCell, on && styles.dayOn]}>
              <AppText variant="labelSm" color={on ? "rgba(255,255,255,0.8)" : sun ? colors.error : colors.secondary}>{WD_SHORT[d.getDay()]}</AppText>
              <AppText variant="labelMd" color={on ? colors.onAccent : colors.ink} style={{ marginTop: 4 }}>{d.getDate()}</AppText>
            </Pressable>
          );
        })}
      </View>

      {/* Таймлайн */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 140, gap: space.md, paddingTop: space.sm }} showsVerticalScrollIndicator={false}>
        {SLOTS.map((s, i) => {
          if (s.kind === "free") {
            return (
              <Pressable key={i} style={styles.freeSlot}>
                <Sym name="add" size={20} color={colors.secondary} />
                <AppText variant="labelMd" color={colors.secondary}>{s.time} · {t("Свободно")}</AppText>
              </Pressable>
            );
          }
          const pending = s.kind === "pending";
          return (
            <View key={i} style={[styles.busySlot, pending ? styles.pendingSlot : styles.confirmedSlot]}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <AppText variant="labelMd" color={pending ? colors.accentDeep : "#FFFFFF"}>{s.time}</AppText>
                  {pending && <View style={styles.newBadge}><AppText variant="labelSm" color={colors.accentDeep} style={{ fontSize: 10 }}>{t("НОВОЕ")}</AppText></View>}
                </View>
                <AppText variant="labelMd" color={pending ? colors.accentDeep : "#FFFFFF"} style={{ marginTop: 4 }}>{s.title}</AppText>
              </View>
              <Sym name={pending ? "pending" : "check-circle"} size={22} color={pending ? colors.accentDeep : "rgba(255,255,255,0.6)"} />
            </View>
          );
        })}
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => router.push("/(master)/service-form")}>
        <Sym name="add" size={26} color={colors.onAccent} />
      </Pressable>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4, marginHorizontal: space.margin },
  seg: { flex: 1, paddingVertical: 8, borderRadius: radius.lg, alignItems: "center" },
  segOn: { backgroundColor: colors.surface, ...cardShadow },
  weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md, gap: 6 },
  dayCell: { flex: 1, paddingVertical: 8, borderRadius: radius.xl, alignItems: "center" },
  dayOn: { backgroundColor: colors.accent },
  freeSlot: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 64, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", backgroundColor: colors.surface },
  busySlot: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", minHeight: 80, borderRadius: radius.xl, padding: 16 },
  confirmedSlot: { backgroundColor: colors.accentDeep },
  pendingSlot: { backgroundColor: colors.gold },
  newBadge: { backgroundColor: "rgba(0,0,0,0.12)", paddingHorizontal: 6, paddingVertical: 1, borderRadius: radius.full },
  fab: { position: "absolute", bottom: 100, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", ...cardShadow },
});

import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { getDayBusy } from "../../lib/api";
import { supabaseConfigured } from "../../lib/data";
import { fmtDate, MONTHS_NOM, nextDays, WD_SHORT, withTime } from "../../lib/format";
import { Busy, freeSlots, minutesToTime, toOurDow } from "../../lib/slots";
import { useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

// Демо-слоты, когда специалист без графика из БД.
const DEMO_SLOTS = ["10:00", "10:30", "11:00", "12:00", "14:00", "15:00", "16:00"];

function isoDate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function DateTime() {
  const router = useRouter();
  const { draft, patchDraft } = useStore();
  const days = useMemo(() => nextDays(14), []);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(0);
  const [busy, setBusy] = useState<Busy[]>([]);

  const real = supabaseConfigured && !!draft.slug && !!draft.availability;

  useEffect(() => {
    if (!real) return;
    let alive = true;
    getDayBusy(draft.slug, isoDate(days[day])).then((b) => alive && setBusy(b)).catch(() => alive && setBusy([]));
    return () => { alive = false; };
  }, [day, real]);

  const today = new Date();
  const isToday = days[day].toDateString() === today.toDateString();
  const nowMin = isToday ? today.getHours() * 60 + today.getMinutes() : null;

  const slots = useMemo(() => {
    if (!real) return DEMO_SLOTS;
    return freeSlots({
      availability: draft.availability!,
      busy,
      totalDuration: draft.duration,
      dow: toOurDow(days[day]),
      nowMin,
      step: draft.duration, // шаг = длительность записи (60 мин → слоты по часу)
    }).map(minutesToTime);
  }, [real, busy, day, draft.duration, draft.availability]);

  useEffect(() => { setSlot(0); }, [day]);

  const monthLabel = `${MONTHS_NOM[days[day].getMonth()]} ${days[day].getFullYear()}`.toUpperCase();
  const canNext = slots.length > 0;

  function next() {
    patchDraft({ date: withTime(days[day], slots[slot]) });
    router.push("/booking/confirm");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={26} color={colors.accent} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.accent}>Дата и время</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <AppText variant="labelMd" color={colors.secondary} style={styles.month}>{monthLabel}</AppText>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {days.map((d, i) => {
            const on = i === day;
            return (
              <Pressable key={i} onPress={() => setDay(i)} style={[styles.day, on && styles.dayOn]}>
                <AppText variant="labelSm" color={on ? "rgba(255,255,255,0.7)" : colors.secondary}>{WD_SHORT[d.getDay()].toUpperCase()}</AppText>
                <AppText variant="labelMd" color={on ? colors.onAccent : colors.accent} style={{ marginTop: 4 }}>{d.getDate()}</AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <AppText variant="labelMd" color={colors.ink} style={styles.slotTitle}>Доступное время</AppText>
        {slots.length === 0 ? (
          <View style={{ paddingHorizontal: space.margin, paddingVertical: space.lg, alignItems: "center" }}>
            <AppText variant="bodyMd" color={colors.secondary}>В этот день свободных слотов нет</AppText>
          </View>
        ) : (
          <View style={styles.grid}>
            {slots.map((t, i) => {
              const on = i === slot;
              return (
                <Pressable key={t} onPress={() => setSlot(i)} style={[styles.slot, on ? styles.slotOn : styles.slotFree]}>
                  <AppText variant="labelMd" color={on ? colors.onAccent : colors.accent}>{t}</AppText>
                </Pressable>
              );
            })}
          </View>
        )}

        {canNext && (
          <View style={styles.summary}>
            <View style={styles.summaryIcon}><Sym name="event-available" size={22} color={colors.accent} /></View>
            <View>
              <AppText variant="labelSm" color={colors.inkVariant} style={{ textTransform: "uppercase", letterSpacing: 1 }}>Ваш выбор</AppText>
              <AppText variant="labelMd" color={colors.accent}>{fmtDate(days[day])} · {slots[slot]} · {draft.duration} мин</AppText>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Далее" icon="arrow-forward" onPress={next} style={!canNext ? { opacity: 0.4 } : undefined} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  month: { textTransform: "uppercase", letterSpacing: 2, paddingHorizontal: space.margin, paddingTop: space.md },
  daysRow: { paddingHorizontal: space.margin, gap: 8, paddingVertical: space.md },
  day: { width: 56, height: 76, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.outlineVariant, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  slotTitle: { paddingHorizontal: space.margin, marginTop: space.lg, marginBottom: space.md },
  grid: { paddingHorizontal: space.margin, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  slot: { width: "30%", height: 48, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" },
  slotFree: { borderWidth: 1, borderColor: colors.outlineVariant },
  slotOn: { backgroundColor: colors.accent },
  summary: { marginHorizontal: space.margin, marginTop: space.lg, backgroundColor: colors.surfaceLow, borderRadius: radius.x2l, padding: space.margin, flexDirection: "row", alignItems: "center", gap: space.md },
  summaryIcon: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: "rgba(6,78,59,0.06)", alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.bg },
});

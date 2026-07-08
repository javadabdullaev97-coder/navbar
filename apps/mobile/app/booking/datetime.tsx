import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

const DAYS = [
  { dow: "ПН", n: 8, off: true },
  { dow: "ВТ", n: 9, off: true },
  { dow: "СР", n: 10 },
  { dow: "ЧТ", n: 11 },
  { dow: "ПТ", n: 12 },
  { dow: "СБ", n: 13 },
  { dow: "ВС", n: 14 },
  { dow: "ПН", n: 15 },
];

const TIMES = [
  { t: "10:00" }, { t: "10:30" }, { t: "11:00" },
  { t: "11:30", taken: true }, { t: "12:00" }, { t: "13:00", taken: true },
  { t: "14:00" }, { t: "15:00" }, { t: "16:00" },
];

export default function DateTime() {
  const router = useRouter();
  const [day, setDay] = useState(4); // Пт, 12
  const [time, setTime] = useState(2); // 11:00

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
        <AppText variant="labelMd" color={colors.secondary} style={styles.month}>ИЮЛЬ 2024</AppText>

        {/* Дни */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {DAYS.map((d, i) => {
            const on = i === day;
            return (
              <Pressable
                key={i}
                disabled={d.off}
                onPress={() => setDay(i)}
                style={[styles.day, d.off && styles.dayOff, on && styles.dayOn]}
              >
                <AppText variant="labelSm" color={on ? "rgba(255,255,255,0.7)" : colors.secondary}>{d.dow}</AppText>
                <AppText variant="labelMd" color={on ? colors.onAccent : d.off ? colors.outlineVariant : colors.accent} style={{ marginTop: 4 }}>
                  {d.n}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Время */}
        <AppText variant="labelMd" color={colors.ink} style={styles.slotTitle}>Доступное время</AppText>
        <View style={styles.grid}>
          {TIMES.map((s, i) => {
            const on = i === time;
            if (s.taken) {
              return (
                <View key={i} style={[styles.slot, styles.slotTaken]}>
                  <AppText variant="labelMd" color={colors.outline}>{s.t}</AppText>
                </View>
              );
            }
            return (
              <Pressable key={i} onPress={() => setTime(i)} style={[styles.slot, on ? styles.slotOn : styles.slotFree]}>
                <AppText variant="labelMd" color={on ? colors.onAccent : colors.accent}>{s.t}</AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Сводка */}
        <View style={styles.summary}>
          <View style={styles.summaryIcon}>
            <Sym name="event-available" size={22} color={colors.accent} />
          </View>
          <View>
            <AppText variant="labelSm" color={colors.inkVariant} style={{ textTransform: "uppercase", letterSpacing: 1 }}>Ваш выбор</AppText>
            <AppText variant="labelMd" color={colors.accent}>
              {DAYS[day].dow === "ПТ" ? "Пт" : DAYS[day].dow}, {DAYS[day].n} июля · {TIMES[time].t} · 50 мин
            </AppText>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label="Далее" icon="arrow-forward" onPress={() => router.push("/booking/confirm")} />
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
  dayOff: { opacity: 0.4, backgroundColor: colors.surfaceLow },
  dayOn: { backgroundColor: colors.accent, borderColor: colors.accent },
  slotTitle: { paddingHorizontal: space.margin, marginTop: space.lg, marginBottom: space.md },
  grid: { paddingHorizontal: space.margin, flexDirection: "row", flexWrap: "wrap", gap: 12 },
  slot: { width: "30%", height: 48, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" },
  slotFree: { borderWidth: 1, borderColor: colors.outlineVariant },
  slotOn: { backgroundColor: colors.accent },
  slotTaken: { backgroundColor: colors.surfaceHighest },
  summary: { marginHorizontal: space.margin, marginTop: space.lg, backgroundColor: colors.surfaceLow, borderRadius: radius.x2l, padding: space.margin, flexDirection: "row", alignItems: "center", gap: space.md },
  summaryIcon: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: "rgba(6,78,59,0.06)", alignItems: "center", justifyContent: "center" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.bg },
});

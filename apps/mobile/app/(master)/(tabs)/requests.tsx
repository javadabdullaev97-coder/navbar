import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type Status = "pending" | "confirmed" | "done";
type Req = { id: string; initial: string; name: string; service: string; date: string; time: string; status: Status };

const DATA: Req[] = [
  { id: "1", initial: "А", name: "Анна Кузнецова", service: "Маникюр & Уход", date: "15 октября", time: "14:00 — 15:30", status: "pending" },
  { id: "2", initial: "Д", name: "Дмитрий Соколов", service: "Мужская стрижка", date: "16 октября", time: "10:00 — 11:00", status: "pending" },
  { id: "3", initial: "Е", name: "Елена Петрова", service: "Консультация", date: "16 октября", time: "17:30 — 18:30", status: "pending" },
  { id: "4", initial: "К", name: "Камила Исаева", service: "Маникюр", date: "12 октября", time: "11:00 — 12:00", status: "confirmed" },
  { id: "5", initial: "Б", name: "Бахтиёр Хакимов", service: "Стрижка", date: "5 октября", time: "16:00 — 16:45", status: "done" },
];

const TABS: { key: Status; label: string }[] = [
  { key: "pending", label: "Новые" },
  { key: "confirmed", label: "Подтверждённые" },
  { key: "done", label: "История" },
];

export default function Requests() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<Status>("pending");
  const [overrides, setOverrides] = useState<Record<string, Status>>({});

  const list = DATA
    .map((r) => ({ ...r, status: overrides[r.id] ?? r.status }))
    .filter((r) => r.status === tab);

  const set = (id: string, status: Status) => setOverrides((o) => ({ ...o, [id]: status }));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Записи")}</AppText>
        <Sym name="search" size={24} color={colors.accent} />
      </View>

      {/* Сегментированный контрол */}
      <View style={styles.segment}>
        {TABS.map((s) => {
          const on = s.key === tab;
          return (
            <Pressable key={s.key} onPress={() => setTab(s.key)} style={[styles.seg, on && styles.segOn]}>
              <AppText variant="labelSm" color={on ? colors.accent : colors.secondary}>{t(s.label)}</AppText>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 120, gap: space.md }} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 64, gap: 12 }}>
            <Sym name="event-note" size={40} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary}>{t("Здесь пока пусто")}</AppText>
          </View>
        ) : (
          list.map((r) => (
            <Pressable key={r.id} onPress={() => router.push(`/(master)/booking/${r.id}`)}>
              <View style={[styles.card, cardShadow]}>
                <View style={styles.cardTop}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                    <Avatar initial={r.initial} size={48} round tint={colors.surfaceMid} fg={colors.inkVariant} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.ink}>{r.name}</AppText>
                      <AppText variant="labelSm" color={colors.secondary}>{t(r.service)}</AppText>
                    </View>
                  </View>
                  <StatusBadge status={r.status} />
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.meta}><Sym name="calendar-today" size={16} color={colors.gold} /><AppText variant="labelSm" color={colors.ink}>{r.date}</AppText></View>
                  <View style={styles.meta}><Sym name="schedule" size={16} color={colors.gold} /><AppText variant="labelSm" color={colors.ink}>{r.time}</AppText></View>
                </View>

                {r.status === "pending" && (
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <Pressable style={styles.confirmBtn} onPress={() => set(r.id, "confirmed")}>
                      <AppText variant="labelMd" color={colors.onAccent}>{t("Подтвердить")}</AppText>
                    </Pressable>
                    <Pressable style={styles.rejectBtn} onPress={() => set(r.id, "done")}>
                      <AppText variant="labelMd" color={colors.secondary}>{t("Отклонить")}</AppText>
                    </Pressable>
                  </View>
                )}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const map = {
    pending: { bg: colors.warningBg, fg: colors.warningText, label: "Ожидает" },
    confirmed: { bg: colors.successBg, fg: colors.successText, label: "Подтверждено" },
    done: { bg: colors.surfaceHigh, fg: colors.secondary, label: "Завершено" },
  }[status];
  return (
    <View style={[styles.badge, { backgroundColor: map.bg }]}>
      <AppText variant="labelSm" color={map.fg} style={{ fontSize: 11 }}>{t(map.label)}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4, marginHorizontal: space.margin, marginBottom: space.sm },
  seg: { flex: 1, paddingVertical: 8, borderRadius: radius.lg, alignItems: "center" },
  segOn: { backgroundColor: colors.surface, ...cardShadow },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.md, gap: space.md },
  cardTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  metaRow: { flexDirection: "row", gap: 16, paddingVertical: space.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.outlineVariant },
  meta: { flexDirection: "row", alignItems: "center", gap: 6 },
  confirmBtn: { flex: 1, paddingVertical: 12, borderRadius: radius.xl, backgroundColor: colors.accent, alignItems: "center" },
  rejectBtn: { paddingHorizontal: 20, paddingVertical: 12, alignItems: "center", justifyContent: "center" },
});

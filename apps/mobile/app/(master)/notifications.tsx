import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, Sym } from "../../components/ui";
import { MONTHS_GEN } from "../../lib/format";
import { masterConfigured, MasterBooking, useMasterBookings } from "../../lib/master-api";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

type IconName = React.ComponentProps<typeof Sym>["name"];
type Note = { id: string; icon: IconName; kind: "pending" | "info" | "confirmed"; title: string; body: string; time: string; go: string };

const p2 = (n: number) => String(n).padStart(2, "0");
const clock = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const dayLabel = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;

function build(bookings: MasterBooking[], now: number, t: (k: string, p?: Record<string, string | number>) => string): Note[] {
  const notes: Note[] = [];
  for (const b of bookings) {
    if (b.status === "cancelled" || b.status === "done") continue;
    const start = new Date(b.starts_at);
    const client = b.client_name ?? t("Клиент");
    const svc = b.service_name ?? t("Услуга");
    if (b.status === "pending") {
      notes.push({ id: `p-${b.id}`, icon: "event", kind: "pending", title: t("Новая заявка на запись"), body: `${client} · ${svc}`, time: `${dayLabel(start)}, ${clock(start)}`, go: `/(master)/booking/${b.id}` });
    } else if ((start.getTime() - now) / 3600_000 <= 24) {
      notes.push({ id: `s-${b.id}`, icon: "notifications-active", kind: "info", title: t("Скоро визит"), body: `${client} · ${svc} в ${clock(start)}`, time: dayLabel(start), go: `/(master)/booking/${b.id}` });
    } else {
      notes.push({ id: `c-${b.id}`, icon: "check-circle", kind: "confirmed", title: t("Подтверждённая запись"), body: `${client} · ${dayLabel(start)}, ${clock(start)}`, time: dayLabel(start), go: `/(master)/booking/${b.id}` });
    }
  }
  return notes.sort((a, b) => a.id.localeCompare(b.id));
}

const DEMO: Note[] = [
  { id: "p-1", icon: "event", kind: "pending", title: "Новая заявка на запись", body: "Азиза К. · Консультация", time: "Сегодня, 14:00", go: "" },
  { id: "s-1", icon: "notifications-active", kind: "info", title: "Скоро визит", body: "Фаррух А. · Стрижка в 15:30", time: "Сегодня", go: "" },
];

export default function MasterNotifications() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [refreshing, setRefreshing] = useState(false);
  const { data: bookings, loading, reload } = useMasterBookings();
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const notes = masterConfigured && bookings ? build(bookings, Date.now(), t) : DEMO;
  const showLoading = masterConfigured && bookings === null && loading;

  const tint = (k: Note["kind"]) => ({
    pending: { bg: colors.warningBg, fg: colors.warningText },
    info: { bg: colors.infoBg, fg: colors.infoText },
    confirmed: { bg: colors.successBg, fg: colors.successText },
  }[k]);

  const onRefresh = async () => { setRefreshing(true); await reload(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Уведомления")}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space.margin, paddingBottom: 32, gap: space.md, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        {showLoading ? <Loading /> : notes.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 }}>
            <Sym name="notifications-none" size={48} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center" }}>{t("Новых уведомлений нет.")}</AppText>
          </View>
        ) : notes.map((n) => {
          const c = tint(n.kind);
          return (
            <Pressable key={n.id} onPress={() => n.go && router.push(n.go as any)}>
              <View style={[styles.card, cardShadow]}>
                <View style={[styles.iconWrap, { backgroundColor: c.bg }]}><Sym name={n.icon} size={22} color={c.fg} /></View>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{t(n.title)}</AppText>
                    <AppText variant="labelSm" color={colors.secondary}>{n.time}</AppText>
                  </View>
                  <AppText variant="bodyMd" color={colors.secondary} numberOfLines={1} style={{ marginTop: 2 }}>{n.body}</AppText>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  card: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  iconWrap: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
});

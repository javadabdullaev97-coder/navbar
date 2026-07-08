import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, Sym } from "../components/ui";
import { ClientBooking, getMyBookings } from "../lib/api";
import { supabaseConfigured } from "../lib/data";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { MONTHS_GEN } from "../lib/format";
import { cardShadow, radius, space, ThemeColors } from "../theme";

type TFn = (key: string, params?: Record<string, string | number>) => string;

type Note = {
  id: string; icon: any; tintBg: string; tintFg: string;
  title: string; body: string; time: string; go?: string;
};

const p2 = (n: number) => String(n).padStart(2, "0");
const clock = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const dayLabel = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;

// Формируем уведомления из реальных записей клиента.
function buildNotes(bookings: ClientBooking[], now: number, t: TFn, colors: ThemeColors): Note[] {
  const notes: Note[] = [];
  for (const b of bookings) {
    const start = new Date(b.starts_at);
    const at = start.getTime();
    const hoursTo = (at - now) / 3600_000;

    if (b.status === "cancelled") continue;

    if (at < now) {
      // Прошедший визит — предложить отзыв.
      notes.push({
        id: `rev-${b.id}`, icon: "star", tintBg: colors.infoBg, tintFg: colors.infoText,
        title: t("Оставьте отзыв"), body: t("Как прошёл визит к {name}?", { name: b.master_name }),
        time: dayLabel(start), go: `/review?slug=${b.master_slug}`,
      });
    } else if (hoursTo <= 24) {
      // Ближайший визит — напоминание.
      notes.push({
        id: `rem-${b.id}`, icon: "notifications-active", tintBg: colors.warningBg, tintFg: colors.warningText,
        title: t("Скоро визит"),
        body: t("{service} · {master} в {time}", { service: b.service_name ?? t("Запись"), master: b.master_name, time: clock(start) }),
        time: dayLabel(start), go: `/appointment/${b.id}`,
      });
    } else {
      // Предстоящий визит — подтверждение.
      notes.push({
        id: `cfm-${b.id}`, icon: "check-circle", tintBg: colors.successBg, tintFg: colors.successText,
        title: b.status === "confirmed" ? t("Запись подтверждена") : t("Запись создана"),
        body: t("{service} · {date}, {time}", { service: b.service_name ?? t("Запись"), date: dayLabel(start), time: clock(start) }),
        time: dayLabel(start), go: `/appointment/${b.id}`,
      });
    }
  }
  return notes;
}

function Item({ n, onPress }: { n: Note; onPress?: () => void }) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable onPress={onPress} style={[styles.item, cardShadow]}>
      <View style={[styles.tint, { backgroundColor: n.tintBg }]}>
        <Sym name={n.icon} size={22} color={n.tintFg} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{n.title}</AppText>
          <AppText variant="labelSm" color={colors.secondary}>{n.time}</AppText>
        </View>
        <AppText variant="labelMd" color={colors.secondary} numberOfLines={2} style={{ marginTop: 2 }}>{n.body}</AppText>
      </View>
    </Pressable>
  );
}

export default function Notifications() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [notes, setNotes] = useState<Note[] | null>(supabaseConfigured ? null : []);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!supabaseConfigured) return;
    try { setNotes(buildNotes(await getMyBookings(), Date.now(), t, colors)); }
    catch { setNotes([]); }
  }
  useEffect(() => { load(); }, []);
  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const loading = supabaseConfigured && notes === null;
  const list = notes ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Уведомления")}</AppText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: space.margin, paddingBottom: 24, gap: 8, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        {loading ? (
          <Loading />
        ) : list.length === 0 ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 80 }}>
            <Sym name="notifications-none" size={48} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center" }}>
              {t("Уведомлений пока нет.")}{"\n"}{t("Здесь появятся напоминания о визитах.")}
            </AppText>
          </View>
        ) : (
          list.map((n) => <Item key={n.id} n={n} onPress={() => n.go && router.push(n.go as any)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  item: { flexDirection: "row", gap: 16, alignItems: "center", padding: 16, backgroundColor: colors.surface, borderRadius: radius.xl },
  tint: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
});

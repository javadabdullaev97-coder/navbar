import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, Sym } from "../components/ui";
import { ClientBooking, getMyBookings } from "../lib/api";
import { supabaseConfigured } from "../lib/data";
import { MONTHS_GEN } from "../lib/format";
import { cardShadow, colors, radius, space } from "../theme";

type Note = {
  id: string; icon: any; tintBg: string; tintFg: string;
  title: string; body: string; time: string; go?: string;
};

const p2 = (n: number) => String(n).padStart(2, "0");
const clock = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`;
const dayLabel = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;

// Формируем уведомления из реальных записей клиента.
function buildNotes(bookings: ClientBooking[], now: number): Note[] {
  const notes: Note[] = [];
  for (const b of bookings) {
    const start = new Date(b.starts_at);
    const t = start.getTime();
    const hoursTo = (t - now) / 3600_000;

    if (b.status === "cancelled") continue;

    if (t < now) {
      // Прошедший визит — предложить отзыв.
      notes.push({
        id: `rev-${b.id}`, icon: "star", tintBg: colors.infoBg, tintFg: colors.infoText,
        title: "Оставьте отзыв", body: `Как прошёл визит к ${b.master_name}?`,
        time: dayLabel(start), go: `/review?slug=${b.master_slug}`,
      });
    } else if (hoursTo <= 24) {
      // Ближайший визит — напоминание.
      notes.push({
        id: `rem-${b.id}`, icon: "notifications-active", tintBg: colors.warningBg, tintFg: colors.warningText,
        title: "Скоро визит", body: `${b.service_name ?? "Запись"} · ${b.master_name} в ${clock(start)}`,
        time: dayLabel(start), go: `/appointment/${b.id}`,
      });
    } else {
      // Предстоящий визит — подтверждение.
      notes.push({
        id: `cfm-${b.id}`, icon: "check-circle", tintBg: colors.successBg, tintFg: colors.successText,
        title: b.status === "confirmed" ? "Запись подтверждена" : "Запись создана",
        body: `${b.service_name ?? "Запись"} · ${dayLabel(start)}, ${clock(start)}`,
        time: dayLabel(start), go: `/appointment/${b.id}`,
      });
    }
  }
  return notes;
}

function Item({ n, onPress }: { n: Note; onPress?: () => void }) {
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
  const [notes, setNotes] = useState<Note[] | null>(supabaseConfigured ? null : []);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    if (!supabaseConfigured) return;
    try { setNotes(buildNotes(await getMyBookings(), Date.now())); }
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
          <AppText variant="headlineMd" color={colors.accent}>Уведомления</AppText>
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
              Уведомлений пока нет.{"\n"}Здесь появятся напоминания о визитах.
            </AppText>
          </View>
        ) : (
          list.map((n) => <Item key={n.id} n={n} onPress={() => n.go && router.push(n.go as any)} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  item: { flexDirection: "row", gap: 16, alignItems: "center", padding: 16, backgroundColor: colors.surface, borderRadius: radius.xl },
  tint: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
});

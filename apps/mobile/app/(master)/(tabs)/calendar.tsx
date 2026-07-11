import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Loading, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { fmtTime, MONTHS_NOM, WD_SHORT } from "../../../lib/format";
import { masterConfigured, useMasterBookings } from "../../../lib/master-api";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type View3 = "day" | "week" | "month";
type Ev = { id: string; date: Date; client: string; service: string; status: "pending" | "confirmed" | "done" | "cancelled" };

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(d.getDate() + n); return x; };
const addMonths = (d: Date, n: number) => { const x = new Date(d); x.setMonth(d.getMonth() + n, 1); return x; };
const startOfWeek = (d: Date) => addDays(d, -((d.getDay() + 6) % 7)); // понедельник
const p2 = (n: number) => String(n).padStart(2, "0");

const DEMO: Ev[] = [
  { id: "1", date: new Date(), client: "Азиза Каримова", service: "Консультация", status: "confirmed" },
  { id: "2", date: addDays(new Date(), 0), client: "Фаррух Алиев", service: "Стрижка", status: "pending" },
  { id: "3", date: addDays(new Date(), 1), client: "Елена Волкова", service: "Маникюр", status: "confirmed" },
  { id: "4", date: addDays(new Date(), 3), client: "Дмитрий Соколов", service: "Стрижка", status: "confirmed" },
];

export default function Calendar() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [view, setView] = useState<View3>("day");
  const [anchor, setAnchor] = useState(new Date());
  const { data: remote, loading, reload } = useMasterBookings();
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const events: Ev[] = masterConfigured && remote
    ? remote.filter((b) => b.status !== "cancelled").map((b) => ({
        id: b.id, date: new Date(b.starts_at), client: b.client_name ?? t("Клиент"),
        service: b.service_name ?? t("Услуга"), status: b.status,
      }))
    : DEMO;
  const showLoading = masterConfigured && remote === null && loading;

  const weekStart = useMemo(() => startOfWeek(anchor), [anchor]);
  const monthDays = useMemo(() => buildMonth(anchor), [anchor]);

  const dayEvents = (d: Date) => events.filter((e) => sameDay(e.date, d)).sort((a, b) => a.date.getTime() - b.date.getTime());
  const monthHas = (d: Date) => events.some((e) => sameDay(e.date, d));

  const title =
    view === "month" ? `${MONTHS_NOM[anchor.getMonth()]} ${anchor.getFullYear()}` :
    view === "week" ? `${weekStart.getDate()} – ${addDays(weekStart, 6).getDate()} ${MONTHS_NOM[addDays(weekStart, 6).getMonth()].toLowerCase()}` :
    `${anchor.getDate()} ${MONTHS_NOM[anchor.getMonth()].toLowerCase()} ${anchor.getFullYear()}`;

  const shift = (dir: number) => setAnchor((a) => (view === "month" ? addMonths(a, dir) : addDays(a, view === "week" ? dir * 7 : dir)));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Календарь")}</AppText>
      </View>

      {/* Сегмент День/Неделя/Месяц */}
      <View style={styles.segment}>
        {(["day", "week", "month"] as View3[]).map((v) => (
          <Pressable key={v} onPress={() => setView(v)} style={[styles.seg, v === view && styles.segOn]}>
            <AppText variant="labelMd" color={v === view ? colors.onAccent : colors.secondary}>
              {v === "day" ? t("День") : v === "week" ? t("Неделя") : t("Месяц")}
            </AppText>
          </Pressable>
        ))}
      </View>

      {/* Навигатор периода */}
      <View style={styles.nav}>
        <Pressable onPress={() => shift(-1)} hitSlop={10} style={styles.navBtn}><Sym name="chevron-left" size={22} color={colors.accent} /></Pressable>
        <Pressable onPress={() => setAnchor(new Date())}><AppText variant="labelMd" color={colors.ink}>{title}</AppText></Pressable>
        <Pressable onPress={() => shift(1)} hitSlop={10} style={styles.navBtn}><Sym name="chevron-right" size={22} color={colors.accent} /></Pressable>
      </View>

      {/* День: полоса недели */}
      {view === "day" && (
        <View style={styles.weekRow}>
          {Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => {
            const on = sameDay(d, anchor);
            const today = sameDay(d, new Date());
            return (
              <Pressable key={i} onPress={() => setAnchor(d)} style={[styles.dayCell, on && styles.dayOn]}>
                <AppText variant="labelSm" color={on ? "rgba(255,255,255,0.8)" : i === 6 ? colors.error : colors.secondary}>{WD_SHORT[d.getDay()]}</AppText>
                <AppText variant="labelMd" color={on ? colors.onAccent : colors.ink} style={{ marginTop: 4 }}>{d.getDate()}</AppText>
                {monthHas(d) && !on ? <View style={[styles.dot, today && { backgroundColor: colors.accent }]} /> : <View style={{ height: 6 }} />}
              </Pressable>
            );
          })}
        </View>
      )}

      {/* Месяц: сетка */}
      {view === "month" && (
        <View style={styles.monthGrid}>
          <View style={styles.gridHead}>
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((w, i) => (
              <AppText key={i} variant="labelSm" color={i === 6 ? colors.error : colors.secondary} style={styles.gridHeadCell}>{t(w)}</AppText>
            ))}
          </View>
          {monthDays.map((week, wi) => (
            <View key={wi} style={{ flexDirection: "row" }}>
              {week.map((d, di) => {
                if (!d) return <View key={di} style={styles.gridCell} />;
                const on = sameDay(d, anchor);
                const today = sameDay(d, new Date());
                return (
                  <Pressable key={di} onPress={() => setAnchor(d)} style={styles.gridCell}>
                    <View style={[styles.gridDay, on && { backgroundColor: colors.accent }, !on && today && { borderWidth: 1, borderColor: colors.accent }]}>
                      <AppText variant="labelMd" color={on ? colors.onAccent : colors.ink}>{d.getDate()}</AppText>
                    </View>
                    {monthHas(d) && !on ? <View style={styles.dot} /> : <View style={{ height: 6 }} />}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {/* Список записей снизу */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120, paddingTop: space.md, gap: space.md }} showsVerticalScrollIndicator={false}>
        {showLoading ? <Loading /> : view === "week" ? (
          Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)).map((d, i) => {
            const evs = dayEvents(d);
            if (evs.length === 0) return null;
            return (
              <View key={i} style={{ gap: 8 }}>
                <AppText variant="labelSm" color={colors.secondary} style={styles.dayHead}>{WD_SHORT[d.getDay()]}, {d.getDate()} {MONTHS_NOM[d.getMonth()].toLowerCase()}</AppText>
                {evs.map((e) => <EventCard key={e.id} e={e} onPress={() => router.push(`/(master)/booking/${e.id}`)} />)}
              </View>
            );
          })
        ) : (
          (() => {
            const evs = dayEvents(anchor);
            if (evs.length === 0) return (
              <View style={{ alignItems: "center", paddingVertical: 48, gap: 10 }}>
                <Sym name="event-available" size={40} color={colors.outlineVariant} />
                <AppText variant="bodyMd" color={colors.secondary}>{t("На этот день записей нет")}</AppText>
              </View>
            );
            return evs.map((e) => <EventCard key={e.id} e={e} onPress={() => router.push(`/(master)/booking/${e.id}`)} />);
          })()
        )}
        {view === "week" && events.filter((e) => e.date >= weekStart && e.date < addDays(weekStart, 7)).length === 0 && !showLoading && (
          <View style={{ alignItems: "center", paddingVertical: 48, gap: 10 }}>
            <Sym name="event-available" size={40} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary}>{t("На эту неделю записей нет")}</AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function EventCard({ e, onPress }: { e: Ev; onPress: () => void }) {
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const badge = e.status === "confirmed" ? { bg: colors.successBg, fg: colors.successText, label: "Подтверждено" }
    : e.status === "pending" ? { bg: colors.warningBg, fg: colors.warningText, label: "Ожидает" }
    : { bg: colors.infoBg, fg: colors.infoText, label: "Выполнено" };
  return (
    <Pressable onPress={onPress}>
      <View style={[styles.card, cardShadow]}>
        <AppText variant="labelMd" color={colors.accent} style={{ width: 52 }}>{fmtTime(e.date)}</AppText>
        <Avatar initial={initialOf(e.client)} size={40} round tint={colors.surfaceMid} fg={colors.inkVariant} />
        <View style={{ flex: 1 }}>
          <AppText variant="labelMd" color={colors.ink}>{e.client}</AppText>
          <AppText variant="labelSm" color={colors.secondary}>{t(e.service)}</AppText>
        </View>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <AppText variant="labelSm" color={badge.fg} style={{ fontSize: 10 }}>{t(badge.label)}</AppText>
        </View>
      </View>
    </Pressable>
  );
}

// Матрица месяца: недели по 7 ячеек (null для пустых), понедельник первый.
function buildMonth(anchor: Date): (Date | null)[][] {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const daysIn = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: offset }, () => null);
  for (let d = 1; d <= daysIn; d++) cells.push(new Date(anchor.getFullYear(), anchor.getMonth(), d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4, marginHorizontal: space.margin },
  seg: { flex: 1, paddingVertical: 8, borderRadius: radius.lg, alignItems: "center" },
  segOn: { backgroundColor: colors.accent },
  nav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md },
  navBtn: { width: 36, height: 36, borderRadius: radius.full, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  weekRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: space.margin, gap: 4 },
  dayCell: { flex: 1, paddingVertical: 8, borderRadius: radius.xl, alignItems: "center" },
  dayOn: { backgroundColor: colors.accent },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.accent, marginTop: 3 },
  monthGrid: { paddingHorizontal: space.margin, gap: 4 },
  gridHead: { flexDirection: "row", marginBottom: 4 },
  gridHeadCell: { flex: 1, textAlign: "center" },
  gridCell: { flex: 1, alignItems: "center", paddingVertical: 3 },
  gridDay: { width: 36, height: 36, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  dayHead: { textTransform: "uppercase", letterSpacing: 1 },
  card: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
});

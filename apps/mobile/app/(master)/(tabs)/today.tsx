import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { initialOf } from "../../../lib/data";
import { fmtTime } from "../../../lib/format";
import { masterConfigured, useMasterBookings } from "../../../lib/master-api";
import { useStore } from "../../../lib/store";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type Booking = { id: string; initial: string; name: string; service: string; time: string; status: "confirmed" | "pending" };
const TODAY: Booking[] = [
  { id: "1", initial: "А", name: "Азиза Каримова", service: "Консультация", time: "14:00", status: "confirmed" },
  { id: "2", initial: "Ф", name: "Фаррух Алиев", service: "Стрижка", time: "15:30", status: "pending" },
  { id: "3", initial: "Е", name: "Елена Волкова", service: "Маникюр", time: "17:00", status: "confirmed" },
];

export default function Today() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile } = useStore();
  const name = profile.name ? profile.name.split(" ")[0] : t("мастер");
  const { data: bookings, reload } = useMasterBookings();
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const real = masterConfigured && bookings ? bookings.filter((b) => b.status !== "cancelled") : null;
  const isToday = (iso: string) => { const d = new Date(iso), n = new Date(); return d.toDateString() === n.toDateString(); };
  const todayCount = real ? real.filter((b) => isToday(b.starts_at)).length : 5;
  const near: Booking[] = real
    ? real.filter((b) => new Date(b.starts_at).getTime() >= Date.now() - 3600_000)
        .slice(0, 5)
        .map((b) => ({
          id: b.id, initial: initialOf(b.client_name ?? "?"), name: b.client_name ?? t("Клиент"),
          service: b.service_name ?? t("Услуга"), time: fmtTime(new Date(b.starts_at)),
          status: b.status === "confirmed" ? "confirmed" : "pending",
        }))
    : TODAY;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Шапка */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Avatar initial={profile.name ? initialOf(profile.name) : "М"} size={40} round tint={colors.surfaceMid} fg={colors.accent} />
          <AppText variant="headlineMd" color={colors.accent}>{t("Здравствуйте, {name}", { name })}</AppText>
        </View>
        <Pressable onPress={() => router.push("/(master)/notifications")} style={styles.bell} hitSlop={8}>
          <Sym name="notifications-none" size={22} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Bento-статистика */}
        <View style={styles.bento}>
          <View style={[styles.statCard, cardShadow]}>
            <AppText variant="labelSm" color={colors.secondary} style={styles.statLabel}>{t("Записи")}</AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 26 }}>{todayCount}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{t("сегодня")}</AppText>
            </View>
          </View>
          <View style={[styles.statCard, cardShadow]}>
            <AppText variant="labelSm" color={colors.secondary} style={styles.statLabel}>{t("Слоты")}</AppText>
            <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4 }}>
              <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 26 }}>3</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{t("свободно")}</AppText>
            </View>
          </View>
          <View style={[styles.revenueCard, cardShadow]}>
            <View>
              <AppText variant="labelSm" color="#FFD9DD" style={styles.statLabel}>{t("Выручка за день")}</AppText>
              <AppText variant="headlineMd" color="#FFFFFF" style={{ marginTop: 4, fontSize: 20 }}>1 250 000 {t("сум")}</AppText>
            </View>
            <View style={styles.revenueIcon}><Sym name="payments" size={24} color={colors.onAccent} /></View>
          </View>
        </View>

        {/* Быстрые действия */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: space.lg }} contentContainerStyle={{ gap: 12 }}>
          <Pressable onPress={() => router.push("/(master)/share")} style={[styles.actionPrimary, cardShadow]}>
            <Sym name="share" size={16} color={colors.onAccent} />
            <AppText variant="labelMd" color={colors.onAccent}>{t("Поделиться ссылкой")}</AppText>
          </Pressable>
          <Pressable onPress={() => router.push("/(master)/service-form")} style={[styles.actionGhost, cardShadow]}>
            <Sym name="add" size={16} color={colors.accent} />
            <AppText variant="labelMd" color={colors.accent}>{t("Добавить услугу")}</AppText>
          </Pressable>
        </ScrollView>

        {/* Ближайшие записи */}
        <View style={styles.sectionHead}>
          <AppText variant="headlineMd" color={colors.accent}>{t("Ближайшие записи")}</AppText>
          <Pressable onPress={() => router.push("/(master)/(tabs)/requests")}>
            <AppText variant="labelMd" color={colors.accent}>{t("Все")}</AppText>
          </Pressable>
        </View>

        <View style={{ gap: space.md }}>
          {near.length === 0 && (
            <View style={{ alignItems: "center", paddingVertical: 24 }}><AppText variant="bodyMd" color={colors.secondary}>{t("На сегодня записей нет.")}</AppText></View>
          )}
          {near.map((b) => (
            <Pressable key={b.id} onPress={() => router.push(`/(master)/booking/${b.id}`)}>
              <View style={[styles.bookingCard, cardShadow]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
                  <Avatar initial={b.initial} size={48} tint={colors.surfaceMid} fg={colors.inkVariant} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="labelMd" color={colors.ink}>{b.name}</AppText>
                    <AppText variant="labelSm" color={colors.secondary}>{t(b.service)}</AppText>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <AppText variant="labelMd" color={colors.accent}>{b.time}</AppText>
                  <View style={[styles.badge, { backgroundColor: b.status === "confirmed" ? colors.successBg : colors.warningBg }]}>
                    <AppText variant="labelSm" color={b.status === "confirmed" ? colors.successText : colors.warningText} style={{ fontSize: 10 }}>
                      {b.status === "confirmed" ? t("Подтверждено") : t("Ожидает")}
                    </AppText>
                  </View>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md },
  bell: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", ...cardShadow },
  bento: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: space.sm },
  statCard: { width: "47.5%", flexGrow: 1, minHeight: 100, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md, justifyContent: "space-between" },
  statLabel: { textTransform: "uppercase", letterSpacing: 1 },
  revenueCard: { width: "100%", backgroundColor: colors.accentDeep, borderRadius: radius.lg, padding: space.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  revenueIcon: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  actionPrimary: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full, backgroundColor: colors.accent },
  actionGhost: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: space.lg, marginBottom: space.md },
  bookingCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.md },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
});

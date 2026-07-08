import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { fmtMoney, MONTHS_GEN } from "../../lib/format";
import { Booking, BookingStatus, useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

const BADGE: Record<BookingStatus, { bg: string; fg: string; label: string }> = {
  confirmed: { bg: colors.successBg, fg: colors.successText, label: "Подтверждена" },
  pending: { bg: colors.warningBg, fg: colors.warningText, label: "Ожидает" },
  done: { bg: colors.infoBg, fg: colors.infoText, label: "Выполнена" },
  cancelled: { bg: colors.surfaceHigh, fg: colors.secondary, label: "Отменена" },
};

const p2 = (n: number) => String(n).padStart(2, "0");
const when = (d: Date) => `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}, ${p2(d.getHours())}:${p2(d.getMinutes())}`;

export default function Bookings() {
  const router = useRouter();
  const { bookings } = useStore();
  const [tab, setTab] = useState(0);

  const now = Date.now();
  const upcoming = bookings.filter((b) => b.status !== "cancelled" && b.date.getTime() >= now - 60 * 60 * 1000);
  const history = bookings.filter((b) => !(b.status !== "cancelled" && b.date.getTime() >= now - 60 * 60 * 1000));
  const list = tab === 0 ? upcoming : history;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>Мои записи</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.segment}>
          {["Предстоящие", "История"].map((s, i) => (
            <Pressable key={s} onPress={() => setTab(i)} style={[styles.seg, i === tab && styles.segOn]}>
              <AppText variant="labelMd" color={i === tab ? colors.onAccent : colors.secondary}>{s}</AppText>
            </Pressable>
          ))}
        </View>

        {list.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 56, gap: 12 }}>
            <Sym name={tab === 0 ? "event-note" : "history"} size={40} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center" }}>
              {tab === 0 ? "Записей пока нет.\nВыберите специалиста и запишитесь." : "Прошлых записей пока нет"}
            </AppText>
            {tab === 0 && (
              <Pressable onPress={() => router.push("/(tabs)/search")} style={styles.findBtn}>
                <AppText variant="labelMd" color={colors.onAccent}>Найти специалиста</AppText>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={{ gap: space.md }}>
            {list.map((b: Booking) => {
              const badge = BADGE[b.status];
              return (
                <Pressable key={b.id} onPress={() => router.push(`/appointment/${b.id}`)}>
                  <Card padding={16}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flexDirection: "row", gap: space.md, alignItems: "center", flex: 1 }}>
                        <Avatar initial={b.initial} size={48} tint={colors.surfaceMid} fg={colors.inkVariant} />
                        <View style={{ flex: 1 }}>
                          <AppText variant="labelMd" color={colors.ink}>{b.specialist}</AppText>
                          <AppText variant="labelSm" color={colors.secondary}>{b.service}</AppText>
                        </View>
                      </View>
                      <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                        <AppText variant="labelSm" color={badge.fg} style={{ fontSize: 11 }}>{badge.label}</AppText>
                      </View>
                    </View>
                    <View style={styles.divider} />
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Sym name="calendar-today" size={18} color={colors.inkVariant} />
                        <AppText variant="labelSm" color={colors.inkVariant}>{when(b.date)}</AppText>
                      </View>
                      <AppText variant="labelMd" color={colors.accent}>{fmtMoney(b.price)}</AppText>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        )}

        {tab === 0 && (
          <View style={styles.promo}>
            <AppText variant="headlineMd" color={colors.accentTint}>Уход за собой как ритуал</AppText>
            <AppText variant="bodyMd" color={"#80bea6"} style={{ marginTop: 4 }}>Найдите специалиста для следующего визита в ORA.</AppText>
            <Pressable onPress={() => router.push("/(tabs)/search")} style={styles.promoBtn}>
              <AppText variant="labelMd" color={colors.accentDeep}>Перейти к поиску</AppText>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, height: 56, justifyContent: "center" },
  segment: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.full, padding: 4, marginBottom: space.lg },
  seg: { flex: 1, paddingVertical: 10, borderRadius: radius.full, alignItems: "center" },
  segOn: { backgroundColor: colors.accent },
  findBtn: { backgroundColor: colors.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.xl, marginTop: 4 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  divider: { height: 1, backgroundColor: colors.outlineVariant, opacity: 0.4, marginVertical: 12 },
  promo: { backgroundColor: colors.accentDeep, borderRadius: radius.xl, padding: 24, marginTop: space.md },
  promoBtn: { alignSelf: "flex-start", backgroundColor: colors.accentTint, paddingHorizontal: 24, paddingVertical: 8, borderRadius: radius.full, marginTop: 12 },
});

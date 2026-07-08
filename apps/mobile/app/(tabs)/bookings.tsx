import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

type Status = "confirmed" | "pending" | "done" | "cancelled";
const BADGE: Record<Status, { bg: string; fg: string; label: string }> = {
  confirmed: { bg: colors.successBg, fg: colors.successText, label: "Подтверждена" },
  pending: { bg: colors.warningBg, fg: colors.warningText, label: "Ожидает" },
  done: { bg: colors.infoBg, fg: colors.infoText, label: "Выполнена" },
  cancelled: { bg: colors.surfaceHigh, fg: colors.secondary, label: "Отменена" },
};

const UPCOMING = [
  { id: "1", initial: "Д", name: "Дилноза Каримова", service: "Индивидуальная консультация", when: "12 июля, 11:00", price: "250 000 сум", status: "confirmed" as Status },
  { id: "2", initial: "Р", name: "Рустам Ахмедов", service: "Стрижка и укладка", when: "15 июля, 14:30", price: "180 000 сум", status: "pending" as Status },
];

export default function Bookings() {
  const router = useRouter();
  const [tab, setTab] = useState(0);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>Мои записи</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Сегмент */}
        <View style={styles.segment}>
          {["Предстоящие", "История"].map((s, i) => (
            <Pressable key={s} onPress={() => setTab(i)} style={[styles.seg, i === tab && styles.segOn]}>
              <AppText variant="labelMd" color={i === tab ? colors.onAccent : colors.secondary}>{s}</AppText>
            </Pressable>
          ))}
        </View>

        {tab === 0 ? (
          <View style={{ gap: space.md }}>
            {UPCOMING.map((b) => {
              const badge = BADGE[b.status];
              return (
                <Pressable key={b.id} onPress={() => router.push(`/appointment/${b.id}`)}>
                <Card padding={16}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flexDirection: "row", gap: space.md, alignItems: "center", flex: 1 }}>
                      <Avatar initial={b.initial} size={48} tint={colors.surfaceMid} fg={colors.inkVariant} />
                      <View style={{ flex: 1 }}>
                        <AppText variant="labelMd" color={colors.ink}>{b.name}</AppText>
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
                      <AppText variant="labelSm" color={colors.inkVariant}>{b.when}</AppText>
                    </View>
                    <AppText variant="labelMd" color={colors.accent}>{b.price}</AppText>
                  </View>
                </Card>
                </Pressable>
              );
            })}

            {/* Промо */}
            <View style={styles.promo}>
              <AppText variant="headlineMd" color={colors.accentTint}>Уход за собой как ритуал</AppText>
              <AppText variant="bodyMd" color={"#80bea6"} style={{ marginTop: 4 }}>
                Найдите специалиста для следующего визита в ORA.
              </AppText>
              <Pressable onPress={() => router.push("/(tabs)/search")} style={styles.promoBtn}>
                <AppText variant="labelMd" color={colors.accentDeep}>Перейти к поиску</AppText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={{ alignItems: "center", paddingVertical: 64, gap: 12 }}>
            <Sym name="history" size={40} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary}>Прошлых записей пока нет</AppText>
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
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  divider: { height: 1, backgroundColor: colors.outlineVariant, opacity: 0.4, marginVertical: 12 },
  promo: { backgroundColor: colors.accentDeep, borderRadius: radius.xl, padding: 24, marginTop: 4 },
  promoBtn: { alignSelf: "flex-start", backgroundColor: colors.accentTint, paddingHorizontal: 24, paddingVertical: 8, borderRadius: radius.full, marginTop: 12 },
});

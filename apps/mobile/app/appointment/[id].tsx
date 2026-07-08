import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, GhostBorderButton, PrimaryButton, Sym } from "../../components/ui";
import { fmtDate, fmtMoney, fmtTime } from "../../lib/format";
import { useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

function DetailRow({ icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
      <View style={styles.iconCircle}><Sym name={icon} size={20} color={colors.accent} /></View>
      <View>
        <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>{label}</AppText>
        <AppText variant="bodyMd" color={colors.ink} style={{ fontFamily: "Manrope_600SemiBold" }}>{value}</AppText>
        {sub ? <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{sub}</AppText> : null}
      </View>
    </View>
  );
}

export default function Appointment() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, cancelBooking } = useStore();
  const b = bookings.find((x) => x.id === id) ?? bookings[0];

  // Демо-данные, если запись не найдена (например, переход из уведомлений).
  const specialist = b?.specialist ?? "Дилноза Каримова";
  const initial = b?.initial ?? "Д";
  const spec = b?.spec ?? "Клинический психолог";
  const date = b?.date ?? new Date();
  const service = b?.service ?? "Индивидуальная консультация";
  const duration = b?.duration ?? 50;
  const price = b?.price ?? 180000;
  const address = b?.address ?? "Ташкент, Мирабад";
  const cancelled = b?.status === "cancelled";

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>Запись</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {/* Статус */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="headlineMd" color={colors.accent}>Детали записи</AppText>
          <View style={[styles.badge, { backgroundColor: cancelled ? colors.surfaceHigh : colors.successBg }]}>
            <AppText variant="labelSm" color={cancelled ? colors.secondary : colors.successText}>{cancelled ? "Отменена" : "Подтверждена"}</AppText>
          </View>
        </View>

        {/* Специалист */}
        <Pressable onPress={() => router.push("/specialist/1")}>
          <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{initial}</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.ink}>{specialist}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{spec}</AppText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 }}>
                <Sym name="star" size={16} color={colors.gold} />
                <AppText variant="labelSm" color={colors.ink}>4.9 (124 отзыва)</AppText>
              </View>
            </View>
            <Sym name="chevron-right" size={22} color={colors.outlineVariant} />
          </Card>
        </Pressable>

        {/* Услуга и время */}
        <Card padding={20}>
          <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <DetailRow icon="content-paste" label="Услуга" value={service} sub={`${duration} минут`} />
          </View>
          <View style={{ paddingTop: 16 }}>
            <DetailRow icon="calendar-today" label="Дата и время" value={fmtDate(date)} sub={fmtTime(date)} />
          </View>
        </Card>

        {/* Локация */}
        <View>
          <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>Локация</AppText>
          <Card padding={0} style={{ overflow: "hidden" }}>
            <View style={styles.map}>
              <View style={styles.pin}><Sym name="location-on" size={18} color={colors.onAccent} /></View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 }}>
              <View>
                <AppText variant="labelMd" color={colors.ink}>Ташкент, Мирабад</AppText>
                <AppText variant="labelSm" color={colors.secondary}>ул. Шевченко, 21</AppText>
              </View>
              <View style={styles.mapBtn}><Sym name="directions" size={20} color={colors.accent} /></View>
            </View>
          </Card>
        </View>

        {/* Оплата */}
        <Card padding={20}>
          <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Оплата</AppText>
          <View style={{ gap: 8 }}>
            <View style={styles.payRow}><AppText variant="bodyMd" color={colors.secondary}>Услуга</AppText><AppText variant="bodyMd" color={colors.ink}>{fmtMoney(price)}</AppText></View>
            <View style={styles.payRow}><AppText variant="bodyMd" color={colors.secondary}>Сервисный сбор</AppText><AppText variant="bodyMd" color={colors.ink}>{fmtMoney(10000)}</AppText></View>
            <View style={[styles.payRow, { borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: 12, marginTop: 4 }]}>
              <AppText variant="labelMd" color={colors.ink}>Итого</AppText>
              <AppText variant="labelMd" color={colors.accent}>{fmtMoney(price + 10000)}</AppText>
            </View>
          </View>
        </Card>

        {/* Заметка */}
        <View style={[styles.note, { backgroundColor: colors.infoBg }]}>
          <Sym name="info" size={20} color={colors.infoText} />
          <AppText variant="labelSm" color={colors.infoText} style={{ flex: 1 }}>
            Отменить или перенести запись можно не позднее чем за 24 часа до визита.
          </AppText>
        </View>
      </ScrollView>

      {/* Действия */}
      <View style={styles.actions}>
        <PrimaryButton label="Написать специалисту" icon="chat" onPress={() => router.push("/chat/1")} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          <View style={{ flex: 1 }}><GhostBorderButton label="Перенести" onPress={() => router.push("/booking/datetime")} /></View>
          <Pressable style={styles.cancelBtn} onPress={() => { if (b) cancelBooking(b.id); router.back(); }}>
            <AppText variant="labelMd" color={colors.error}>Отменить</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26, lineHeight: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  map: { height: 160, backgroundColor: colors.surfaceHighest, alignItems: "center", justifyContent: "center" },
  pin: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.surface },
  mapBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  note: { flexDirection: "row", gap: 12, alignItems: "center", padding: 16, borderRadius: radius.xl },
  actions: { paddingHorizontal: space.margin, paddingTop: space.md, gap: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  cancelBtn: { flex: 1, height: 56, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" },
});

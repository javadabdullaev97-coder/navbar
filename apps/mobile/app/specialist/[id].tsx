import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { cardShadow, colors, radius, space } from "../../theme";

const TABS = ["Услуги", "Портфолио", "Отзывы"] as const;

const SERVICES = [
  { name: "Индивидуальная консультация", meta: "50 мин", icon: "schedule", price: "180 000 сум" },
  { name: "Семейная терапия", meta: "90 мин", icon: "schedule", price: "250 000 сум" },
  { name: "Онлайн-сессия", meta: "50 мин", icon: "videocam", price: "150 000 сум" },
] as const;

export default function Specialist() {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Обложка */}
        <View style={styles.cover} />

        {/* Плавающие кнопки */}
        <SafeAreaView edges={["top"]} style={styles.floatBar} pointerEvents="box-none">
          <Pressable style={styles.circleBtn} onPress={() => router.back()}>
            <Sym name="arrow-back" size={22} color={colors.accent} />
          </Pressable>
          <Pressable style={styles.circleBtn} onPress={() => setSaved((s) => !s)}>
            <Sym name={saved ? "bookmark" : "bookmark-border"} size={22} color={colors.accent} />
          </Pressable>
        </SafeAreaView>

        {/* Шапка профиля */}
        <View style={styles.head}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarInitial} color={colors.inkVariant}>Д</AppText>
          </View>
          <AppText variant="displayLg" color={colors.accent} style={{ marginTop: 10 }}>
            Дилноза Каримова
          </AppText>
          <AppText variant="labelMd" color={colors.secondary} style={{ marginTop: 2 }}>
            Клинический психолог, 8 лет опыта
          </AppText>
          <View style={styles.metaRow}>
            <Sym name="star" size={18} color={colors.gold} />
            <AppText variant="labelMd" color={colors.ink}>4.9</AppText>
            <AppText variant="labelSm" color={colors.secondary}>(213 отзывов)</AppText>
          </View>
          <View style={styles.locRow}>
            <Sym name="location-on" size={16} color={colors.secondary} />
            <AppText variant="labelSm" color={colors.secondary}>Ташкент, Мирабад ·</AppText>
            <AppText variant="labelSm" color={colors.accent} style={{ textDecorationLine: "underline" }}>на карте</AppText>
          </View>
        </View>

        {/* Табы */}
        <View style={styles.tabs}>
          {TABS.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={[styles.tab, i === tab && styles.tabOn]}>
              <AppText variant="labelMd" color={i === tab ? colors.onAccent : colors.secondary}>{t}</AppText>
            </Pressable>
          ))}
        </View>

        {/* Содержимое таба */}
        {tab === 0 && (
          <View style={{ paddingHorizontal: space.margin, gap: space.md, marginTop: space.md }}>
            {SERVICES.map((s) => (
              <Pressable key={s.name} onPress={() => router.push("/booking/service")}>
                <View style={[styles.service, cardShadow]}>
                  <View style={{ gap: 4 }}>
                    <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Sym name={s.icon as any} size={14} color={colors.secondary} />
                      <AppText variant="labelSm" color={colors.secondary}>{s.meta}</AppText>
                    </View>
                    <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText>
                  </View>
                  <View style={styles.serviceBtn}>
                    <Sym name="chevron-right" size={22} color={colors.accent} />
                  </View>
                </View>
              </Pressable>
            ))}

            {/* О себе */}
            <AppText variant="headlineMd" color={colors.accent} style={{ marginTop: space.lg }}>О себе</AppText>
            <AppText variant="bodyMd" color={colors.secondary}>
              Помогаю находить гармонию с собой и окружающими. Использую когнитивно-поведенческую терапию
              и гештальт-подход, адаптируя методы под запрос каждого клиента.
            </AppText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: space.sm }}>
              <View style={[styles.pill, { backgroundColor: colors.infoBg }]}>
                <Sym name="verified" size={14} color={colors.infoText} />
                <AppText variant="labelSm" color={colors.infoText}>Диплом проверен</AppText>
              </View>
              <View style={[styles.pill, { backgroundColor: colors.successBg }]}>
                <Sym name="check-circle" size={14} color={colors.successText} />
                <AppText variant="labelSm" color={colors.successText}>Принимает очно</AppText>
              </View>
            </View>
          </View>
        )}
        {tab === 1 && <Empty text="Портфолио появится здесь" />}
        {tab === 2 && <Empty text="Отзывы появятся здесь" />}
      </ScrollView>

      {/* Липкая кнопка */}
      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <PrimaryButton label="Записаться" icon="calendar-today" onPress={() => router.push("/booking/service")} />
      </SafeAreaView>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={{ padding: space.lg, alignItems: "center" }}>
      <AppText variant="bodyMd" color={colors.secondary}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  cover: { height: 192, backgroundColor: colors.surfaceMid },
  floatBar: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    paddingHorizontal: space.margin,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  circleBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center", justifyContent: "center",
    ...cardShadow,
  },
  head: { paddingHorizontal: space.margin, marginTop: -64 },
  avatar: {
    width: 128, height: 128, borderRadius: radius.x2l,
    backgroundColor: colors.surfaceMid,
    borderWidth: 4, borderColor: colors.bg,
    alignItems: "center", justifyContent: "center",
  },
  avatarInitial: { fontFamily: "LibreCaslonText_400Regular", fontSize: 52 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  tabs: {
    flexDirection: "row",
    gap: 8,
    marginHorizontal: space.margin,
    marginTop: space.lg,
    padding: 4,
    backgroundColor: colors.surfaceLow,
    borderRadius: radius.full,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: "center" },
  tabOn: { backgroundColor: colors.accent },
  service: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 16,
  },
  serviceBtn: {
    width: 40, height: 40, borderRadius: radius.full,
    backgroundColor: colors.surfaceLow,
    alignItems: "center", justifyContent: "center",
  },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  footer: {
    position: "absolute",
    bottom: 0, left: 0, right: 0,
    backgroundColor: colors.surface,
    paddingHorizontal: space.margin,
    paddingTop: space.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
  },
});

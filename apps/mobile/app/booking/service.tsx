import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { cardShadow, colors, radius, space } from "../../theme";

const SERVICES = [
  { name: "Индивидуальная консультация", meta: "50 мин · очно/онлайн", icon: "person", price: "180 000", raw: 180000 },
  { name: "Семейная терапия", meta: "90 мин · только очно", icon: "groups", price: "250 000", raw: 250000 },
  { name: "Психодиагностика", meta: "120 мин · комплекс", icon: "psychology", price: "350 000", raw: 350000 },
  { name: "Онлайн-сессия", meta: "50 мин · только онлайн", icon: "videocam", price: "150 000", raw: 150000 },
] as const;

const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/,/g, " ");

export default function ServiceSelect() {
  const router = useRouter();
  const [sel, setSel] = useState(0);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={26} color={colors.accent} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.accent}>Выбор услуги</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Специалист */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.lg }}>
          <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>Д</AppText></View>
          <View>
            <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>
              Специалист
            </AppText>
            <AppText variant="headlineMd" color={colors.accent}>Дилноза Каримова</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
              <Sym name="star" size={16} color={colors.gold} />
              <AppText variant="labelMd" color={colors.ink}>4.9</AppText>
              <AppText variant="labelSm" color={colors.secondary}>(124)</AppText>
            </View>
          </View>
        </View>

        <AppText variant="labelMd" color={colors.ink} style={{ marginBottom: 8 }}>Выберите услугу</AppText>

        <View style={{ gap: space.md }}>
          {SERVICES.map((s, i) => {
            const on = i === sel;
            return (
              <Pressable key={s.name} onPress={() => setSel(i)}>
                <View style={[styles.card, cardShadow, on && { borderColor: colors.accent }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, flex: 1 }}>
                    <View style={styles.iconBox}>
                      <Sym name={s.icon as any} size={22} color={colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                      <AppText variant="labelSm" color={colors.secondary}>{s.meta}</AppText>
                    </View>
                  </View>
                  <AppText variant="labelMd" color={colors.accent}>{s.price} сум</AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Футер */}
      <View style={styles.footer}>
        <View>
          <AppText variant="labelSm" color={colors.secondary}>Итого</AppText>
          <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>
            {fmt(SERVICES[sel].raw)} сум
          </AppText>
        </View>
        <PrimaryButton label="Далее" icon="arrow-forward" style={{ width: 180 }} onPress={() => router.push("/booking/datetime")} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 28 },
  card: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16,
    borderWidth: 1, borderColor: "transparent",
  },
  iconBox: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  footer: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: space.margin, paddingVertical: space.md,
    backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant,
  },
});

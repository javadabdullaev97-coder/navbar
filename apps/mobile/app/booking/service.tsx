import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { fmtMoney } from "../../lib/format";
import { useStore } from "../../lib/store";
import { cardShadow, colors, radius, space } from "../../theme";

const SERVICES = [
  { name: "Индивидуальная консультация", meta: "50 мин · очно/онлайн", icon: "person", price: 180000, duration: 50 },
  { name: "Семейная терапия", meta: "90 мин · только очно", icon: "groups", price: 250000, duration: 90 },
  { name: "Психодиагностика", meta: "120 мин · комплекс", icon: "psychology", price: 350000, duration: 120 },
  { name: "Онлайн-сессия", meta: "50 мин · только онлайн", icon: "videocam", price: 150000, duration: 50 },
] as const;

export default function ServiceSelect() {
  const router = useRouter();
  const { draft, patchDraft } = useStore();
  const [sel, setSel] = useState(0);

  function next() {
    const s = SERVICES[sel];
    patchDraft({ service: s.name, price: s.price, duration: s.duration });
    router.push("/booking/datetime");
  }

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
          <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{draft.initial}</AppText></View>
          <View>
            <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>Специалист</AppText>
            <AppText variant="headlineMd" color={colors.accent}>{draft.specialist}</AppText>
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
                    <View style={styles.iconBox}><Sym name={s.icon as any} size={22} color={colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                      <AppText variant="labelSm" color={colors.secondary}>{s.meta}</AppText>
                    </View>
                  </View>
                  <AppText variant="labelMd" color={colors.accent}>{s.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум</AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <AppText variant="labelSm" color={colors.secondary}>Итого</AppText>
          <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>{fmtMoney(SERVICES[sel].price)}</AppText>
        </View>
        <PrimaryButton label="Далее" icon="arrow-forward" style={{ width: 180 }} onPress={next} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 28 },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: "transparent" },
  iconBox: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

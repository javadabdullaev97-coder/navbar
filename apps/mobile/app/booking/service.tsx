import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { fmtMoney } from "../../lib/format";
import { useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

const DEMO_SERVICES = [
  { id: "d1", name: "Индивидуальная консультация", duration_min: 50, price: 180000 },
  { id: "d2", name: "Семейная терапия", duration_min: 90, price: 250000 },
  { id: "d3", name: "Психодиагностика", duration_min: 120, price: 350000 },
  { id: "d4", name: "Онлайн-сессия", duration_min: 50, price: 150000 },
];

export default function ServiceSelect() {
  const router = useRouter();
  const { draft, patchDraft } = useStore();
  const options = draft.serviceOptions && draft.serviceOptions.length ? draft.serviceOptions : DEMO_SERVICES;
  const [sel, setSel] = useState(0);

  function next() {
    const s = options[sel];
    patchDraft({ service: s.name, serviceId: s.id, price: s.price, duration: s.duration_min });
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.lg }}>
          <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{draft.initial}</AppText></View>
          <View>
            <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>Специалист</AppText>
            <AppText variant="headlineMd" color={colors.accent}>{draft.specialist}</AppText>
          </View>
        </View>

        <AppText variant="labelMd" color={colors.ink} style={{ marginBottom: 8 }}>Выберите услугу</AppText>

        <View style={{ gap: space.md }}>
          {options.map((s, i) => {
            const on = i === sel;
            return (
              <Pressable key={s.id} onPress={() => setSel(i)}>
                <View style={[styles.card, on && { borderColor: colors.accent }]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, flex: 1 }}>
                    <View style={styles.iconBox}><Sym name="spa" size={22} color={colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                      <AppText variant="labelSm" color={colors.secondary}>{s.duration_min} мин</AppText>
                    </View>
                  </View>
                  <AppText variant="labelMd" color={colors.accent}>{fmtMoney(s.price)}</AppText>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View>
          <AppText variant="labelSm" color={colors.secondary}>Итого</AppText>
          <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>{fmtMoney(options[sel].price)}</AppText>
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
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.outlineVariant },
  iconBox: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

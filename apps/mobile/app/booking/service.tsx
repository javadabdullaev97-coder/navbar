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

  // Выбранные услуги (по умолчанию — то, что пришло из профиля).
  const [selected, setSelected] = useState<Set<string>>(new Set(draft.serviceIds.length ? draft.serviceIds : [options[0]?.id]));

  const chosen = options.filter((o) => selected.has(o.id));
  const totalPrice = chosen.reduce((s, o) => s + o.price, 0);
  const totalDuration = chosen.reduce((s, o) => s + o.duration_min, 0);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { if (next.size > 1) next.delete(id); } // хотя бы одна услуга
      else next.add(id);
      return next;
    });
  }

  function nextStep() {
    if (chosen.length === 0) return;
    patchDraft({
      service: chosen.map((o) => o.name).join(", "),
      serviceIds: chosen.map((o) => o.id),
      price: totalPrice,
      duration: totalDuration,
    });
    router.push("/booking/datetime");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>Выбор услуг</AppText>
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

        <AppText variant="labelMd" color={colors.ink} style={{ marginBottom: 8 }}>Выберите одну или несколько услуг</AppText>

        <View style={{ gap: space.md }}>
          {options.map((s) => {
            const on = selected.has(s.id);
            return (
              <Pressable key={s.id} onPress={() => toggle(s.id)}>
                <View style={[styles.card, on && { borderColor: colors.accent }]}>
                  <View style={[styles.check, on ? { backgroundColor: colors.accent, borderColor: colors.accent } : { borderColor: colors.outlineVariant }]}>
                    {on ? <Sym name="check" size={16} color={colors.onAccent} /> : null}
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                    <AppText variant="labelSm" color={colors.secondary}>{s.duration_min} мин</AppText>
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
          <AppText variant="labelSm" color={colors.secondary}>Итого · {totalDuration} мин</AppText>
          <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>{fmtMoney(totalPrice)}</AppText>
        </View>
        <PrimaryButton label="Далее" icon="arrow-forward" style={{ width: 180 }} onPress={nextStep} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 28 },
  card: { flexDirection: "row", alignItems: "center", gap: space.md, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16, borderWidth: 1, borderColor: colors.outlineVariant },
  check: { width: 24, height: 24, borderRadius: 8, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, paddingVertical: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

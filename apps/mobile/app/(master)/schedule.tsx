import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

type Day = { key: string; label: string; on: boolean; hours: string };
const INITIAL: Day[] = [
  { key: "mon", label: "Пн", on: true, hours: "09:00 – 18:00" },
  { key: "tue", label: "Вт", on: true, hours: "09:00 – 18:00" },
  { key: "wed", label: "Ср", on: true, hours: "09:00 – 18:00" },
  { key: "thu", label: "Чт", on: true, hours: "09:00 – 18:00" },
  { key: "fri", label: "Пт", on: true, hours: "09:00 – 17:00" },
  { key: "sat", label: "Сб", on: false, hours: "09:00 – 18:00" },
  { key: "sun", label: "Вс", on: false, hours: "09:00 – 18:00" },
];

export default function Schedule() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [days, setDays] = useState<Day[]>(INITIAL);

  const toggle = (key: string) => setDays((d) => d.map((x) => (x.key === key ? { ...x, on: !x.on } : x)));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accentDeep}>{t("График работы")}</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} showsVerticalScrollIndicator={false}>
        {/* Дни недели */}
        <View style={{ gap: space.sm }}>
          <View style={styles.sectionRow}>
            <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Дни недели")}</AppText>
            <AppText variant="labelSm" color={colors.accent}>{t("Режим работы")}</AppText>
          </View>
          <View style={[styles.card, cardShadow]}>
            {days.map((d, i) => (
              <View key={d.key} style={[styles.dayRow, i < days.length - 1 && styles.divider, !d.on && { opacity: 0.6 }]}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                  <Switch value={d.on} onValueChange={() => toggle(d.key)} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
                  <AppText variant="labelMd" color={colors.ink}>{t(d.label)}</AppText>
                </View>
                {d.on ? (
                  <Pressable style={styles.hoursBtn}><AppText variant="bodyMd" color={colors.accent}>{d.hours}</AppText></Pressable>
                ) : (
                  <AppText variant="bodyMd" color={colors.secondary} style={{ fontStyle: "italic" }}>{t("Выходной")}</AppText>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Перерыв */}
        <View style={{ gap: space.sm }}>
          <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Обед и перерывы")}</AppText>
          <View style={[styles.card, styles.breakRow, cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.coffee}><Sym name="coffee" size={20} color={colors.successText} /></View>
              <AppText variant="labelMd" color={colors.ink}>{t("Перерыв")}</AppText>
            </View>
            <Pressable style={styles.hoursBtn}><AppText variant="bodyMd" color={colors.accent}>13:00 – 14:00</AppText></Pressable>
          </View>
        </View>

        {/* Атмосферная карточка */}
        <View style={styles.hero}>
          <AppText variant="headlineMd" color={colors.onAccent}>{t("Эффективное время")}</AppText>
          <AppText variant="bodyMd" color={colors.accentTint} style={{ marginTop: 6, maxWidth: 240 }}>
            {t("Точный график повышает доверие клиентов.")}
          </AppText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Сохранить изменения")} onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 4 },
  upper: { textTransform: "uppercase", letterSpacing: 1.5 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: "hidden" },
  dayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  hoursBtn: { backgroundColor: colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.lg },
  breakRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  coffee: { backgroundColor: colors.successBg, padding: 8, borderRadius: radius.full },
  hero: { backgroundColor: colors.accentDeep, borderRadius: radius.xl, padding: 24, overflow: "hidden" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

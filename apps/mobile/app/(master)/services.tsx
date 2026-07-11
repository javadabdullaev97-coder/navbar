import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { fmtMoney } from "../../lib/format";
import { fmtDur } from "./service-form";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

type Service = { id: string; name: string; duration: number; price: number };
const SERVICES: Service[] = [
  { id: "1", name: "Консультация 50 мин", duration: 50, price: 250000 },
  { id: "2", name: "Первичный приём", duration: 60, price: 300000 },
  { id: "3", name: "Диагностика", duration: 40, price: 180000 },
  { id: "4", name: "Повторный сеанс", duration: 45, price: 220000 },
];

export default function Services() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Услуги")}</AppText>
        </View>
        <Pressable onPress={() => router.push("/(master)/service-form")} style={styles.addBtn}>
          <Sym name="add" size={20} color={colors.onAccent} />
          <AppText variant="labelMd" color={colors.onAccent}>{t("Добавить")}</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.md }} showsVerticalScrollIndicator={false}>
        {SERVICES.map((s) => (
          <Pressable key={s.id} onPress={() => router.push({ pathname: "/(master)/service-form", params: { id: s.id, name: s.name, duration: String(s.duration), price: String(s.price) } })}>
            <View style={[styles.card, cardShadow]}>
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" color={colors.ink}>{t(s.name)}</AppText>
                <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{fmtDur(s.duration)}</AppText>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <AppText variant="labelMd" color={colors.accent}>{fmtMoney(s.price)}</AppText>
                <Sym name="edit" size={20} color={colors.secondary} />
              </View>
            </View>
          </Pressable>
        ))}

        <View style={styles.note}>
          <AppText variant="bodyMd" color={colors.inkVariant} style={{ lineHeight: 24 }}>
            {t("Настройте стоимость и длительность услуг. Эти данные видят клиенты при записи.")}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 20 },
  note: { marginTop: space.md, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 24, borderWidth: 1, borderColor: colors.outlineVariant },
});

import { useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, Sym } from "../components/ui";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

const FAQ = [
  { q: "Как записаться к специалисту?", a: "Откройте профиль специалиста, выберите одну или несколько услуг, затем удобные дату и время и подтвердите запись." },
  { q: "Как отменить или перенести запись?", a: "Зайдите в «Мои записи» → выберите запись. Отменить или перенести можно не позднее чем за 24 часа до визита." },
  { q: "Как оплатить услугу?", a: "Сейчас оплата производится на месте у специалиста. Онлайн-оплата (Payme / Click) появится позже." },
  { q: "Как добавить специалиста в свой список?", a: "На странице специалиста нажмите на закладку — он появится в разделе «Мои специалисты»." },
];

const CONTACTS = [
  { icon: "mail-outline" as const, label: "support@ora.uz", url: "mailto:support@ora.uz" },
  { icon: "send" as const, label: "Telegram: @ora_support", url: "https://t.me/ora_support" },
];

export default function Help() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Помощь")}</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 32, gap: space.md }} showsVerticalScrollIndicator={false}>
        <AppText variant="labelSm" color={colors.secondary} style={styles.section}>{t("ЧАСТЫЕ ВОПРОСЫ")}</AppText>
        {FAQ.map((f) => (
          <Card key={f.q} padding={16}>
            <View style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Sym name="help-outline" size={20} color={colors.accent} />
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" color={colors.ink}>{t(f.q)}</AppText>
                <AppText variant="bodyMd" color={colors.secondary} style={{ marginTop: 6 }}>{t(f.a)}</AppText>
              </View>
            </View>
          </Card>
        ))}

        <AppText variant="labelSm" color={colors.secondary} style={[styles.section, { marginTop: space.md }]}>{t("СВЯЗАТЬСЯ С НАМИ")}</AppText>
        {CONTACTS.map((c) => (
          <Pressable key={c.label} onPress={() => Linking.openURL(c.url).catch(() => {})}>
            <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.iconCircle}><Sym name={c.icon} size={20} color={colors.accent} /></View>
              <AppText variant="bodyMd" color={colors.ink} style={{ flex: 1 }}>{c.label}</AppText>
              <Sym name="chevron-right" size={22} color={colors.outlineVariant} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  section: { textTransform: "uppercase", letterSpacing: 2 },
  iconCircle: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
});

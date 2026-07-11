import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { useT } from "../../../lib/i18n";
import { Lang, ThemeMode, useStore } from "../../../lib/store";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

const THEMES: ThemeMode[] = ["light", "dark", "auto"];
const THEME_SHORT: Record<ThemeMode, string> = { light: "Светлая", dark: "Тёмная", auto: "Авто" };
const LANGS: Lang[] = ["ru", "uz", "en"];
const LANG_SHORT: Record<Lang, string> = { ru: "RU", uz: "UZ", en: "EN" };

type IconName = React.ComponentProps<typeof Sym>["name"];
const ROWS: { icon: IconName; label: string; route: string; badge?: string }[] = [
  { icon: "send", label: "Telegram-подключение", route: "", badge: "подключено" },
  { icon: "design-services", label: "Услуги", route: "/(master)/services" },
  { icon: "calendar-month", label: "График работы", route: "/(master)/schedule" },
  { icon: "photo-library", label: "Портфолио", route: "/(master)/portfolio" },
  { icon: "link", label: "Ссылка для записи", route: "/(master)/share" },
];

export default function MasterProfile() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, lang, setLang, themeMode, setThemeMode } = useStore();

  const name = profile.name || "Дилноза Каримова";
  const spec = "Психолог";

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Профиль")}</AppText>
        <Pressable onPress={() => router.push("/(master)/notifications")} hitSlop={8}>
          <Sym name="notifications-none" size={24} color={colors.accent} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Карточка профиля */}
        <View style={[styles.profileCard, cardShadow]}>
          <Avatar initial={initialOf(name)} size={64} tint={colors.surfaceMid} fg={colors.accent} />
          <View style={{ flex: 1 }}>
            <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20 }}>{name}</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 }}>
              <AppText variant="bodyMd" color={colors.secondary}>{t(spec)}</AppText>
              <Sym name="star" size={16} color={colors.gold} />
              <AppText variant="labelMd" color={colors.ink}>4.9</AppText>
            </View>
          </View>
        </View>
        <Pressable onPress={() => router.push("/(master)/onboarding")} style={{ alignSelf: "flex-end", paddingVertical: 8 }}>
          <AppText variant="labelMd" color={colors.accent}>{t("Редактировать профиль")}</AppText>
        </Pressable>

        {/* Настройки кабинета */}
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {ROWS.map((r, i) => (
            <Pressable key={i} onPress={() => r.route && router.push(r.route as any)} style={[styles.row, cardShadow]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
                <Sym name={r.icon} size={22} color={colors.accent} />
                <AppText variant="bodyMd" color={colors.ink}>{t(r.label)}</AppText>
                {r.badge && (
                  <View style={styles.connected}>
                    <AppText variant="labelSm" color={colors.successText} style={{ fontSize: 10 }}>{t(r.badge)}</AppText>
                  </View>
                )}
              </View>
              {r.route ? <Sym name="chevron-right" size={22} color={colors.outlineVariant} /> : null}
            </Pressable>
          ))}
        </View>

        {/* Тема */}
        <AppText variant="labelMd" color={colors.secondary} style={styles.groupTitle}>{t("Тема")}</AppText>
        <View style={styles.pills}>
          {THEMES.map((k) => {
            const on = k === themeMode;
            return (
              <Pressable key={k} onPress={() => setThemeMode(k)} style={[styles.pill, on && styles.pillOn]}>
                <AppText variant="labelSm" color={on ? colors.accent : colors.secondary}>{t(THEME_SHORT[k])}</AppText>
              </Pressable>
            );
          })}
        </View>

        {/* Язык */}
        <AppText variant="labelMd" color={colors.secondary} style={styles.groupTitle}>{t("Язык")}</AppText>
        <View style={styles.pills}>
          {LANGS.map((k) => {
            const on = k === lang;
            return (
              <Pressable key={k} onPress={() => setLang(k)} style={[styles.pill, on && styles.pillFilled]}>
                <AppText variant="labelSm" color={on ? colors.onAccent : colors.secondary}>{LANG_SHORT[k]}</AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={{ alignItems: "center", marginTop: space.lg }}>
          <Pressable onPress={() => router.replace("/")} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12 }}>
            <Sym name="logout" size={20} color={colors.error} />
            <AppText variant="labelMd" color={colors.error}>{t("Выйти")}</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surface, borderRadius: radius.xl, padding: space.md, marginTop: space.sm },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  connected: { backgroundColor: colors.successBg, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  groupTitle: { marginTop: space.lg, marginBottom: space.sm, paddingHorizontal: 4 },
  pills: { flexDirection: "row", gap: 6, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: "center" },
  pillOn: { backgroundColor: colors.surface, ...cardShadow },
  pillFilled: { backgroundColor: colors.accent },
});

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { signOut } from "../../../lib/auth";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { useT } from "../../../lib/i18n";
import { masterConfigured, submitVerification, useMyMaster } from "../../../lib/master-api";
import { uploadImage } from "../../../lib/storage";
import { Lang, ThemeMode, useStore } from "../../../lib/store";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

const THEMES: ThemeMode[] = ["light", "dark", "auto"];
const THEME_SHORT: Record<ThemeMode, string> = { light: "Светлая", dark: "Тёмная", auto: "Авто" };
const LANGS: Lang[] = ["ru", "uz", "en"];
const LANG_SHORT: Record<Lang, string> = { ru: "RU", uz: "UZ", en: "EN" };

type IconName = React.ComponentProps<typeof Sym>["name"];
const ROWS: { icon: IconName; label: string; route: string }[] = [
  { icon: "design-services", label: "Услуги", route: "/(master)/services" },
  { icon: "insights", label: "Аналитика", route: "/(master)/analytics" },
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
  const { data: master, reload } = useMyMaster();
  const [verifying, setVerifying] = useState(false);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const name = profile.name || t("Мастер");
  const spec = master?.specialization || t("Специализация не указана");
  const avatar = master?.avatar_url ?? null;
  const verified = master?.verified ?? false;

  async function submitDoc() {
    if (!masterConfigured) { Alert.alert(t("Скоро"), t("Загрузка станет доступна после подключения к серверу.")); return; }
    if (verifying) return;
    setVerifying(true);
    try {
      const r = await uploadImage("docs");
      if (r) { await submitVerification(r.path); Alert.alert(t("Отправлено"), t("Документ отправлен на проверку. Обычно занимает 1–2 дня.")); }
    } catch (e) { Alert.alert(t("Ошибка"), e instanceof Error ? e.message : ""); }
    finally { setVerifying(false); }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Профиль")}</AppText>
        <Pressable onPress={() => router.push("/(master)/notifications")} hitSlop={8}><Sym name="notifications-none" size={24} color={colors.accent} /></Pressable>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Карточка профиля */}
        <View style={[styles.profileCard, cardShadow]}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.avatarImg} /> : <Avatar initial={initialOf(name)} size={64} tint={colors.surfaceMid} fg={colors.accent} />}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20 }}>{name}</AppText>
              {verified ? <Sym name="verified" size={18} color={colors.infoText} /> : null}
            </View>
            <AppText variant="bodyMd" color={colors.secondary} style={{ marginTop: 2 }}>{spec}</AppText>
          </View>
        </View>
        <Pressable onPress={() => router.push("/(master)/edit-profile")} style={{ alignSelf: "flex-end", paddingVertical: 8 }}>
          <AppText variant="labelMd" color={colors.accent}>{t("Редактировать профиль")}</AppText>
        </Pressable>

        {/* Настройки кабинета */}
        <View style={{ gap: space.sm, marginTop: space.sm }}>
          {ROWS.map((r, i) => (
            <Pressable key={i} onPress={() => router.push(r.route as any)} style={[styles.row, cardShadow]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
                <Sym name={r.icon} size={22} color={colors.accent} />
                <AppText variant="bodyMd" color={colors.ink}>{t(r.label)}</AppText>
              </View>
              <Sym name="chevron-right" size={22} color={colors.outlineVariant} />
            </Pressable>
          ))}

          {/* Верификация */}
          <Pressable onPress={verified ? undefined : submitDoc} style={[styles.row, cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
              <Sym name="verified" size={22} color={verified ? colors.successText : colors.accent} />
              <AppText variant="bodyMd" color={colors.ink}>{t("Верификация")}</AppText>
              <View style={[styles.badge, { backgroundColor: verified ? colors.successBg : colors.surfaceHigh }]}>
                <AppText variant="labelSm" color={verified ? colors.successText : colors.secondary} style={{ fontSize: 10 }}>{verified ? t("подтверждён") : t("не подтверждён")}</AppText>
              </View>
            </View>
            {verifying ? <ActivityIndicator size="small" color={colors.accent} /> : verified ? null : <Sym name="upload-file" size={20} color={colors.accent} />}
          </Pressable>
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
          <Pressable onPress={async () => { await signOut(); router.replace("/"); }} style={{ flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 24, paddingVertical: 12 }}>
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
  avatarImg: { width: 64, height: 64, borderRadius: radius.xl },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
  groupTitle: { marginTop: space.lg, marginBottom: space.sm, paddingHorizontal: 4 },
  pills: { flexDirection: "row", gap: 6, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4 },
  pill: { flex: 1, paddingVertical: 10, borderRadius: radius.lg, alignItems: "center" },
  pillOn: { backgroundColor: colors.surface, ...cardShadow },
  pillFilled: { backgroundColor: colors.accent },
});

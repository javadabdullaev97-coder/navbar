import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../components/ui";
import { deleteAccount } from "../lib/auth";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

const POINTS = [
  "Профиль и настройки",
  "Все записи и историю",
  "Услуги, график и портфолио",
  "Клиентскую базу и заметки",
  "Отзывы и избранное",
];

export default function DeleteAccount() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [busy, setBusy] = useState(false);

  async function run() {
    setBusy(true);
    try {
      await deleteAccount();
      router.replace("/");
    } catch (e) {
      setBusy(false);
      Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось удалить аккаунт. Попробуйте позже."));
    }
  }

  function confirm() {
    Alert.alert(
      t("Удалить аккаунт?"),
      t("Это действие необратимо. Все данные будут удалены навсегда."),
      [
        { text: t("Отмена"), style: "cancel" },
        { text: t("Удалить"), style: "destructive", onPress: run },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.ink} /></Pressable>
        <AppText variant="headlineMd" color={colors.ink}>{t("Удаление аккаунта")}</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, gap: space.lg }} showsVerticalScrollIndicator={false}>
        <View style={styles.warnIcon}><Sym name="delete-forever" size={40} color={colors.error} /></View>
        <AppText variant="headlineMd" color={colors.ink} style={{ textAlign: "center" }}>{t("Удалить аккаунт навсегда?")}</AppText>
        <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 320, alignSelf: "center" }}>
          {t("Мы безвозвратно удалим все данные, связанные с аккаунтом. Восстановить их будет невозможно.")}
        </AppText>

        <View style={styles.card}>
          <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: space.sm }}>{t("Что будет удалено")}</AppText>
          {POINTS.map((p) => (
            <View key={p} style={styles.pointRow}>
              <Sym name="close" size={18} color={colors.error} />
              <AppText variant="bodyMd" color={colors.ink} style={{ flex: 1 }}>{t(p)}</AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable onPress={confirm} disabled={busy} style={({ pressed }) => [styles.deleteBtn, { backgroundColor: colors.error }, pressed && { opacity: 0.9 }]}>
          {busy ? <ActivityIndicator color="#fff" /> : <AppText variant="labelMd" color="#fff">{t("Удалить мой аккаунт")}</AppText>}
        </Pressable>
        <Pressable onPress={() => router.back()} disabled={busy} style={{ alignItems: "center", paddingVertical: 14 }}>
          <AppText variant="labelMd" color={colors.secondary}>{t("Отмена")}</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  warnIcon: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", alignSelf: "center", marginTop: space.md },
  card: { backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 20, borderWidth: 1, borderColor: colors.outlineVariant },
  pointRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 8 },
  footer: { paddingHorizontal: space.margin, paddingTop: space.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  deleteBtn: { height: 56, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" },
});

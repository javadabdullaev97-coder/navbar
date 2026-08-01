import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { initialOf } from "../../lib/data";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

// Чат ещё не подключён к бэкенду (Supabase Realtime) — честная заглушка,
// а не фейковая переписка. Экран пока никуда не ведёт из UI.
export default function Chat() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { name } = useLocalSearchParams<{ name?: string }>();
  const title = typeof name === "string" && name ? name : t("Чат");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
          <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{initialOf(title)}</AppText></View>
          <AppText variant="labelMd" color={colors.accent}>{title}</AppText>
        </View>
      </View>

      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: space.lg }}>
        <Sym name="chat-bubble-outline" size={48} color={colors.outlineVariant} />
        <AppText variant="headlineMd" color={colors.ink}>{t("Чат скоро появится")}</AppText>
        <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 280 }}>
          {t("Здесь можно будет переписываться с мастером и клиентом. Мы включим чат в одном из ближайших обновлений.")}
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  av: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 18 },
});

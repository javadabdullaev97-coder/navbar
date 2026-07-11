import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { space, ThemeColors } from "../../../theme";

export default function Clients() {
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}><AppText variant="headlineMd" color={colors.accentDeep}>{t("Клиенты")}</AppText></View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.iconWrap}><Sym name="group" size={44} color={colors.accent} /></View>
        <AppText variant="headlineMd" color={colors.ink} style={{ textAlign: "center" }}>{t("Клиентская база скоро")}</AppText>
        <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 280 }}>
          {t("Здесь соберётся история визитов, заметки и контакты ваших клиентов.")}
        </AppText>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, height: 56, justifyContent: "center" },
  body: { flexGrow: 1, alignItems: "center", justifyContent: "center", gap: 14, padding: space.margin, paddingBottom: 120 },
  iconWrap: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
});

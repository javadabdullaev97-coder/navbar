import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type IconName = React.ComponentProps<typeof Sym>["name"];
const HISTORY: { id: string; icon: IconName; name: string; date: string; price: string }[] = [
  { id: "1", icon: "content-cut", name: "Маникюр", date: "12 июля", price: "180 000 сум" },
  { id: "2", icon: "brush", name: "Стрижка", date: "5 июня", price: "250 000 сум" },
];

export default function ClientCard() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Клиент")}</AppText>
        </View>
        <Sym name="more-vert" size={24} color={colors.secondary} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Профиль */}
        <View style={{ alignItems: "center", paddingTop: space.md }}>
          <View>
            <Avatar initial="А" size={96} round tint={colors.surfaceMid} fg={colors.inkVariant} />
            <View style={styles.verified}><Sym name="verified" size={16} color={colors.successText} /></View>
          </View>
          <AppText variant="headlineMd" color={colors.accent} style={{ marginTop: 12 }}>Азиза Каримова</AppText>
          <AppText variant="bodyMd" color={colors.secondary}>+998 90 123 45 67</AppText>
          <View style={{ flexDirection: "row", gap: 12, marginTop: space.md, width: "100%" }}>
            <Pressable style={styles.ghostBtn}><AppText variant="labelMd" color={colors.accent}>{t("Написать")}</AppText></Pressable>
            <Pressable style={styles.fillBtn}><AppText variant="labelMd" color={colors.onAccent}>{t("Записать")}</AppText></Pressable>
          </View>
        </View>

        {/* Статистика */}
        <View style={[styles.stats, cardShadow]}>
          <Stat label={t("Визитов")} value="12" />
          <View style={styles.vline} />
          <Stat label={t("Потрачено")} value={`1.25M ${t("сум")}`} />
          <View style={styles.vline} />
          <Stat label={t("С нами с")} value={t("июля 2023")} />
        </View>

        {/* Заметки */}
        <View style={[styles.card, cardShadow]}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Заметки")}</AppText>
            <Sym name="edit-note" size={20} color={colors.accent} />
          </View>
          <AppText variant="bodyMd" color={colors.inkVariant} style={{ lineHeight: 24 }}>
            {t("Азиза предпочитает спокойную атмосферу. Аллергия на цитрусовые масла.")}
          </AppText>
        </View>

        {/* История визитов */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: space.lg, marginBottom: space.md }}>
          <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20 }}>{t("История визитов")}</AppText>
          <AppText variant="labelSm" color={colors.accent}>{t("См. все")}</AppText>
        </View>
        <View style={{ gap: space.md }}>
          {HISTORY.map((h) => (
            <View key={h.id} style={[styles.histRow, cardShadow]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                <View style={styles.histIcon}><Sym name={h.icon} size={22} color={colors.accent} /></View>
                <View>
                  <AppText variant="labelMd" color={colors.accent}>{t(h.name)}</AppText>
                  <AppText variant="labelSm" color={colors.secondary}>{h.date} · {h.price}</AppText>
                </View>
              </View>
              <View style={styles.doneBadge}><AppText variant="labelSm" color={colors.successText}>{t("Выполнено")}</AppText></View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10 }}>{label}</AppText>
      <AppText variant="labelMd" color={colors.accent}>{value}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  verified: { position: "absolute", bottom: 2, right: 2, backgroundColor: colors.successBg, padding: 4, borderRadius: radius.full, borderWidth: 2, borderColor: colors.bg },
  ghostBtn: { flex: 1, height: 48, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.accent, alignItems: "center", justifyContent: "center" },
  fillBtn: { flex: 1, height: 48, borderRadius: radius.lg, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  stats: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 16, marginTop: space.lg },
  vline: { width: 1, height: 32, backgroundColor: colors.outlineVariant },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, marginTop: space.lg },
  upper: { textTransform: "uppercase", letterSpacing: 1.5 },
  histRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  histIcon: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  doneBadge: { backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
});

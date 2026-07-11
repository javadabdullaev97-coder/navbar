import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

type IconName = React.ComponentProps<typeof Sym>["name"];
type Note = { id: string; icon: IconName; kind: "pending" | "error" | "confirmed" | "info"; title: string; body: string; time: string; unread?: boolean };

const NOTES: Note[] = [
  { id: "1", icon: "event", kind: "pending", title: "Новая заявка на запись", body: "Азиза К. • Консультация", time: "10:24", unread: true },
  { id: "2", icon: "close", kind: "error", title: "Клиент отменил визит", body: "Фаррух А. • Стрижка", time: "Вчера" },
  { id: "3", icon: "chat", kind: "confirmed", title: "Новое сообщение от Азизы", body: "«Здравствуйте! Подскажите, нужно ли…»", time: "Пт 11:00", unread: true },
  { id: "4", icon: "payments", kind: "confirmed", title: "Оплата получена: 250 000 сум", body: "За услугу «Маникюр»", time: "Пт 09:15" },
  { id: "5", icon: "info", kind: "info", title: "Подписка продлится через 3 дня", body: "План «Профессионал»", time: "28 авг" },
];

export default function MasterNotifications() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  const tint = (k: Note["kind"]) => ({
    pending: { bg: colors.warningBg, fg: colors.warningText },
    error: { bg: colors.surfaceHigh, fg: colors.error },
    confirmed: { bg: colors.successBg, fg: colors.successText },
    info: { bg: colors.infoBg, fg: colors.infoText },
  }[k]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accentDeep}>{t("Уведомления")}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 32, gap: space.md }} showsVerticalScrollIndicator={false}>
        {NOTES.map((n) => {
          const c = tint(n.kind);
          return (
            <View key={n.id} style={[styles.card, cardShadow]}>
              <View style={[styles.iconWrap, { backgroundColor: c.bg }]}><Sym name={n.icon} size={22} color={c.fg} /></View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{t(n.title)}</AppText>
                  <AppText variant="labelSm" color={colors.secondary}>{n.time}</AppText>
                </View>
                <AppText variant="bodyMd" color={colors.secondary} numberOfLines={1} style={{ marginTop: 2 }}>{t(n.body)}</AppText>
              </View>
              {n.unread ? <View style={styles.dot} /> : null}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  card: { flexDirection: "row", alignItems: "center", gap: 16, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  iconWrap: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  dot: { position: "absolute", right: 12, bottom: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
});

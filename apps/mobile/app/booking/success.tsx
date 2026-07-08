import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, GhostBorderButton, PrimaryButton, Sym } from "../../components/ui";
import { fmtDate, fmtTime } from "../../lib/format";
import { useT } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

function Line({ icon, label, value }: { icon: any; label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Sym name={icon} size={20} color={"rgba(6,78,59,0.6)"} />
      <View>
        <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>{label}</AppText>
        <AppText variant="bodyMd" color={colors.ink}>{value}</AppText>
      </View>
    </View>
  );
}

export default function Success() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { draft } = useStore();
  const date = draft.date ?? new Date();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.body}>
        {/* Герой */}
        <View style={{ alignItems: "center", gap: space.md }}>
          <View style={styles.check}>
            <Sym name="check" size={44} color={colors.onAccent} />
          </View>
          <AppText variant="displayLg" color={colors.accent}>{t("Вы записаны!")}</AppText>
          <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 280 }}>
            {t("Мы отправим напоминание перед визитом")}
          </AppText>
        </View>

        {/* Сводка */}
        <Card padding={24} style={{ width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: 24 }}>
            <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{draft.initial}</AppText></View>
            <View>
              <AppText variant="labelMd" color={colors.ink}>{draft.specialist}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{draft.spec}</AppText>
            </View>
          </View>
          <View style={{ gap: space.md }}>
            <Line icon="content-paste" label={t("Услуга")} value={draft.service} />
            <Line icon="calendar-today" label={t("Дата и время")} value={`${fmtDate(date)} · ${fmtTime(date)}`} />
            <Line icon="location-on" label={t("Адрес")} value={draft.address} />
          </View>
        </Card>

        {/* Действия */}
        <View style={{ width: "100%", gap: 12 }}>
          <PrimaryButton label={t("В мои записи")} onPress={() => router.replace("/(tabs)/bookings")} />
          <GhostBorderButton label={t("Добавить в календарь")} icon="event-available" />
          <Pressable onPress={() => router.replace("/(tabs)/home")} style={({ pressed }) => [{ paddingVertical: 12, alignItems: "center" }, pressed && { opacity: 0.6 }]}>
            <AppText variant="labelSm" color={colors.secondary}>{t("Вернуться на главную")}</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: space.margin, paddingTop: 40, paddingBottom: space.margin, justifyContent: "space-between", alignItems: "center" },
  check: { width: 96, height: 96, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26, lineHeight: 30 },
});

import { useRouter } from "expo-router";
import { Pressable, ScrollView, Share, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { initialOf } from "../../lib/data";
import { masterConfigured, useMyMaster } from "../../lib/master-api";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

export default function ShareLink() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile } = useStore();
  const { data: master } = useMyMaster();
  const name = profile.name || "Дилноза Алиева";
  const slug = masterConfigured && master?.slug ? master.slug : "dilnoza-aliyeva";
  const LINK = `ora.uz/${slug}`;

  const share = () => Share.share({ message: `${t("Запишитесь ко мне онлайн")}: https://${LINK}` }).catch(() => {});

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Ваша страница")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, alignItems: "center" }} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, cardShadow]}>
          <View style={styles.avatar}><AppText variant="displayLg" color={colors.accent} style={{ fontSize: 32 }}>{initialOf(name)}</AppText></View>
          <AppText variant="headlineMd" color={colors.accent} style={{ marginTop: 12 }}>{name}</AppText>
          <AppText variant="labelSm" color={colors.secondary} style={styles.spec}>{t("Профессиональный косметолог")}</AppText>

          {/* QR-заглушка */}
          <View style={styles.qr}>
            <Sym name="qr-code-2" size={140} color={colors.accentDeep} />
          </View>

          {/* Ссылка */}
          <View style={styles.linkRow}>
            <Sym name="link" size={20} color={colors.accent} />
            <AppText variant="labelMd" color={colors.accent} style={{ flex: 1 }} numberOfLines={1}>{LINK}</AppText>
            <Pressable onPress={share} hitSlop={8}><Sym name="content-copy" size={20} color={colors.accent} /></Pressable>
          </View>
          <AppText variant="labelSm" color={colors.secondary} style={{ textAlign: "center", marginTop: 12 }}>
            {t("Клиенты найдут вас и запишутся по этой ссылке.")}
          </AppText>
        </View>

        {/* Статистика */}
        <View style={styles.stats}>
          <View style={[styles.statCard, { backgroundColor: colors.accentDeep }]}>
            <Sym name="visibility" size={26} color="#FFD9DD" />
            <View>
              <AppText variant="headlineMd" color="#FFFFFF">1.2k</AppText>
              <AppText variant="labelSm" color="#FFD9DD" style={{ fontSize: 10, textTransform: "uppercase" }}>{t("Просмотры")}</AppText>
            </View>
          </View>
          <View style={[styles.statCard, styles.statGold]}>
            <Sym name="star" size={26} color={colors.gold} />
            <View>
              <AppText variant="headlineMd" color={colors.accent}>4.9</AppText>
              <AppText variant="labelSm" color={colors.secondary} style={{ fontSize: 10, textTransform: "uppercase" }}>{t("Рейтинг")}</AppText>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Поделиться ссылкой")} icon="share" onPress={share} />
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  card: { width: "100%", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 24, alignItems: "center" },
  avatar: { width: 80, height: 80, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.bg },
  spec: { textTransform: "uppercase", letterSpacing: 1.5, marginTop: 4 },
  qr: { marginVertical: 24, padding: 16, backgroundColor: "#FFFFFF", borderRadius: radius.xl, borderWidth: 1, borderColor: colors.outlineVariant },
  linkRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 14, borderRadius: radius.xl, width: "100%", borderWidth: 1, borderColor: colors.outlineVariant },
  stats: { flexDirection: "row", gap: 12, marginTop: space.md, width: "100%" },
  statCard: { flex: 1, height: 120, borderRadius: radius.x2l, padding: 20, justifyContent: "space-between" },
  statGold: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.gold },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, PrimaryButton, Sym } from "../../../components/ui";
import { useT } from "../../../lib/i18n";
import { fmtMoney } from "../../../lib/format";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

export default function MasterBooking() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState("");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accentDeep}>{t("Запись")}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Клиент */}
          <View style={[styles.clientCard, cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
              <Avatar initial="А" size={56} round tint={colors.surfaceMid} fg={colors.inkVariant} />
              <View>
                <AppText variant="labelMd" color={colors.ink}>Азиза Р.</AppText>
                <AppText variant="labelSm" color={colors.secondary}>+998 90 123 45 67</AppText>
              </View>
            </View>
            <Pressable style={styles.chatBtn}>
              <Sym name="chat-bubble-outline" size={18} color={colors.accent} />
              <AppText variant="labelSm" color={colors.accent}>{t("Написать")}</AppText>
            </Pressable>
          </View>

          {/* Детали */}
          <View style={[styles.detailsCard, cardShadow]}>
            <DetailRow label={t("Услуга")} value={t("Консультация")} strong />
            <DetailRow label={t("Дата")} value={t("Пт, 12 июля")} />
            <DetailRow label={t("Время")} value={`11:00  ·  ${t("{count} мин", { count: 50 })}`} />
            <DetailRow label={t("Цена")} value={fmtMoney(250000)} accent />
            <View style={styles.detail}>
              <AppText variant="labelMd" color={colors.secondary}>{t("Статус")}</AppText>
              <View style={styles.confirmBadge}>
                <AppText variant="labelSm" color={colors.successText}>{t("Подтверждено")}</AppText>
              </View>
            </View>
          </View>

          {/* Заметка */}
          <View style={{ gap: 8 }}>
            <AppText variant="labelMd" color={colors.inkVariant}>{t("Заметка о клиенте")}</AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={t("Добавьте важные детали о клиенте или процедуре…")}
              placeholderTextColor={colors.outline}
              multiline
              style={styles.textarea}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Отметить выполненной")} icon="check-circle" onPress={() => router.back()} />
        <View style={styles.actionsRow}>
          <Pressable style={styles.action} onPress={() => router.back()}>
            <Sym name="event-repeat" size={20} color={colors.secondary} />
            <AppText variant="labelMd" color={colors.secondary}>{t("Перенести")}</AppText>
          </Pressable>
          <View style={styles.vline} />
          <Pressable style={styles.action} onPress={() => router.back()}>
            <Sym name="cancel" size={20} color={colors.error} />
            <AppText variant="labelMd" color={colors.error}>{t("Отменить")}</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function DetailRow({ label, value, strong, accent }: { label: string; value: string; strong?: boolean; accent?: boolean }) {
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.detail, styles.detailBorder]}>
      <AppText variant="labelMd" color={colors.secondary}>{label}</AppText>
      <AppText variant={strong ? "labelMd" : "bodyMd"} color={accent ? colors.accent : colors.ink}>{value}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  clientCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  chatBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.surfaceLow, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  detailsCard: { backgroundColor: colors.surface, borderRadius: radius.xl, paddingHorizontal: 16 },
  detail: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
  detailBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  confirmBadge: { backgroundColor: colors.successBg, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  textarea: { minHeight: 110, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, padding: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, textAlignVertical: "top" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, gap: 4, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.surface },
  actionsRow: { flexDirection: "row", alignItems: "center", paddingVertical: 4 },
  action: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 44 },
  vline: { width: 1, height: 20, backgroundColor: colors.outlineVariant },
});

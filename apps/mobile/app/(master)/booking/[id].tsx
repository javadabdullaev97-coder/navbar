import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, PrimaryButton, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { useT } from "../../../lib/i18n";
import { fmtDate, fmtTime } from "../../../lib/format";
import { masterConfigured, MasterBookingStatus, setBookingStatus, setClientNote, useMasterBookings } from "../../../lib/master-api";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

const STATUS_META: Record<MasterBookingStatus, { label: string; kind: "success" | "warning" | "info" | "muted" }> = {
  confirmed: { label: "Подтверждено", kind: "success" },
  pending: { label: "Ожидает", kind: "warning" },
  done: { label: "Выполнено", kind: "info" },
  cancelled: { label: "Отменено", kind: "muted" },
};

export default function MasterBooking() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const { data: bookings, reload } = useMasterBookings();

  const b = masterConfigured && bookings ? bookings.find((x) => x.id === id) : null;
  const clientName = b?.client_name ?? "Азиза Р.";
  const phone = b?.client_phone ?? "+998 90 123 45 67";
  const service = b?.service_name ?? t("Консультация");
  const dateStr = b ? fmtDate(new Date(b.starts_at)) : t("Пт, 12 июля");
  const timeStr = b ? fmtTime(new Date(b.starts_at)) : "11:00";
  const status: MasterBookingStatus = b?.status ?? "confirmed";
  const meta = STATUS_META[status];
  const badgeColor = meta.kind === "success" ? { bg: colors.successBg, fg: colors.successText }
    : meta.kind === "warning" ? { bg: colors.warningBg, fg: colors.warningText }
    : meta.kind === "info" ? { bg: colors.infoBg, fg: colors.infoText }
    : { bg: colors.surfaceHigh, fg: colors.secondary };
  const canManage = status === "pending" || status === "confirmed";

  // Заметка о клиенте (client.notes) — грузим из брони, сохраняем на blur.
  useEffect(() => { if (b?.client_note != null) setNote(b.client_note); }, [b?.client_note]);
  async function saveNote() {
    if (masterConfigured && b?.client_id) { try { await setClientNote(b.client_id, note); } catch { /* игнор */ } }
  }

  async function apply(next: MasterBookingStatus) {
    if (busy) return;
    if (masterConfigured && b) {
      setBusy(true);
      try { await setBookingStatus(b.id, next); await reload(); }
      catch (e) { setBusy(false); Alert.alert(t("Ошибка"), e instanceof Error ? e.message : ""); return; }
      setBusy(false);
    }
    router.back();
  }

  function confirmCancel() {
    Alert.alert(t("Отменить запись?"), t("Это действие нельзя отменить."), [
      { text: t("Назад"), style: "cancel" },
      { text: t("Отменить"), style: "destructive", onPress: () => apply("cancelled") },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Запись")}</AppText>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* Клиент */}
          <View style={[styles.clientCard, cardShadow]}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 14, flex: 1 }}>
              <Avatar initial={initialOf(clientName)} size={56} round tint={colors.surfaceMid} fg={colors.inkVariant} />
              <View>
                <AppText variant="labelMd" color={colors.ink}>{clientName}</AppText>
                <AppText variant="labelSm" color={colors.secondary}>{phone}</AppText>
              </View>
            </View>
            <Pressable style={styles.chatBtn}>
              <Sym name="chat-bubble-outline" size={18} color={colors.accent} />
              <AppText variant="labelSm" color={colors.accent}>{t("Написать")}</AppText>
            </Pressable>
          </View>

          {/* Детали */}
          <View style={[styles.detailsCard, cardShadow]}>
            <DetailRow label={t("Услуга")} value={service} strong />
            <DetailRow label={t("Дата")} value={dateStr} />
            <DetailRow label={t("Время")} value={timeStr} />
            <View style={styles.detail}>
              <AppText variant="labelMd" color={colors.secondary}>{t("Статус")}</AppText>
              <View style={[styles.confirmBadge, { backgroundColor: badgeColor.bg }]}>
                <AppText variant="labelSm" color={badgeColor.fg}>{t(meta.label)}</AppText>
              </View>
            </View>
          </View>

          {/* Заметка */}
          <View style={{ gap: 8 }}>
            <AppText variant="labelMd" color={colors.inkVariant}>{t("Заметка о клиенте")}</AppText>
            <TextInput
              value={note}
              onChangeText={setNote}
              onBlur={saveNote}
              placeholder={t("Добавьте важные детали о клиенте или процедуре…")}
              placeholderTextColor={colors.outline}
              multiline
              style={styles.textarea}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {canManage && (
        <View style={styles.footer}>
          {status === "pending" ? (
            <PrimaryButton label={t("Подтвердить")} icon="check-circle" onPress={() => apply("confirmed")} loading={busy} />
          ) : (
            <PrimaryButton label={t("Отметить выполненной")} icon="check-circle" onPress={() => apply("done")} loading={busy} />
          )}
          <View style={styles.actionsRow}>
            <Pressable style={styles.action} onPress={() => router.back()}>
              <Sym name="event-repeat" size={20} color={colors.secondary} />
              <AppText variant="labelMd" color={colors.secondary}>{t("Перенести")}</AppText>
            </Pressable>
            <View style={styles.vline} />
            <Pressable style={styles.action} onPress={confirmCancel}>
              <Sym name="cancel" size={20} color={colors.error} />
              <AppText variant="labelMd" color={colors.error}>{t("Отменить")}</AppText>
            </Pressable>
          </View>
        </View>
      )}
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

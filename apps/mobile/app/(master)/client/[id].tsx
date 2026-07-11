import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Loading, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { fmtDate, fmtMoney, MONTHS_NOM } from "../../../lib/format";
import { getClient, masterConfigured, MasterClientDetail, setClientNote } from "../../../lib/master-api";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

const DEMO: MasterClientDetail = {
  id: "0", name: "Азиза Каримова", phone: "+998 90 123 45 67", notes: "Предпочитает спокойную атмосферу. Аллергия на цитрусовые масла.",
  since: new Date(Date.now() - 2.4e10).toISOString(), visits: 12, total_spent: 1250000,
  history: [
    { id: "h1", service_name: "Маникюр", price: 180000, starts_at: new Date(Date.now() - 6e8).toISOString(), status: "done" },
    { id: "h2", service_name: "Стрижка", price: 250000, starts_at: new Date(Date.now() - 3e9).toISOString(), status: "done" },
  ],
};

export default function ClientCard() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<MasterClientDetail | null | undefined>(masterConfigured ? undefined : DEMO);
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!masterConfigured) { setNote(DEMO.notes ?? ""); return; }
    let alive = true;
    getClient(id).then((c) => { if (alive) { setClient(c); setNote(c?.notes ?? ""); } }).catch(() => alive && setClient(null));
    return () => { alive = false; };
  }, [id]);

  async function saveNote() {
    if (!masterConfigured || !client || savingNote) return;
    setSavingNote(true);
    try { await setClientNote(client.id, note); } catch { /* игнор */ } finally { setSavingNote(false); }
  }

  if (masterConfigured && client === undefined) {
    return <SafeAreaView style={styles.safe} edges={["top"]}><Loading /></SafeAreaView>;
  }
  const c = client ?? DEMO;
  const sinceD = new Date(c.since);
  const since = isNaN(sinceD.getTime()) ? "—" : `${MONTHS_NOM[sinceD.getMonth()].toLowerCase()} ${sinceD.getFullYear()}`;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Клиент")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", paddingTop: space.md }}>
            <Avatar initial={initialOf(c.name)} size={96} round tint={colors.surfaceMid} fg={colors.inkVariant} />
            <AppText variant="headlineMd" color={colors.accent} style={{ marginTop: 12 }}>{c.name}</AppText>
            {c.phone ? <AppText variant="bodyMd" color={colors.secondary}>{c.phone}</AppText> : null}
          </View>

          {/* Статистика */}
          <View style={[styles.stats, cardShadow]}>
            <Stat label={t("Визитов")} value={String(c.visits)} />
            <View style={styles.vline} />
            <Stat label={t("Потрачено")} value={fmtMoney(c.total_spent)} />
            <View style={styles.vline} />
            <Stat label={t("С нами с")} value={since} />
          </View>

          {/* Заметки (сохраняются) */}
          <View style={[styles.card, cardShadow]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Заметки")}</AppText>
              {savingNote ? <ActivityIndicator size="small" color={colors.accent} /> : null}
            </View>
            <TextInput
              value={note}
              onChangeText={setNote}
              onBlur={saveNote}
              placeholder={t("Важные детали о клиенте, предпочтения, аллергии…")}
              placeholderTextColor={colors.outline}
              multiline
              style={styles.noteInput}
            />
            <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 4 }}>{t("Заметка видна только вам. Сохраняется автоматически.")}</AppText>
          </View>

          {/* История визитов */}
          <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20, marginTop: space.lg, marginBottom: space.md }}>{t("История визитов")}</AppText>
          {c.history.length === 0 ? (
            <AppText variant="bodyMd" color={colors.secondary}>{t("Визитов пока нет.")}</AppText>
          ) : (
            <View style={{ gap: space.md }}>
              {c.history.map((h) => {
                const badge = h.status === "done" ? { bg: colors.successBg, fg: colors.successText, label: "Выполнено" }
                  : h.status === "confirmed" ? { bg: colors.infoBg, fg: colors.infoText, label: "Подтверждено" }
                  : h.status === "cancelled" ? { bg: colors.surfaceHigh, fg: colors.secondary, label: "Отменено" }
                  : { bg: colors.warningBg, fg: colors.warningText, label: "Ожидает" };
                return (
                  <View key={h.id} style={[styles.histRow, cardShadow]}>
                    <View style={styles.histIcon}><Sym name="content-cut" size={20} color={colors.accent} /></View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.accent}>{h.service_name ?? t("Услуга")}</AppText>
                      <AppText variant="labelSm" color={colors.secondary}>{fmtDate(new Date(h.starts_at))}{h.price ? ` · ${fmtMoney(h.price)}` : ""}</AppText>
                    </View>
                    <View style={[styles.doneBadge, { backgroundColor: badge.bg }]}><AppText variant="labelSm" color={badge.fg}>{t(badge.label)}</AppText></View>
                  </View>
                );
              })}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const colors = useColors();
  return (
    <View style={{ flex: 1, alignItems: "center", gap: 4 }}>
      <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 0.5, fontSize: 10 }}>{label}</AppText>
      <AppText variant="labelMd" color={colors.accent} style={{ textAlign: "center" }}>{value}</AppText>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  stats: { flexDirection: "row", alignItems: "center", backgroundColor: colors.surface, borderRadius: radius.lg, paddingVertical: 16, marginTop: space.lg },
  vline: { width: 1, height: 32, backgroundColor: colors.outlineVariant },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 20, marginTop: space.lg },
  upper: { textTransform: "uppercase", letterSpacing: 1.5 },
  noteInput: { minHeight: 72, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, textAlignVertical: "top" },
  histRow: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16 },
  histIcon: { width: 48, height: 48, borderRadius: radius.lg, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  doneBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
});

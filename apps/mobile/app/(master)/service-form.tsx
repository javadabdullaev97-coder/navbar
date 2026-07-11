import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DurationSheet } from "../../components/pickers";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { fmtDur } from "../../lib/format";
import { useT } from "../../lib/i18n";
import { deleteService, masterConfigured, upsertService } from "../../lib/master-api";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

export default function ServiceForm() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ id?: string; name?: string; duration?: string; price?: string }>();
  const editing = Boolean(params.id);

  const [name, setName] = useState(params.name ?? "");
  const [desc, setDesc] = useState("");
  const [duration, setDuration] = useState(params.duration ? Number(params.duration) : 50);
  const [price, setPrice] = useState(params.price ?? "");
  const [deposit, setDeposit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [durOpen, setDurOpen] = useState(false);

  const valid = name.trim().length > 0 && duration > 0 && (Number(price) || 0) > 0;

  async function submit() {
    if (busy) return;
    if (!valid) {
      Alert.alert(t("Заполните поля"), t("Укажите название, длительность и цену услуги."));
      return;
    }
    if (masterConfigured) {
      setBusy(true);
      try {
        await upsertService({ id: params.id, name: name.trim(), duration, price: Number(price) || 0 });
      } catch (e) {
        setBusy(false);
        Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось сохранить услугу."));
        return;
      }
      setBusy(false);
    }
    router.back();
  }

  function remove() {
    Alert.alert(t("Удалить услугу?"), t("Это действие нельзя отменить."), [
      { text: t("Назад"), style: "cancel" },
      {
        text: t("Удалить"), style: "destructive",
        onPress: async () => {
          if (masterConfigured && params.id) { try { await deleteService(params.id); } catch { /* игнор */ } }
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="chevron-left" size={28} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{editing ? t("Услуга") : t("Новая услуга")}</AppText>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Field label={t("Название")}>
            <TextInput value={name} onChangeText={setName} placeholder={t("Введите название")} placeholderTextColor={colors.outline} style={styles.input} />
          </Field>

          <Field label={t("Описание (необязательно)")}>
            <TextInput value={desc} onChangeText={setDesc} placeholder={t("Добавьте детали услуги…")} placeholderTextColor={colors.outline} multiline style={[styles.input, styles.textarea]} />
          </Field>

          {/* Длительность — колесо выбора (шаг 5 мин) */}
          <Field label={t("Длительность")}>
            <Pressable style={styles.pickerRow} onPress={() => setDurOpen(true)}>
              <AppText variant="bodyMd" color={colors.ink}>{fmtDur(duration)}</AppText>
              <Sym name="expand-more" size={22} color={colors.secondary} />
            </Pressable>
          </Field>

          <Field label={t("Цена, сум")}>
            <View style={{ position: "relative", justifyContent: "center" }}>
              <TextInput value={price} onChangeText={(v) => setPrice(v.replace(/[^\d]/g, ""))} keyboardType="number-pad" placeholder="250000" placeholderTextColor={colors.outline} style={[styles.input, { paddingRight: 56 }]} />
              <AppText variant="labelMd" color={colors.inkVariant} style={styles.suffix}>UZS</AppText>
            </View>
          </Field>

          <View style={styles.depositRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText variant="labelMd" color={colors.ink}>{t("Требовать депозит")}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{t("Клиент оплатит часть суммы при бронировании")}</AppText>
            </View>
            <Switch value={deposit} onValueChange={setDeposit} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Сохранить")} onPress={submit} loading={busy} style={!valid ? { opacity: 0.5 } : undefined} />
        {editing && (
          <Pressable onPress={remove} style={{ alignItems: "center", paddingVertical: 12 }}>
            <AppText variant="labelMd" color={colors.error}>{t("Удалить услугу")}</AppText>
          </Pressable>
        )}
      </View>

      <DurationSheet visible={durOpen} value={duration} onSelect={setDuration} onClose={() => setDurOpen(false)} />
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="labelMd" color={colors.inkVariant}>{label}</AppText>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  input: { minHeight: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  textarea: { minHeight: 110, paddingTop: 14, textAlignVertical: "top" },
  suffix: { position: "absolute", right: 16 },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16 },
  depositRow: { flexDirection: "row", alignItems: "center", paddingVertical: space.sm },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, gap: 4, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.surface },
});

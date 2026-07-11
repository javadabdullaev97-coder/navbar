import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

const PRESETS = [30, 45, 60, 90, 120];

// «90» → «1 ч 30 мин», «60» → «1 ч», «45» → «45 мин».
export function fmtDur(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}

export default function ServiceForm() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const params = useLocalSearchParams<{ id?: string; name?: string; duration?: string; price?: string }>();
  const editing = Boolean(params.id);

  const [name, setName] = useState(params.name ?? "");
  const [desc, setDesc] = useState("");
  const initMin = params.duration ? Number(params.duration) : 50;
  const [hours, setHours] = useState(String(Math.floor(initMin / 60)));
  const [mins, setMins] = useState(String(initMin % 60));
  const totalMin = (Number(hours) || 0) * 60 + (Number(mins) || 0);
  const setPreset = (d: number) => { setHours(String(Math.floor(d / 60))); setMins(String(d % 60)); };
  const [price, setPrice] = useState(params.price ?? "");
  const [deposit, setDeposit] = useState(false);

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

          <View style={{ gap: space.sm }}>
            <AppText variant="labelMd" color={colors.inkVariant}>{t("Длительность")}</AppText>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={styles.durField}>
                <TextInput value={hours} onChangeText={(v) => setHours(v.replace(/[^\d]/g, "").slice(0, 2))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.outline} style={styles.durInput} />
                <AppText variant="labelMd" color={colors.inkVariant}>{t("ч")}</AppText>
              </View>
              <View style={styles.durField}>
                <TextInput value={mins} onChangeText={(v) => { const n = Number(v.replace(/[^\d]/g, "")) || 0; setMins(String(Math.min(n, 59))); }} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.outline} style={styles.durInput} />
                <AppText variant="labelMd" color={colors.inkVariant}>{t("мин")}</AppText>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {PRESETS.map((d) => {
                const on = totalMin === d;
                return (
                  <Pressable key={d} onPress={() => setPreset(d)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                    <AppText variant="labelMd" color={on ? colors.onAccent : colors.accent}>{fmtDur(d)}</AppText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <AppText variant="labelSm" color={colors.secondary}>{t("Например, 1 ч 30 мин.")}</AppText>
          </View>

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
        <PrimaryButton label={t("Сохранить")} onPress={() => router.back()} />
        {editing && (
          <Pressable onPress={() => router.back()} style={{ alignItems: "center", paddingVertical: 12 }}>
            <AppText variant="labelMd" color={colors.error}>{t("Удалить услугу")}</AppText>
          </Pressable>
        )}
      </View>
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
  durField: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16 },
  durInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surfaceMid },
  depositRow: { flexDirection: "row", alignItems: "center", paddingVertical: space.sm },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, gap: 4, borderTopWidth: 1, borderTopColor: colors.outlineVariant, backgroundColor: colors.surface },
});

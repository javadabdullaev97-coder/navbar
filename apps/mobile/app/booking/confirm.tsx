import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, PrimaryButton, Sym } from "../../components/ui";
import { createBooking } from "../../lib/api";
import { supabaseConfigured } from "../../lib/data";
import { fmtDate, fmtMoney, fmtTime } from "../../lib/format";
import { useT } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>{label}</AppText>
      <AppText variant="bodyMd" color={colors.ink}>{value}</AppText>
    </View>
  );
}

// Телефон в формат E.164 (+998…) из того, что ввёл пользователь.
function toE164(raw: string): string {
  const digits = raw.replace(/[^\d]/g, "");
  if (raw.trim().startsWith("+")) return "+" + digits;
  if (digits.length === 9) return "+998" + digits; // локальный узбекский номер
  return "+" + digits;
}

export default function Confirm() {
  const router = useRouter();
  const t = useT();
  const { draft, confirmBooking, profile, setProfile } = useStore();
  const [comment, setComment] = useState("");
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [busy, setBusy] = useState(false);
  const date = draft.date ?? new Date();

  async function submit() {
    if (busy) return;

    const nameOk = name.trim().length >= 2;
    const phoneOk = phone.replace(/[^\d]/g, "").length >= 9;
    if (!nameOk || !phoneOk) {
      Alert.alert(t("Заполните контакты"), t("Укажите имя и телефон — мастер свяжется с вами по ним."));
      return;
    }

    // Сохраняем контакты в профиль устройства, чтобы не вводить каждый раз.
    setProfile({ name: name.trim(), phone: phone.trim() });

    const real = supabaseConfigured && draft.slug && draft.serviceIds.length > 0 && draft.date;
    if (real) {
      setBusy(true);
      try {
        await createBooking({
          slug: draft.slug,
          serviceIds: draft.serviceIds,
          startsAt: date.toISOString(),
          name: name.trim(),
          phone: toE164(phone),
        });
      } catch (e) {
        setBusy(false);
        const msg = e instanceof Error ? e.message : t("Не удалось создать запись. Попробуйте ещё раз.");
        Alert.alert(t("Ошибка"), msg);
        return;
      } finally {
        setBusy(false);
      }
    } else {
      confirmBooking();
    }
    router.replace("/booking/success");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={26} color={colors.accent} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.ink}>{t("Подтверждение")}</AppText>
        <View style={{ width: 26 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24, gap: space.lg }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Card padding={16}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: space.lg }}>
              <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{draft.initial}</AppText></View>
              <View>
                <AppText variant="labelMd" color={colors.ink}>{draft.specialist}</AppText>
                <AppText variant="labelSm" color={colors.secondary}>{draft.spec}</AppText>
              </View>
            </View>
            <View style={styles.rows}>
              <Field label={t("Услуга")} value={draft.service} />
              <View style={{ flexDirection: "row", gap: space.md }}>
                <View style={{ flex: 1 }}><Field label={t("Дата")} value={fmtDate(date)} /></View>
                <View style={{ flex: 1 }}><Field label={t("Время")} value={`${fmtTime(date)} (${t("{count} мин", { count: draft.duration })})`} /></View>
              </View>
              <Field label={t("Адрес")} value={draft.address} />
              <View style={styles.total}>
                <AppText variant="labelSm" color={colors.secondary}>{t("ИТОГО")}</AppText>
                <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>{fmtMoney(draft.price)}</AppText>
              </View>
            </View>
          </Card>

          {/* Контакты клиента */}
          <View style={{ gap: space.md }}>
            <AppText variant="labelMd" color={colors.ink} style={{ paddingHorizontal: 4 }}>{t("Ваши контакты")}</AppText>
            <View style={{ gap: 4 }}>
              <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>{t("Имя")}</AppText>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t("Как к вам обращаться")}
                placeholderTextColor={colors.outline}
                style={styles.input}
              />
            </View>
            <View style={{ gap: 4 }}>
              <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>{t("Телефон")}</AppText>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="+998 90 123-45-67"
                placeholderTextColor={colors.outline}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
          </View>

          <View style={{ gap: 4 }}>
            <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>{t("Комментарий специалисту")}</AppText>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder={t("Комментарий специалисту (необязательно)")}
              placeholderTextColor={colors.outline}
              multiline
              style={styles.textarea}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8, opacity: 0.75 }}>
            <Sym name="info" size={18} color={colors.secondary} />
            <AppText variant="labelSm" color={colors.secondary} style={{ flex: 1 }}>
              {t("Подтверждая запись, вы соглашаетесь с правилами отмены. Бесплатная отмена — за 24 часа. При неявке депозит не возвращается.")}
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Подтвердить запись")} onPress={submit} loading={busy} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26, lineHeight: 30 },
  rows: { gap: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: space.lg },
  total: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderStyle: "dashed", paddingTop: space.md, marginTop: 4 },
  input: { height: 52, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  textarea: { minHeight: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, padding: space.md, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, textAlignVertical: "top" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.bg },
});

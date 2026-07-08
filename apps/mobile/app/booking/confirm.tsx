import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Keyboard,
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
import { fmtDate, fmtMoney, fmtTime } from "../../lib/format";
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

export default function Confirm() {
  const router = useRouter();
  const { draft, confirmBooking } = useStore();
  const [comment, setComment] = useState("");
  const date = draft.date ?? new Date();

  function submit() {
    confirmBooking();
    router.replace("/booking/success");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={26} color={colors.accent} />
        </Pressable>
        <AppText variant="headlineMd" color={colors.ink}>Подтверждение</AppText>
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
              <Field label="Услуга" value={draft.service} />
              <View style={{ flexDirection: "row", gap: space.md }}>
                <View style={{ flex: 1 }}><Field label="Дата" value={fmtDate(date)} /></View>
                <View style={{ flex: 1 }}><Field label="Время" value={`${fmtTime(date)} (${draft.duration} мин)`} /></View>
              </View>
              <Field label="Адрес" value={draft.address} />
              <View style={styles.total}>
                <AppText variant="labelSm" color={colors.secondary}>ИТОГО</AppText>
                <AppText variant="bodyLg" color={colors.accent} style={{ fontFamily: "Manrope_700Bold" }}>{fmtMoney(draft.price)}</AppText>
              </View>
            </View>
          </Card>

          <View style={{ gap: 4 }}>
            <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>Комментарий специалисту</AppText>
            <TextInput
              value={comment}
              onChangeText={setComment}
              placeholder="Комментарий специалисту (необязательно)"
              placeholderTextColor={colors.outline}
              multiline
              style={styles.textarea}
            />
          </View>

          <View style={{ flexDirection: "row", gap: 8, opacity: 0.75 }}>
            <Sym name="info" size={18} color={colors.secondary} />
            <AppText variant="labelSm" color={colors.secondary} style={{ flex: 1 }}>
              Подтверждая запись, вы соглашаетесь с правилами отмены. Бесплатная отмена — за 24 часа.
              При неявке депозит не возвращается.
            </AppText>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label="Подтвердить запись" onPress={submit} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26 },
  rows: { gap: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant, paddingTop: space.lg },
  total: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.outlineVariant, borderStyle: "dashed", paddingTop: space.md, marginTop: 4 },
  textarea: { minHeight: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, padding: space.md, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, textAlignVertical: "top" },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.bg },
});

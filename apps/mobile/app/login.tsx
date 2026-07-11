import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../components/ui";
import { ensureGuest, sendEmailCode } from "../lib/auth";
import { supabaseConfigured } from "../lib/data";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

export default function Login() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (busy) return;
    if (!isEmail(email)) { Alert.alert(t("Проверьте email"), t("Введите корректный адрес электронной почты.")); return; }
    if (!supabaseConfigured) { router.push({ pathname: "/otp", params: { email, role } }); return; }
    setBusy(true);
    try {
      await sendEmailCode(email);
      router.push({ pathname: "/otp", params: { email: email.trim().toLowerCase(), role } });
    } catch (e) {
      Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось отправить код."));
    } finally {
      setBusy(false);
    }
  }

  async function guest() {
    if (supabaseConfigured) { try { await ensureGuest(); } catch { /* игнор */ } }
    router.replace("/(tabs)/home");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="chevron-left" size={28} color={colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Pressable style={styles.body} onPress={() => Keyboard.dismiss()}>
          <View>
            <AppText variant="displayLg" color={colors.accent} style={{ marginBottom: space.sm }}>{t("Вход")}</AppText>
            <AppText variant="bodyMd" color={colors.inkVariant} style={{ maxWidth: 300 }}>{t("Введите email — пришлём код для входа")}</AppText>
          </View>

          <View>
            <View style={[styles.field, focused && { borderColor: colors.accent }]}>
              <Sym name="mail-outline" size={20} color={colors.outline} />
              <TextInput
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="you@email.com"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />
            </View>
            <AppText variant="labelSm" color={colors.inkVariant} style={{ marginTop: space.sm, paddingHorizontal: 4, opacity: 0.7 }}>
              {t("Мы отправим код подтверждения на почту")}
            </AppText>
          </View>

          <View style={{ gap: space.md }}>
            <PrimaryButton label={t("Получить код")} onPress={submit} loading={busy} />
            {role !== "master" && (
              <Pressable onPress={guest} style={({ pressed }) => [{ paddingVertical: 8, alignItems: "center" }, pressed && { opacity: 0.6 }]}>
                <AppText variant="labelMd" color={colors.inkVariant}>{t("Продолжить как гость")}</AppText>
              </Pressable>
            )}
          </View>

          <AppText variant="labelSm" color={colors.inkVariant} style={styles.terms}>
            {t("Продолжая, вы принимаете условия и политику конфиденциальности")}
          </AppText>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  body: { flex: 1, paddingHorizontal: space.margin, paddingVertical: space.lg, justifyContent: "space-between" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, height: 64, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl },
  input: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  terms: { textAlign: "center", opacity: 0.6, paddingHorizontal: 16, marginTop: space.lg },
});

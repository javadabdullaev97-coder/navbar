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
import { ensureGuest, sendPhoneCode, signInOrUp } from "../lib/auth";
import { supabaseConfigured } from "../lib/data";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../theme";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());
const phoneDigits = (s: string) => s.replace(/\D/g, "").length;

type Mode = "email" | "phone";

export default function Login() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  function go() {
    router.replace(role === "master" ? "/(master)/onboarding" : "/(tabs)/home");
  }

  async function submitEmail() {
    if (!isEmail(email)) { Alert.alert(t("Проверьте email"), t("Введите корректный адрес электронной почты.")); return; }
    if (password.length < 4) { Alert.alert(t("Короткий пароль"), t("Пароль — минимум 4 символа.")); return; }
    if (!supabaseConfigured) { go(); return; }
    setBusy(true);
    try {
      await signInOrUp(email, password);
      go();
    } catch (e) {
      Alert.alert(t("Не удалось войти"), e instanceof Error ? e.message : t("Проверьте email и пароль."));
    } finally {
      setBusy(false);
    }
  }

  async function submitPhone() {
    if (phoneDigits(phone) < 9) { Alert.alert(t("Проверьте номер"), t("Введите корректный номер телефона.")); return; }
    if (!supabaseConfigured) { router.push(`/otp?phone=${encodeURIComponent(phone)}&role=${role ?? ""}`); return; }
    setBusy(true);
    try {
      await sendPhoneCode(phone);
      router.push(`/otp?phone=${encodeURIComponent(phone)}&role=${role ?? ""}`);
    } catch (e) {
      Alert.alert(t("Не удалось отправить код"), e instanceof Error ? e.message : t("Попробуйте позже или войдите по email."));
    } finally {
      setBusy(false);
    }
  }

  function submit() {
    if (busy) return;
    if (mode === "email") submitEmail(); else submitPhone();
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
            <AppText variant="bodyMd" color={colors.inkVariant} style={{ maxWidth: 300 }}>
              {mode === "email"
                ? t("Войдите по email — новый аккаунт создаётся автоматически")
                : t("Введите номер телефона — пришлём код")}
            </AppText>
          </View>

          {/* Переключатель Email / Телефон */}
          <View style={styles.modeRow}>
            <Pressable onPress={() => setMode("email")} style={[styles.modeTab, mode === "email" && styles.modeOn]}>
              <Sym name="mail-outline" size={18} color={mode === "email" ? colors.accent : colors.secondary} />
              <AppText variant="labelMd" color={mode === "email" ? colors.accent : colors.secondary}>Email</AppText>
            </Pressable>
            <Pressable onPress={() => setMode("phone")} style={[styles.modeTab, mode === "phone" && styles.modeOn]}>
              <Sym name="smartphone" size={18} color={mode === "phone" ? colors.accent : colors.secondary} />
              <AppText variant="labelMd" color={mode === "phone" ? colors.accent : colors.secondary}>{t("Телефон")}</AppText>
            </Pressable>
          </View>

          {mode === "email" ? (
            <View style={{ gap: space.md }}>
              <View style={styles.field}>
                <Sym name="mail-outline" size={20} color={colors.outline} />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@email.com"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>
              <View style={styles.field}>
                <Sym name="lock-outline" size={20} color={colors.outline} />
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t("Пароль")}
                  placeholderTextColor={colors.outlineVariant}
                  secureTextEntry={!show}
                  autoCapitalize="none"
                  style={styles.input}
                />
                <Pressable onPress={() => setShow((s) => !s)} hitSlop={8}>
                  <Sym name={show ? "visibility-off" : "visibility"} size={20} color={colors.outline} />
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ gap: space.md }}>
              <View style={styles.field}>
                <Sym name="phone-iphone" size={20} color={colors.outline} />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+998 90 123 45 67"
                  placeholderTextColor={colors.outlineVariant}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
              </View>
              <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>
                {t("Мы отправим SMS с кодом подтверждения")}
              </AppText>
            </View>
          )}

          <View style={{ gap: space.md }}>
            <PrimaryButton label={mode === "email" ? t("Продолжить") : t("Получить код")} onPress={submit} loading={busy} />
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
  modeRow: { flexDirection: "row", gap: 6, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4 },
  modeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: radius.lg },
  modeOn: { backgroundColor: colors.surface, ...cardShadow },
  field: { flexDirection: "row", alignItems: "center", gap: 10, height: 60, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl },
  input: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  terms: { textAlign: "center", opacity: 0.6, paddingHorizontal: 16 },
});

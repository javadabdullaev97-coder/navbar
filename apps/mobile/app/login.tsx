import { LinearGradient } from "expo-linear-gradient";
import { getLocales } from "expo-localization";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Glass, PrimaryButton, Sym } from "../components/ui";
import { ensureGuest, sendPhoneCode, signInOrUp } from "../lib/auth";
import { dialForRegion, flagOf, formatPhone, isTooLong, isValidPhone } from "../lib/phone";
import { supabaseConfigured } from "../lib/data";
import { useT } from "../lib/i18n";
import { useColors, useIsDark, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

type Mode = "email" | "phone";
type Auth = "login" | "register";

function initialDial(): string {
  try { return `+${dialForRegion(getLocales()[0]?.regionCode)}`; }
  catch { return "+998"; }
}

export default function Login() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const isDark = useIsDark();
  const styles = useThemedStyles(makeStyles);
  const { role } = useLocalSearchParams<{ role?: string }>();
  const [auth, setAuth] = useState<Auth>("login");
  const [mode, setMode] = useState<Mode>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(initialDial);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const edited = useRef(false);

  useEffect(() => {
    let alive = true;
    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((j) => {
        if (!alive || edited.current || !j?.country_code) return;
        setPhone(`+${dialForRegion(j.country_code)}`);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const info = formatPhone(phone);

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
    if (!isValidPhone(phone)) { Alert.alert(t("Проверьте номер"), t("Введите корректный номер телефона.")); return; }
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

  const title = auth === "login" ? t("Вход") : t("Регистрация");
  const subtitle = mode === "email"
    ? t("Войдите по email — новый аккаунт создаётся автоматически")
    : t("Введите номер телефона — пришлём код");
  const primaryLabel = mode === "phone" ? t("Получить код") : auth === "login" ? t("Войти") : t("Создать аккаунт");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[isDark ? "rgba(6,78,59,0.32)" : "rgba(6,78,59,0.10)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Sym name="chevron-left" size={28} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <AppText variant="displayLg" color={colors.accent} style={{ marginBottom: space.sm }}>{title}</AppText>
          <AppText variant="bodyMd" color={colors.inkVariant} style={styles.subtitle}>{subtitle}</AppText>

          {/* Стеклянная карточка с формой */}
          <Glass style={{ marginTop: space.md }}>
            <View style={styles.panel}>
              {/* Метод: Email / Телефон */}
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

              <View style={styles.inputZone}>
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
                  <View style={{ gap: space.sm }}>
                    <View style={styles.field}>
                      {info.country ? (
                        <AppText style={{ fontSize: 22, opacity: info.hasNational ? 1 : 0.45 }}>{flagOf(info.country)}</AppText>
                      ) : (
                        <Sym name="phone-iphone" size={20} color={colors.outline} />
                      )}
                      <TextInput
                        value={phone}
                        onChangeText={(v) => {
                          const next = formatPhone(v).text;
                          const growing = next.replace(/\D/g, "").length > phone.replace(/\D/g, "").length;
                          // Индивидуальный лимит по стране: не даём выйти за максимум
                          // и не даём добавлять цифры к уже валидному номеру.
                          if (growing && (isTooLong(next) || isValidPhone(phone))) return;
                          edited.current = true;
                          setPhone(next);
                        }}
                        placeholder="+998 90 123 45 67"
                        placeholderTextColor={colors.outlineVariant}
                        keyboardType="phone-pad"
                        style={[styles.input, { opacity: info.hasNational ? 1 : 0.6 }]}
                      />
                    </View>
                    <AppText variant="labelSm" color={colors.inkVariant} style={{ paddingHorizontal: 4 }}>
                      {t("Мы отправим SMS с кодом подтверждения")}
                    </AppText>
                  </View>
                )}
              </View>
            </View>
          </Glass>

          <View style={{ marginTop: space.lg }}>
            <PrimaryButton label={primaryLabel} onPress={submit} loading={busy} />
          </View>

          {/* Переключатель Вход ↔ Регистрация */}
          <Pressable
            onPress={() => setAuth((a) => (a === "login" ? "register" : "login"))}
            style={({ pressed }) => [{ alignItems: "center", paddingVertical: 14 }, pressed && { opacity: 0.6 }]}
          >
            <AppText variant="labelMd" color={colors.accent}>
              {auth === "login" ? t("Нет аккаунта? Зарегистрироваться") : t("Уже есть аккаунт? Войти")}
            </AppText>
          </Pressable>

          {role !== "master" && (
            <Pressable onPress={guest} style={({ pressed }) => [{ paddingVertical: 6, alignItems: "center" }, pressed && { opacity: 0.6 }]}>
              <AppText variant="labelMd" color={colors.inkVariant}>{t("Продолжить как гость")}</AppText>
            </Pressable>
          )}

          <AppText variant="labelSm" color={colors.inkVariant} style={styles.terms}>
            {t("Продолжая, вы принимаете условия и политику конфиденциальности")}
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  body: { flex: 1, paddingHorizontal: space.margin, paddingTop: space.md },
  subtitle: { minHeight: 44, maxWidth: 320 },
  panel: { padding: 16, gap: space.md },
  modeRow: { flexDirection: "row", gap: 6, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 4 },
  modeTab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 12, borderRadius: radius.lg },
  modeOn: { backgroundColor: colors.surface },
  inputZone: { minHeight: 156, justifyContent: "flex-start" },
  field: { flexDirection: "row", alignItems: "center", gap: 10, height: 58, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl },
  input: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  terms: { textAlign: "center", opacity: 0.6, paddingHorizontal: 16, marginTop: "auto", paddingBottom: space.sm },
});

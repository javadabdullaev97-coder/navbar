import { LinearGradient } from "expo-linear-gradient";
import { getLocales } from "expo-localization";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../components/ui";
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
      .then((j) => { if (alive && !edited.current && j?.country_code) setPhone(`+${dialForRegion(j.country_code)}`); })
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
    try { await signInOrUp(email, password); go(); }
    catch (e) { Alert.alert(t("Не удалось войти"), e instanceof Error ? e.message : t("Проверьте email и пароль.")); }
    finally { setBusy(false); }
  }

  async function submitPhone() {
    if (!isValidPhone(phone)) { Alert.alert(t("Проверьте номер"), t("Введите корректный номер телефона.")); return; }
    if (!supabaseConfigured) { router.push(`/otp?phone=${encodeURIComponent(phone)}&role=${role ?? ""}`); return; }
    setBusy(true);
    try { await sendPhoneCode(phone); router.push(`/otp?phone=${encodeURIComponent(phone)}&role=${role ?? ""}`); }
    catch (e) { Alert.alert(t("Не удалось отправить код"), e instanceof Error ? e.message : t("Попробуйте позже или войдите по email.")); }
    finally { setBusy(false); }
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
    ? t("По email — аккаунт создастся сам, если вы впервые")
    : t("Введите номер — пришлём код в SMS");
  const primaryLabel = mode === "phone" ? t("Получить код") : auth === "login" ? t("Войти") : t("Создать аккаунт");

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[isDark ? "rgba(6,78,59,0.26)" : "rgba(6,78,59,0.09)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Sym name="chevron-left" size={28} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.body}>
          <AppText variant="displayLg" color={colors.accent}>{title}</AppText>
          <AppText variant="bodyMd" color={colors.secondary} style={styles.subtitle}>{subtitle}</AppText>

          {/* Метод — тихие текстовые вкладки */}
          <View style={styles.tabs}>
            {(["email", "phone"] as Mode[]).map((m) => (
              <Pressable key={m} onPress={() => setMode(m)} style={styles.tab}>
                <AppText variant="bodyMd" color={mode === m ? colors.accent : colors.outline} style={mode === m ? { fontFamily: "Manrope_600SemiBold" } : undefined}>
                  {m === "email" ? "Email" : t("Телефон")}
                </AppText>
                <View style={[styles.tabBar, { backgroundColor: mode === m ? colors.accent : "transparent" }]} />
              </Pressable>
            ))}
          </View>

          {/* Поля — мягкие, без рамок */}
          <View style={styles.inputZone}>
            {mode === "email" ? (
              <View style={{ gap: 12 }}>
                <View style={styles.field}>
                  <Sym name="mail-outline" size={20} color={colors.outline} />
                  <TextInput value={email} onChangeText={setEmail} placeholder="you@email.com" placeholderTextColor={colors.outline} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} style={styles.input} />
                </View>
                <View style={styles.field}>
                  <Sym name="lock-outline" size={20} color={colors.outline} />
                  <TextInput value={password} onChangeText={setPassword} placeholder={t("Пароль")} placeholderTextColor={colors.outline} secureTextEntry={!show} autoCapitalize="none" style={styles.input} />
                  <Pressable onPress={() => setShow((s) => !s)} hitSlop={8}>
                    <Sym name={show ? "visibility-off" : "visibility"} size={20} color={colors.outline} />
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.field}>
                {info.country ? (
                  <AppText style={{ fontSize: 22, opacity: info.hasNational ? 1 : 0.4 }}>{flagOf(info.country)}</AppText>
                ) : (
                  <Sym name="phone-iphone" size={20} color={colors.outline} />
                )}
                <TextInput
                  value={phone}
                  onChangeText={(v) => {
                    const next = formatPhone(v).text;
                    const growing = next.replace(/\D/g, "").length > phone.replace(/\D/g, "").length;
                    if (growing && (isTooLong(next) || isValidPhone(phone))) return;
                    edited.current = true;
                    setPhone(next);
                  }}
                  placeholder="+998 90 123 45 67"
                  placeholderTextColor={colors.outline}
                  keyboardType="phone-pad"
                  style={[styles.input, { opacity: info.hasNational ? 1 : 0.55 }]}
                />
              </View>
            )}
          </View>

          <PrimaryButton label={primaryLabel} onPress={submit} loading={busy} />

          <View style={styles.links}>
            <Pressable onPress={() => setAuth((a) => (a === "login" ? "register" : "login"))} hitSlop={8}>
              <AppText variant="bodyMd" color={colors.secondary}>
                {auth === "login" ? t("Нет аккаунта?") : t("Уже есть аккаунт?")}{" "}
                <AppText variant="bodyMd" color={colors.accent}>{auth === "login" ? t("Регистрация") : t("Войти")}</AppText>
              </AppText>
            </Pressable>
            {role !== "master" && (
              <Pressable onPress={guest} hitSlop={8} style={{ marginTop: 14 }}>
                <AppText variant="bodyMd" color={colors.outline}>{t("Продолжить как гость")}</AppText>
              </Pressable>
            )}
          </View>

          <AppText variant="labelSm" color={colors.outline} style={styles.terms}>
            {t("Продолжая, вы принимаете условия и политику конфиденциальности")}
          </AppText>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  header: { height: 56, justifyContent: "center", paddingHorizontal: space.margin },
  body: { flex: 1, paddingHorizontal: space.margin, paddingTop: space.lg },
  subtitle: { marginTop: 8, maxWidth: 300, lineHeight: 22 },
  tabs: { flexDirection: "row", gap: 28, marginTop: space.lg, marginBottom: space.lg },
  tab: { alignItems: "center", gap: 8 },
  tabBar: { height: 2, width: 22, borderRadius: 1 },
  inputZone: { minHeight: 140, justifyContent: "flex-start", marginBottom: space.lg },
  field: { flexDirection: "row", alignItems: "center", gap: 12, height: 58, paddingHorizontal: 18, backgroundColor: colors.surface, borderRadius: radius.xl },
  input: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  links: { alignItems: "center", marginTop: space.lg },
  terms: { textAlign: "center", opacity: 0.7, paddingHorizontal: 24, marginTop: "auto", paddingBottom: space.sm, letterSpacing: 0 },
});

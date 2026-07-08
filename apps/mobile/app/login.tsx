import { useRouter } from "expo-router";
import { useState } from "react";
import {
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
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

export default function Login() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [phone, setPhone] = useState("");
  const [focused, setFocused] = useState(false);

  function format(raw: string) {
    const d = raw.replace(/\D/g, "").slice(0, 9);
    const m = d.match(/(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})/);
    if (!m) return d;
    let out = m[1];
    if (m[2]) out += " " + m[2];
    if (m[3]) out += "-" + m[3];
    if (m[4]) out += "-" + m[4];
    return out;
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Шапка */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="chevron-left" size={28} color={colors.ink} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.body} onPress={() => Keyboard.dismiss()}>
          {/* Заголовок */}
          <View>
            <AppText variant="displayLg" color={colors.accent} style={{ marginBottom: space.sm }}>
              {t("Вход")}
            </AppText>
            <AppText variant="bodyMd" color={colors.inkVariant} style={{ maxWidth: 280 }}>
              {t("Введите номер телефона — пришлём код")}
            </AppText>
          </View>

          {/* Поле ввода */}
          <View>
            <View style={[styles.phoneRow, focused && { borderColor: colors.accent }]}>
              <View style={styles.flag} />
              <AppText variant="bodyMd" color={colors.ink} style={{ fontFamily: "Manrope_600SemiBold" }}>
                +998
              </AppText>
              <View style={styles.divider} />
              <TextInput
                value={phone}
                onChangeText={(t) => setPhone(format(t))}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="XX XXX-XX-XX"
                placeholderTextColor={colors.outlineVariant}
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>
            <AppText variant="labelSm" color={colors.inkVariant} style={{ marginTop: space.sm, paddingHorizontal: 4, opacity: 0.7 }}>
              {t("Мы отправим SMS с кодом подтверждения")}
            </AppText>
          </View>

          {/* Действия */}
          <View style={{ gap: space.md }}>
            <PrimaryButton label={t("Получить код")} onPress={() => router.push("/otp")} />
            <Pressable
              onPress={() => router.replace("/(tabs)/home")}
              style={({ pressed }) => [{ paddingVertical: 8, alignItems: "center" }, pressed && { opacity: 0.6 }]}
            >
              <AppText variant="labelMd" color={colors.inkVariant}>
                {t("Продолжить как гость")}
              </AppText>
            </Pressable>
          </View>

          {/* Футер */}
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
  body: {
    flex: 1,
    paddingHorizontal: space.margin,
    paddingVertical: space.lg,
    justifyContent: "space-between",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 64,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
  },
  flag: {
    width: 24,
    height: 16,
    borderRadius: 3,
    backgroundColor: "#0099B5",
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.surfaceMid,
  },
  divider: { width: 1, height: 24, backgroundColor: colors.outlineVariant, marginHorizontal: 12 },
  input: { flex: 1, ...({ fontFamily: "Manrope_400Regular", fontSize: 16 } as object), color: colors.ink },
  terms: { textAlign: "center", opacity: 0.6, paddingHorizontal: 16, marginTop: space.lg },
});

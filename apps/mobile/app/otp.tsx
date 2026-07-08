import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../components/ui";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors, type as T } from "../theme";

const LEN = 6;

export default function Otp() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState("");
  const [left, setLeft] = useState(42);

  useEffect(() => {
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, []);

  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  const cells = Array.from({ length: LEN }, (_, i) => code[i] ?? "");
  const focusIdx = Math.min(code.length, LEN - 1);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={28} color={colors.ink} />
        </Pressable>
      </View>

      <Pressable style={styles.body} onPress={() => Keyboard.dismiss()}>
        {/* Заголовок */}
        <View style={{ gap: 12, marginBottom: 48 }}>
          <AppText variant="displayLg" color={colors.accent}>
            {t("Введите код")}
          </AppText>
          <AppText variant="bodyMd" color={colors.inkVariant}>
            {t("Код отправлен на")}{" "}
            <AppText variant="bodyMd" color={colors.ink} style={{ fontFamily: "Manrope_500Medium" }}>
              +998 90 123-45-67
            </AppText>
          </AppText>
        </View>

        {/* Ячейки */}
        <Pressable style={styles.cells} onPress={() => inputRef.current?.focus()}>
          {cells.map((c, i) => (
            <View
              key={i}
              style={[styles.cell, i === focusIdx && { borderBottomWidth: 2, borderBottomColor: colors.accent }]}
            >
              <AppText variant="displayLg" color={c ? colors.ink : colors.outlineVariant}>
                {c}
              </AppText>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, LEN))}
            keyboardType="number-pad"
            maxLength={LEN}
            style={styles.hiddenInput}
            caretHidden
          />
        </Pressable>

        {/* Таймер */}
        <View style={{ alignItems: "center", marginBottom: 48 }}>
          {left > 0 ? (
            <AppText variant="labelMd" color={colors.inkVariant}>
              {t("Отправить код повторно через")}{" "}
              <AppText variant="labelMd" color={colors.accent} style={{ fontFamily: "Manrope_600SemiBold" }}>
                {mmss}
              </AppText>
            </AppText>
          ) : (
            <Pressable onPress={() => setLeft(42)}>
              <AppText variant="labelMd" color={colors.accent} style={{ fontFamily: "Manrope_600SemiBold" }}>
                {t("Отправить код снова")}
              </AppText>
            </Pressable>
          )}
        </View>

        {/* Действия */}
        <View style={{ marginTop: "auto", gap: space.lg }}>
          <PrimaryButton label={t("Подтвердить")} onPress={() => router.replace("/(tabs)/home")} />
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.changeNum, pressed && { opacity: 0.6 }]}
          >
            <AppText variant="labelMd" color={colors.inkVariant}>
              {t("Изменить номер")}
            </AppText>
            <Sym name="edit" size={16} color={colors.inkVariant} />
          </Pressable>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  body: { flex: 1, paddingHorizontal: space.margin, paddingTop: 20, paddingBottom: 24 },
  cells: {
    flexDirection: "row",
    justifyContent: "space-between",
    maxWidth: 340,
    alignSelf: "center",
    width: "100%",
    marginBottom: 32,
  },
  cell: {
    width: 48,
    height: 56,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceLow,
    alignItems: "center",
    justifyContent: "center",
  },
  hiddenInput: { position: "absolute", opacity: 0, width: 1, height: 1 },
  changeNum: { flexDirection: "row", gap: 4, alignItems: "center", justifyContent: "center", paddingBottom: 16 },
});

import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

const CITIES = ["Ташкент", "Самарканд", "Бухара", "Наманган", "Андижан"];
const COVERS = ["#5E1226", "#D4AF37", "#3F0013", "#5E5E5E", "#003527", "#C1A57B"];

export default function MasterOnboarding() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, setProfile } = useStore();

  const [name, setName] = useState(profile.name);
  const [spec, setSpec] = useState("");
  const [city, setCity] = useState(0);
  const [cover, setCover] = useState(0);

  function save() {
    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    router.replace("/(master)/(tabs)/today");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accentDeep}>{t("Профиль мастера")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppText variant="labelSm" color={colors.secondary} style={styles.step}>{t("Шаг 1 из 3")}</AppText>
          <AppText variant="displayLg" color={colors.accentDeep} style={{ marginTop: 4 }}>{t("Расскажите о себе")}</AppText>

          {/* Аватар */}
          <View style={{ alignItems: "center", marginTop: space.lg }}>
            <Pressable style={styles.avatar}>
              <Sym name="photo-camera" size={36} color={colors.accent} />
              <View style={styles.avatarBadge}><Sym name="add" size={16} color={colors.onAccent} /></View>
            </Pressable>
          </View>

          {/* Форма */}
          <View style={{ gap: space.md, marginTop: space.lg }}>
            <Field label={t("Имя")}>
              <TextInput value={name} onChangeText={setName} placeholder="Дилноза" placeholderTextColor={colors.outline} style={styles.input} />
            </Field>
            <Field label={t("Специализация")}>
              <TextInput value={spec} onChangeText={setSpec} placeholder={t("Психолог")} placeholderTextColor={colors.outline} style={styles.input} />
            </Field>
            <View style={{ gap: 8 }}>
              <AppText variant="labelMd" color={colors.secondary}>{t("Город")}</AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {CITIES.map((c, i) => {
                  const on = i === city;
                  return (
                    <Pressable key={c} onPress={() => setCity(i)} style={[styles.chip, on ? styles.chipOn : styles.chipOff]}>
                      <AppText variant="labelMd" color={on ? colors.onAccent : colors.inkVariant}>{t(c)}</AppText>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>

          {/* Обложка */}
          <AppText variant="labelMd" color={colors.accentDeep} style={{ marginTop: space.lg, marginBottom: space.sm }}>{t("Обложка профиля")}</AppText>
          <View style={{ flexDirection: "row", gap: 16 }}>
            {COVERS.map((hex, i) => {
              const on = i === cover;
              return (
                <Pressable key={hex} onPress={() => setCover(i)} style={[styles.swatch, { backgroundColor: hex }, on && styles.swatchOn]}>
                  {on ? <Sym name="check" size={18} color="#fff" /> : null}
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Далее")} icon="arrow-forward" onPress={save} />
      </View>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const colors = useColors();
  return (
    <View style={{ gap: 8 }}>
      <AppText variant="labelMd" color={colors.secondary}>{label}</AppText>
      {children}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60 },
  step: { textTransform: "uppercase", letterSpacing: 1.5 },
  avatar: { width: 128, height: 128, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surface },
  avatarBadge: { position: "absolute", bottom: 4, right: 4, width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
  input: { height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surfaceMid },
  swatch: { width: 44, height: 44, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  swatchOn: { borderWidth: 2, borderColor: colors.accentDeep },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

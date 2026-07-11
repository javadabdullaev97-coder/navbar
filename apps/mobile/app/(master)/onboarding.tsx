import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

const CITIES = ["Ташкент", "Самарканд", "Бухара", "Наманган", "Андижан"];
const COVERS = ["#5E1226", "#D4AF37", "#3F0013", "#5E5E5E", "#003527", "#C1A57B"];
const PRESETS = [30, 45, 60, 90, 120];

function fmtDur(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h && m) return `${h} ч ${m} мин`;
  if (h) return `${h} ч`;
  return `${m} мин`;
}
const DAYS = [
  { key: "mon", label: "Пн" }, { key: "tue", label: "Вт" }, { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" }, { key: "fri", label: "Пт" }, { key: "sat", label: "Сб" }, { key: "sun", label: "Вс" },
];
const STEP_TITLE = ["Расскажите о себе", "Добавьте первую услугу", "Настройте график"];

export default function MasterOnboarding() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, setProfile } = useStore();

  const [step, setStep] = useState(1);
  // Шаг 1
  const [name, setName] = useState(profile.name);
  const [spec, setSpec] = useState("");
  const [city, setCity] = useState(0);
  const [cover, setCover] = useState(0);
  // Шаг 2
  const [svcName, setSvcName] = useState("");
  const [svcHours, setSvcHours] = useState("0");
  const [svcMins, setSvcMins] = useState("50");
  const svcTotal = (Number(svcHours) || 0) * 60 + (Number(svcMins) || 0);
  const setSvcPreset = (d: number) => { setSvcHours(String(Math.floor(d / 60))); setSvcMins(String(d % 60)); };
  const [svcPrice, setSvcPrice] = useState("");
  // Шаг 3
  const [days, setDays] = useState<Record<string, boolean>>({ mon: true, tue: true, wed: true, thu: true, fri: true, sat: false, sun: false });

  function back() {
    if (step > 1) setStep(step - 1);
    else router.back();
  }
  function next() {
    if (step < 3) { setStep(step + 1); return; }
    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    router.replace("/(master)/(tabs)/today");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={back} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Профиль мастера")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      {/* Прогресс */}
      <View style={styles.progressRow}>
        {[1, 2, 3].map((s) => (
          <View key={s} style={[styles.progressSeg, { backgroundColor: s <= step ? colors.accent : colors.surfaceHigh }]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppText variant="labelSm" color={colors.secondary} style={styles.step}>{t("Шаг {n} из 3", { n: step })}</AppText>
          <AppText variant="displayLg" color={colors.accent} style={{ marginTop: 4 }}>{t(STEP_TITLE[step - 1])}</AppText>

          {step === 1 && (
            <>
              <View style={{ alignItems: "center", marginTop: space.lg }}>
                <Pressable style={styles.avatar}>
                  <Sym name="photo-camera" size={36} color={colors.accent} />
                  <View style={styles.avatarBadge}><Sym name="add" size={16} color={colors.onAccent} /></View>
                </Pressable>
              </View>
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
                    {CITIES.map((c, i) => (
                      <Pressable key={c} onPress={() => setCity(i)} style={[styles.chip, i === city ? styles.chipOn : styles.chipOff]}>
                        <AppText variant="labelMd" color={i === city ? colors.onAccent : colors.inkVariant}>{t(c)}</AppText>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
              <AppText variant="labelMd" color={colors.accent} style={{ marginTop: space.lg, marginBottom: space.sm }}>{t("Обложка профиля")}</AppText>
              <View style={{ flexDirection: "row", gap: 16 }}>
                {COVERS.map((hex, i) => (
                  <Pressable key={hex} onPress={() => setCover(i)} style={[styles.swatch, { backgroundColor: hex }, i === cover && styles.swatchOn]}>
                    {i === cover ? <Sym name="check" size={18} color="#fff" /> : null}
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {step === 2 && (
            <View style={{ gap: space.md, marginTop: space.lg }}>
              <Field label={t("Название")}>
                <TextInput value={svcName} onChangeText={setSvcName} placeholder={t("Например, Консультация")} placeholderTextColor={colors.outline} style={styles.input} />
              </Field>
              <View style={{ gap: 8 }}>
                <AppText variant="labelMd" color={colors.secondary}>{t("Длительность")}</AppText>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <View style={styles.durField}>
                    <TextInput value={svcHours} onChangeText={(v) => setSvcHours(v.replace(/[^\d]/g, "").slice(0, 2))} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.outline} style={styles.durInput} />
                    <AppText variant="labelMd" color={colors.inkVariant}>{t("ч")}</AppText>
                  </View>
                  <View style={styles.durField}>
                    <TextInput value={svcMins} onChangeText={(v) => { const n = Number(v.replace(/[^\d]/g, "")) || 0; setSvcMins(String(Math.min(n, 59))); }} keyboardType="number-pad" placeholder="0" placeholderTextColor={colors.outline} style={styles.durInput} />
                    <AppText variant="labelMd" color={colors.inkVariant}>{t("мин")}</AppText>
                  </View>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                  {PRESETS.map((d) => (
                    <Pressable key={d} onPress={() => setSvcPreset(d)} style={[styles.chip, svcTotal === d ? styles.chipOn : styles.chipOff]}>
                      <AppText variant="labelMd" color={svcTotal === d ? colors.onAccent : colors.accent}>{fmtDur(d)}</AppText>
                    </Pressable>
                  ))}
                </ScrollView>
                <AppText variant="labelSm" color={colors.secondary}>{t("Например, 1 ч 30 мин.")}</AppText>
              </View>
              <Field label={t("Цена, сум")}>
                <TextInput value={svcPrice} onChangeText={(v) => setSvcPrice(v.replace(/[^\d]/g, ""))} keyboardType="number-pad" placeholder="250000" placeholderTextColor={colors.outline} style={styles.input} />
              </Field>
              <AppText variant="labelSm" color={colors.secondary}>{t("Услуги можно будет добавить и изменить позже.")}</AppText>
            </View>
          )}

          {step === 3 && (
            <View style={{ marginTop: space.lg }}>
              <View style={[styles.card, cardShadow]}>
                {DAYS.map((d, i) => (
                  <View key={d.key} style={[styles.dayRow, i < DAYS.length - 1 && styles.divider]}>
                    <AppText variant="labelMd" color={colors.ink}>{t(d.label)}</AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <AppText variant="labelSm" color={days[d.key] ? colors.secondary : colors.outline}>{days[d.key] ? "09:00 – 18:00" : t("Выходной")}</AppText>
                      <Switch value={days[d.key]} onValueChange={() => setDays((x) => ({ ...x, [d.key]: !x[d.key] }))} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
                    </View>
                  </View>
                ))}
              </View>
              <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: space.sm }}>{t("Точное время по каждому дню настроите в графике работы.")}</AppText>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton
          label={step < 3 ? t("Далее") : t("Готово, к записям")}
          icon={step < 3 ? "arrow-forward" : "check"}
          onPress={next}
        />
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
  progressRow: { flexDirection: "row", gap: 6, paddingHorizontal: space.margin, marginBottom: 8 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2 },
  step: { textTransform: "uppercase", letterSpacing: 1.5 },
  avatar: { width: 128, height: 128, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surface },
  avatarBadge: { position: "absolute", bottom: 4, right: 4, width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
  input: { height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  suffix: { position: "absolute", right: 16 },
  durField: { flex: 1, flexDirection: "row", alignItems: "center", gap: 8, height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16 },
  durInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surfaceMid },
  swatch: { width: 44, height: 44, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  swatchOn: { borderWidth: 2, borderColor: colors.accent },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: "hidden" },
  dayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

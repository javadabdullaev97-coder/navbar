import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { DurationSheet, HoursSheet } from "../../components/pickers";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { fmtDur, fmtMoney, minToHHMM } from "../../lib/format";
import { useT } from "../../lib/i18n";
import {
  addGalleryItem, becomeSoloMaster, masterConfigured, setAvailability, setAvatar,
  submitVerification, updateMyProfile, upsertService,
} from "../../lib/master-api";
import { uploadImage } from "../../lib/storage";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../theme";

const CITIES = ["Ташкент", "Самарканд", "Бухара", "Наманган", "Андижан"];
const COVERS = ["#5E1226", "#D4AF37", "#3F0013", "#5E5E5E", "#003527", "#C1A57B"];
const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const STEP_TITLE = ["Расскажите о себе", "Добавьте услуги", "Настройте график", "Загрузите портфолио", "Документы и верификация"];
const STEPS = 5;
const MAX_PHOTOS = 10;
type DayState = { on: boolean; start: number; end: number };
type Svc = { name: string; duration: number; price: number };
const DAYS_DEFAULT: DayState[] = DAY_LABELS.map((_, i) => ({ on: i < 5, start: 540, end: i === 4 ? 1020 : 1080 }));

export default function MasterOnboarding() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, setProfile } = useStore();

  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Шаг 1
  const [name, setName] = useState(profile.name);
  const [spec, setSpec] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState(0);
  const [address, setAddress] = useState("");
  const [cover, setCover] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  // Шаг 2
  const [svcName, setSvcName] = useState("");
  const [svcDuration, setSvcDuration] = useState(50);
  const [svcPrice, setSvcPrice] = useState("");
  const [durOpen, setDurOpen] = useState(false);
  const [services, setServices] = useState<Svc[]>([]);
  // Шаг 3
  const [days, setDays] = useState<DayState[]>(DAYS_DEFAULT);
  const [editDay, setEditDay] = useState<number | null>(null);
  // Шаг 4 / 5
  const [photos, setPhotos] = useState<string[]>([]);
  const [docPath, setDocPath] = useState<string | null>(null);

  function addService() {
    if (!svcName.trim() || svcDuration <= 0 || (Number(svcPrice) || 0) <= 0) {
      Alert.alert(t("Заполните поля"), t("Укажите название, длительность и цену услуги."));
      return;
    }
    setServices((s) => [...s, { name: svcName.trim(), duration: svcDuration, price: Number(svcPrice) || 0 }]);
    setSvcName(""); setSvcPrice(""); setSvcDuration(50);
  }

  async function upload(bucket: string, onDone: (r: { path: string; url: string }) => void) {
    if (!masterConfigured) { Alert.alert(t("Скоро"), t("Загрузка станет доступна после подключения к серверу.")); return; }
    if (uploading) return;
    setUploading(true);
    try { const r = await uploadImage(bucket); if (r) onDone(r); }
    catch (e) { Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось загрузить файл.")); }
    finally { setUploading(false); }
  }

  const valid =
    step === 1 ? name.trim().length > 0 && spec.trim().length > 0 :
    step === 2 ? services.length > 0 :
    step === 3 ? days.some((d) => d.on) :
    true;

  const hint =
    step === 1 ? t("Заполните имя и специализацию.") :
    step === 2 ? t("Добавьте хотя бы одну услугу.") :
    step === 3 ? t("Оставьте включённым хотя бы один рабочий день.") : "";

  async function next() {
    if (busy) return;
    if (!valid) { Alert.alert(t("Заполните поля"), hint); return; }
    if (step < STEPS) { setStep(step + 1); return; }

    if (name.trim()) setProfile({ ...profile, name: name.trim() });
    if (masterConfigured) {
      setBusy(true);
      try {
        await becomeSoloMaster(name.trim(), spec.trim(), CITIES[city]);
        await updateMyProfile({ spec: spec.trim(), bio: bio.trim(), address: address.trim() || CITIES[city] });
        if (avatarUrl) await setAvatar(avatarUrl);
        for (const s of services) await upsertService(s);
        for (let i = 0; i < days.length; i++) await setAvailability(i, days[i].start, days[i].end, !days[i].on);
        for (const url of photos) await addGalleryItem(url);
        if (docPath) await submitVerification(docPath);
      } catch (e) {
        setBusy(false);
        Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось завершить регистрацию."));
        return;
      }
      setBusy(false);
    }
    router.replace("/(master)/(tabs)/today");
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => (step > 1 ? setStep(step - 1) : router.back())} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Профиль мастера")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.progressRow}>
        {Array.from({ length: STEPS }, (_, i) => (
          <View key={i} style={[styles.progressSeg, { backgroundColor: i < step ? colors.accent : colors.surfaceHigh }]} />
        ))}
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppText variant="labelSm" color={colors.secondary} style={styles.step}>{t("Шаг {n} из {total}", { n: step, total: STEPS })}</AppText>
          <AppText variant="displayLg" color={colors.accent} style={{ marginTop: 4 }}>{t(STEP_TITLE[step - 1])}</AppText>

          {step === 1 && (
            <>
              <View style={{ alignItems: "center", marginTop: space.lg }}>
                <Pressable style={styles.avatar} onPress={() => upload("avatars", (r) => setAvatarUrl(r.url))}>
                  {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImg} /> : <Sym name="photo-camera" size={36} color={colors.accent} />}
                  <View style={styles.avatarBadge}>{uploading ? <ActivityIndicator size="small" color={colors.onAccent} /> : <Sym name="add" size={16} color={colors.onAccent} />}</View>
                </Pressable>
              </View>
              <View style={{ gap: space.md, marginTop: space.lg }}>
                <Field label={t("Имя")}>
                  <TextInput value={name} onChangeText={setName} placeholder="Дилноза" placeholderTextColor={colors.outline} style={styles.input} />
                </Field>
                <Field label={t("Специализация")}>
                  <TextInput value={spec} onChangeText={setSpec} placeholder={t("Психолог")} placeholderTextColor={colors.outline} style={styles.input} />
                </Field>
                <Field label={t("О себе (необязательно)")}>
                  <TextInput value={bio} onChangeText={setBio} placeholder={t("Коротко о себе и опыте…")} placeholderTextColor={colors.outline} multiline style={[styles.input, styles.textarea]} />
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
                <Field label={t("Адрес (необязательно)")}>
                  <TextInput value={address} onChangeText={setAddress} placeholder={t("Улица, дом, ориентир")} placeholderTextColor={colors.outline} style={styles.input} />
                </Field>
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
              {services.length > 0 && (
                <View style={{ gap: space.sm }}>
                  {services.map((s, i) => (
                    <View key={i} style={[styles.svcRow, cardShadow]}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                        <AppText variant="labelSm" color={colors.secondary}>{fmtDur(s.duration)} · {fmtMoney(s.price)}</AppText>
                      </View>
                      <Pressable hitSlop={8} onPress={() => setServices((arr) => arr.filter((_, idx) => idx !== i))}>
                        <Sym name="close" size={20} color={colors.secondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              )}
              <Field label={t("Название")}>
                <TextInput value={svcName} onChangeText={setSvcName} placeholder={t("Например, Консультация")} placeholderTextColor={colors.outline} style={styles.input} />
              </Field>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1, gap: 8 }}>
                  <AppText variant="labelMd" color={colors.secondary}>{t("Длительность")}</AppText>
                  <Pressable style={styles.pickerRow} onPress={() => setDurOpen(true)}>
                    <AppText variant="bodyMd" color={colors.ink}>{fmtDur(svcDuration)}</AppText>
                    <Sym name="expand-more" size={22} color={colors.secondary} />
                  </Pressable>
                </View>
                <View style={{ flex: 1, gap: 8 }}>
                  <AppText variant="labelMd" color={colors.secondary}>{t("Цена, сум")}</AppText>
                  <TextInput value={svcPrice} onChangeText={(v) => setSvcPrice(v.replace(/[^\d]/g, ""))} keyboardType="number-pad" placeholder="250000" placeholderTextColor={colors.outline} style={styles.input} />
                </View>
              </View>
              <Pressable style={styles.addSvcBtn} onPress={addService}>
                <Sym name="add" size={20} color={colors.accent} />
                <AppText variant="labelMd" color={colors.accent}>{t("Добавить услугу")}</AppText>
              </Pressable>
              <AppText variant="labelSm" color={colors.secondary}>{t("Можно добавить несколько услуг с разной длительностью и ценой.")}</AppText>
            </View>
          )}

          {step === 3 && (
            <View style={{ marginTop: space.lg }}>
              <View style={[styles.card, cardShadow]}>
                {days.map((d, i) => (
                  <View key={i} style={[styles.dayRow, i < days.length - 1 && styles.divider]}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Switch value={d.on} onValueChange={() => setDays((x) => x.map((y, idx) => (idx === i ? { ...y, on: !y.on } : y)))} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
                      <AppText variant="labelMd" color={colors.ink}>{t(DAY_LABELS[i])}</AppText>
                    </View>
                    {d.on ? (
                      <Pressable style={styles.hoursBtn} onPress={() => setEditDay(i)}>
                        <AppText variant="bodyMd" color={colors.accent}>{minToHHMM(d.start)} – {minToHHMM(d.end)}</AppText>
                      </Pressable>
                    ) : (
                      <AppText variant="bodyMd" color={colors.secondary} style={{ fontStyle: "italic" }}>{t("Выходной")}</AppText>
                    )}
                  </View>
                ))}
              </View>
              <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: space.sm }}>{t("Нажмите на время, чтобы задать часы работы.")}</AppText>
            </View>
          )}

          {step === 4 && (
            <View style={{ marginTop: space.lg, gap: space.md }}>
              <AppText variant="bodyMd" color={colors.secondary}>{t("Добавьте минимум 4 фото — это заметно повышает доверие клиентов. Шаг необязательный, можно пропустить.")}</AppText>
              <View style={styles.grid}>
                {photos.map((url, i) => (
                  <Pressable key={i} onLongPress={() => setPhotos((p) => p.filter((_, idx) => idx !== i))} style={styles.tile}>
                    <Image source={{ uri: url }} style={styles.tileImg} />
                  </Pressable>
                ))}
                {photos.length < MAX_PHOTOS && (
                  <Pressable style={[styles.tile, styles.addTile]} onPress={() => upload("portfolio", (r) => setPhotos((p) => [...p, r.url]))}>
                    {uploading ? <ActivityIndicator color={colors.accent} /> : <Sym name="add-a-photo" size={26} color={colors.accent} />}
                  </Pressable>
                )}
              </View>
              <AppText variant="labelSm" color={colors.secondary}>{t("Загружено: {count} из 10. Удерживайте фото, чтобы удалить.", { count: photos.length })}</AppText>
            </View>
          )}

          {step === 5 && (
            <View style={{ marginTop: space.lg, gap: space.md }}>
              <AppText variant="bodyMd" color={colors.secondary}>{t("Загрузите диплом или сертификат. После проверки в профиле появится бейдж «Диплом проверен». Шаг необязательный.")}</AppText>
              <Pressable style={styles.dropzone} onPress={() => upload("docs", (r) => setDocPath(r.path))}>
                <View style={styles.dropIcon}>
                  {uploading ? <ActivityIndicator color={colors.accent} /> : <Sym name={docPath ? "check-circle" : "upload-file"} size={30} color={docPath ? colors.successText : colors.accent} />}
                </View>
                <AppText variant="labelMd" color={docPath ? colors.successText : colors.accent}>{docPath ? t("Документ загружен") : t("Загрузить документ")}</AppText>
                <AppText variant="labelSm" color={colors.secondary}>{t("Фото диплома, сертификата или лицензии")}</AppText>
              </Pressable>
              <View style={[styles.verifyNote, { backgroundColor: colors.infoBg }]}>
                <Sym name="verified" size={18} color={colors.infoText} />
                <AppText variant="labelSm" color={colors.infoText} style={{ flex: 1 }}>{t("Проверка занимает 1–2 дня. Бейдж повышает доверие, но не обязателен.")}</AppText>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton
          label={step < STEPS ? t("Далее") : t("Готово, к записям")}
          icon={step < STEPS ? "arrow-forward" : "check"}
          onPress={next}
          loading={busy}
          style={!valid ? { opacity: 0.5 } : undefined}
        />
        {step >= 4 && (
          <Pressable onPress={next} style={{ alignItems: "center", paddingVertical: 10 }}>
            <AppText variant="labelMd" color={colors.secondary}>{step < STEPS ? t("Пропустить") : t("Пропустить и завершить")}</AppText>
          </Pressable>
        )}
      </View>

      <DurationSheet visible={durOpen} value={svcDuration} onSelect={setSvcDuration} onClose={() => setDurOpen(false)} />
      <HoursSheet
        visible={editDay !== null}
        start={editDay !== null ? days[editDay].start : 540}
        end={editDay !== null ? days[editDay].end : 1080}
        onSelect={(s, e) => { if (editDay !== null) setDays((d) => d.map((x, idx) => (idx === editDay ? { ...x, start: s, end: e } : x))); }}
        onClose={() => setEditDay(null)}
      />
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
  avatar: { width: 128, height: 128, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", borderWidth: 4, borderColor: colors.surface, overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  avatarBadge: { position: "absolute", bottom: 4, right: 4, width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
  input: { minHeight: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  textarea: { minHeight: 96, paddingTop: 14, textAlignVertical: "top" },
  pickerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16 },
  chip: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: radius.full },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surfaceMid },
  swatch: { width: 44, height: 44, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  swatchOn: { borderWidth: 2, borderColor: colors.accent },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: "hidden" },
  dayRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", height: 60, paddingHorizontal: 16 },
  divider: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  hoursBtn: { backgroundColor: colors.surfaceLow, paddingHorizontal: 16, height: 36, justifyContent: "center", borderRadius: radius.lg },
  svcRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 14 },
  addSvcBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 52, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.accent, borderStyle: "dashed" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "31%", aspectRatio: 1, borderRadius: radius.xl, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMid },
  tileImg: { width: "100%", height: "100%" },
  addTile: { borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", backgroundColor: colors.surfaceLow },
  dropzone: { alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 36, borderRadius: radius.x2l, borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", backgroundColor: colors.surfaceLow },
  dropIcon: { width: 64, height: 64, borderRadius: radius.full, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  verifyNote: { flexDirection: "row", gap: 10, alignItems: "center", padding: 16, borderRadius: radius.xl },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

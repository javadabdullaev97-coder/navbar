import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, PrimaryButton, Sym } from "../../components/ui";
import { initialOf } from "../../lib/data";
import { useT } from "../../lib/i18n";
import { becomeSoloMaster, masterConfigured, setAvatar, updateMyProfile, useMyMaster } from "../../lib/master-api";
import { uploadImage } from "../../lib/storage";
import { useStore } from "../../lib/store";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

export default function EditProfile() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { profile, setProfile } = useStore();
  const { data: master } = useMyMaster();

  const [name, setName] = useState(profile.name);
  const [spec, setSpec] = useState("");
  const [bio, setBio] = useState("");
  const [address, setAddress] = useState("");
  const [visible, setVisible] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Префилл из реального профиля (один раз).
  useEffect(() => {
    if (master && !loaded) {
      setSpec(master.specialization ?? "");
      setBio(master.bio ?? "");
      setAddress(master.address ?? "");
      setVisible(master.visible_in_search);
      setAvatarUrl(master.avatar_url ?? null);
      setLoaded(true);
    }
  }, [master, loaded]);

  async function pickAvatar() {
    if (!masterConfigured) return;
    if (uploading) return;
    setUploading(true);
    try { const r = await uploadImage("avatars"); if (r) setAvatarUrl(r.url); }
    catch (e) { Alert.alert(t("Ошибка"), e instanceof Error ? e.message : ""); }
    finally { setUploading(false); }
  }

  async function save() {
    if (busy) return;
    if (!name.trim() || !spec.trim()) { Alert.alert(t("Заполните поля"), t("Заполните имя и специализацию.")); return; }
    setProfile({ ...profile, name: name.trim() });
    if (masterConfigured) {
      setBusy(true);
      try {
        await becomeSoloMaster(name.trim(), spec.trim(), address.trim()); // обновляет имя/спец/адрес
        await updateMyProfile({ spec: spec.trim(), bio: bio.trim(), address: address.trim(), visible });
        if (avatarUrl && avatarUrl !== master?.avatar_url) await setAvatar(avatarUrl);
      } catch (e) {
        setBusy(false);
        Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось сохранить профиль."));
        return;
      }
      setBusy(false);
    }
    router.back();
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Редактировать профиль")}</AppText>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40, gap: space.md }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginBottom: space.sm }}>
            <Pressable style={styles.avatar} onPress={pickAvatar}>
              {avatarUrl ? <Image source={{ uri: avatarUrl }} style={styles.avatarImg} /> : <AppText style={styles.avatarInitial} color={colors.inkVariant}>{name ? initialOf(name) : "•"}</AppText>}
              <View style={styles.avatarBadge}>{uploading ? <ActivityIndicator size="small" color={colors.onAccent} /> : <Sym name="edit" size={14} color={colors.onAccent} />}</View>
            </Pressable>
          </View>

          <Field label={t("Имя")}>
            <TextInput value={name} onChangeText={setName} placeholder="Дилноза" placeholderTextColor={colors.outline} style={styles.input} />
          </Field>
          <Field label={t("Специализация")}>
            <TextInput value={spec} onChangeText={setSpec} placeholder={t("Психолог")} placeholderTextColor={colors.outline} style={styles.input} />
          </Field>
          <Field label={t("О себе (необязательно)")}>
            <TextInput value={bio} onChangeText={setBio} placeholder={t("Коротко о себе и опыте…")} placeholderTextColor={colors.outline} multiline style={[styles.input, styles.textarea]} />
          </Field>
          <Field label={t("Адрес (необязательно)")}>
            <TextInput value={address} onChangeText={setAddress} placeholder={t("Улица, дом, ориентир")} placeholderTextColor={colors.outline} style={styles.input} />
          </Field>

          <View style={styles.toggleRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText variant="labelMd" color={colors.ink}>{t("Показывать в поиске")}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{t("Клиенты смогут находить вас в каталоге. Ссылка на запись работает всегда.")}</AppText>
            </View>
            <Switch value={visible} onValueChange={setVisible} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label={t("Сохранить")} onPress={save} loading={busy} />
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  avatar: { width: 112, height: 112, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  avatarImg: { width: "100%", height: "100%" },
  avatarInitial: { fontFamily: "LibreCaslonText_400Regular", fontSize: 44, lineHeight: 50 },
  avatarBadge: { position: "absolute", bottom: 2, right: 2, width: 30, height: 30, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
  input: { minHeight: 56, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl, paddingHorizontal: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  textarea: { minHeight: 96, paddingTop: 14, textAlignVertical: "top" },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingVertical: space.sm },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

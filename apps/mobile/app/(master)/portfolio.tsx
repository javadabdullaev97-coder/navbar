import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Loading, Sym } from "../../components/ui";
import { addGalleryItem, deleteGalleryItem, masterConfigured, useMyGallery } from "../../lib/master-api";
import { uploadImage } from "../../lib/storage";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

const MAX = 10;

export default function Portfolio() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const { data: gallery, loading, reload } = useMyGallery();
  const [uploading, setUploading] = useState(false);
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const items = gallery ?? [];
  const showLoading = masterConfigured && gallery === null && loading;

  async function add() {
    if (uploading) return;
    if (!masterConfigured) { Alert.alert(t("Скоро"), t("Загрузка станет доступна после подключения к серверу.")); return; }
    if (items.length >= MAX) { Alert.alert(t("Лимит фото"), t("Можно загрузить до 10 фото.")); return; }
    setUploading(true);
    try {
      const r = await uploadImage("portfolio");
      if (r) { await addGalleryItem(r.url); await reload(); }
    } catch (e) { Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось загрузить фото.")); }
    finally { setUploading(false); }
  }

  function remove(id: string) {
    Alert.alert(t("Удалить фото?"), "", [
      { text: t("Назад"), style: "cancel" },
      { text: t("Удалить"), style: "destructive", onPress: async () => { try { await deleteGalleryItem(id); await reload(); } catch { /* игнор */ } } },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Портфолио")}</AppText>
        </View>
        <Pressable onPress={add} style={styles.addBtn}>
          {uploading ? <ActivityIndicator size="small" color={colors.onAccent} /> : <Sym name="add" size={20} color={colors.onAccent} />}
          <AppText variant="labelMd" color={colors.onAccent}>{t("Добавить фото")}</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <AppText variant="bodyMd" color={colors.secondary} style={{ marginBottom: space.lg }}>
          {t("Покажите свои работы — это повышает доверие.")}
        </AppText>

        {showLoading ? <Loading /> : (
          <View style={styles.grid}>
            {items.map((g) => (
              <Pressable key={g.id} onLongPress={() => remove(g.id)} style={styles.tile}>
                <Image source={{ uri: g.url }} style={styles.tileImg} />
              </Pressable>
            ))}
            {items.length < MAX && (
              <Pressable style={[styles.tile, styles.addTile]} onPress={add}>
                {uploading ? <ActivityIndicator color={colors.accent} /> : <Sym name="add-a-photo" size={28} color={colors.accent} />}
              </Pressable>
            )}
          </View>
        )}

        {!showLoading && (
          <View style={styles.hint}>
            <Sym name="info" size={18} color={colors.secondary} />
            <AppText variant="labelSm" color={colors.secondary} style={{ flex: 1 }}>
              {t("Удерживайте фото, чтобы удалить. До 10 фото.")}
            </AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, paddingHorizontal: 14, height: 40, borderRadius: radius.full },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "31%", aspectRatio: 1, borderRadius: radius.xl, overflow: "hidden", alignItems: "center", justifyContent: "center", backgroundColor: colors.surfaceMid },
  tileImg: { width: "100%", height: "100%" },
  addTile: { borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", backgroundColor: colors.surfaceLow },
  hint: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: space.lg, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 16 },
});

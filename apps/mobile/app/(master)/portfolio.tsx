import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { useColors, useThemedStyles } from "../../lib/theme-context";
import { radius, space, ThemeColors } from "../../theme";

export default function Portfolio() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  // Демо-плитки (загрузка фото появится с подключением Supabase Storage).
  const [tiles, setTiles] = useState([1, 2, 3, 4, 5]);

  const remove = (i: number) => setTiles((arr) => arr.filter((_, idx) => idx !== i));

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Портфолио")}</AppText>
        </View>
        <Pressable onPress={() => Alert.alert(t("Скоро"), t("Загрузка фото появится в следующем обновлении."))} style={styles.addBtn}>
          <Sym name="add" size={20} color={colors.onAccent} />
          <AppText variant="labelMd" color={colors.onAccent}>{t("Добавить фото")}</AppText>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <AppText variant="bodyMd" color={colors.secondary} style={{ marginBottom: space.lg }}>
          {t("Покажите свои работы — это повышает доверие.")}
        </AppText>

        <View style={styles.grid}>
          {/* Плитка добавления */}
          <Pressable onPress={() => Alert.alert(t("Скоро"), t("Загрузка фото появится в следующем обновлении."))} style={[styles.tile, styles.addTile]}>
            <Sym name="photo-camera" size={30} color={colors.accent} />
          </Pressable>
          {tiles.map((_, i) => (
            <Pressable key={i} onLongPress={() => remove(i)} style={[styles.tile, styles.photoTile]}>
              <Sym name="image" size={28} color={colors.outline} />
            </Pressable>
          ))}
        </View>

        <View style={styles.hint}>
          <Sym name="info" size={18} color={colors.secondary} />
          <AppText variant="labelSm" color={colors.secondary} style={{ flex: 1 }}>
            {t("Удерживайте плитку, чтобы удалить. Загрузка реальных фото — в следующем обновлении.")}
          </AppText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 60, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.accent, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.full },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  tile: { width: "31%", aspectRatio: 1, borderRadius: radius.xl, alignItems: "center", justifyContent: "center" },
  addTile: { borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed", backgroundColor: colors.surfaceLow },
  photoTile: { backgroundColor: colors.surfaceMid },
  hint: { flexDirection: "row", gap: 10, alignItems: "center", marginTop: space.lg, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, padding: 16 },
});

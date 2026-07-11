import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

type Client = { id: string; name: string; visits: number; last: string; regular?: boolean };
const CLIENTS: Client[] = [
  { id: "1", name: "Азиза Каримова", visits: 12, last: "12 июля", regular: true },
  { id: "2", name: "Дмитрий Соколов", visits: 8, last: "5 авг", regular: true },
  { id: "3", name: "Елена Волкова", visits: 4, last: "28 июля", regular: true },
  { id: "4", name: "Бахтиёр Хакимов", visits: 1, last: "14 авг" },
  { id: "5", name: "Иван Кравцов", visits: 2, last: "1 авг" },
  { id: "6", name: "Камила Исаева", visits: 6, last: "20 июля" },
];

const CHIPS = ["Все", "Постоянные", "Новые", "Архив"];

export default function Clients() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState(0);

  const filtered = CLIENTS.filter((c) => {
    if (q && !c.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (chip === 1) return c.regular; // Постоянные
    if (chip === 2) return c.visits <= 1; // Новые
    return true;
  });
  const regulars = filtered.filter((c) => c.regular);
  const others = filtered.filter((c) => !c.regular);

  const Row = (c: Client) => (
    <Pressable key={c.id} onPress={() => router.push(`/(master)/client/${c.id}`)}>
      <View style={[styles.row, cardShadow]}>
        <Avatar initial={initialOf(c.name)} size={48} round tint={colors.surfaceMid} fg={colors.inkVariant} />
        <View style={{ flex: 1 }}>
          <AppText variant="labelMd" color={colors.ink}>{c.name}</AppText>
          <AppText variant="labelSm" color={colors.secondary}>{t("Визитов: {count} · Последний: {date}", { count: c.visits, date: c.last })}</AppText>
        </View>
        <Sym name="chevron-right" size={22} color={colors.secondary} />
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Клиенты")}</AppText>
        <Sym name="add-circle-outline" size={26} color={colors.accent} />
      </View>

      <View style={styles.searchWrap}>
        <Sym name="search" size={20} color={colors.outline} />
        <TextInput value={q} onChangeText={setQ} placeholder={t("Поиск клиента")} placeholderTextColor={colors.outline} style={styles.searchInput} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsBar} contentContainerStyle={styles.chips}>
        {CHIPS.map((c, i) => (
          <Pressable key={c} onPress={() => setChip(i)} style={[styles.chip, i === chip ? styles.chipOn : styles.chipOff]}>
            <AppText variant="labelMd" color={i === chip ? colors.onAccent : colors.secondary}>{t(c)}</AppText>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 56 }}><AppText variant="bodyMd" color={colors.secondary}>{t("Никого не найдено")}</AppText></View>
        )}
        {regulars.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <AppText variant="labelSm" color={colors.secondary} style={styles.upper}>{t("Постоянные")}</AppText>
              <AppText variant="labelSm" color={colors.secondary}>{t("{count} чел.", { count: regulars.length })}</AppText>
            </View>
            <View style={{ gap: space.sm }}>{regulars.map(Row)}</View>
          </>
        )}
        {others.length > 0 && (
          <>
            <AppText variant="labelSm" color={colors.secondary} style={[styles.upper, { marginTop: space.lg, marginBottom: space.sm }]}>{t("Все клиенты")}</AppText>
            <View style={{ gap: space.sm }}>{others.map(Row)}</View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  searchWrap: { flexDirection: "row", alignItems: "center", gap: 10, marginHorizontal: space.margin, height: 48, paddingHorizontal: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant, borderRadius: radius.xl },
  searchInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  chipsBar: { flexGrow: 0, maxHeight: 60 },
  chips: { paddingHorizontal: space.margin, gap: 8, alignItems: "center", paddingVertical: space.md },
  chip: { height: 38, paddingHorizontal: 20, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: space.sm },
  upper: { textTransform: "uppercase", letterSpacing: 1.5 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 12 },
});

import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Loading, Sym } from "../../../components/ui";
import { initialOf } from "../../../lib/data";
import { MONTHS_GEN } from "../../../lib/format";
import { masterConfigured, MasterClient, useMyClients } from "../../../lib/master-api";
import { useT } from "../../../lib/i18n";
import { useColors, useThemedStyles } from "../../../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../../../theme";

const DEMO: MasterClient[] = [
  { id: "1", name: "Азиза Каримова", phone: "", notes: null, visits: 12, last_visit: new Date().toISOString() },
  { id: "2", name: "Дмитрий Соколов", phone: "", notes: null, visits: 8, last_visit: new Date(Date.now() - 6e8).toISOString() },
  { id: "3", name: "Бахтиёр Хакимов", phone: "", notes: null, visits: 1, last_visit: new Date(Date.now() - 3e9).toISOString() },
];
const CHIPS = ["Все", "Постоянные", "Новые"];

function shortDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "—" : `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

export default function Clients() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [q, setQ] = useState("");
  const [chip, setChip] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const { data: remote, loading, reload } = useMyClients();
  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const source = masterConfigured && remote ? remote : DEMO;
  const showLoading = masterConfigured && remote === null && loading;
  const list = source
    .filter((c) => (q ? c.name.toLowerCase().includes(q.toLowerCase()) : true))
    .filter((c) => (chip === 1 ? c.visits >= 3 : chip === 2 ? c.visits <= 1 : true));

  const onRefresh = async () => { setRefreshing(true); await reload(); setRefreshing(false); };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>{t("Клиенты")}</AppText>
        <AppText variant="labelMd" color={colors.secondary}>{t("{count} чел.", { count: source.length })}</AppText>
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

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 120, gap: space.sm }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}
      >
        {showLoading ? <Loading /> : list.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 64, gap: 12 }}>
            <Sym name="group" size={44} color={colors.outlineVariant} />
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center" }}>
              {q ? t("Никого не найдено") : t("Клиенты появятся после первых записей.")}
            </AppText>
          </View>
        ) : (
          list.map((c) => (
            <Pressable key={c.id} onPress={() => router.push(`/(master)/client/${c.id}`)}>
              <View style={[styles.row, cardShadow]}>
                <Avatar initial={initialOf(c.name)} size={48} round tint={colors.surfaceMid} fg={colors.inkVariant} />
                <View style={{ flex: 1 }}>
                  <AppText variant="labelMd" color={colors.ink}>{c.name}</AppText>
                  <AppText variant="labelSm" color={colors.secondary}>{t("Визитов: {count} · Последний: {date}", { count: c.visits, date: shortDate(c.last_visit) })}</AppText>
                </View>
                <Sym name="chevron-right" size={22} color={colors.secondary} />
              </View>
            </Pressable>
          ))
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
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 12 },
});

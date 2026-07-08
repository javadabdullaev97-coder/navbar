import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Loading, Sym } from "../../components/ui";
import { initialOf, supabaseConfigured, useSearchMasters } from "../../lib/data";
import { fmtMoney } from "../../lib/format";
import { colors, radius, space } from "../../theme";

type SortKey = "rating" | "price";
const SORT_LABEL: Record<SortKey, string> = { rating: "По рейтингу", price: "По цене" };

type Item = { key: string; initial: string; name: string; spec: string; rating: string; dist: string; price: string };
const DEMO: Item[] = [
  { key: "1", initial: "А", name: "Д-р Алишер Усманов", spec: "Психолог", rating: "5.0", dist: "0.8 км", price: "300 000 сум" },
  { key: "2", initial: "Е", name: "Елена Ким", spec: "Семейный психолог", rating: "4.8", dist: "2.5 км", price: "250 000 сум" },
  { key: "3", initial: "С", name: "Санжар Махмудов", spec: "Гештальт-терапевт", rating: "4.9", dist: "3.1 км", price: "200 000 сум" },
];

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const { data: remote, reload } = useSearchMasters(q);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortKey>("rating");
  const [topRated, setTopRated] = useState(false);
  const onRefresh = async () => { setRefreshing(true); await reload(); setRefreshing(false); };

  const loading = supabaseConfigured && remote === null;
  const results: Item[] = supabaseConfigured
    ? (remote ?? [])
        .filter((m) => (topRated ? (m.rating ?? 0) >= 4.5 : true))
        .slice()
        .sort((a, b) =>
          sort === "rating"
            ? (b.rating ?? 0) - (a.rating ?? 0)
            : (a.min_price ?? Infinity) - (b.min_price ?? Infinity)
        )
        .map((m) => ({ key: m.slug, initial: initialOf(m.name), name: m.name, spec: m.specialization ?? m.category ?? "", rating: m.rating ? m.rating.toFixed(1) : "—", dist: "", price: m.min_price ? fmtMoney(m.min_price) : "" }))
    : DEMO;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <Sym name="search" size={20} color={colors.outline} />
          <TextInput value={q} onChangeText={setQ} placeholder="Найти специалиста или услугу" placeholderTextColor={colors.outline} style={styles.searchInput} />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={8}><Sym name="close" size={18} color={colors.secondary} /></Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filters}>
        <Pressable onPress={() => setTopRated((v) => !v)} style={[styles.fchip, topRated ? styles.fOn : styles.fOff]}>
          <Sym name="star" size={16} color={topRated ? colors.onAccent : colors.gold} />
          <AppText variant="labelMd" color={topRated ? colors.onAccent : colors.inkVariant}>Рейтинг 4.5+</AppText>
        </Pressable>
        <Pressable onPress={() => setSort("rating")} style={[styles.fchip, sort === "rating" ? styles.fOn : styles.fOff]}>
          <AppText variant="labelMd" color={sort === "rating" ? colors.onAccent : colors.inkVariant}>Сначала рейтинг</AppText>
        </Pressable>
        <Pressable onPress={() => setSort("price")} style={[styles.fchip, sort === "price" ? styles.fOn : styles.fOff]}>
          <AppText variant="labelMd" color={sort === "price" ? colors.onAccent : colors.inkVariant}>Сначала дешевле</AppText>
        </Pressable>
      </ScrollView>

      <View style={styles.head}>
        <AppText variant="headlineMd" color={colors.ink}>Специалисты</AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <AppText variant="labelMd" color={colors.secondary}>{SORT_LABEL[sort]}</AppText>
          <Sym name="swap-vert" size={16} color={colors.secondary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24, gap: space.md }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}>
        {loading && <Loading />}
        {!loading && results.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 48 }}><AppText variant="bodyMd" color={colors.secondary}>Ничего не найдено</AppText></View>
        )}
        {!loading && results.map((s) => (
          <Pressable key={s.key} onPress={() => router.push(`/specialist/${s.key}`)}>
            <Card padding={12} style={{ flexDirection: "row", gap: space.md }}>
              <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
              <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 2 }}>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                      <Sym name="star" size={16} color={colors.gold} />
                      <AppText variant="labelSm" color={colors.ink}>{s.rating}</AppText>
                    </View>
                  </View>
                  <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{s.spec}</AppText>
                  {s.dist ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 8 }}>
                      <Sym name="location-on" size={14} color={colors.secondary} />
                      <AppText variant="labelSm" color={colors.secondary}>{s.dist}</AppText>
                    </View>
                  ) : null}
                </View>
                {s.price ? (
                  <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "baseline", gap: 4 }}>
                    <AppText variant="labelSm" color={colors.secondary}>от</AppText>
                    <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText>
                  </View>
                ) : null}
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  searchWrap: { paddingHorizontal: space.margin, paddingTop: space.sm, paddingBottom: space.sm },
  search: { flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 16, backgroundColor: colors.surfaceLow, borderRadius: radius.xl },
  searchInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  filterBar: { flexGrow: 0, maxHeight: 52 },
  filters: { paddingHorizontal: space.margin, gap: 8, alignItems: "center" },
  fchip: { flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.full },
  fOn: { backgroundColor: colors.accent },
  fOff: { backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.outlineVariant },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: space.margin, paddingTop: space.md, paddingBottom: space.md },
});

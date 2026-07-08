import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Loading, Sym } from "../../components/ui";
import { initialOf, supabaseConfigured, useCatalog } from "../../lib/data";
import { fmtMoney } from "../../lib/format";
import { colors, radius, space } from "../../theme";

type Item = { key: string; initial: string; name: string; spec: string; rating: string; reviews: string; dist: string; price: string };
const DEMO: Item[] = [
  { key: "1", initial: "А", name: "Анна Маринина", spec: "Клинический психолог", rating: "4.9", reviews: "42", dist: "1.2 км", price: "от 150 000 сум" },
  { key: "2", initial: "А", name: "Артур Хакимов", spec: "Гештальт-терапевт", rating: "4.8", reviews: "118", dist: "2.5 км", price: "от 220 000 сум" },
  { key: "3", initial: "Е", name: "Елена Громова", spec: "Семейный консультант", rating: "5.0", reviews: "89", dist: "0.8 км", price: "от 300 000 сум" },
];

export default function Category() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const title = typeof slug === "string" ? slug : "Специалисты";
  const remote = useCatalog(title);
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  const loading = supabaseConfigured && remote === null;
  const rows: Item[] = supabaseConfigured
    ? (remote ?? []).map((m) => ({ key: m.slug, initial: initialOf(m.name), name: m.name, spec: m.specialization ?? m.category ?? "", rating: m.rating ? m.rating.toFixed(1) : "—", reviews: String(m.review_count), dist: "", price: m.min_price ? `от ${fmtMoney(m.min_price)}` : "" }))
    : DEMO;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={24} color={colors.accent} /></Pressable>
          <View>
            <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20 }}>{title}</AppText>
            <AppText variant="labelSm" color={colors.secondary}>{loading ? "Загрузка…" : `${rows.length} специалистов`}</AppText>
          </View>
        </View>
        <Sym name="search" size={24} color={colors.secondary} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={styles.filters}>
        <View style={[styles.fchip, styles.fOff]}><Sym name="tune" size={18} color={colors.inkVariant} /><AppText variant="labelMd" color={colors.inkVariant}>Фильтры</AppText></View>
        <View style={[styles.fchip, styles.fOff]}><AppText variant="labelMd" color={colors.inkVariant}>Рядом</AppText></View>
        <View style={[styles.fchip, styles.fOn]}><AppText variant="labelMd" color={colors.onAccent}>Рейтинг 4.5+</AppText></View>
      </ScrollView>

      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24, gap: space.md, paddingTop: space.sm }} showsVerticalScrollIndicator={false}>
        {loading && <Loading />}
        {!loading && rows.length === 0 && (
          <View style={{ alignItems: "center", paddingVertical: 48 }}><AppText variant="bodyMd" color={colors.secondary}>В этой категории пока пусто</AppText></View>
        )}
        {!loading && rows.map((s) => (
          <Pressable key={s.key} onPress={() => router.push(`/specialist/${s.key}`)}>
            <Card padding={16} style={{ flexDirection: "row", gap: space.md }}>
              <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <AppText variant="labelMd" color={colors.accent} style={{ fontSize: 16 }}>{s.name}</AppText>
                    <Pressable hitSlop={8} onPress={() => setSaved((r) => ({ ...r, [s.key]: !r[s.key] }))}>
                      <Sym name={saved[s.key] ? "bookmark" : "bookmark-border"} size={22} color={saved[s.key] ? colors.accent : colors.secondary} />
                    </Pressable>
                  </View>
                  <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{s.spec}</AppText>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                    <Sym name="star" size={16} color={colors.gold} />
                    <AppText variant="labelMd" color={colors.ink} style={{ fontSize: 13 }}>{s.rating} <AppText variant="labelSm" color={colors.secondary}>({s.reviews})</AppText></AppText>
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                  {s.dist ? <View style={styles.distPill}><AppText variant="labelSm" color={colors.inkVariant}>{s.dist}</AppText></View> : <View />}
                  {s.price ? <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText> : null}
                </View>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  filterBar: { flexGrow: 0, maxHeight: 60 },
  filters: { paddingHorizontal: space.margin, gap: 12, alignItems: "center", paddingVertical: space.sm },
  fchip: { flexDirection: "row", alignItems: "center", gap: 6, height: 40, paddingHorizontal: 16, borderRadius: radius.full },
  fOn: { backgroundColor: colors.accent },
  fOff: { backgroundColor: colors.surfaceLow },
  distPill: { backgroundColor: colors.surfaceMid, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.lg },
});

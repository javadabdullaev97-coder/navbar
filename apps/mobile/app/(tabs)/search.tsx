import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

const FILTERS = [
  { label: "Фильтры", icon: "tune" as const },
  { label: "Рядом" },
  { label: "Рейтинг 4.5+", on: true },
  { label: "Свободно сегодня", on: true },
];

const RESULTS = [
  { id: "1", initial: "А", name: "Д-р Алишер Усманов", spec: "Психолог", rating: "5.0", dist: "0.8 км", price: "300 000 сум" },
  { id: "2", initial: "Е", name: "Елена Ким", spec: "Семейный психолог", rating: "4.8", dist: "2.5 км", price: "250 000 сум" },
  { id: "3", initial: "С", name: "Санжар Махмудов", spec: "Гештальт-терапевт", rating: "4.9", dist: "3.1 км", price: "200 000 сум" },
  { id: "4", initial: "М", name: "Мария Иванова", spec: "Детский психолог", rating: "4.7", dist: "4.2 км", price: "280 000 сум" },
];

export default function Search() {
  const router = useRouter();
  const [q, setQ] = useState("психолог");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Поиск */}
      <View style={styles.searchWrap}>
        <View style={styles.search}>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Поиск"
            placeholderTextColor={colors.outline}
            style={styles.searchInput}
          />
          {q ? (
            <Pressable onPress={() => setQ("")} hitSlop={8}>
              <Sym name="close" size={18} color={colors.secondary} />
            </Pressable>
          ) : (
            <Sym name="search" size={20} color={colors.outline} />
          )}
        </View>
      </View>

      {/* Фильтры */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((f) => (
          <View key={f.label} style={[styles.fchip, f.on ? styles.fOn : styles.fOff]}>
            {f.icon ? <Sym name={f.icon} size={16} color={f.on ? colors.onAccent : colors.inkVariant} /> : null}
            <AppText variant="labelMd" color={f.on ? colors.onAccent : colors.inkVariant}>{f.label}</AppText>
          </View>
        ))}
      </ScrollView>

      {/* Заголовок + сортировка */}
      <View style={styles.head}>
        <AppText variant="headlineMd" color={colors.ink}>Специалисты</AppText>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <AppText variant="labelMd" color={colors.secondary}>Сортировка</AppText>
          <Sym name="expand-more" size={16} color={colors.secondary} />
        </View>
      </View>

      {/* Результаты */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24, gap: space.md }} showsVerticalScrollIndicator={false}>
        {RESULTS.map((s) => (
          <Pressable key={s.id} onPress={() => router.push(`/specialist/${s.id}`)}>
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
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 2, marginTop: 8 }}>
                    <Sym name="location-on" size={14} color={colors.secondary} />
                    <AppText variant="labelSm" color={colors.secondary}>{s.dist}</AppText>
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "flex-end", alignItems: "baseline", gap: 4 }}>
                  <AppText variant="labelSm" color={colors.secondary}>от</AppText>
                  <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText>
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
  searchWrap: { paddingHorizontal: space.margin, paddingTop: space.sm, paddingBottom: space.sm },
  search: {
    flexDirection: "row", alignItems: "center", gap: 8, height: 48, paddingHorizontal: 16,
    backgroundColor: colors.surfaceLow, borderRadius: radius.xl,
  },
  searchInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  filters: { paddingHorizontal: space.margin, gap: 8, paddingVertical: 4 },
  fchip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
  fOn: { backgroundColor: colors.accent },
  fOff: { backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.outlineVariant },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: space.margin, paddingTop: space.md, paddingBottom: space.md },
});

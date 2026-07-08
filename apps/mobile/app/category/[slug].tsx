import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

const LIST = [
  { id: "1", initial: "А", name: "Анна Маринина", spec: "Клинический психолог", rating: "4.9", reviews: "42", dist: "1.2 км", price: "от 150 000 сум" },
  { id: "2", initial: "А", name: "Артур Хакимов", spec: "Гештальт-терапевт", rating: "4.8", reviews: "118", dist: "2.5 км", price: "от 220 000 сум" },
  { id: "3", initial: "Е", name: "Елена Громова", spec: "Семейный консультант", rating: "5.0", reviews: "89", dist: "0.8 км", price: "от 300 000 сум", saved: true },
  { id: "4", initial: "В", name: "Виктор Степанов", spec: "Психоаналитик", rating: "4.7", reviews: "15", dist: "3.4 км", price: "от 180 000 сум" },
];

export default function Category() {
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const title = typeof slug === "string" ? slug : "Психологи";
  const [saved, setSaved] = useState<Record<string, boolean>>({ "3": true });

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* Шапка */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <Sym name="arrow-back" size={24} color={colors.accent} />
          </Pressable>
          <View>
            <AppText variant="headlineMd" color={colors.accent} style={{ fontSize: 20 }}>{title}</AppText>
            <AppText variant="labelSm" color={colors.secondary}>128 специалистов</AppText>
          </View>
        </View>
        <Sym name="search" size={24} color={colors.secondary} />
      </View>

      {/* Фильтры */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        <View style={[styles.fchip, styles.fOff]}>
          <Sym name="tune" size={18} color={colors.inkVariant} />
          <AppText variant="labelMd" color={colors.inkVariant}>Фильтры</AppText>
        </View>
        <View style={[styles.fchip, styles.fOff]}><AppText variant="labelMd" color={colors.inkVariant}>Рядом</AppText></View>
        <View style={[styles.fchip, styles.fOn]}><AppText variant="labelMd" color={colors.onAccent}>Рейтинг 4.5+</AppText></View>
      </ScrollView>

      {/* Список */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: space.margin, paddingBottom: 24, gap: space.md, paddingTop: space.sm }} showsVerticalScrollIndicator={false}>
        {LIST.map((s) => (
          <Pressable key={s.id} onPress={() => router.push(`/specialist/${s.id}`)}>
            <Card padding={16} style={{ flexDirection: "row", gap: space.md }}>
              <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
              <View style={{ flex: 1, justifyContent: "space-between" }}>
                <View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <AppText variant="labelMd" color={colors.accent} style={{ fontSize: 16 }}>{s.name}</AppText>
                    <Pressable hitSlop={8} onPress={() => setSaved((r) => ({ ...r, [s.id]: !r[s.id] }))}>
                      <Sym name={saved[s.id] ? "bookmark" : "bookmark-border"} size={22} color={saved[s.id] ? colors.accent : colors.secondary} />
                    </Pressable>
                  </View>
                  <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{s.spec}</AppText>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 }}>
                    <Sym name="star" size={16} color={colors.gold} />
                    <AppText variant="labelMd" color={colors.ink} style={{ fontSize: 13 }}>
                      {s.rating} <AppText variant="labelSm" color={colors.secondary}>({s.reviews} отзыва)</AppText>
                    </AppText>
                  </View>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 8 }}>
                  <View style={styles.distPill}><AppText variant="labelSm" color={colors.inkVariant}>{s.dist}</AppText></View>
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
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, height: 56 },
  filters: { paddingHorizontal: space.margin, gap: 12, paddingVertical: space.md },
  fchip: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full },
  fOn: { backgroundColor: colors.accent },
  fOff: { backgroundColor: colors.surfaceLow },
  distPill: { backgroundColor: colors.surfaceMid, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.lg },
});

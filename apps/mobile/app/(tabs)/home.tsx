import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { cardShadow, colors, radius, space } from "../../theme";

const CATS = ["Барберы", "Ногти", "Психологи", "Массаж", "Репетиторы", "Врачи", "Ещё"];

const NEAR = [
  { id: "1", initial: "Р", name: "Рустам Ахмедов", spec: "Топ-барбер", rating: "4.9", dist: "1.2 км", price: "от 80 000 сум" },
  { id: "2", initial: "Д", name: "Дильноза Каримова", spec: "Senior Stylist", rating: "4.8", dist: "0.8 км", price: "от 120 000 сум" },
];

const POPULAR = [
  { id: "3", initial: "С", name: "Доктор Санжар", spec: "Психолог • 10 лет опыта", rating: "5.0", dist: "2.5 км", price: "от 250 000 сум" },
  { id: "4", initial: "А", name: "Алина Ким", spec: "Персональный тренер", rating: "4.9", dist: "3.1 км", price: "от 150 000 сум" },
];

function Stars({ value }: { value: string }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
      <Sym name="star" size={14} color={colors.gold} />
      <AppText variant="labelSm" color={colors.ink}>{value}</AppText>
    </View>
  );
}

export default function Home() {
  const router = useRouter();
  const go = (id: string) => router.push(`/specialist/${id}`);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Шапка */}
        <View style={styles.header}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <AppText variant="headlineMd" color={colors.accent}>Привет, Азиз</AppText>
              <View style={styles.locChip}>
                <Sym name="location-on" size={14} color={colors.outline} />
                <AppText variant="labelSm" color={colors.inkVariant}>Ташкент</AppText>
              </View>
            </View>
            <Avatar initial="А" size={40} round tint={colors.surfaceMid} fg={colors.inkVariant} />
          </View>

          {/* Поиск */}
          <View style={styles.search}>
            <Sym name="search" size={22} color={colors.outline} />
            <TextInput
              placeholder="Найти специалиста или услугу"
              placeholderTextColor={colors.outline}
              style={styles.searchInput}
            />
          </View>
        </View>

        {/* Категории */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.margin, gap: 12, paddingTop: space.md }}
        >
          {CATS.map((c, i) => (
            <View key={c} style={[styles.cat, i === 0 ? styles.catOn : styles.catOff]}>
              <AppText variant="labelMd" color={i === 0 ? colors.onAccent : colors.inkVariant}>{c}</AppText>
            </View>
          ))}
        </ScrollView>

        {/* Рядом с вами */}
        <View style={styles.sectionHead}>
          <AppText variant="headlineMd" color={colors.accent}>Рядом с вами</AppText>
          <AppText variant="labelMd" color={colors.accent}>Все</AppText>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: space.margin, gap: space.md }}
        >
          {NEAR.map((s) => (
            <Pressable key={s.id} onPress={() => go(s.id)} style={[styles.nearCard, cardShadow]}>
              <View style={styles.nearPhoto}>
                <AppText style={styles.nearInitial} color={colors.inkVariant}>{s.initial}</AppText>
                <View style={styles.ratingBadge}>
                  <Sym name="star" size={13} color={colors.gold} />
                  <AppText variant="labelSm" color={colors.ink}>{s.rating}</AppText>
                </View>
                <View style={styles.distBadge}>
                  <AppText variant="labelSm" color={colors.onAccent}>{s.dist}</AppText>
                </View>
              </View>
              <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
              <AppText variant="labelSm" color={colors.inkVariant} style={{ marginTop: 2 }}>{s.spec}</AppText>
              <AppText variant="labelMd" color={colors.accent} style={{ marginTop: 14, textAlign: "right" }}>{s.price}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Популярные */}
        <View style={[styles.sectionHead, { marginTop: space.lg }]}>
          <AppText variant="headlineMd" color={colors.accent}>Популярные</AppText>
        </View>
        <View style={{ paddingHorizontal: space.margin, gap: space.md }}>
          {POPULAR.map((s) => (
            <Pressable key={s.id} onPress={() => go(s.id)}>
              <Card padding={12} style={{ flexDirection: "row", gap: space.md }}>
                <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
                <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 4 }}>
                  <View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                      <Stars value={s.rating} />
                    </View>
                    <AppText variant="labelSm" color={colors.inkVariant} style={{ marginTop: 2 }}>{s.spec}</AppText>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={styles.distPill}>
                      <AppText variant="labelSm" color={colors.inkVariant}>{s.dist}</AppText>
                    </View>
                    <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, paddingTop: space.sm, gap: space.md },
  locChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceLow,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
    marginTop: 4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.xl,
  },
  searchInput: { flex: 1, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink },
  cat: { height: 40, paddingHorizontal: 24, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  catOn: { backgroundColor: colors.accent },
  catOff: { backgroundColor: colors.surfaceLow },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: space.margin,
    marginTop: space.lg,
    marginBottom: space.md,
  },
  nearCard: { width: 256, backgroundColor: colors.surface, borderRadius: radius.xl, padding: 12 },
  nearPhoto: { position: "relative", width: "100%", aspectRatio: 1, borderRadius: radius.xl, overflow: "hidden", marginBottom: 12, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  nearInitial: { fontFamily: "LibreCaslonText_400Regular", fontSize: 64 },
  ratingBadge: {
    position: "absolute", top: 8, left: 8, flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(255,255,255,0.9)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full,
  },
  distBadge: {
    position: "absolute", bottom: 8, left: 8,
    backgroundColor: "rgba(6,78,59,0.85)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full,
  },
  distPill: { backgroundColor: colors.surfaceLow, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.full },
});

import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

const CATS = ["Все", "Красота", "Терапия", "Здоровье"];

const SAVED = [
  { id: "1", initial: "Е", name: "Елена Белова", spec: "Стилист · салон Mood", rating: "4.9", next: "Сегодня, 15:30", price: "от 250 000 сум" },
  { id: "2", initial: "А", name: "Азиз Рахимов", spec: "Барбер · Chop Shop", rating: "5.0", next: "Завтра", price: "от 180 000 сум" },
  { id: "3", initial: "М", name: "Д-р Марина Ким", spec: "Дерматолог · Clear Skin", rating: "4.8", next: "12 июля", price: "от 400 000 сум" },
];

export default function Saved() {
  const router = useRouter();
  const [cat, setCat] = useState(0);
  const [removed, setRemoved] = useState<Record<string, boolean>>({});

  const list = SAVED.filter((s) => !removed[s.id]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>Мои специалисты</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        {/* Категории */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.margin, gap: 8, marginBottom: space.md }}>
          {CATS.map((c, i) => (
            <Pressable key={c} onPress={() => setCat(i)} style={[styles.chip, i === cat ? styles.chipOn : styles.chipOff]}>
              <AppText variant="labelSm" color={i === cat ? colors.onAccent : colors.secondary}>{c}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <AppText variant="labelMd" color={colors.secondary}>Сохранено: {list.length}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Sym name="tune" size={18} color={colors.accent} />
            <AppText variant="labelMd" color={colors.accent}>Сортировка</AppText>
          </View>
        </View>

        {list.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 64, gap: 12 }}>
            <Sym name="bookmark-border" size={56} color={colors.surfaceHighest} />
            <AppText variant="headlineMd" color={colors.ink}>Список пуст</AppText>
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 260 }}>
              Добавляйте специалистов в свой список, чтобы записываться быстрее.
            </AppText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: space.margin, gap: space.md }}>
            {list.map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/specialist/${s.id}`)}>
                <Card padding={12} style={{ flexDirection: "row", gap: space.md }}>
                  <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
                  <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                        <AppText variant="labelSm" color={colors.secondary}>{s.spec}</AppText>
                      </View>
                      <Pressable hitSlop={8} onPress={() => setRemoved((r) => ({ ...r, [s.id]: true }))}>
                        <Sym name="bookmark" size={22} color={colors.accent} />
                      </Pressable>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                      <Sym name="star" size={14} color={colors.gold} />
                      <AppText variant="labelSm" color={colors.ink}>{s.rating}</AppText>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                      <AppText variant="labelSm" color={colors.secondary}>Ближайшее: {s.next}</AppText>
                      <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText>
                    </View>
                  </View>
                </Card>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, height: 56, justifyContent: "center" },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.full },
  chipOn: { backgroundColor: colors.accent },
  chipOff: { backgroundColor: colors.surfaceLow },
  countRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingHorizontal: space.margin, marginBottom: space.md },
});

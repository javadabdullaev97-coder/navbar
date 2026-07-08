import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Card, Loading, Sym } from "../../components/ui";
import { getFavorites, toggleFavorite } from "../../lib/api";
import { initialOf, supabaseConfigured } from "../../lib/data";
import { useT } from "../../lib/i18n";
import { colors, radius, space } from "../../theme";

const CATS = ["Все", "Красота", "Терапия", "Здоровье"];
// Грубое сопоставление категории по тексту специализации.
const CAT_KEYWORDS: Record<string, RegExp> = {
  Красота: /барбер|ногт|маник|педикюр|стил|макияж|бров|ресниц|космет|причес|волос|визаж|beauty|nail|hair/i,
  Терапия: /психолог|психотерап|терап|коуч|гештальт|консультант/i,
  Здоровье: /врач|доктор|дерматолог|массаж|медиц|стомат|нутрициолог|health/i,
};

type Item = { key: string; initial: string; name: string; spec: string; rating?: string; next?: string; price?: string };
const DEMO: Item[] = [
  { key: "1", initial: "Е", name: "Елена Белова", spec: "Стилист · салон Mood", rating: "4.9", next: "Сегодня, 15:30", price: "от 250 000 сум" },
  { key: "2", initial: "А", name: "Азиз Рахимов", spec: "Барбер · Chop Shop", rating: "5.0", next: "Завтра", price: "от 180 000 сум" },
  { key: "3", initial: "М", name: "Д-р Марина Ким", spec: "Дерматолог · Clear Skin", rating: "4.8", next: "12 июля", price: "от 400 000 сум" },
];

export default function Saved() {
  const router = useRouter();
  const t = useT();
  const [cat, setCat] = useState(0);
  const [remote, setRemote] = useState<Item[] | null>(null);
  const [removed, setRemoved] = useState<Record<string, boolean>>({});
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!supabaseConfigured) return;
      let alive = true;
      getFavorites()
        .then((f) => alive && setRemote(f.map((x) => ({ key: x.slug, initial: initialOf(x.name), name: x.name, spec: x.specialization ?? "" }))))
        .catch(() => alive && setRemote([]));
      return () => { alive = false; };
    }, [])
  );

  const onRefresh = async () => {
    if (!supabaseConfigured) return;
    setRefreshing(true);
    try {
      const f = await getFavorites();
      setRemote(f.map((x) => ({ key: x.slug, initial: initialOf(x.name), name: x.name, spec: x.specialization ?? "" })));
      setRemoved({});
    } catch { setRemote([]); } finally { setRefreshing(false); }
  };

  const loading = supabaseConfigured && remote === null;
  const source = supabaseConfigured ? (remote ?? []) : DEMO;
  const catName = CATS[cat];
  const list = source
    .filter((s) => !removed[s.key])
    .filter((s) => (catName === "Все" ? true : CAT_KEYWORDS[catName]?.test(s.spec ?? "")));

  async function remove(key: string) {
    setRemoved((r) => ({ ...r, [key]: true }));
    if (supabaseConfigured && remote) {
      try { await toggleFavorite(key); } catch { /* игнор */ }
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}><AppText variant="headlineMd" color={colors.accent}>{t("Мои специалисты")}</AppText></View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} />}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.margin, gap: 8, marginBottom: space.md }}>
          {CATS.map((c, i) => (
            <Pressable key={c} onPress={() => setCat(i)} style={[styles.chip, i === cat ? styles.chipOn : styles.chipOff]}>
              <AppText variant="labelSm" color={i === cat ? colors.onAccent : colors.secondary}>{t(c)}</AppText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.countRow}>
          <AppText variant="labelMd" color={colors.secondary}>{t("Сохранено: {count}", { count: list.length })}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Sym name="tune" size={18} color={colors.accent} />
            <AppText variant="labelMd" color={colors.accent}>{t("Сортировка")}</AppText>
          </View>
        </View>

        {loading ? <Loading /> : list.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 64, gap: 12 }}>
            <Sym name="bookmark-border" size={56} color={colors.surfaceHighest} />
            <AppText variant="headlineMd" color={colors.ink}>{t("Список пуст")}</AppText>
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 260 }}>
              {t("Добавляйте специалистов в свой список, чтобы записываться быстрее.")}
            </AppText>
          </View>
        ) : (
          <View style={{ paddingHorizontal: space.margin, gap: space.md }}>
            {list.map((s) => (
              <Pressable key={s.key} onPress={() => router.push(`/specialist/${s.key}`)}>
                <Card padding={12} style={{ flexDirection: "row", gap: space.md }}>
                  <Avatar initial={s.initial} size={96} tint={colors.surfaceMid} fg={colors.inkVariant} />
                  <View style={{ flex: 1, justifyContent: "space-between", paddingVertical: 4 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <View style={{ flex: 1 }}>
                        <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                        <AppText variant="labelSm" color={colors.secondary}>{s.spec}</AppText>
                      </View>
                      <Pressable hitSlop={8} onPress={() => remove(s.key)}>
                        <Sym name="bookmark" size={22} color={colors.accent} />
                      </Pressable>
                    </View>
                    {s.rating ? (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                        <Sym name="star" size={14} color={colors.gold} />
                        <AppText variant="labelSm" color={colors.ink}>{s.rating}</AppText>
                      </View>
                    ) : null}
                    {(s.next || s.price) ? (
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
                        <AppText variant="labelSm" color={colors.secondary}>{s.next ? t("Ближайшее: {next}", { next: s.next }) : ""}</AppText>
                        {s.price ? <AppText variant="labelMd" color={colors.accent}>{s.price}</AppText> : null}
                      </View>
                    ) : null}
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

import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Avatar, Loading, PrimaryButton, Sym } from "../../components/ui";
import { toggleFavorite } from "../../lib/api";
import { initialOf, supabaseConfigured, useMaster, useReviews } from "../../lib/data";
import { fmtMoney } from "../../lib/format";
import { useStore } from "../../lib/store";
import { cardShadow, colors, radius, space } from "../../theme";

function reviewDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

const TABS = ["Услуги", "Портфолио", "Отзывы"] as const;

const DEMO = {
  slug: "",
  name: "Дилноза Каримова",
  spec: "Клинический психолог, 8 лет опыта",
  rating: 4.9,
  reviews: 213,
  address: "Ташкент, Мирабад",
  bio: "Помогаю находить гармонию с собой и окружающими. Использую когнитивно-поведенческую терапию и гештальт-подход, адаптируя методы под запрос каждого клиента.",
  services: [
    { id: "d1", name: "Индивидуальная консультация", duration_min: 50, price: 180000 },
    { id: "d2", name: "Семейная терапия", duration_min: 90, price: 250000 },
    { id: "d3", name: "Онлайн-сессия", duration_min: 50, price: 150000 },
  ],
  availability: null,
};

export default function Specialist() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { master, reload } = useMaster(id);
  const { data: reviewList, loading: reviewsLoading, reload: reloadReviews } = useReviews(master?.slug);
  const { patchDraft } = useStore();
  const [tab, setTab] = useState(0);
  const [saved, setSaved] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([reload(), reloadReviews()]);
    setRefreshing(false);
  };

  // Обновляем отзывы при каждом возврате на экран (после отправки нового).
  useFocusEffect(useCallback(() => { reloadReviews(); }, [reloadReviews]));

  const name = master?.name ?? DEMO.name;
  const spec = master ? (master.specialization ?? master.category ?? "") : DEMO.spec;
  const rating = master?.rating ?? DEMO.rating;
  const reviews = master?.review_count ?? DEMO.reviews;
  const address = master?.address ?? DEMO.address;
  const bio = master?.bio ?? DEMO.bio;
  const services = master?.services ?? DEMO.services;
  const initial = initialOf(name);

  function startBooking(pre?: { id: string; name: string; duration_min: number; price: number }) {
    const chosen = pre ?? services[0];
    patchDraft({
      slug: master?.slug ?? "",
      specialist: name,
      initial,
      spec,
      address,
      availability: master?.availability ?? null,
      serviceOptions: services,
      service: chosen?.name ?? "",
      serviceIds: chosen ? [chosen.id] : [],
      price: chosen?.price ?? 0,
      duration: chosen?.duration_min ?? 50,
    });
    router.push("/booking/service");
  }

  return (
    <View style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} colors={[colors.accent]} progressViewOffset={80} />}>
        <View style={styles.cover} />
        <SafeAreaView edges={["top"]} style={styles.floatBar} pointerEvents="box-none">
          <Pressable style={styles.circleBtn} onPress={() => router.back()}>
            <Sym name="arrow-back" size={22} color={colors.accent} />
          </Pressable>
          <Pressable style={styles.circleBtn} onPress={() => { setSaved((s) => !s); if (supabaseConfigured && master?.slug) toggleFavorite(master.slug).catch(() => {}); }}>
            <Sym name={saved ? "bookmark" : "bookmark-border"} size={22} color={colors.accent} />
          </Pressable>
        </SafeAreaView>

        <View style={styles.head}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarInitial} color={colors.inkVariant}>{initial}</AppText>
          </View>
          <AppText variant="displayLg" color={colors.accent} style={{ marginTop: 10 }}>{name}</AppText>
          <AppText variant="labelMd" color={colors.secondary} style={{ marginTop: 2 }}>{spec}</AppText>
          <View style={styles.metaRow}>
            <Sym name="star" size={18} color={colors.gold} />
            <AppText variant="labelMd" color={colors.ink}>{rating ? rating.toFixed(1) : "—"}</AppText>
            <AppText variant="labelSm" color={colors.secondary}>({reviews} отзывов)</AppText>
          </View>
          <View style={styles.locRow}>
            <Sym name="location-on" size={16} color={colors.secondary} />
            <AppText variant="labelSm" color={colors.secondary}>{address} ·</AppText>
            <AppText variant="labelSm" color={colors.accent} style={{ textDecorationLine: "underline" }}>на карте</AppText>
          </View>
        </View>

        <View style={styles.tabs}>
          {TABS.map((t, i) => (
            <Pressable key={t} onPress={() => setTab(i)} style={[styles.tab, i === tab && styles.tabOn]}>
              <AppText variant="labelMd" color={i === tab ? colors.onAccent : colors.secondary}>{t}</AppText>
            </Pressable>
          ))}
        </View>

        {tab === 0 && (
          <View style={{ paddingHorizontal: space.margin, gap: space.md, marginTop: space.md }}>
            {services.map((s) => (
              <Pressable key={s.id} onPress={() => startBooking(s)}>
                <View style={[styles.service, cardShadow]}>
                  <View style={{ gap: 4 }}>
                    <AppText variant="labelMd" color={colors.ink}>{s.name}</AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Sym name="schedule" size={14} color={colors.secondary} />
                      <AppText variant="labelSm" color={colors.secondary}>{s.duration_min} мин</AppText>
                    </View>
                    <AppText variant="labelMd" color={colors.accent}>{fmtMoney(s.price)}</AppText>
                  </View>
                  <View style={styles.serviceBtn}><Sym name="chevron-right" size={22} color={colors.accent} /></View>
                </View>
              </Pressable>
            ))}

            <AppText variant="headlineMd" color={colors.accent} style={{ marginTop: space.lg }}>О себе</AppText>
            <AppText variant="bodyMd" color={colors.secondary}>{bio}</AppText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: space.sm }}>
              <View style={[styles.pill, { backgroundColor: colors.infoBg }]}>
                <Sym name="verified" size={14} color={colors.infoText} />
                <AppText variant="labelSm" color={colors.infoText}>Диплом проверен</AppText>
              </View>
              <View style={[styles.pill, { backgroundColor: colors.successBg }]}>
                <Sym name="check-circle" size={14} color={colors.successText} />
                <AppText variant="labelSm" color={colors.successText}>Принимает очно</AppText>
              </View>
            </View>
          </View>
        )}
        {tab === 1 && (
          (master?.portfolio?.length ?? 0) === 0 ? (
            <Empty text="Портфолио пока пусто" />
          ) : (
            <View style={styles.gallery}>
              {master!.portfolio.map((p, i) => (
                <View key={i} style={styles.galleryItem}>
                  <Image source={{ uri: p.url }} style={styles.galleryImg} resizeMode="cover" />
                  {p.caption ? (
                    <AppText variant="labelSm" color={colors.secondary} numberOfLines={1} style={{ marginTop: 4 }}>{p.caption}</AppText>
                  ) : null}
                </View>
              ))}
            </View>
          )
        )}
        {tab === 2 && (
          <View style={{ paddingHorizontal: space.margin, marginTop: space.md, gap: space.md }}>
            <Pressable
              style={styles.leaveReview}
              onPress={() => router.push({ pathname: "/review", params: { slug: master?.slug ?? "" } })}
            >
              <Sym name="rate-review" size={20} color={colors.accent} />
              <AppText variant="labelMd" color={colors.accent}>Оставить отзыв</AppText>
            </Pressable>

            {supabaseConfigured && reviewsLoading && reviewList == null ? (
              <Loading />
            ) : (reviewList ?? []).length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 32, gap: 8 }}>
                <Sym name="reviews" size={40} color={colors.outlineVariant} />
                <AppText variant="bodyMd" color={colors.secondary}>Отзывов пока нет. Будьте первым!</AppText>
              </View>
            ) : (
              (reviewList ?? []).map((r, i) => (
                <View key={i} style={[styles.reviewCard, cardShadow]}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    <Avatar initial={initialOf(r.author_name)} size={44} tint={colors.surfaceMid} fg={colors.inkVariant} />
                    <View style={{ flex: 1 }}>
                      <AppText variant="labelMd" color={colors.ink}>{r.author_name}</AppText>
                      <AppText variant="labelSm" color={colors.outline}>{reviewDate(r.created_at)}</AppText>
                    </View>
                    <View style={{ flexDirection: "row", gap: 2 }}>
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Sym key={n} name="star" size={14} color={n <= r.stars ? colors.gold : colors.surfaceHighest} />
                      ))}
                    </View>
                  </View>
                  {r.text ? <AppText variant="bodyMd" color={colors.secondary} style={{ marginTop: 10 }}>{r.text}</AppText> : null}
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      <SafeAreaView edges={["bottom"]} style={styles.footer}>
        <PrimaryButton label="Записаться" icon="calendar-today" onPress={() => startBooking()} />
      </SafeAreaView>
    </View>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <View style={{ padding: space.lg, alignItems: "center" }}>
      <AppText variant="bodyMd" color={colors.secondary}>{text}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  cover: { height: 192, backgroundColor: colors.surfaceMid },
  floatBar: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: space.margin, flexDirection: "row", justifyContent: "space-between" },
  circleBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center", ...cardShadow },
  head: { paddingHorizontal: space.margin, marginTop: -64 },
  avatar: { width: 128, height: 128, borderRadius: radius.x2l, backgroundColor: colors.surfaceMid, borderWidth: 4, borderColor: colors.bg, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontFamily: "LibreCaslonText_400Regular", fontSize: 52, lineHeight: 58 },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8 },
  locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  tabs: { flexDirection: "row", gap: 8, marginHorizontal: space.margin, marginTop: space.lg, padding: 4, backgroundColor: colors.surfaceLow, borderRadius: radius.full },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: "center" },
  tabOn: { backgroundColor: colors.accent },
  service: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  serviceBtn: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  leaveReview: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, backgroundColor: colors.surfaceLow, borderRadius: radius.xl },
  reviewCard: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: 16 },
  gallery: { flexDirection: "row", flexWrap: "wrap", gap: space.md, paddingHorizontal: space.margin, marginTop: space.md },
  galleryItem: { width: "47%" },
  galleryImg: { width: "100%", aspectRatio: 1, borderRadius: radius.xl, backgroundColor: colors.surfaceMid },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: colors.surface, paddingHorizontal: space.margin, paddingTop: space.md, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
});

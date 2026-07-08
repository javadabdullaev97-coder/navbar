import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../components/ui";
import { cardShadow, colors, radius, space } from "../theme";

type Note = {
  icon: any; tintBg: string; tintFg: string; title: string; body: string; time: string;
  unread?: boolean; go?: string;
};

const TODAY: Note[] = [
  { icon: "chat", tintBg: colors.accentTint, tintFg: colors.accent, title: "Новое сообщение", body: "Новое сообщение от Дилнозы", time: "14:20", unread: true, go: "/chat/1" },
  { icon: "check-circle", tintBg: colors.successBg, tintFg: colors.successText, title: "Запись подтверждена", body: "Ваш визит забронирован", time: "10:45", go: "/appointment/1" },
];
const YESTERDAY: Note[] = [
  { icon: "notifications-active", tintBg: colors.warningBg, tintFg: colors.warningText, title: "Напоминание о визите", body: "Напоминание о визите завтра в 11:00", time: "18:00", go: "/appointment/1" },
  { icon: "star", tintBg: colors.infoBg, tintFg: colors.infoText, title: "Оставьте отзыв", body: "Оставьте отзыв о вчерашнем визите", time: "12:30", go: "/review" },
];

function Item({ n, onPress }: { n: Note; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.item, cardShadow]}>
      <View>
        <View style={[styles.tint, { backgroundColor: n.tintBg }]}>
          <Sym name={n.icon} size={22} color={n.tintFg} />
        </View>
        {n.unread ? <View style={styles.unread} /> : null}
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <AppText variant="labelMd" color={colors.ink} numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{n.title}</AppText>
          <AppText variant="labelSm" color={colors.secondary}>{n.time}</AppText>
        </View>
        <AppText variant="labelMd" color={colors.secondary} numberOfLines={1} style={{ marginTop: 2 }}>{n.body}</AppText>
      </View>
    </Pressable>
  );
}

export default function Notifications() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>Уведомления</AppText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <AppText variant="labelSm" color={colors.secondary} style={styles.section}>СЕГОДНЯ</AppText>
        <View style={{ gap: 8 }}>
          {TODAY.map((n, i) => <Item key={i} n={n} onPress={() => n.go && router.push(n.go as any)} />)}
        </View>

        <AppText variant="labelSm" color={colors.secondary} style={[styles.section, { marginTop: space.lg }]}>ВЧЕРА</AppText>
        <View style={{ gap: 8 }}>
          {YESTERDAY.map((n, i) => <Item key={i} n={n} onPress={() => n.go && router.push(n.go as any)} />)}
        </View>

        {/* Промо */}
        <View style={styles.promo}>
          <View style={styles.promoOverlay} />
          <View style={{ zIndex: 1 }}>
            <AppText variant="labelSm" color={colors.onAccent} style={{ textTransform: "uppercase", letterSpacing: 2, opacity: 0.9 }}>Специальное предложение</AppText>
            <AppText variant="displayLg" color={colors.onAccent} style={{ marginTop: 4 }}>−20% на первый визит</AppText>
            <Pressable style={styles.promoBtn}><AppText variant="labelSm" color={colors.accent}>Подробнее</AppText></Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, justifyContent: "center", paddingHorizontal: space.margin },
  section: { textTransform: "uppercase", letterSpacing: 2, marginBottom: space.md },
  item: { flexDirection: "row", gap: 16, alignItems: "center", padding: 16, backgroundColor: colors.surface, borderRadius: radius.xl },
  tint: { width: 48, height: 48, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  unread: { position: "absolute", top: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.surface },
  promo: { marginTop: space.lg, height: 160, borderRadius: radius.xl, overflow: "hidden", justifyContent: "center", paddingHorizontal: 24, backgroundColor: colors.accent },
  promoOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.accentDeep, opacity: 0.5 },
  promoBtn: { alignSelf: "flex-start", backgroundColor: colors.onAccent, paddingHorizontal: 16, paddingVertical: 6, borderRadius: radius.full, marginTop: 12 },
});

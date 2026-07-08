import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, GhostBorderButton, Loading, PrimaryButton, Sym } from "../../components/ui";
import { cancelBookingRpc, ClientBooking, getMyBookings } from "../../lib/api";
import { initialOf, supabaseConfigured } from "../../lib/data";
import { fmtDate, fmtMoney, fmtTime } from "../../lib/format";
import { useT } from "../../lib/i18n";
import { BookingStatus, useStore } from "../../lib/store";
import { colors, radius, space } from "../../theme";

const STATUS_LABEL: Record<BookingStatus, string> = {
  confirmed: "Подтверждена", pending: "Ожидает", done: "Выполнена", cancelled: "Отменена",
};

function DetailRow({ icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 16, alignItems: "flex-start" }}>
      <View style={styles.iconCircle}><Sym name={icon} size={20} color={colors.accent} /></View>
      <View style={{ flex: 1 }}>
        <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>{label}</AppText>
        <AppText variant="bodyMd" color={colors.ink} style={{ fontFamily: "Manrope_600SemiBold" }}>{value}</AppText>
        {sub ? <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 2 }}>{sub}</AppText> : null}
      </View>
    </View>
  );
}

// Единая модель для экрана — из БД или из локального стора (демо).
type ApptView = {
  specialist: string; initial: string; spec: string; slug: string;
  date: Date; service: string; duration: number | null; price: number | null;
  address: string; status: BookingStatus; remote: boolean;
};

export default function Appointment() {
  const router = useRouter();
  const t = useT();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { bookings, cancelBooking } = useStore();
  const [remote, setRemote] = useState<ClientBooking | null | undefined>(undefined); // undefined = грузим
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!supabaseConfigured) { setRemote(null); return; }
    let alive = true;
    getMyBookings()
      .then((list) => alive && setRemote(list.find((b) => b.id === id) ?? null))
      .catch(() => alive && setRemote(null));
    return () => { alive = false; };
  }, [id]);

  if (supabaseConfigured && remote === undefined) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
          <AppText variant="headlineMd" color={colors.accent}>{t("Запись")}</AppText>
          <View style={{ width: 26 }} />
        </View>
        <Loading />
      </SafeAreaView>
    );
  }

  // Собираем данные: реальная запись → локальная → демо.
  const local = bookings.find((x) => x.id === id);
  const v: ApptView = remote
    ? {
        specialist: remote.master_name, initial: initialOf(remote.master_name), spec: "", slug: remote.master_slug,
        date: new Date(remote.starts_at), service: remote.service_name ?? t("Услуга"), duration: null, price: null,
        address: remote.master_address ?? "", status: remote.status, remote: true,
      }
    : {
        specialist: local?.specialist ?? "Дилноза Каримова", initial: local?.initial ?? "Д",
        spec: local?.spec ?? "Клинический психолог", slug: "",
        date: local?.date ?? new Date(), service: local?.service ?? "Индивидуальная консультация",
        duration: local?.duration ?? 50, price: local?.price ?? 180000,
        address: local?.address ?? "Ташкент, Мирабад", status: local?.status ?? "confirmed", remote: false,
      };

  const cancelled = v.status === "cancelled";
  const canManage = !cancelled && v.status !== "done";

  function doCancel() {
    Alert.alert(t("Отменить запись?"), t("Это действие нельзя отменить."), [
      { text: t("Назад"), style: "cancel" },
      {
        text: t("Отменить запись"), style: "destructive",
        onPress: async () => {
          if (v.remote && supabaseConfigured) {
            setBusy(true);
            try { await cancelBookingRpc(id); }
            catch (e) {
              setBusy(false);
              Alert.alert(t("Ошибка"), e instanceof Error ? e.message : t("Не удалось отменить запись."));
              return;
            }
            setBusy(false);
          } else if (local) {
            cancelBooking(local.id);
          }
          router.back();
        },
      },
    ]);
  }

  function openSpecialist() {
    if (v.slug) router.push(`/specialist/${v.slug}`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
        <AppText variant="headlineMd" color={colors.accent}>{t("Запись")}</AppText>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24, gap: space.lg }} showsVerticalScrollIndicator={false}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <AppText variant="headlineMd" color={colors.accent}>{t("Детали записи")}</AppText>
          <View style={[styles.badge, { backgroundColor: cancelled ? colors.surfaceHigh : colors.successBg }]}>
            <AppText variant="labelSm" color={cancelled ? colors.secondary : colors.successText}>{t(STATUS_LABEL[v.status])}</AppText>
          </View>
        </View>

        {/* Специалист */}
        <Pressable onPress={openSpecialist} disabled={!v.slug}>
          <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>{v.initial}</AppText></View>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.ink}>{v.specialist}</AppText>
              {v.spec ? <AppText variant="labelSm" color={colors.secondary}>{v.spec}</AppText> : null}
            </View>
            {v.slug ? <Sym name="chevron-right" size={22} color={colors.outlineVariant} /> : null}
          </Card>
        </Pressable>

        {/* Услуга и время */}
        <Card padding={20}>
          <View style={{ paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant }}>
            <DetailRow icon="content-paste" label={t("Услуга")} value={v.service} sub={v.duration ? t("{count} минут", { count: v.duration }) : undefined} />
          </View>
          <View style={{ paddingTop: 16 }}>
            <DetailRow icon="calendar-today" label={t("Дата и время")} value={fmtDate(v.date)} sub={fmtTime(v.date)} />
          </View>
        </Card>

        {/* Локация */}
        {v.address ? (
          <View>
            <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, marginLeft: 4 }}>{t("Локация")}</AppText>
            <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <View style={styles.pin}><Sym name="location-on" size={18} color={colors.onAccent} /></View>
              <AppText variant="bodyMd" color={colors.ink} style={{ flex: 1 }}>{v.address}</AppText>
            </Card>
          </View>
        ) : null}

        {/* Оплата — только когда есть цена (демо/локальная запись) */}
        {v.price != null ? (
          <Card padding={20}>
            <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>{t("Оплата")}</AppText>
            <View style={styles.payRow}>
              <AppText variant="labelMd" color={colors.ink}>{t("Стоимость услуги")}</AppText>
              <AppText variant="labelMd" color={colors.accent}>{fmtMoney(v.price)}</AppText>
            </View>
            <AppText variant="labelSm" color={colors.secondary} style={{ marginTop: 8 }}>{t("Оплата на месте у специалиста.")}</AppText>
          </Card>
        ) : null}

        <View style={[styles.note, { backgroundColor: colors.infoBg }]}>
          <Sym name="info" size={20} color={colors.infoText} />
          <AppText variant="labelSm" color={colors.infoText} style={{ flex: 1 }}>
            {t("Отменить или перенести запись можно не позднее чем за 24 часа до визита.")}
          </AppText>
        </View>
      </ScrollView>

      {canManage && (
        <View style={styles.actions}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <View style={{ flex: 1 }}><GhostBorderButton label={t("Перенести")} onPress={() => router.push("/booking/datetime")} /></View>
            <Pressable style={[styles.cancelBtn, busy && { opacity: 0.5 }]} onPress={busy ? undefined : doCancel}>
              <AppText variant="labelMd" color={colors.error}>{busy ? t("Отмена…") : t("Отменить")}</AppText>
            </Pressable>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.full },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26, lineHeight: 30 },
  iconCircle: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  pin: { width: 32, height: 32, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center" },
  payRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  note: { flexDirection: "row", gap: 12, alignItems: "center", padding: 16, borderRadius: radius.xl },
  actions: { paddingHorizontal: space.margin, paddingTop: space.md, gap: 12, backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.outlineVariant },
  cancelBtn: { flex: 1, height: 56, borderRadius: radius.xl, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.outlineVariant },
});

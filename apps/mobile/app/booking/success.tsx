import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, GhostBorderButton, PrimaryButton, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

function Line({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", gap: 12 }}>
      <Sym name={icon} size={20} color={"rgba(6,78,59,0.6)"} />
      <View>
        <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1 }}>{label}</AppText>
        <AppText variant="bodyMd" color={colors.ink}>{value}</AppText>
      </View>
    </View>
  );
}

export default function Success() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.body}>
        {/* Герой */}
        <View style={{ alignItems: "center", gap: space.md }}>
          <View style={styles.check}>
            <Sym name="check" size={44} color={colors.onAccent} />
          </View>
          <AppText variant="displayLg" color={colors.accent}>Вы записаны!</AppText>
          <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 280 }}>
            Мы отправим напоминание перед визитом
          </AppText>
        </View>

        {/* Сводка */}
        <Card padding={24} style={{ width: "100%" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginBottom: 24 }}>
            <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>Д</AppText></View>
            <View>
              <AppText variant="labelMd" color={colors.ink}>Дилноза Каримова</AppText>
              <AppText variant="labelSm" color={colors.secondary}>Специалист по психологии</AppText>
            </View>
          </View>
          <View style={{ gap: space.md }}>
            <Line icon="content-paste" label="Услуга" value="Индивидуальная консультация" />
            <Line icon="calendar-today" label="Дата и время" value="Пт, 12 июля · 11:00" />
            <Line icon="location-on" label="Адрес" value="Ташкент, Мирабад" />
          </View>
        </Card>

        {/* Действия */}
        <View style={{ width: "100%", gap: 12 }}>
          <PrimaryButton label="В мои записи" onPress={() => router.replace("/(tabs)/bookings")} />
          <GhostBorderButton label="Добавить в календарь" icon="event-available" />
          <Pressable onPress={() => router.replace("/(tabs)/home")} style={({ pressed }) => [{ paddingVertical: 12, alignItems: "center" }, pressed && { opacity: 0.6 }]}>
            <AppText variant="labelSm" color={colors.secondary}>Вернуться на главную</AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { flex: 1, paddingHorizontal: space.margin, paddingTop: 40, paddingBottom: space.margin, justifyContent: "space-between", alignItems: "center" },
  check: { width: 96, height: 96, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26 },
});

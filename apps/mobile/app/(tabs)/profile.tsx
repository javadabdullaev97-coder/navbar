import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { colors, radius, space } from "../../theme";

type Row = { icon: any; label: string; value?: string };
const ROWS: Row[] = [
  { icon: "contrast", label: "Тема", value: "Авто" },
  { icon: "language", label: "Язык", value: "Русский" },
  { icon: "notifications-none", label: "Уведомления" },
  { icon: "payments", label: "Способы оплаты" },
  { icon: "help-outline", label: "Помощь" },
];

export default function Profile() {
  const router = useRouter();
  const [role, setRole] = useState(0); // 0 клиент, 1 мастер

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>Настройки</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Профиль */}
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: space.lg }}>
          <View style={styles.avatar}>
            <AppText style={{ fontFamily: "LibreCaslonText_400Regular", fontSize: 40 }} color={colors.inkVariant}>А</AppText>
            <View style={styles.editBadge}><Sym name="edit" size={14} color={colors.onAccent} /></View>
          </View>
          <AppText variant="headlineMd" color={colors.ink} style={{ marginTop: 12 }}>Азиз Рахимов</AppText>
          <AppText variant="bodyMd" color={colors.secondary}>+998 90 123-45-67</AppText>
        </View>

        {/* Роль */}
        <View style={{ paddingHorizontal: space.margin, marginBottom: space.lg }}>
          <View style={styles.roleWrap}>
            {["Клиент", "Мастер"].map((r, i) => (
              <Pressable key={r} onPress={() => setRole(i)} style={[styles.roleBtn, i === role && styles.roleOn]}>
                <AppText variant="labelMd" color={i === role ? colors.onAccent : colors.secondary}>{r}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Настройки */}
        <View style={styles.group}>
          {ROWS.map((r, i) => (
            <Pressable key={r.label} style={[styles.row, i < ROWS.length - 1 && styles.rowBorder]}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                <Sym name={r.icon} size={22} color={colors.accent} />
                <AppText variant="bodyMd" color={colors.ink}>{r.label}</AppText>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                {r.value ? <AppText variant="bodyMd" color={colors.secondary}>{r.value}</AppText> : null}
                <Sym name="chevron-right" size={22} color={colors.outline} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* Выйти */}
        <View style={{ alignItems: "center", marginTop: space.lg }}>
          <Pressable onPress={() => router.replace("/")} style={({ pressed }) => [{ paddingHorizontal: 32, paddingVertical: 12, borderRadius: radius.xl }, pressed && { opacity: 0.6 }]}>
            <AppText variant="labelMd" color={colors.error}>Выйти</AppText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, height: 56, justifyContent: "center" },
  avatar: {
    width: 96, height: 96, borderRadius: radius.full, backgroundColor: colors.surfaceMid,
    alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.accentTint,
  },
  editBadge: {
    position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: radius.full,
    backgroundColor: colors.accent, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: colors.bg,
  },
  roleWrap: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.full, padding: 4, height: 48 },
  roleBtn: { flex: 1, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  roleOn: { backgroundColor: colors.accent },
  group: { marginHorizontal: space.margin, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
});

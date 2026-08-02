import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Glass, Sym } from "../components/ui";
import { useT } from "../lib/i18n";
import { useColors, useIsDark, useThemedStyles } from "../lib/theme-context";
import { radius, space, ThemeColors } from "../theme";

type Role = {
  icon: React.ComponentProps<typeof Sym>["name"];
  title: string;
  subtitle: string;
  target: string;
  primary?: boolean;
};

const ROLES: Role[] = [
  {
    icon: "person",
    title: "Я клиент",
    subtitle: "Записаться к специалисту: мастер, врач, юрист, тренер",
    target: "/login?role=client",
    primary: true,
  },
  {
    icon: "work",
    title: "Я специалист",
    subtitle: "Принимать записи и вести своё расписание",
    target: "/login?role=master",
  },
];

export default function Welcome() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const isDark = useIsDark();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[isDark ? "rgba(6,78,59,0.35)" : "rgba(6,78,59,0.12)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.wrap}>
          {/* Бренд */}
          <View style={styles.brand}>
            <AppText variant="displayLg" color={colors.accent} style={styles.logo}>ORA</AppText>
            <AppText variant="labelMd" color={colors.inkVariant} style={{ opacity: 0.8, textAlign: "center" }}>
              {t("Запись к специалистам — за пару касаний")}
            </AppText>
          </View>

          {/* Карточки ролей */}
          <View style={{ gap: space.md }}>
            {ROLES.map((r) => (
              <Pressable key={r.title} onPress={() => router.push(r.target as any)} style={({ pressed }) => [pressed && { transform: [{ scale: 0.98 }] }]}>
                <Glass style={r.primary ? { borderColor: colors.accent } : undefined}>
                  <View style={styles.card}>
                    <View style={[styles.iconWrap, r.primary && { backgroundColor: colors.accent }]}>
                      <Sym name={r.icon} size={24} color={r.primary ? colors.onAccent : colors.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText variant="headlineMd" color={colors.ink} style={{ fontSize: 18, marginBottom: 2 }}>{t(r.title)}</AppText>
                      <AppText variant="labelSm" color={colors.inkVariant}>{t(r.subtitle)}</AppText>
                    </View>
                    <Sym name="chevron-right" size={22} color={colors.outline} />
                  </View>
                </Glass>
              </Pressable>
            ))}
          </View>

          {/* Вход */}
          <View style={styles.footer}>
            <Pressable onPress={() => router.push("/login")} style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.6 }]}>
              <AppText variant="labelMd" color={colors.accent}>{t("Уже есть аккаунт? Войти")}</AppText>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.margin },
  brand: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 44, lineHeight: 50, marginBottom: space.sm, letterSpacing: 2 },
  card: { flexDirection: "row", alignItems: "center", gap: 16, padding: 18 },
  iconWrap: { width: 48, height: 48, borderRadius: radius.full, backgroundColor: colors.accentTint, alignItems: "center", justifyContent: "center" },
  footer: { alignItems: "center", justifyContent: "flex-end", paddingTop: space.lg, paddingBottom: space.md },
  loginLink: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: radius.full },
});

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../components/ui";
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
  { icon: "person", title: "Я клиент", subtitle: "Найти специалиста и записаться", target: "/login?role=client", primary: true },
  { icon: "work", title: "Я специалист", subtitle: "Принимать записи и вести расписание", target: "/login?role=master" },
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
        colors={[isDark ? "rgba(6,78,59,0.28)" : "rgba(6,78,59,0.10)", "transparent"]}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.wrap}>
          <View style={styles.brand}>
            <AppText variant="displayLg" color={colors.accent} style={styles.logo}>ORA</AppText>
            <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", marginTop: 6 }}>
              {t("Запись к специалистам — за пару касаний")}
            </AppText>
          </View>

          <View style={{ gap: 14 }}>
            {ROLES.map((r) => (
              <Pressable
                key={r.title}
                onPress={() => router.push(r.target as any)}
                style={({ pressed }) => [styles.card, r.primary && styles.cardPrimary, pressed && { opacity: 0.85 }]}
              >
                <View style={[styles.iconWrap, r.primary && { backgroundColor: colors.accent }]}>
                  <Sym name={r.icon} size={22} color={r.primary ? colors.onAccent : colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyLg" color={colors.ink} style={styles.cardTitle}>{t(r.title)}</AppText>
                  <AppText variant="bodyMd" color={colors.secondary} style={{ fontSize: 13, marginTop: 2 }}>{t(r.subtitle)}</AppText>
                </View>
                <Sym name="arrow-forward" size={20} color={colors.outline} />
              </Pressable>
            ))}
          </View>

          <Pressable onPress={() => router.push("/login")} style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.5 }]}>
            <AppText variant="bodyMd" color={colors.secondary}>
              {t("Уже есть аккаунт?")} <AppText variant="bodyMd" color={colors.accent}>{t("Войти")}</AppText>
            </AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  wrap: { flex: 1, paddingHorizontal: space.margin },
  brand: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 52, lineHeight: 58, letterSpacing: 4 },
  card: { flexDirection: "row", alignItems: "center", gap: 16, paddingVertical: 18, paddingHorizontal: 18, borderRadius: radius.x2l, backgroundColor: colors.surface },
  cardPrimary: { backgroundColor: colors.accentTint },
  iconWrap: { width: 44, height: 44, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontFamily: "Manrope_600SemiBold", fontSize: 17 },
  loginLink: { alignItems: "center", paddingVertical: 20, marginTop: space.md },
});

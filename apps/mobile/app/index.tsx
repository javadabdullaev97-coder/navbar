import { useRouter } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../components/ui";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../theme";

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
    subtitle: "Найти мастера, врача, психолога и записаться",
    target: "/login",
    primary: true,
  },
  {
    icon: "calendar-today",
    title: "Я мастер",
    subtitle: "Принимать записи и вести расписание",
    target: "/(master)/onboarding",
  },
  {
    icon: "storefront",
    title: "Салон",
    subtitle: "Управлять командой специалистов",
    target: "/login",
  },
];

export default function Welcome() {
  const router = useRouter();
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);

  function pick(role: Role) {
    router.push(role.target as any);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.wrap}>
        {/* Верх: бренд */}
        <View style={styles.brand}>
          <AppText variant="displayLg" color={colors.accent} style={styles.logo}>
            ORA
          </AppText>
          <AppText
            variant="labelMd"
            color={colors.inkVariant}
            style={{ opacity: 0.8, textAlign: "center" }}
          >
            {t("Запись к специалистам — за пару касаний")}
          </AppText>
        </View>

        {/* Центр: карточки ролей */}
        <View style={{ gap: space.md }}>
          {ROLES.map((r) => (
            <Pressable
              key={r.title}
              onPress={() => pick(r)}
              style={({ pressed }) => [
                styles.roleCard,
                cardShadow,
                r.primary && styles.roleCardPrimary,
                pressed && { transform: [{ scale: 0.98 }] },
              ]}
            >
              <Sym
                name={r.icon}
                size={30}
                color={r.primary ? colors.accent : colors.inkVariant}
                style={{ marginRight: space.md, marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <AppText variant="labelMd" color={colors.ink} style={{ marginBottom: 4 }}>
                  {t(r.title)}
                </AppText>
                <AppText variant="labelSm" color={colors.inkVariant}>
                  {t(r.subtitle)}
                </AppText>
              </View>
              <Sym name="chevron-right" size={22} color={colors.outlineVariant} />
            </Pressable>
          ))}
        </View>

        {/* Низ: вход */}
        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [styles.loginLink, pressed && { opacity: 0.6 }]}
          >
            <AppText variant="labelMd" color={colors.accent}>
              {t("Уже есть аккаунт? Войти")}
            </AppText>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  wrap: { flex: 1, paddingHorizontal: space.margin },
  brand: { flex: 1, alignItems: "center", justifyContent: "center" },
  logo: { fontSize: 40, lineHeight: 46, marginBottom: space.sm },
  roleCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 20,
    borderRadius: radius.xl,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  roleCardPrimary: {
    borderColor: "rgba(6,78,59,0.10)",
  },
  footer: {
    alignItems: "center",
    justifyContent: "flex-end",
    paddingTop: space.lg,
    paddingBottom: space.md,
  },
  loginLink: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
});

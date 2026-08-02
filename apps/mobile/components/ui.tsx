// Переиспользуемые «кирпичи» ORA. Цвета берутся из активной темы (useColors),
// поэтому компоненты автоматически адаптируются к светлой/тёмной теме.
import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { ComponentProps } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextProps,
  View,
  ViewStyle,
} from "react-native";
import { useColors, useIsDark } from "../lib/theme-context";
import { useT } from "../lib/i18n";
import { cardShadow, radius, space, type as T } from "../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

/** Иконка (Material Symbols → Material Icons). */
export function Sym({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  style?: StyleProp<any>;
}) {
  const colors = useColors();
  return <MaterialIcons name={name} size={size} color={color ?? colors.ink} style={style} />;
}

type Variant = keyof typeof T;

/** Текст с типографикой из дизайн-системы. */
export function AppText({
  variant = "bodyMd",
  color,
  style,
  ...rest
}: TextProps & { variant?: Variant; color?: string }) {
  const colors = useColors();
  return <Text {...rest} style={[T[variant], { color: color ?? colors.ink }, style]} />;
}

/** Приподнятая карточка (фон-поверхность, мягкая тень, радиус 12). */
export function Card({
  children,
  style,
  padding = space.md,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}) {
  const colors = useColors();
  return (
    <View style={[{ backgroundColor: colors.surface, borderRadius: radius.xl, padding }, cardShadow, style]}>
      {children}
    </View>
  );
}

/** Квадратный аватар-плейсхолдер (пока нет фото) с инициалом. */
export function Avatar({
  initial,
  size = 48,
  round = false,
  tint,
  fg,
}: {
  initial: string;
  size?: number;
  round?: boolean;
  tint?: string;
  fg?: string;
}) {
  const colors = useColors();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: round ? radius.full : radius.xl,
        backgroundColor: tint ?? colors.accentTint,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontFamily: T.headlineMd.fontFamily,
          fontSize: size * 0.42,
          lineHeight: size * 0.5,
          color: fg ?? colors.accent,
        }}
      >
        {initial}
      </Text>
    </View>
  );
}

/** Индикатор загрузки (пока данные грузятся из базы). */
export function Loading() {
  const colors = useColors();
  return (
    <View style={{ paddingVertical: 48, alignItems: "center" }}>
      <ActivityIndicator color={colors.accent} />
    </View>
  );
}

/** Матовое «стекло» (frosted glass) — размывает фон + лёгкая заливка и рамка.
 *  Тема-осознанное: светлое стекло на светлой теме, тёмное — на тёмной. */
export function Glass({
  children,
  style,
  intensity = 30,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
}) {
  const isDark = useIsDark();
  return (
    <BlurView
      intensity={intensity}
      tint={isDark ? "dark" : "light"}
      style={[styles.glass, { borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.05)" }, style]}
    >
      <View style={{ backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.45)" }}>
        {children}
      </View>
    </BlurView>
  );
}

/** Состояние ошибки сети с кнопкой «Повторить». Показывать, когда загрузка не удалась. */
export function ErrorState({ onRetry }: { onRetry?: () => void }) {
  const colors = useColors();
  const t = useT();
  return (
    <View style={{ paddingVertical: 48, alignItems: "center", gap: 12, paddingHorizontal: 24 }}>
      <Sym name="wifi-off" size={44} color={colors.outlineVariant} />
      <AppText variant="headlineMd" color={colors.ink}>{t("Нет соединения")}</AppText>
      <AppText variant="bodyMd" color={colors.secondary} style={{ textAlign: "center", maxWidth: 280 }}>
        {t("Не удалось загрузить данные. Проверьте интернет и попробуйте снова.")}
      </AppText>
      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, paddingHorizontal: 20, paddingVertical: 10, borderRadius: radius.full, backgroundColor: colors.surfaceLow, borderWidth: 1, borderColor: colors.outlineVariant }}
        >
          <Sym name="refresh" size={18} color={colors.accent} />
          <AppText variant="labelMd" color={colors.accent}>{t("Повторить")}</AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Пилюля-чип (категории/фильтры). */
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { backgroundColor: active ? colors.accent : colors.surfaceLow }]}
    >
      <AppText variant="labelMd" color={active ? colors.onAccent : colors.inkVariant}>
        {label}
      </AppText>
    </Pressable>
  );
}

/** Основная кнопка (акцент, во всю ширину, высота 56). */
export function PrimaryButton({
  label,
  onPress,
  loading,
  style,
  icon,
}: {
  label: string;
  onPress?: () => void;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: IconName;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.primaryBtn,
        { backgroundColor: colors.accent },
        cardShadow,
        pressed && { transform: [{ scale: 0.98 }], opacity: 0.95 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onAccent} />
      ) : (
        <>
          <AppText variant="labelMd" color={colors.onAccent}>
            {label}
          </AppText>
          {icon ? <Sym name={icon} size={18} color={colors.onAccent} /> : null}
        </>
      )}
    </Pressable>
  );
}

/** Вторичная (обводка). */
export function GhostBorderButton({
  label,
  onPress,
  icon,
}: {
  label: string;
  onPress?: () => void;
  icon?: IconName;
}) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ghostBtn, { borderColor: colors.accent }, pressed && { opacity: 0.8 }]}
    >
      {icon ? <Sym name={icon} size={18} color={colors.accent} /> : null}
      <AppText variant="labelMd" color={colors.accent}>
        {label}
      </AppText>
    </Pressable>
  );
}

// Статические (не зависящие от темы) части стилей.
const styles = StyleSheet.create({
  glass: {
    borderRadius: radius.x2l,
    overflow: "hidden",
    borderWidth: 1,
  },
  chip: {
    height: 40,
    paddingHorizontal: 20,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryBtn: {
    height: 56,
    borderRadius: radius.xl,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  ghostBtn: {
    height: 56,
    borderRadius: radius.xl,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
});

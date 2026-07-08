// Переиспользуемые «кирпичи» ORA. Цвета берутся из активной темы (useColors),
// поэтому компоненты автоматически адаптируются к светлой/тёмной теме.
import { MaterialIcons } from "@expo/vector-icons";
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
import { useColors } from "../lib/theme-context";
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

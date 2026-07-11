// Дизайн-токены ORA (клиент) — значения 1:1 из макетов Stitch.
// Акцент — deep-forest #064E3B. Меняется только он; остальное общее.
import { Platform, TextStyle, ViewStyle } from "react-native";

// Светлая палитра (значения 1:1 из макетов Stitch).
export const lightColors = {
  // Фон / поверхности
  bg: "#FCF9F8", // warm-white / surface
  surface: "#FFFFFF", // surface-elevated (карточки)
  surfaceLow: "#F6F3F2", // surface-container-low
  surfaceMid: "#F0EDEC", // surface-container
  surfaceHigh: "#EAE7E7", // surface-container-high
  surfaceHighest: "#E4E2E1", // surface-container-highest
  // Текст
  ink: "#1B1C1B", // on-surface
  inkVariant: "#404944", // on-surface-variant
  secondary: "#5E5E5E", // secondary (вторичный текст/иконки)
  outline: "#717974",
  outlineVariant: "#C0C8C3",
  // Акцент
  accent: "#064E3B", // deep-forest
  accentTint: "#BCEDD8", // primary-fixed (мягкая подложка акцента)
  accentDeep: "#003527", // primary-container
  onAccent: "#FFFFFF",
  // Рейтинг
  gold: "#D4AF37",
  // Статусы (семантика, не акцент)
  successBg: "#ECFDF5",
  successText: "#065F46",
  warningBg: "#FFFBEB",
  warningText: "#92400E",
  infoBg: "#EFF3FF",
  infoText: "#1E40AF",
  error: "#BA1A1A",
} as const;

export type ThemeColors = Record<keyof typeof lightColors, string>;

// Тёмная палитра: те же токены, инвертированные под тёмный фон.
// Акцент осветляем (deep-forest нечитаем на тёмном), onAccent делаем тёмным.
export const darkColors: ThemeColors = {
  bg: "#101311",
  surface: "#191D1A",
  surfaceLow: "#1E221F",
  surfaceMid: "#242824",
  surfaceHigh: "#2C302B",
  surfaceHighest: "#353A34",
  ink: "#E7EAE6",
  inkVariant: "#C2CBC4",
  secondary: "#9BA39C",
  outline: "#8A928C",
  outlineVariant: "#3C443E",
  accent: "#77D9AE", // осветлённый forest
  accentTint: "#0C3F30", // тёмная подложка акцента
  accentDeep: "#052A20",
  onAccent: "#00382A", // тёмный текст на светлом акценте
  gold: "#E3C158",
  successBg: "#0C2A1E",
  successText: "#6EE7B7",
  warningBg: "#2A2410",
  warningText: "#F5C451",
  infoBg: "#121D34",
  infoText: "#9DB8FF",
  error: "#FFB4AB",
};

// Обратная совместимость: пока экраны не переведены на useColors(),
// они импортируют статичную светлую палитру.
export const colors = lightColors;

// ── Палитра МАСТЕРА (бордо). Те же нейтрали, акцент — deep-bordo. ──
export const masterLightColors: ThemeColors = {
  bg: "#FDF8F8",
  surface: "#FFFFFF",
  surfaceLow: "#F7F2F2",
  surfaceMid: "#F1EDEC",
  surfaceHigh: "#ECE7E7",
  surfaceHighest: "#E6E1E1",
  ink: "#1C1B1B",
  inkVariant: "#544244",
  secondary: "#5E5E5E",
  outline: "#877274",
  outlineVariant: "#DAC0C3",
  accent: "#5E1226", // primary-container (бордо)
  accentTint: "#FFD9DD", // primary-fixed
  accentDeep: "#3F0013", // primary
  onAccent: "#FFFFFF",
  gold: "#D4AF37",
  successBg: "#ECFDF5",
  successText: "#065F46",
  warningBg: "#FFFBEB",
  warningText: "#92400E",
  infoBg: "#EFF3FF",
  infoText: "#1E40AF",
  error: "#BA1A1A",
};

export const masterDarkColors: ThemeColors = {
  bg: "#131011",
  surface: "#1D1A1B",
  surfaceLow: "#221F20",
  surfaceMid: "#282425",
  surfaceHigh: "#302C2D",
  surfaceHighest: "#393435",
  ink: "#EAE0E1",
  inkVariant: "#D7C1C4",
  secondary: "#A89EA0",
  outline: "#A08D90",
  outlineVariant: "#4A3F41",
  accent: "#FFB2BC", // осветлённый бордо
  accentTint: "#5E1226",
  accentDeep: "#3F0013",
  onAccent: "#400013", // тёмный текст на светлом акценте
  gold: "#E3C158",
  successBg: "#0C2A1E",
  successText: "#6EE7B7",
  warningBg: "#2A2410",
  warningText: "#F5C451",
  infoBg: "#121D34",
  infoText: "#9DB8FF",
  error: "#FFB4AB",
};

export type Brand = "client" | "master";

export const radius = {
  sm: 4,
  lg: 8,
  xl: 12, // основной радиус карточек/кнопок (rounded-xl)
  x2l: 16,
  full: 9999,
} as const;

export const space = {
  base: 4,
  sm: 8, // stack-sm
  md: 16, // stack-md / gutter
  lg: 32, // stack-lg
  margin: 20, // margin-mobile (боковые поля экрана)
} as const;

// Мягкая тень карточек: 0 4px 20px rgba(0,0,0,0.04)
export const cardShadow = Platform.select<ViewStyle>({
  ios: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
  },
  android: { elevation: 2 },
  default: {},
}) as ViewStyle;

export const fonts = {
  caslon: "LibreCaslonText_400Regular",
  caslonBold: "LibreCaslonText_700Bold",
  body: "Manrope_400Regular",
  medium: "Manrope_500Medium",
  semibold: "Manrope_600SemiBold",
  bold: "Manrope_700Bold",
} as const;

// Типографика 1:1 из макетов
export const type = {
  displayLg: { fontFamily: fonts.caslon, fontSize: 32, lineHeight: 38 }, // display-lg-mobile
  headlineMd: { fontFamily: fonts.caslon, fontSize: 24, lineHeight: 32 },
  bodyLg: { fontFamily: fonts.body, fontSize: 18, lineHeight: 28 },
  bodyMd: { fontFamily: fonts.body, fontSize: 16, lineHeight: 24 },
  labelMd: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20, letterSpacing: 0.14 },
  labelSm: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16, letterSpacing: 0.48 },
} satisfies Record<string, TextStyle>;

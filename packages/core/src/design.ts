// Дизайн-система Navbar (CLAUDE.md §8): три слоя токенов —
// режим (светлая/тёмная) / тёплая нейтральная база / акцент.
// Единый источник для web (CSS-переменные) и mobile (RN StyleSheet).
// Цвета не хардкодить в компонентах — только эти токены.

export interface ThemeColors {
  bg: string;
  surface: string; // карточки
  surfaceAlt: string; // вложенные/полосы
  surfaceHigh: string; // максимально светлая
  border: string;
  ink: string; // основной текст
  inkStrong: string; // заголовки
  muted: string; // вторичный текст
  faint: string; // третичный
  accent: string; // бренд-акцент
  accentInk: string; // текст на акценте
  danger: string;
}

// Тёплая «журнальная» палитра. Нейтральная база одинаковой температуры
// в обеих темах; красится только акцент.
export const light: ThemeColors = {
  bg: "#EFE7DE",
  surface: "#F7F1EB",
  surfaceAlt: "#F3ECE4",
  surfaceHigh: "#FFFFFF",
  border: "#E7DCD1",
  ink: "#2A2320",
  inkStrong: "#1A1613",
  muted: "#7A6E64",
  faint: "#B7A99C",
  accent: "#A83254",
  accentInk: "#FFFFFF",
  danger: "#C65A3A",
};

export const dark: ThemeColors = {
  bg: "#1A1613",
  surface: "#241E1A",
  surfaceAlt: "#2C251F",
  surfaceHigh: "#322A24",
  border: "#382F28",
  ink: "#F3ECE4",
  inkStrong: "#FFFFFF",
  muted: "#B7A99C",
  faint: "#7A6E64",
  accent: "#C24A6B", // чуть светлее для тёмного фона
  accentInk: "#1A1613",
  danger: "#E07A54",
};

// Курируемая палитра акцентов категорий (общая для тем)
export const categoryColors: Record<string, string> = {
  Барберы: "#A83254",
  Парикмахеры: "#C65A3A",
  Ногти: "#D68A2E",
  "Брови и ресницы": "#8A5CC7",
  Макияж: "#4F6BD8",
  Массаж: "#566072",
};

export const radii = {
  sm: "9px",
  md: "12px",
  lg: "16px",
  xl: "20px",
  pill: "999px",
};

export const space = {
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
  "3xl": "48px",
};

export const fonts = {
  display: "'Fraunces', Georgia, serif", // заголовки — серифный
  body: "'Manrope', system-ui, sans-serif", // текст/интерфейс
};

/** CSS-переменные темы для web (строка для <style> или globals). */
export function cssVars(c: ThemeColors): string {
  return Object.entries({
    "--bg": c.bg,
    "--surface": c.surface,
    "--surface-alt": c.surfaceAlt,
    "--surface-high": c.surfaceHigh,
    "--border": c.border,
    "--ink": c.ink,
    "--ink-strong": c.inkStrong,
    "--muted": c.muted,
    "--faint": c.faint,
    "--accent": c.accent,
    "--accent-ink": c.accentInk,
    "--danger": c.danger,
    "--r-sm": radii.sm,
    "--r-md": radii.md,
    "--r-lg": radii.lg,
    "--r-xl": radii.xl,
    "--font-display": fonts.display,
    "--font-body": fonts.body,
  })
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

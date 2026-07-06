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

// Чистая нейтральная база (без коричневого); красится только акцент.
export const light: ThemeColors = {
  bg: "#F6F6F4",
  surface: "#FFFFFF",
  surfaceAlt: "#F0F0EE",
  surfaceHigh: "#FFFFFF",
  border: "#E5E5E2",
  ink: "#1B1B1A",
  inkStrong: "#0D0D0C",
  muted: "#6E6E6B",
  faint: "#A2A29E",
  accent: "#A83254",
  accentInk: "#FFFFFF",
  danger: "#C0442E",
};

export const dark: ThemeColors = {
  bg: "#121212",
  surface: "#1C1C1D",
  surfaceAlt: "#232324",
  surfaceHigh: "#2A2A2B",
  border: "#2E2E30",
  ink: "#ECECEB",
  inkStrong: "#FFFFFF",
  muted: "#9B9B98",
  faint: "#6A6A67",
  accent: "#D45C7A", // светлее для тёмного фона
  accentInk: "#121212",
  danger: "#E0765A",
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

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
  gold: string; // рейтинг (звёзды)
  danger: string;
  shadow1: string; // мягкая тень карточек
  shadow2: string; // тень модалок/поповеров
}

// Цвета бейджей статусов (из DESIGN.md): bg + text
export const statusBadge = {
  pending: { bg: "#FFFBEB", fg: "#92400E" },
  confirmed: { bg: "#ECFDF5", fg: "#065F46" },
  done: { bg: "#EFF3FF", fg: "#1E40AF" },
  cancelled: { bg: "#F3F4F6", fg: "#374151" },
};
export const statusBadgeDark = {
  pending: { bg: "#3A2E12", fg: "#F5C971" },
  confirmed: { bg: "#123227", fg: "#6EE7B7" },
  done: { bg: "#16233F", fg: "#93B4FF" },
  cancelled: { bg: "#26272B", fg: "#B4B8BF" },
};

// «Modern Editorial»: глубокий лесной зелёный акцент, тёплый белый фон,
// серифные заголовки. По дизайн-системе из Stitch (DESIGN.md).
export const light: ThemeColors = {
  bg: "#FDFCFB", // тёплый белый (не клинический)
  surface: "#FFFFFF", // приподнятые карточки
  surfaceAlt: "#F6F3F2",
  surfaceHigh: "#FFFFFF",
  border: "#EEEDEB", // тонкие линии
  ink: "#1A1A1A",
  inkStrong: "#111111",
  muted: "#6B7280",
  faint: "#9CA3AF",
  accent: "#064E3B", // deep forest
  accentInk: "#FFFFFF",
  gold: "#D4AF37",
  danger: "#BA1A1A",
  shadow1: "0 4px 20px rgba(0,0,0,0.04)",
  shadow2: "0 10px 30px rgba(0,0,0,0.08)",
};

export const dark: ThemeColors = {
  bg: "#0F172A", // deep navy-black
  surface: "#1E293B",
  surfaceAlt: "#172033",
  surfaceHigh: "#24344D",
  border: "#263143",
  ink: "#F9FAFB",
  inkStrong: "#FFFFFF",
  muted: "#94A3B8",
  faint: "#64748B",
  accent: "#10B981", // ярче для контраста
  accentInk: "#06231A",
  gold: "#E9C349",
  danger: "#FF6B6B",
  shadow1: "0 4px 20px rgba(0,0,0,0.25)",
  shadow2: "0 10px 30px rgba(0,0,0,0.4)",
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
  display: "'Libre Caslon Text', Georgia, serif", // заголовки — серифный
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
    "--gold": c.gold,
    "--danger": c.danger,
    "--shadow-1": c.shadow1,
    "--shadow-2": c.shadow2,
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

// Рантайм-переключение темы. Экраны строят стили через useThemedStyles(),
// а инлайновые цвета берут из useColors() — оба реагируют на смену темы.
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { darkColors, lightColors, ThemeColors } from "../theme";
import { useStore } from "./store";

type ThemeValue = { colors: ThemeColors; isDark: boolean };
const ThemeCtx = createContext<ThemeValue>({ colors: lightColors, isDark: false });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { themeMode } = useStore();
  const system = useColorScheme();
  const isDark = themeMode === "dark" || (themeMode === "auto" && system === "dark");
  const value = useMemo<ThemeValue>(() => ({ colors: isDark ? darkColors : lightColors, isDark }), [isDark]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/** Активная палитра (реагирует на светлую/тёмную тему). */
export function useColors(): ThemeColors {
  return useContext(ThemeCtx).colors;
}

export function useIsDark(): boolean {
  return useContext(ThemeCtx).isDark;
}

/** Мемоизированные стили из фабрики: useThemedStyles((c) => StyleSheet.create({...})). */
export function useThemedStyles<T>(factory: (c: ThemeColors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors]);
}

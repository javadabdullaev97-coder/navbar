// Рантайм-переключение темы. Экраны строят стили через useThemedStyles(),
// а инлайновые цвета берут из useColors() — оба реагируют на смену темы.
// brand: "client" (лесной зелёный) или "master" (бордо).
import { createContext, ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import {
  Brand,
  darkColors,
  lightColors,
  masterDarkColors,
  masterLightColors,
  ThemeColors,
} from "../theme";
import { useStore } from "./store";

type ThemeValue = { colors: ThemeColors; isDark: boolean; brand: Brand };
const ThemeCtx = createContext<ThemeValue>({ colors: lightColors, isDark: false, brand: "client" });

export function ThemeProvider({ children, brand = "client" }: { children: ReactNode; brand?: Brand }) {
  const { themeMode } = useStore();
  const system = useColorScheme();
  const isDark = themeMode === "dark" || (themeMode === "auto" && system === "dark");
  const value = useMemo<ThemeValue>(() => {
    const colors =
      brand === "master"
        ? isDark ? masterDarkColors : masterLightColors
        : isDark ? darkColors : lightColors;
    return { colors, isDark, brand };
  }, [isDark, brand]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

/** Активная палитра (реагирует на светлую/тёмную тему и бренд). */
export function useColors(): ThemeColors {
  return useContext(ThemeCtx).colors;
}

export function useIsDark(): boolean {
  return useContext(ThemeCtx).isDark;
}

export function useBrand(): Brand {
  return useContext(ThemeCtx).brand;
}

/** Мемоизированные стили из фабрики: useThemedStyles((c) => StyleSheet.create({...})). */
export function useThemedStyles<T>(factory: (c: ThemeColors) => T): T {
  const colors = useColors();
  return useMemo(() => factory(colors), [colors]);
}

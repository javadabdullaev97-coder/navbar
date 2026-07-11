import {
  LibreCaslonText_400Regular,
  LibreCaslonText_700Bold,
} from "@expo-google-fonts/libre-caslon-text";
import {
  Manrope_400Regular,
  Manrope_500Medium,
  Manrope_600SemiBold,
  Manrope_700Bold,
  useFonts,
} from "@expo-google-fonts/manrope";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StoreProvider } from "../lib/store";
import { ThemeProvider, useColors, useIsDark } from "../lib/theme-context";
import { lightColors } from "../theme";

// Внутри провайдера темы: реагирует на светлую/тёмную тему.
function Root() {
  const colors = useColors();
  const isDark = useIsDark();
  return (
    <>
      <StatusBar style={isDark ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(master)" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
    LibreCaslonText_400Regular,
    LibreCaslonText_700Bold,
  });

  if (!loaded) {
    return <View style={{ flex: 1, backgroundColor: lightColors.bg }} />;
  }

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

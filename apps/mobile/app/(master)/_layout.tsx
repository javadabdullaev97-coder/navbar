import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useColors, useIsDark } from "../../lib/theme-context";

function MasterStack() {
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
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="services" />
        <Stack.Screen name="service-form" />
        <Stack.Screen name="schedule" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="share" />
      </Stack>
    </>
  );
}

export default function MasterLayout() {
  // Весь раздел мастера — в бордовом бренде.
  return (
    <ThemeProvider brand="master">
      <MasterStack />
    </ThemeProvider>
  );
}

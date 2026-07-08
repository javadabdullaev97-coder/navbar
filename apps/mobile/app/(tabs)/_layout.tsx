import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import { useT } from "../../lib/i18n";
import { useColors } from "../../lib/theme-context";
import { fonts } from "../../theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const TABS: { name: string; title: string; icon: IconName }[] = [
  { name: "home", title: "Главная", icon: "home" },
  { name: "search", title: "Поиск", icon: "search" },
  { name: "bookings", title: "Записи", icon: "calendar-today" },
  { name: "favorites", title: "Специалисты", icon: "bookmark" },
  { name: "profile", title: "Профиль", icon: "person" },
];

export default function TabsLayout() {
  const tr = useT();
  const colors = useColors();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.outlineVariant,
          borderTopWidth: 0.5,
          height: 84,
          paddingTop: 8,
          paddingBottom: 24,
        },
        tabBarLabelStyle: { fontFamily: fonts.medium, fontSize: 11, marginTop: 2 },
      }}
    >
      {TABS.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: tr(t.title),
            tabBarIcon: ({ color, focused }) => (
              <MaterialIcons name={t.icon} size={24} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

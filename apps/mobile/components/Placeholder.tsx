import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, space } from "../theme";
import { AppText, Sym } from "./ui";

export default function Placeholder({ title, note }: { title: string; note?: string }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{ paddingHorizontal: space.margin, height: 64, justifyContent: "center" }}>
        <AppText variant="headlineMd" color={colors.accent}>{title}</AppText>
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12, padding: space.lg }}>
        <Sym name="auto-awesome" size={40} color={colors.outlineVariant} />
        <AppText variant="bodyMd" color={colors.inkVariant} style={{ textAlign: "center" }}>
          {note ?? "Экран в разработке — перенесём макет 1:1 следующим шагом."}
        </AppText>
      </View>
    </SafeAreaView>
  );
}

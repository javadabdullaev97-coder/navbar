import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Placeholder from "../../components/Placeholder";
import { Sym } from "../../components/ui";
import { colors, space } from "../../theme";

export default function Specialist() {
  const router = useRouter();
  useLocalSearchParams();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{ paddingHorizontal: space.margin, height: 64, justifyContent: "center" }}>
        <Pressable onPress={() => router.back()} hitSlop={10}>
          <Sym name="arrow-back" size={28} color={colors.ink} />
        </Pressable>
      </View>
      <Placeholder title="Профиль специалиста" note="Экран профиля переносим следующим шагом (услуги / портфолио / отзывы + «Записаться»)." />
    </SafeAreaView>
  );
}

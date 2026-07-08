import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Card, PrimaryButton, Sym } from "../components/ui";
import { colors, radius, space } from "../theme";

export default function Review() {
  const router = useRouter();
  const [rating, setRating] = useState(4);
  const [text, setText] = useState("");
  const [anon, setAnon] = useState(false);

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
        <View style={{ width: 26 }} />
        <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="close" size={26} color={colors.accent} /></Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.margin, paddingBottom: 24 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <AppText variant="displayLg" color={colors.accent} style={{ marginBottom: space.md }}>
            Поделитесь опытом
          </AppText>

          {/* Специалист */}
          <Card padding={16} style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>Д</AppText></View>
            <View>
              <AppText variant="labelMd" color={colors.ink}>Дилноза Ахмедова</AppText>
              <AppText variant="labelSm" color={colors.secondary}>Индивидуальная терапия</AppText>
              <AppText variant="labelSm" color={colors.outline} style={{ marginTop: 2 }}>24 июля 2024</AppText>
            </View>
          </Card>

          {/* Рейтинг */}
          <AppText variant="labelMd" color={colors.inkVariant} style={{ textAlign: "center", marginTop: space.lg, marginBottom: space.md }}>
            Оцените качество услуги
          </AppText>
          <View style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)} hitSlop={4}>
                <Sym name="star" size={40} color={n <= rating ? colors.gold : colors.surfaceHighest} />
              </Pressable>
            ))}
          </View>

          {/* Текст */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.lg, marginBottom: 8 }}>
            <AppText variant="labelMd" color={colors.ink}>Ваш отзыв</AppText>
            <AppText variant="labelSm" color={colors.outline}>Необязательно</AppText>
          </View>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Что понравилось больше всего? Оправдались ли ожидания?"
            placeholderTextColor={colors.outline}
            multiline
            style={styles.textarea}
          />

          {/* Фото */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: space.lg, marginBottom: 8 }}>
            <AppText variant="labelMd" color={colors.ink}>Фотографии</AppText>
            <AppText variant="labelSm" color={colors.outline}>Максимум 4</AppText>
          </View>
          <View style={{ flexDirection: "row", gap: 16 }}>
            <View style={styles.addPhoto}>
              <Sym name="add-a-photo" size={24} color={colors.outline} />
              <AppText variant="labelSm" color={colors.outline} style={{ marginTop: 4, fontSize: 10 }}>Добавить</AppText>
            </View>
          </View>

          {/* Анонимно */}
          <View style={styles.anon}>
            <View style={{ flex: 1 }}>
              <AppText variant="labelMd" color={colors.ink}>Оставить отзыв анонимно</AppText>
              <AppText variant="labelSm" color={colors.secondary}>Ваше имя не будет видно другим</AppText>
            </View>
            <Switch value={anon} onValueChange={setAnon} trackColor={{ true: colors.accent, false: colors.surfaceHighest }} thumbColor="#fff" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton label="Отправить отзыв" icon="send" onPress={() => router.back()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin },
  av: { width: 64, height: 64, borderRadius: radius.xl, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 26 },
  textarea: {
    minHeight: 120, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.outlineVariant,
    borderRadius: radius.xl, padding: 16, fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, textAlignVertical: "top",
  },
  addPhoto: {
    width: 96, height: 96, borderRadius: radius.xl, borderWidth: 2, borderColor: colors.outlineVariant, borderStyle: "dashed",
    backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center",
  },
  anon: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, marginTop: space.lg },
  footer: { paddingHorizontal: space.margin, paddingTop: space.md, backgroundColor: colors.bg },
});

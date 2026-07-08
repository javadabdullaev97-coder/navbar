import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import { useT } from "../../lib/i18n";
import { cardShadow, colors, radius, space } from "../../theme";

type Msg = { id: string; me: boolean; text: string; time: string };
const SEED: Msg[] = [
  { id: "1", me: false, text: "Здравствуйте! Я посмотрела ваш запрос. Готовы к нашей сессии?", time: "14:20" },
  { id: "2", me: true, text: "Здравствуйте. Да, готов. Нужно что-то подготовить заранее?", time: "14:22" },
  { id: "3", me: false, text: "Достаточно тихого места и хорошего интернета. До встречи на сессии!", time: "14:25" },
];

export default function Chat() {
  const router = useRouter();
  const t = useT();
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [text, setText] = useState("");
  const scroll = useRef<ScrollView>(null);

  function send() {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { id: String(m.length + 1), me: true, text: text.trim(), time: t("сейчас") }]);
    setText("");
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      {/* Шапка */}
      <View style={styles.header}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <Pressable onPress={() => router.back()} hitSlop={10}><Sym name="arrow-back" size={26} color={colors.accent} /></Pressable>
          <View style={styles.av}><AppText style={styles.avInit} color={colors.inkVariant}>Д</AppText></View>
          <View>
            <AppText variant="labelMd" color={colors.accent}>Дилноза Каримова</AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <View style={styles.dot} />
              <AppText variant="labelSm" color={colors.secondary}>{t("онлайн")}</AppText>
            </View>
          </View>
        </View>
        <Sym name="more-vert" size={24} color={colors.accent} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={8}>
        <ScrollView ref={scroll} contentContainerStyle={{ padding: space.margin, gap: space.md }} showsVerticalScrollIndicator={false}>
          {/* Контекст */}
          <View style={styles.contextRow}>
            <View style={styles.context}>
              <Sym name="calendar-today" size={16} color={colors.accent} />
              <AppText variant="labelSm" color={colors.inkVariant}>{t("Сессия: сегодня, 16:00")}</AppText>
            </View>
          </View>
          <View style={{ alignItems: "center" }}>
            <View style={styles.dayChip}><AppText variant="labelSm" color={colors.secondary}>{t("СЕГОДНЯ")}</AppText></View>
          </View>

          {msgs.map((m) => (
            <View key={m.id} style={{ alignItems: m.me ? "flex-end" : "flex-start" }}>
              <View style={[styles.bubble, m.me ? styles.mine : styles.theirs]}>
                <AppText variant="bodyMd" color={m.me ? colors.onAccent : colors.ink}>{m.text}</AppText>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4, marginHorizontal: 4 }}>
                <AppText variant="labelSm" color={colors.secondary}>{m.time}</AppText>
                {m.me ? <Sym name="done-all" size={16} color={colors.accent} /> : null}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Ввод */}
        <View style={styles.inputBar}>
          <View style={styles.addBtn}><Sym name="add" size={24} color={colors.accent} /></View>
          <View style={styles.field}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={t("Сообщение…")}
              placeholderTextColor={colors.secondary}
              style={styles.input}
              multiline
            />
          </View>
          <Pressable style={styles.sendBtn} onPress={send}>
            <Sym name="send" size={22} color={colors.onAccent} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { height: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: space.margin, borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  av: { width: 40, height: 40, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center" },
  avInit: { fontFamily: "LibreCaslonText_400Regular", fontSize: 18 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.successText },
  contextRow: { alignItems: "center" },
  context: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: colors.surfaceLow, paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, borderWidth: 1, borderColor: colors.outlineVariant },
  dayChip: { backgroundColor: colors.surfaceMid, paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full },
  bubble: { maxWidth: "85%", padding: 14, ...cardShadow },
  theirs: { backgroundColor: colors.surface, borderTopRightRadius: radius.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  mine: { backgroundColor: colors.accent, borderTopLeftRadius: radius.xl, borderBottomLeftRadius: radius.xl, borderBottomRightRadius: radius.xl },
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 12, paddingHorizontal: space.margin, paddingVertical: 12 },
  addBtn: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: colors.surfaceLow, alignItems: "center", justifyContent: "center" },
  field: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.outlineVariant, paddingHorizontal: 14, minHeight: 48, justifyContent: "center" },
  input: { fontFamily: "Manrope_400Regular", fontSize: 16, color: colors.ink, paddingVertical: 12, maxHeight: 120 },
  sendBtn: { width: 48, height: 48, borderRadius: radius.xl, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", ...cardShadow },
});

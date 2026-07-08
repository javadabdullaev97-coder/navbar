import { useRouter } from "expo-router";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText, Sym } from "../../components/ui";
import {
  Lang,
  LANG_LABEL,
  ThemeMode,
  THEME_LABEL,
  useStore,
} from "../../lib/store";
import { cardShadow, colors, radius, space } from "../../theme";

type Option = { key: string; label: string };

function Picker({
  visible, title, options, selected, onSelect, onClose,
}: {
  visible: boolean; title: string; options: Option[]; selected: string;
  onSelect: (k: string) => void; onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, cardShadow]} onPress={() => {}}>
          <AppText variant="labelSm" color={colors.secondary} style={{ textTransform: "uppercase", letterSpacing: 1, marginBottom: space.sm }}>{title}</AppText>
          {options.map((o) => {
            const on = o.key === selected;
            return (
              <Pressable key={o.key} onPress={() => { onSelect(o.key); onClose(); }} style={styles.opt}>
                <AppText variant="bodyMd" color={on ? colors.accent : colors.ink} style={on ? { fontFamily: "Manrope_600SemiBold" } : undefined}>{o.label}</AppText>
                {on ? <Sym name="check" size={22} color={colors.accent} /> : null}
              </Pressable>
            );
          })}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function Profile() {
  const router = useRouter();
  const { role, setRole, lang, setLang, themeMode, setThemeMode } = useStore();
  const [picker, setPicker] = useState<null | "theme" | "lang">(null);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <AppText variant="headlineMd" color={colors.accent}>Настройки</AppText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Профиль */}
        <View style={{ alignItems: "center", paddingTop: 8, paddingBottom: space.lg }}>
          <View style={styles.avatar}>
            <AppText style={{ fontFamily: "LibreCaslonText_400Regular", fontSize: 40, lineHeight: 46 }} color={colors.inkVariant}>А</AppText>
            <View style={styles.editBadge}><Sym name="edit" size={14} color={colors.onAccent} /></View>
          </View>
          <AppText variant="headlineMd" color={colors.ink} style={{ marginTop: 12 }}>Азиз Рахимов</AppText>
          <AppText variant="bodyMd" color={colors.secondary}>+998 90 123-45-67</AppText>
        </View>

        {/* Роль */}
        <View style={{ paddingHorizontal: space.margin, marginBottom: space.lg }}>
          <View style={styles.roleWrap}>
            {(["client", "master"] as const).map((r) => (
              <Pressable key={r} onPress={() => setRole(r)} style={[styles.roleBtn, r === role && styles.roleOn]}>
                <AppText variant="labelMd" color={r === role ? colors.onAccent : colors.secondary}>{r === "client" ? "Клиент" : "Мастер"}</AppText>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Настройки */}
        <View style={styles.group}>
          <Row icon="contrast" label="Тема" value={THEME_LABEL[themeMode]} onPress={() => setPicker("theme")} />
          <Row icon="language" label="Язык" value={LANG_LABEL[lang]} onPress={() => setPicker("lang")} />
          <Row icon="notifications-none" label="Уведомления" onPress={() => router.push("/notifications")} />
          <Row icon="payments" label="Способы оплаты" onPress={() => {}} />
          <Row icon="help-outline" label="Помощь" onPress={() => {}} last />
        </View>

        <View style={{ alignItems: "center", marginTop: space.lg }}>
          <Pressable onPress={() => router.replace("/")} style={({ pressed }) => [{ paddingHorizontal: 32, paddingVertical: 12, borderRadius: radius.xl }, pressed && { opacity: 0.6 }]}>
            <AppText variant="labelMd" color={colors.error}>Выйти</AppText>
          </Pressable>
        </View>
      </ScrollView>

      <Picker
        visible={picker === "theme"}
        title="Тема"
        selected={themeMode}
        options={(["light", "dark", "auto"] as ThemeMode[]).map((k) => ({ key: k, label: THEME_LABEL[k] }))}
        onSelect={(k) => setThemeMode(k as ThemeMode)}
        onClose={() => setPicker(null)}
      />
      <Picker
        visible={picker === "lang"}
        title="Язык"
        selected={lang}
        options={(["ru", "uz", "en"] as Lang[]).map((k) => ({ key: k, label: LANG_LABEL[k] }))}
        onSelect={(k) => setLang(k as Lang)}
        onClose={() => setPicker(null)}
      />
    </SafeAreaView>
  );
}

function Row({ icon, label, value, onPress, last }: { icon: any; label: string; value?: string; onPress: () => void; last?: boolean }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, !last && styles.rowBorder, pressed && { backgroundColor: colors.surfaceMid }]}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <Sym name={icon} size={22} color={colors.accent} />
        <AppText variant="bodyMd" color={colors.ink}>{label}</AppText>
      </View>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        {value ? <AppText variant="bodyMd" color={colors.secondary}>{value}</AppText> : null}
        <Sym name="chevron-right" size={22} color={colors.outline} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: space.margin, height: 56, justifyContent: "center" },
  avatar: { width: 96, height: 96, borderRadius: radius.full, backgroundColor: colors.surfaceMid, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.accentTint },
  editBadge: { position: "absolute", bottom: 0, right: 0, width: 28, height: 28, borderRadius: radius.full, backgroundColor: colors.accent, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.bg },
  roleWrap: { flexDirection: "row", backgroundColor: colors.surfaceLow, borderRadius: radius.full, padding: 4, height: 48 },
  roleBtn: { flex: 1, borderRadius: radius.full, alignItems: "center", justifyContent: "center" },
  roleOn: { backgroundColor: colors.accent },
  group: { marginHorizontal: space.margin, backgroundColor: colors.surfaceLow, borderRadius: radius.xl, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.outlineVariant },
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.x2l, borderTopRightRadius: radius.x2l, padding: space.margin, paddingBottom: 40 },
  opt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 14 },
});

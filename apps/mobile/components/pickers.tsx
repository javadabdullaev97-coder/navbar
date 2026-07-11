// Модальные листы выбора: длительность услуги (шаг 5 мин) и рабочие часы
// (шаг 30 мин). Оба до 24 часов. На базе WheelPicker.
import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";
import { fmtDur, minToHHMM } from "../lib/format";
import { useT } from "../lib/i18n";
import { useColors, useThemedStyles } from "../lib/theme-context";
import { cardShadow, radius, space, ThemeColors } from "../theme";
import { AppText, PrimaryButton } from "./ui";
import { WheelItem, WheelPicker } from "./WheelPicker";

const range = (from: number, to: number, step: number): WheelItem[] => {
  const out: WheelItem[] = [];
  for (let v = from; v <= to; v += step) out.push({ value: v, label: "" });
  return out;
};

const DURATIONS: WheelItem[] = range(5, 1440, 5).map((i) => ({ ...i, label: fmtDur(i.value) }));
const STARTS: WheelItem[] = range(0, 1410, 30).map((i) => ({ ...i, label: minToHHMM(i.value) }));
const ENDS: WheelItem[] = range(30, 1440, 30).map((i) => ({ ...i, label: minToHHMM(i.value) }));

export function DurationSheet({
  visible, value, onSelect, onClose,
}: {
  visible: boolean; value: number; onSelect: (min: number) => void; onClose: () => void;
}) {
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [v, setV] = useState(value);
  useEffect(() => { if (visible) setV(value); }, [visible, value]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, cardShadow]} onPress={() => {}}>
          <View style={styles.grip} />
          <AppText variant="labelMd" color={colors.secondary} style={styles.title}>{t("Длительность услуги")}</AppText>
          <WheelPicker items={DURATIONS} value={v} onChange={setV} />
          <PrimaryButton label={t("Готово")} onPress={() => { onSelect(v); onClose(); }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function HoursSheet({
  visible, start, end, onSelect, onClose,
}: {
  visible: boolean; start: number; end: number; onSelect: (start: number, end: number) => void; onClose: () => void;
}) {
  const t = useT();
  const colors = useColors();
  const styles = useThemedStyles(makeStyles);
  const [s, setS] = useState(start);
  const [e, setE] = useState(end);
  useEffect(() => { if (visible) { setS(start); setE(end); } }, [visible, start, end]);

  // Конец не раньше начала + 30 мин.
  const endVal = e <= s ? s + 30 : e;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={[styles.sheet, cardShadow]} onPress={() => {}}>
          <View style={styles.grip} />
          <AppText variant="labelMd" color={colors.secondary} style={styles.title}>{t("Часы работы")}</AppText>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around" }}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <AppText variant="labelSm" color={colors.secondary} style={{ marginBottom: 4 }}>{t("Начало")}</AppText>
              <WheelPicker items={STARTS} value={s} onChange={setS} width="100%" />
            </View>
            <AppText variant="headlineMd" color={colors.outline}>–</AppText>
            <View style={{ alignItems: "center", flex: 1 }}>
              <AppText variant="labelSm" color={colors.secondary} style={{ marginBottom: 4 }}>{t("Конец")}</AppText>
              <WheelPicker items={ENDS} value={endVal} onChange={setE} width="100%" />
            </View>
          </View>
          <PrimaryButton label={t("Готово")} onPress={() => { onSelect(s, endVal); onClose(); }} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.x2l, borderTopRightRadius: radius.x2l, padding: space.margin, paddingBottom: 40, gap: space.md },
  grip: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant },
  title: { textTransform: "uppercase", letterSpacing: 1, textAlign: "center" },
});

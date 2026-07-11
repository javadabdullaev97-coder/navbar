// Модальные листы выбора: длительность услуги (шаг 5 мин) и рабочие часы
// (шаг 30 мин). Оба до 24 часов. На базе WheelPicker.
// Важно: лист — обычный View (не Pressable), иначе Pressable перехватывает
// жест и колесо «застывает». Закрытие — по тапу в пустую зону сверху.
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

const DURATIONS: WheelItem[] = range(5, 720, 5).map((i) => ({ ...i, label: fmtDur(i.value) })); // до 12 часов
const STARTS: WheelItem[] = range(0, 1410, 30).map((i) => ({ ...i, label: minToHHMM(i.value) }));
const ENDS: WheelItem[] = range(30, 1440, 30).map((i) => ({ ...i, label: minToHHMM(i.value) }));

function Sheet({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.backdrop}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View style={[styles.sheet, cardShadow]}>
        <View style={styles.grip} />
        {children}
      </View>
    </View>
  );
}

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
      <Sheet onClose={onClose}>
        <AppText variant="labelMd" color={colors.secondary} style={styles.title}>{t("Длительность услуги")}</AppText>
        <WheelPicker key={visible ? "open" : "closed"} items={DURATIONS} value={v} onChange={setV} />
        <PrimaryButton label={t("Готово")} onPress={() => { onSelect(v); onClose(); }} />
      </Sheet>
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

  const endVal = e <= s ? s + 30 : e;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Sheet onClose={onClose}>
        <AppText variant="labelMd" color={colors.secondary} style={styles.title}>{t("Часы работы")}</AppText>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={{ alignItems: "center", flex: 1 }}>
            <AppText variant="labelSm" color={colors.secondary} style={{ marginBottom: 4 }}>{t("Начало")}</AppText>
            <WheelPicker key={visible ? "so" : "sc"} items={STARTS} value={s} onChange={setS} width="100%" />
          </View>
          <AppText variant="headlineMd" color={colors.outline}>–</AppText>
          <View style={{ alignItems: "center", flex: 1 }}>
            <AppText variant="labelSm" color={colors.secondary} style={{ marginBottom: 4 }}>{t("Конец")}</AppText>
            <WheelPicker key={visible ? "eo" : "ec"} items={ENDS} value={endVal} onChange={setE} width="100%" />
          </View>
        </View>
        <PrimaryButton label={t("Готово")} onPress={() => { onSelect(s, endVal); onClose(); }} />
      </Sheet>
    </Modal>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.x2l, borderTopRightRadius: radius.x2l, padding: space.margin, paddingBottom: 40, gap: space.md },
  grip: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.outlineVariant },
  title: { textTransform: "uppercase", letterSpacing: 1, textAlign: "center" },
});

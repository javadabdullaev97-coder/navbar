// iOS-подобное колесо выбора на чистом JS (ScrollView со snap) —
// работает в Expo Go без нативных модулей.
import { useEffect, useRef, useState } from "react";
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, View } from "react-native";
import { useColors } from "../lib/theme-context";
import { radius } from "../theme";
import { AppText } from "./ui";

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

export type WheelItem = { label: string; value: number };

export function WheelPicker({
  items, value, onChange, width,
}: {
  items: WheelItem[];
  value: number;
  onChange: (v: number) => void;
  width?: number | `${number}%`;
}) {
  const colors = useColors();
  const ref = useRef<ScrollView>(null);
  const initial = Math.max(0, items.findIndex((i) => i.value === value));
  const [active, setActive] = useState(initial);

  // Реакция на внешнюю смену value (например, кнопкой-пресетом).
  useEffect(() => {
    const i = items.findIndex((it) => it.value === value);
    if (i >= 0 && i !== active) {
      setActive(i);
      ref.current?.scrollTo({ y: i * ITEM_H, animated: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    if (i >= 0 && i < items.length && i !== active) setActive(i);
  };
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(items.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / ITEM_H)));
    onChange(items[i].value);
  };

  return (
    <View style={{ height: ITEM_H * VISIBLE, width: width as number, overflow: "hidden" }}>
      <View pointerEvents="none" style={{ position: "absolute", top: PAD, height: ITEM_H, left: 4, right: 4, backgroundColor: colors.surfaceLow, borderRadius: radius.lg }} />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={onEnd}
        contentOffset={{ x: 0, y: initial * ITEM_H }}
        contentContainerStyle={{ paddingVertical: PAD }}
      >
        {items.map((it, i) => (
          <View key={i} style={{ height: ITEM_H, alignItems: "center", justifyContent: "center" }}>
            <AppText variant={i === active ? "bodyLg" : "bodyMd"} color={i === active ? colors.ink : colors.outline}>{it.label}</AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

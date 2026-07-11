// iOS-подобное колесо выбора на чистом JS (ScrollView со snap + инерция) —
// работает в Expo Go без нативных модулей.
import { useRef, useState } from "react";
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

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    if (i >= 0 && i < items.length && i !== active) setActive(i);
  };
  const commit = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.min(items.length - 1, Math.max(0, Math.round(e.nativeEvent.contentOffset.y / ITEM_H)));
    setActive(i);
    onChange(items[i].value);
  };

  return (
    <View style={{ height: ITEM_H * VISIBLE, width: width as number, overflow: "hidden" }}>
      <View pointerEvents="none" style={{ position: "absolute", top: PAD, height: ITEM_H, left: 4, right: 4, backgroundColor: colors.surfaceLow, borderRadius: radius.lg }} />
      <ScrollView
        ref={ref}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        snapToAlignment="start"
        decelerationRate="normal"
        scrollEventThrottle={16}
        onScroll={onScroll}
        onMomentumScrollEnd={commit}
        onScrollEndDrag={commit}
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

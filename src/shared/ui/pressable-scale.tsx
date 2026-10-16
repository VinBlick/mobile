import type { ReactNode } from "react";
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/** pressable with a subtle spring scale + optional haptic tick */
export function PressableScale({
  children,
  style,
  haptic = false,
  onPress,
  disabled,
  ...props
}: Omit<PressableProps, "style" | "children"> & { children: ReactNode; style?: StyleProp<ViewStyle>; haptic?: boolean }) {
  const scale = useSharedValue(1);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      onPressIn={() => {
        scale.set(withSpring(0.97, { damping: 18, stiffness: 400 }));
      }}
      onPressOut={() => {
        scale.set(withSpring(1, { damping: 14, stiffness: 300 }));
      }}
      onPress={(e) => {
        if (haptic) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
        onPress?.(e);
      }}
      style={[style, animated]}
    >
      {children}
    </AnimatedPressable>
  );
}

import Svg, { Circle, Path, Rect } from "react-native-svg";
import { View } from "react-native";
import { colors, fonts } from "@/shared/theme";
import { Text } from "./text";

/** VINblick mark (same drawing as the website icon) */
export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" accessibilityLabel="VINblick">
      <Rect width={64} height={64} rx={14} fill="#FFD200" />
      <Circle cx={32} cy={32} r={24} fill="none" stroke={colors.brandDark} strokeWidth={4} />
      <Path d="m16 35 5-13h22l5 13v11h-6v-5H22v5h-6z" fill={colors.brandDark} />
      <Path d="m23 25-3 9h24l-3-9z" fill="#FFD200" />
      <Path d="M21 38h6m10 0h6" stroke="#FFD200" strokeWidth={3} />
    </Svg>
  );
}

export function Logo() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <LogoMark size={34} />
      <View>
        <Text style={{ fontFamily: fonts.extrabold, fontSize: 20, lineHeight: 22, color: colors.brandDark, letterSpacing: -0.5 }}>
          VIN<Text style={{ fontFamily: fonts.medium, fontSize: 20, color: colors.brandDark }}>blick</Text>
        </Text>
        <Text style={{ fontFamily: fonts.regular, fontSize: 9, letterSpacing: 2.4, color: colors.brandDark }}>Fahrzeugcheck</Text>
      </View>
    </View>
  );
}

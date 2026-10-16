import { Text as RNText, StyleSheet, type TextProps } from "react-native";
import { colors, fonts } from "@/shared/theme";

const variants = StyleSheet.create({
  display: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 36, letterSpacing: -1.2, color: colors.ink },
  h1: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 30, letterSpacing: -0.6, color: colors.ink },
  h2: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 26, letterSpacing: -0.3, color: colors.ink },
  h3: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 22, color: colors.ink },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24, color: colors.ink },
  bodyMuted: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 19, color: colors.muted },
  label: { fontFamily: fonts.bold, fontSize: 14, lineHeight: 20, color: colors.ink },
  overline: { fontFamily: fonts.bold, fontSize: 11, lineHeight: 16, letterSpacing: 0.6, color: colors.brand, textTransform: "uppercase" },
  mono: { fontFamily: fonts.mono, fontSize: 14, letterSpacing: 0.6, color: colors.ink },
});

export type TextVariant = keyof typeof variants;

export function Text({ variant = "body", style, ...props }: TextProps & { variant?: TextVariant }) {
  return <RNText maxFontSizeMultiplier={1.6} style={[variants[variant], style]} {...props} />;
}

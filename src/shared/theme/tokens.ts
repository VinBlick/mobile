import { Platform } from "react-native";

/** design tokens of the website (web/src/app/globals.css) */
export const colors = {
  ink: "#101827",
  muted: "#465263",
  subtle: "#657080",
  brand: "#003B7A",
  brandDark: "#0B2A5E",
  accent: "#FFD400",
  accentPressed: "#EAD327",
  surface: "#F5F7F8",
  line: "#DDE1E5",
  inputBorder: "#CBD1D8",
  white: "#FFFFFF",
  success: "#15803D",
  successBg: "#ECFDF3",
  warning: "#92400E",
  warningBg: "#FFFBEB",
  danger: "#991B1B",
  dangerBg: "#FEF2F2",
  overlay: "rgba(16,24,39,0.55)",
} as const;

export const fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  extrabold: "Inter_800ExtraBold",
  mono: Platform.select({ ios: "Menlo", default: "monospace" }),
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, xxxl: 40 } as const;
export const radius = { sm: 4, md: 6, lg: 8, xl: 12, pill: 999 } as const;

export const shadow = {
  card: {
    shadowColor: "#101827",
    shadowOpacity: 0.06,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
} as const;

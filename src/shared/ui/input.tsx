import { useState, type ComponentRef, type ReactNode, type Ref } from "react";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";
import { colors, fonts, radius } from "@/shared/theme";
import { Text } from "./text";

type InputProps = TextInputProps & {
  label?: string;
  error?: string | null;
  hint?: string | null;
  mono?: boolean;
  right?: ReactNode;
  ref?: Ref<ComponentRef<typeof TextInput>>;
};

export function Input({ label, error, hint, mono, right, style, onFocus, onBlur, ref, ...props }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label ? <Text variant="label">{label}</Text> : null}
      <View style={[styles.field, focused && styles.focused, error ? styles.error : null]}>
        <TextInput
          ref={ref}
          placeholderTextColor="#8A94A3"
          style={[styles.input, mono && styles.mono, style]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {right}
      </View>
      {error ? (
        <Text variant="small" style={{ color: colors.danger }} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="small">{hint}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  focused: { borderColor: colors.brand, borderWidth: 2, paddingHorizontal: 11 },
  error: { borderColor: colors.danger },
  input: { flex: 1, fontFamily: fonts.regular, fontSize: 16, color: colors.ink, paddingVertical: 12 },
  mono: { fontFamily: fonts.mono, letterSpacing: 1.2 },
});

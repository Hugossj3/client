import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { useSettings } from '@/context/SettingsContext';
import { AppText } from './AppText';

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

export function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
}: Props) {
  const { colors, fontScale } = useSettings();

  return (
    <View style={styles.wrap}>
      <AppText variant="muted">{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        style={[
          styles.input,
          {
            color: colors.text,
            backgroundColor: colors.card,
            borderColor: colors.border,
            fontSize: 16 * fontScale,
            minHeight: 50 * Math.max(fontScale, 1),
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 14,
  },
});

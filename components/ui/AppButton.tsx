import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { useSettings } from '@/context/SettingsContext';
import { AppText } from './AppText';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
};

export function AppButton({ label, onPress, variant = 'primary', disabled, loading }: Props) {
  const { colors, fontScale } = useSettings();
  const background =
    variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.surface : 'transparent';
  const borderColor = variant === 'ghost' ? 'transparent' : colors.primary;
  const textColor = variant === 'primary' ? colors.primaryText : colors.primary;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: background,
          borderColor,
          minHeight: 52 * Math.max(fontScale, 1),
          opacity: disabled || loading ? 0.55 : pressed ? 0.85 : 1,
        },
      ]}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <AppText variant="button" style={{ color: textColor, textAlign: 'center' }}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderWidth: 2,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
});

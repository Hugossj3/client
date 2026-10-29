import { Pressable, StyleSheet, View } from 'react-native';

import { useSettings } from '@/context/SettingsContext';
import { AppText } from './AppText';

type Option<T extends string> = { id: T; label: string };

type Props<T extends string> = {
  label: string;
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
};

export function ChoiceRow<T extends string>({ label, value, options, onChange }: Props<T>) {
  const { colors } = useSettings();

  return (
    <View style={styles.wrap}>
      <AppText variant="muted">{label}</AppText>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              onPress={() => onChange(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary : colors.surface,
                  borderColor: colors.primary,
                },
              ]}>
              <AppText style={{ color: selected ? colors.primaryText : colors.primary }}>
                {option.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
});

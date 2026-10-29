import { Text, type TextProps } from 'react-native';

import { useSettings } from '@/context/SettingsContext';

type Props = TextProps & {
  variant?: 'body' | 'title' | 'subtitle' | 'muted' | 'button';
};

const baseSize = {
  body: 16,
  title: 28,
  subtitle: 18,
  muted: 14,
  button: 16,
};

export function AppText({ variant = 'body', style, ...props }: Props) {
  const { colors, fontScale } = useSettings();
  const color =
    variant === 'muted' ? colors.muted : variant === 'button' ? colors.primaryText : colors.text;

  return (
    <Text
      style={[
        {
          color,
          fontSize: baseSize[variant] * fontScale,
          fontWeight: variant === 'title' ? '800' : variant === 'subtitle' ? '700' : '500',
          lineHeight: baseSize[variant] * fontScale * 1.35,
        },
        style,
      ]}
      {...props}
    />
  );
}

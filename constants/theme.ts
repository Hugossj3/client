export const palette = {
  red: '#C41E3A',
  redDark: '#9B1830',
  white: '#FFFFFF',
};

export type ThemeColors = {
  background: string;
  surface: string;
  card: string;
  text: string;
  muted: string;
  primary: string;
  primaryText: string;
  border: string;
  success: string;
  tabBar: string;
};

export const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#FFF6F7',
  card: '#FFFFFF',
  text: '#1B1B1B',
  muted: '#6F6F6F',
  primary: palette.red,
  primaryText: palette.white,
  border: '#F0C9CF',
  success: '#1F7A4D',
  tabBar: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  background: '#16080B',
  surface: '#241014',
  card: '#2C1418',
  text: '#FFFFFF',
  muted: '#C9B4B7',
  primary: '#E23D54',
  primaryText: '#FFFFFF',
  border: '#5A2A33',
  success: '#5DDC9A',
  tabBar: '#1C0B0E',
};

export type FontSizeId = 'small' | 'medium' | 'large';

export const fontSizeScale: Record<FontSizeId, number> = {
  small: 0.9,
  medium: 1,
  large: 1.18,
};

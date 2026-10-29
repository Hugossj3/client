import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme as useSystemScheme } from 'react-native';

import {
  darkColors,
  fontSizeScale,
  lightColors,
  type FontSizeId,
  type ThemeColors,
} from '@/constants/theme';

type SettingsContextValue = {
  darkMode: boolean;
  fontSize: FontSizeId;
  fontScale: number;
  colors: ThemeColors;
  ready: boolean;
  setDarkMode: (value: boolean) => void;
  setFontSize: (value: FontSizeId) => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);
const STORAGE_KEY = 'salarioapp.settings';

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const system = useSystemScheme();
  const [darkMode, setDarkModeState] = useState(system === 'dark');
  const [fontSize, setFontSizeState] = useState<FontSizeId>('medium');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!raw) return;
        const parsed = JSON.parse(raw) as { darkMode?: boolean; fontSize?: FontSizeId };
        if (typeof parsed.darkMode === 'boolean') setDarkModeState(parsed.darkMode);
        if (parsed.fontSize === 'small' || parsed.fontSize === 'medium' || parsed.fontSize === 'large') {
          setFontSizeState(parsed.fontSize);
        }
      })
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ darkMode, fontSize })).catch(() => {});
  }, [darkMode, fontSize, ready]);

  const value = useMemo(
    () => ({
      darkMode,
      fontSize,
      fontScale: fontSizeScale[fontSize],
      colors: darkMode ? darkColors : lightColors,
      ready,
      setDarkMode: setDarkModeState,
      setFontSize: setFontSizeState,
    }),
    [darkMode, fontSize, ready],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings debe usarse dentro de SettingsProvider');
  return ctx;
}

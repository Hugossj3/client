import { Switch, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ChoiceRow } from '@/components/ui/ChoiceRow';
import { useSettings } from '@/context/SettingsContext';
import { API_URL } from '@/lib/api';
import type { FontSizeId } from '@/constants/theme';

export default function AjustesScreen() {
  const { darkMode, setDarkMode, fontSize, setFontSize, colors } = useSettings();

  return (
    <AppScreen
      title="Ajustes"
      subtitle="Personaliza la app: modo oscuro y tamaño de letra. Los cambios se guardan en el dispositivo.">
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: 52,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}>
        <View style={{ flex: 1, paddingRight: 12 }}>
          <AppText variant="subtitle">Modo oscuro</AppText>
          <AppText variant="muted">Fondo oscuro con acentos en rojo.</AppText>
        </View>
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          accessibilityLabel="Activar modo oscuro"
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>

      <ChoiceRow<FontSizeId>
        label="Tamaño de letra"
        value={fontSize}
        onChange={setFontSize}
        options={[
          { id: 'small', label: 'Pequeña' },
          { id: 'medium', label: 'Normal' },
          { id: 'large', label: 'Grande' },
        ]}
      />

      <AppText variant="muted">
        Texto de ejemplo con el tamaño elegido. Debe leerse bien en el móvil y en la web.
      </AppText>
      <AppText variant="muted">API: {API_URL}</AppText>
    </AppScreen>
  );
}

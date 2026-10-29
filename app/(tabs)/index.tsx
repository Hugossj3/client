import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';

export default function HomeScreen() {
  const { colors } = useSettings();
  const { user } = useAuth();

  return (
    <AppScreen
      title="SalarioApp"
      subtitle="Calcula tu nómina de forma clara: un cálculo rápido para todos y otro más preciso si tienes cuenta.">
      <Pressable
        onPress={() => router.push('/calcular')}
        style={[styles.card, { backgroundColor: colors.primary }]}>
        <AppText variant="subtitle" style={{ color: colors.primaryText }}>
          Cálculo rápido
        </AppText>
        <AppText style={{ color: colors.primaryText }}>
          Sin cuenta. Solo sueldo por hora y número de horas.
        </AppText>
      </Pressable>

      <Pressable
        onPress={() => (user ? router.push('/nomina') : router.push('/login'))}
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 2 }]}>
        <AppText variant="subtitle" style={{ color: colors.primary }}>
          Cálculo preciso
        </AppText>
        <AppText variant="muted">
          {user
            ? `Hola, ${user.nombre}. Usa tu perfil fiscal y tu contrato.`
            : 'Requiere cuenta. Aplica cotización e IRPF de la base de datos.'}
        </AppText>
      </Pressable>

      <View style={styles.tips}>
        <AppText variant="subtitle">Cómo usarla</AppText>
        <AppText variant="muted">1. En Calcular introduce horas y precio hora.</AppText>
        <AppText variant="muted">2. Crea cuenta para guardar perfil, contrato y nóminas.</AppText>
        <AppText variant="muted">3. En Ajustes cambia el modo oscuro y el tamaño de letra.</AppText>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    gap: 8,
    minHeight: 120,
    justifyContent: 'center',
  },
  tips: {
    gap: 6,
    marginTop: 8,
  },
});

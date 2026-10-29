import { router } from 'expo-router';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/context/AuthContext';

export default function CuentaScreen() {
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <AppScreen
        title="Tu cuenta"
        subtitle="Regístrate para un cálculo más preciso con perfil fiscal, contrato y nóminas guardadas.">
        <AppButton label="Iniciar sesión" onPress={() => router.push('/login')} />
        <AppButton label="Crear cuenta" variant="secondary" onPress={() => router.push('/registro')} />
      </AppScreen>
    );
  }

  return (
    <AppScreen title={`Hola, ${user.nombre}`} subtitle={user.email}>
      <View>
        <AppText variant="muted">
          Completa tu perfil laboral y calcula la nómina con los datos de la base.
        </AppText>
      </View>
      <AppButton label="Cálculo preciso" onPress={() => router.push('/nomina')} />
      <AppButton label="Perfil fiscal y contrato" variant="secondary" onPress={() => router.push('/perfil')} />
      <AppButton label="Cerrar sesión" variant="ghost" onPress={() => logout()} />
    </AppScreen>
  );
}

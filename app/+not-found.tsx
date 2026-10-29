import { Link, Stack } from 'expo-router';

import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página no encontrada' }} />
      <AppScreen title="Página no encontrada" subtitle="Esa pantalla no existe en SalarioApp.">
        <Link href="/">
          <AppText style={{ color: '#C41E3A' }}>Volver al inicio</AppText>
        </Link>
      </AppScreen>
    </>
  );
}

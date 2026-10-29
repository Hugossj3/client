import { router } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/cuenta');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen title="Iniciar sesión" subtitle="Entra para usar el cálculo preciso y guardar tu perfil.">
      <AppInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        placeholder="tu@email.com"
      />
      <AppInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      {error ? <AppText style={{ color: '#C41E3A' }}>{error}</AppText> : null}
      <AppButton label="Entrar" onPress={onSubmit} loading={loading} />
      <AppButton label="Crear cuenta" variant="ghost" onPress={() => router.push('/registro')} />
    </AppScreen>
  );
}

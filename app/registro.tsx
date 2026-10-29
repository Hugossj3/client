import { router } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { useAuth } from '@/context/AuthContext';

export default function RegistroScreen() {
  const { register } = useAuth();
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    setError('');
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await register(nombre.trim(), email.trim(), password);
      router.replace('/perfil');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen title="Crear cuenta" subtitle="Tus datos se guardan en la base salarioapp.">
      <AppInput label="Nombre" value={nombre} onChangeText={setNombre} placeholder="Ana Pérez" />
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
      <AppButton label="Registrarme" onPress={onSubmit} loading={loading} />
    </AppScreen>
  );
}

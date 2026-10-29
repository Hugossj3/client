import { useState } from 'react';
import { View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ResultCard } from '@/components/ui/ResultCard';
import { api } from '@/lib/api';

type SimpleResult = {
  bruto: number;
  neto: number;
  total_deducciones: number;
  deducciones: { tipo: string; importe: number }[];
  aviso?: string;
};

export default function CalcularScreen() {
  const [sueldoHora, setSueldoHora] = useState('');
  const [horas, setHoras] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<SimpleResult | null>(null);

  async function calcular() {
    setError('');
    setLoading(true);
    try {
      const data = await api<SimpleResult>('/api/calcular/simple', {
        method: 'POST',
        body: {
          sueldo_hora: Number(sueldoHora.replace(',', '.')),
          horas: Number(horas.replace(',', '.')),
        },
      });
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'No se pudo calcular');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen
      title="Cálculo rápido"
      subtitle="Para cualquier usuario. El resultado es orientativo y se obtiene desde la API.">
      <AppInput
        label="Sueldo por hora (€)"
        value={sueldoHora}
        onChangeText={setSueldoHora}
        keyboardType="decimal-pad"
        placeholder="12,50"
      />
      <AppInput
        label="Número de horas"
        value={horas}
        onChangeText={setHoras}
        keyboardType="decimal-pad"
        placeholder="160"
      />
      {error ? <AppText style={{ color: '#C41E3A' }}>{error}</AppText> : null}
      <AppButton label="Calcular salario" onPress={calcular} loading={loading} />
      {result ? (
        <ResultCard
          bruto={result.bruto}
          neto={result.neto}
          totalDeducciones={result.total_deducciones}
          extra={result.deducciones.map((item) => ({
            label: item.tipo,
            value: `${item.importe.toFixed(2)} €`,
          }))}
          avisos={result.aviso ? [result.aviso] : []}
        />
      ) : null}
      <View>
        <AppText variant="muted">
          ¿Quieres IRPF y Seguridad Social según tu situación? Entra en Cuenta y usa el cálculo preciso.
        </AppText>
      </View>
    </AppScreen>
  );
}

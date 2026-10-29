import { router } from 'expo-router';
import { useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ResultCard } from '@/components/ui/ResultCard';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type PrecisoResult = {
  bruto: number;
  neto: number;
  total_deducciones: number;
  porcentaje_jornada: number;
  irpf: { cuota_mensual: number; minimo_personal: number };
  seguridad_social: { trabajador: number; empresa: number };
  contrato: { tipo_contrato: string; tipo_jornada: string; grupo_cotizacion: string } | null;
  avisos: string[];
  nomina_guardada: { id_nomina: number } | null;
};

export default function NominaScreen() {
  const { token, user } = useAuth();
  const [sueldoHora, setSueldoHora] = useState('');
  const [horas, setHoras] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<PrecisoResult | null>(null);

  if (!user || !token) {
    return (
      <AppScreen title="Cálculo preciso" subtitle="Necesitas una cuenta para este cálculo.">
        <AppButton label="Iniciar sesión" onPress={() => router.replace('/login')} />
      </AppScreen>
    );
  }

  async function calcular(guardar: boolean) {
    setError('');
    guardar ? setSaving(true) : setLoading(true);
    try {
      const data = await api<PrecisoResult>('/api/calcular/preciso', {
        method: 'POST',
        token,
        body: {
          sueldo_hora: Number(sueldoHora.replace(',', '.')),
          horas: Number(horas.replace(',', '.')),
          guardar,
        },
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo calcular');
    } finally {
      setLoading(false);
      setSaving(false);
    }
  }

  return (
    <AppScreen
      title="Cálculo preciso"
      subtitle="Usa cotización e IRPF de la base de datos, tu perfil fiscal y tu contrato.">
      <AppButton label="Completar perfil y contrato" variant="secondary" onPress={() => router.push('/perfil')} />
      <AppInput
        label="Sueldo por hora (€)"
        value={sueldoHora}
        onChangeText={setSueldoHora}
        keyboardType="decimal-pad"
        placeholder="12,50"
      />
      <AppInput
        label="Horas del periodo"
        value={horas}
        onChangeText={setHoras}
        keyboardType="decimal-pad"
        placeholder="160"
      />
      {error ? <AppText style={{ color: '#C41E3A' }}>{error}</AppText> : null}
      <AppButton label="Calcular nómina" onPress={() => calcular(false)} loading={loading} />
      <AppButton
        label="Calcular y guardar"
        variant="secondary"
        onPress={() => calcular(true)}
        loading={saving}
      />
      {result ? (
        <ResultCard
          bruto={result.bruto}
          neto={result.neto}
          totalDeducciones={result.total_deducciones}
          extra={[
            { label: 'SS trabajador', value: `${result.seguridad_social.trabajador.toFixed(2)} €` },
            { label: 'SS empresa', value: `${result.seguridad_social.empresa.toFixed(2)} €` },
            { label: 'IRPF', value: `${result.irpf.cuota_mensual.toFixed(2)} €` },
            { label: 'Jornada', value: `${result.porcentaje_jornada} %` },
            ...(result.contrato
              ? [
                  { label: 'Contrato', value: result.contrato.tipo_contrato },
                  { label: 'Grupo', value: result.contrato.grupo_cotizacion },
                ]
              : []),
          ]}
          avisos={[
            ...result.avisos,
            ...(result.nomina_guardada
              ? [`Nómina guardada (n.º ${result.nomina_guardada.id_nomina}).`]
              : []),
          ]}
        />
      ) : null}
    </AppScreen>
  );
}

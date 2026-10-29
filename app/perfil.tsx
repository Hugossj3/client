import { router } from 'expo-router';
import { useEffect, useState } from 'react';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppScreen } from '@/components/ui/AppScreen';
import { AppText } from '@/components/ui/AppText';
import { ChoiceRow } from '@/components/ui/ChoiceRow';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type CatalogItem = {
  id_tipo_contrato?: number;
  id_tipo_jornada?: number;
  id_grupo_cotizacion?: number;
  nombre: string;
};

type Perfil = {
  id_perfil_fiscal?: number;
  fecha_nacimiento: string;
  situacion_familiar: string;
  situacion_conyugal?: string | null;
  numero_descendientes: number;
  discapacidad: number | boolean;
  grado_discapacidad: number;
};

type Contrato = {
  id_contrato?: number;
  id_tipo_contrato: number;
  id_tipo_jornada: number;
  id_grupo_cotizacion: number;
  fecha_inicio: string;
  porcentaje_jornada: number;
  categoria_profesional?: string | null;
};

export default function PerfilScreen() {
  const { user, token } = useAuth();
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [situacion, setSituacion] = useState('soltero');
  const [descendientes, setDescendientes] = useState('0');
  const [discapacidad, setDiscapacidad] = useState<'no' | 'si'>('no');
  const [grado, setGrado] = useState('0');
  const [perfilId, setPerfilId] = useState<number | null>(null);

  const [contratosTipos, setContratosTipos] = useState<CatalogItem[]>([]);
  const [jornadas, setJornadas] = useState<CatalogItem[]>([]);
  const [grupos, setGrupos] = useState<CatalogItem[]>([]);
  const [tipoContrato, setTipoContrato] = useState('');
  const [tipoJornada, setTipoJornada] = useState('');
  const [grupo, setGrupo] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [porcentaje, setPorcentaje] = useState('100');
  const [categoria, setCategoria] = useState('');
  const [contratoId, setContratoId] = useState<number | null>(null);

  useEffect(() => {
    if (!token || !user) return;
    Promise.all([
      api<CatalogItem[]>('/api/tipos-contrato'),
      api<CatalogItem[]>('/api/tipos-jornada'),
      api<CatalogItem[]>('/api/grupos-cotizacion'),
      api<Perfil[]>(`/api/perfiles-fiscales?id_usuario=${user.id_usuario}`),
      api<Contrato[]>(`/api/contratos?id_usuario=${user.id_usuario}`),
    ])
      .then(([tipos, jornadasData, gruposData, perfiles, contratos]) => {
        setContratosTipos(tipos);
        setJornadas(jornadasData);
        setGrupos(gruposData);
        if (tipos[0]) setTipoContrato(String(tipos[0].id_tipo_contrato));
        if (jornadasData[0]) setTipoJornada(String(jornadasData[0].id_tipo_jornada));
        if (gruposData[0]) setGrupo(String(gruposData[0].id_grupo_cotizacion));

        const perfil = perfiles[0];
        if (perfil) {
          setPerfilId(perfil.id_perfil_fiscal ?? null);
          setFechaNacimiento(String(perfil.fecha_nacimiento).slice(0, 10));
          setSituacion(perfil.situacion_familiar);
          setDescendientes(String(perfil.numero_descendientes));
          setDiscapacidad(perfil.discapacidad ? 'si' : 'no');
          setGrado(String(perfil.grado_discapacidad ?? 0));
        }

        const contrato = contratos[0];
        if (contrato) {
          setContratoId(contrato.id_contrato ?? null);
          setTipoContrato(String(contrato.id_tipo_contrato));
          setTipoJornada(String(contrato.id_tipo_jornada));
          setGrupo(String(contrato.id_grupo_cotizacion));
          setFechaInicio(String(contrato.fecha_inicio).slice(0, 10));
          setPorcentaje(String(contrato.porcentaje_jornada));
          setCategoria(contrato.categoria_profesional ?? '');
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los datos'));
  }, [token, user]);

  if (!user || !token) {
    return (
      <AppScreen title="Perfil laboral" subtitle="Inicia sesión para completar tus datos.">
        <AppButton label="Iniciar sesión" onPress={() => router.replace('/login')} />
      </AppScreen>
    );
  }

  async function guardar() {
    if (!user) return;
    setError('');
    setOk('');
    setLoading(true);
    try {
      const perfilBody = {
        id_usuario: user.id_usuario,
        fecha_nacimiento: fechaNacimiento,
        situacion_familiar: situacion,
        numero_descendientes: Number(descendientes) || 0,
        discapacidad: discapacidad === 'si',
        grado_discapacidad: Number(grado.replace(',', '.')) || 0,
      };
      if (perfilId) {
        await api(`/api/perfiles-fiscales/${perfilId}`, { method: 'PUT', body: perfilBody });
      } else {
        const created = await api<Perfil>('/api/perfiles-fiscales', { method: 'POST', body: perfilBody });
        setPerfilId(created.id_perfil_fiscal ?? null);
      }

      const contratoBody = {
        id_usuario: user.id_usuario,
        id_tipo_contrato: Number(tipoContrato),
        id_tipo_jornada: Number(tipoJornada),
        id_grupo_cotizacion: Number(grupo),
        fecha_inicio: fechaInicio,
        porcentaje_jornada: Number(porcentaje.replace(',', '.')) || 100,
        categoria_profesional: categoria || null,
      };
      if (contratoId) {
        await api(`/api/contratos/${contratoId}`, { method: 'PUT', body: contratoBody });
      } else {
        const created = await api<Contrato>('/api/contratos', { method: 'POST', body: contratoBody });
        setContratoId(created.id_contrato ?? null);
      }
      setOk('Perfil y contrato guardados.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppScreen
      title="Perfil laboral"
      subtitle="Estos datos se usan en el cálculo preciso (IRPF, jornada y grupo de cotización).">
      <AppText variant="subtitle">Perfil fiscal</AppText>
      <AppInput
        label="Fecha de nacimiento (AAAA-MM-DD)"
        value={fechaNacimiento}
        onChangeText={setFechaNacimiento}
        placeholder="1998-04-12"
      />
      <ChoiceRow
        label="Situación familiar"
        value={situacion}
        onChange={setSituacion}
        options={[
          { id: 'soltero', label: 'Soltero/a' },
          { id: 'casado', label: 'Casado/a' },
          { id: 'otros', label: 'Otra' },
        ]}
      />
      <AppInput
        label="Número de descendientes"
        value={descendientes}
        onChangeText={setDescendientes}
        keyboardType="number-pad"
      />
      <ChoiceRow
        label="Discapacidad"
        value={discapacidad}
        onChange={setDiscapacidad}
        options={[
          { id: 'no', label: 'No' },
          { id: 'si', label: 'Sí' },
        ]}
      />
      {discapacidad === 'si' ? (
        <AppInput
          label="Grado de discapacidad (%)"
          value={grado}
          onChangeText={setGrado}
          keyboardType="decimal-pad"
        />
      ) : null}

      <AppText variant="subtitle">Contrato</AppText>
      <ChoiceRow
        label="Tipo de contrato"
        value={tipoContrato}
        onChange={setTipoContrato}
        options={contratosTipos.map((item) => ({
          id: String(item.id_tipo_contrato),
          label: item.nombre,
        }))}
      />
      <ChoiceRow
        label="Jornada"
        value={tipoJornada}
        onChange={setTipoJornada}
        options={jornadas.map((item) => ({
          id: String(item.id_tipo_jornada),
          label: item.nombre,
        }))}
      />
      <ChoiceRow
        label="Grupo de cotización"
        value={grupo}
        onChange={setGrupo}
        options={grupos.map((item) => ({
          id: String(item.id_grupo_cotizacion),
          label: item.nombre,
        }))}
      />
      <AppInput
        label="Fecha de inicio (AAAA-MM-DD)"
        value={fechaInicio}
        onChangeText={setFechaInicio}
        placeholder="2026-01-01"
      />
      <AppInput
        label="Porcentaje de jornada"
        value={porcentaje}
        onChangeText={setPorcentaje}
        keyboardType="decimal-pad"
        placeholder="100"
      />
      <AppInput
        label="Categoría profesional"
        value={categoria}
        onChangeText={setCategoria}
        placeholder="Administrativo"
      />
      {error ? <AppText style={{ color: '#C41E3A' }}>{error}</AppText> : null}
      {ok ? <AppText style={{ color: '#1F7A4D' }}>{ok}</AppText> : null}
      <AppButton label="Guardar datos" onPress={guardar} loading={loading} />
      <AppButton label="Ir al cálculo preciso" variant="secondary" onPress={() => router.push('/nomina')} />
    </AppScreen>
  );
}

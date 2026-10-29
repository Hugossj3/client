import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authRequired } from './auth-middleware.js';
import { query } from './db.js';

const router = Router();

function round2(value: number) {
  return Math.round(value * 100) / 100;
}

function toNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const FALLBACK_SS = [
  { concepto: 'Contingencias comunes', porcentaje_trabajador: 4.7, porcentaje_empresa: 23.6 },
  { concepto: 'MEI', porcentaje_trabajador: 0.13, porcentaje_empresa: 0.67 },
  { concepto: 'Desempleo', porcentaje_trabajador: 1.55, porcentaje_empresa: 5.5 },
  { concepto: 'FOGASA', porcentaje_trabajador: 0, porcentaje_empresa: 0.2 },
  { concepto: 'Formación profesional', porcentaje_trabajador: 0.1, porcentaje_empresa: 0.6 },
  { concepto: 'Accidentes de trabajo', porcentaje_trabajador: 0, porcentaje_empresa: 1.5 },
];

const FALLBACK_TRAMOS = [
  { base_minima: 0, base_maxima: 12450, tipo_porcentaje: 19 },
  { base_minima: 12450, base_maxima: 20200, tipo_porcentaje: 24 },
  { base_minima: 20200, base_maxima: 35200, tipo_porcentaje: 30 },
  { base_minima: 35200, base_maxima: 60000, tipo_porcentaje: 37 },
  { base_minima: 60000, base_maxima: 300000, tipo_porcentaje: 45 },
  { base_minima: 300000, base_maxima: null, tipo_porcentaje: 47 },
];

function irpfAnual(base: number, tramos: typeof FALLBACK_TRAMOS) {
  let restante = Math.max(0, base);
  let cuota = 0;
  for (const tramo of tramos) {
    const tope = tramo.base_maxima ?? Number.POSITIVE_INFINITY;
    const ancho = Math.max(0, tope - tramo.base_minima);
    const gravado = Math.min(restante, ancho);
    cuota += gravado * (tramo.tipo_porcentaje / 100);
    restante -= gravado;
    if (restante <= 0) break;
  }
  return cuota;
}

router.post('/simple', async (req, res) => {
  const sueldoHora = toNumber(req.body?.sueldo_hora);
  const horas = toNumber(req.body?.horas);

  if (sueldoHora <= 0 || horas <= 0) {
    res.status(400).json({ error: 'Indica un sueldo por hora y un número de horas mayores que 0' });
    return;
  }

  const bruto = round2(sueldoHora * horas);
  const ss = round2(bruto * 0.0635);
  const irpf = round2(bruto * 0.15);
  const neto = round2(bruto - ss - irpf);

  res.json({
    tipo: 'simple',
    sueldo_hora: sueldoHora,
    horas,
    bruto,
    deducciones: [
      { tipo: 'Seguridad Social (estimada)', importe: ss },
      { tipo: 'IRPF (estimado 15%)', importe: irpf },
    ],
    total_deducciones: round2(ss + irpf),
    neto,
    aviso:
      'Cálculo orientativo para cualquier usuario. Con una cuenta registrada se aplican cotización e IRPF según la base de datos.',
  });
});

router.post('/preciso', authRequired, async (req, res) => {
  const sueldoHora = toNumber(req.body?.sueldo_hora);
  const horas = toNumber(req.body?.horas);
  const guardar = Boolean(req.body?.guardar);
  const idUsuario = res.locals.auth.id_usuario as number;

  if (sueldoHora <= 0 || horas <= 0) {
    res.status(400).json({ error: 'Indica un sueldo por hora y un número de horas mayores que 0' });
    return;
  }

  const avisos: string[] = [];
  const perfiles = await query<RowDataPacket[]>(
    'SELECT * FROM perfiles_fiscales WHERE id_usuario = :id LIMIT 1',
    { id: idUsuario },
  );
  const perfil = perfiles[0];
  if (!perfil) {
    avisos.push('No hay perfil fiscal. Se aplica IRPF general, sin mínimos por descendientes o discapacidad.');
  }

  const contratos = await query<RowDataPacket[]>(
    `SELECT c.*, tc.nombre AS tipo_contrato, tj.nombre AS tipo_jornada, gc.nombre AS grupo_cotizacion
     FROM contratos c
     JOIN tipos_contrato tc ON tc.id_tipo_contrato = c.id_tipo_contrato
     JOIN tipos_jornada tj ON tj.id_tipo_jornada = c.id_tipo_jornada
     JOIN grupos_cotizacion gc ON gc.id_grupo_cotizacion = c.id_grupo_cotizacion
     WHERE c.id_usuario = :id
     ORDER BY c.fecha_inicio DESC`,
    { id: idUsuario },
  );
  const contrato = contratos[0];
  if (!contrato) {
    avisos.push('No hay contrato guardado. Se usa jornada completa (100%).');
  }

  const porcentajeJornada = toNumber(contrato?.porcentaje_jornada) || 100;
  const bruto = round2(sueldoHora * horas * (porcentajeJornada / 100));

  let parametros = await query<RowDataPacket[]>(
    `SELECT pc.concepto, pc.porcentaje_trabajador, pc.porcentaje_empresa
     FROM parametros_cotizacion pc
     WHERE pc.ejercicio = 2026 AND (pc.fecha_fin IS NULL OR pc.fecha_fin >= CURDATE())`,
  );
  if (!parametros.length) {
    parametros = FALLBACK_SS as unknown as RowDataPacket[];
    avisos.push('No había parámetros de cotización en la base; se han usado valores generales 2026.');
  }

  const detalleSs = parametros.map((p) => {
    const pctTrabajador = toNumber(p.porcentaje_trabajador);
    const pctEmpresa = toNumber(p.porcentaje_empresa);
    return {
      concepto: String(p.concepto),
      porcentaje_trabajador: pctTrabajador,
      porcentaje_empresa: pctEmpresa,
      trabajador: round2(bruto * (pctTrabajador / 100)),
      empresa: round2(bruto * (pctEmpresa / 100)),
    };
  });
  const ssTrabajador = round2(detalleSs.reduce((acc, item) => acc + item.trabajador, 0));
  const ssEmpresa = round2(detalleSs.reduce((acc, item) => acc + item.empresa, 0));

  let tramos = await query<RowDataPacket[]>(
    `SELECT t.base_minima, t.base_maxima, t.tipo_porcentaje
     FROM tramos_irpf t
     JOIN configuracion_irpf c ON c.id_configuracion = t.id_configuracion
     WHERE c.ejercicio = 2026
     ORDER BY t.base_minima ASC`,
  );
  if (!tramos.length) {
    tramos = FALLBACK_TRAMOS as unknown as RowDataPacket[];
    avisos.push('No había tramos IRPF en la base; se han usado tramos generales 2026.');
  }

  const descendientes = toNumber(perfil?.numero_descendientes);
  const discapacidad = Boolean(perfil?.discapacidad);
  const grado = toNumber(perfil?.grado_discapacidad);
  let minimo = 5550;
  if (descendientes > 0) minimo += descendientes * 2400;
  if (discapacidad) minimo += grado >= 65 ? 9000 : 3000;

  const baseAnual = Math.max(0, bruto * 12 - ssTrabajador * 12 - minimo);
  const irpfAnualCuota = irpfAnual(
    baseAnual,
    tramos.map((t) => ({
      base_minima: toNumber(t.base_minima),
      base_maxima: t.base_maxima == null ? null : toNumber(t.base_maxima),
      tipo_porcentaje: toNumber(t.tipo_porcentaje),
    })),
  );
  const irpf = round2(irpfAnualCuota / 12);
  const totalDeducciones = round2(ssTrabajador + irpf);
  const neto = round2(bruto - totalDeducciones);

  let nominaGuardada: { id_nomina: number } | null = null;
  if (guardar) {
    if (!contrato) {
      res.status(400).json({
        error: 'Para guardar la nómina necesitas un contrato en tu perfil',
      });
      return;
    }

    const hoy = new Date();
    const inicio = new Date(hoy.getFullYear(), hoy.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const fin = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0)
      .toISOString()
      .slice(0, 10);

    const result = await query<ResultSetHeader>(
      `INSERT INTO nominas
        (id_usuario, id_contrato, fecha_inicio_periodo, fecha_fin_periodo, tipo_paga, estado,
         total_devengado, total_deducciones, salario_neto)
       VALUES
        (:idUsuario, :idContrato, :inicio, :fin, 'mensual', 'calculada',
         :bruto, :deducciones, :neto)`,
      {
        idUsuario,
        idContrato: contrato.id_contrato,
        inicio,
        fin,
        bruto,
        deducciones: totalDeducciones,
        neto,
      },
    );

    const conceptos = await query<RowDataPacket[]>(
      `SELECT id_concepto FROM conceptos_retributivos WHERE tipo = 'salario_base' LIMIT 1`,
    );
    if (conceptos.length) {
      await query(
        `INSERT INTO nomina_conceptos (id_nomina, id_concepto_retributivo, cantidad, importe)
         VALUES (:idNomina, :idConcepto, :horas, :bruto)`,
        {
          idNomina: result.insertId,
          idConcepto: conceptos[0].id_concepto,
          horas,
          bruto,
        },
      );
    }

    await query(
      `INSERT INTO deducciones (id_nomina, tipo, descripcion, importe)
       VALUES
        (:idNomina, 'ss', 'Seguridad Social trabajador', :ss),
        (:idNomina, 'irpf', 'Retención IRPF', :irpf)`,
      { idNomina: result.insertId, ss: ssTrabajador, irpf },
    );

    nominaGuardada = { id_nomina: result.insertId };
  }

  res.json({
    tipo: 'preciso',
    sueldo_hora: sueldoHora,
    horas,
    porcentaje_jornada: porcentajeJornada,
    contrato: contrato
      ? {
          id_contrato: contrato.id_contrato,
          tipo_contrato: contrato.tipo_contrato,
          tipo_jornada: contrato.tipo_jornada,
          grupo_cotizacion: contrato.grupo_cotizacion,
          categoria_profesional: contrato.categoria_profesional,
        }
      : null,
    perfil: perfil
      ? {
          situacion_familiar: perfil.situacion_familiar,
          numero_descendientes: descendientes,
          discapacidad,
          grado_discapacidad: grado,
        }
      : null,
    bruto,
    seguridad_social: {
      trabajador: ssTrabajador,
      empresa: ssEmpresa,
      detalle: detalleSs,
    },
    irpf: {
      minimo_personal: minimo,
      base_anual: round2(baseAnual),
      cuota_mensual: irpf,
    },
    total_deducciones: totalDeducciones,
    neto,
    avisos,
    nomina_guardada: nominaGuardada,
  });
});

export default router;

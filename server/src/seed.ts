import type { RowDataPacket } from 'mysql2';
import { query } from './db.js';

export async function seedCalculoData() {
  const config = await query<RowDataPacket[]>(
    'SELECT id_configuracion FROM configuracion_irpf WHERE ejercicio = 2026 LIMIT 1',
  );
  if (config.length) {
    const tramos = await query<RowDataPacket[]>(
      'SELECT id_tramo FROM tramos_irpf WHERE id_configuracion = :id LIMIT 1',
      { id: config[0].id_configuracion },
    );
    if (!tramos.length) {
      await query(
        `INSERT INTO tramos_irpf (id_configuracion, base_minima, base_maxima, tipo_porcentaje)
         VALUES
         (:id, 0, 12450, 19),
         (:id, 12450, 20200, 24),
         (:id, 20200, 35200, 30),
         (:id, 35200, 60000, 37),
         (:id, 60000, 300000, 45),
         (:id, 300000, NULL, 47)`,
        { id: config[0].id_configuracion },
      );
    }
  }

  const params = await query<RowDataPacket[]>(
    'SELECT id_parametro FROM parametros_cotizacion WHERE ejercicio = 2026 LIMIT 1',
  );
  if (params.length) return;

  const tipos = await query<RowDataPacket[]>(
    'SELECT id_tipo_cotizacion, nombre FROM tipos_cotizacion',
  );
  const byName = Object.fromEntries(tipos.map((t) => [t.nombre, t.id_tipo_cotizacion]));

  const filas = [
    ['Contingencias comunes', 'CC', 4.7, 23.6],
    ['MEI', 'MEI', 0.13, 0.67],
    ['Desempleo', 'Desempleo', 1.55, 5.5],
    ['FOGASA', 'FOGASA', 0, 0.2],
    ['Formación profesional', 'FP', 0.1, 0.6],
    ['Accidentes de trabajo', 'AT/EP', 0, 1.5],
  ] as const;

  for (const [nombre, concepto, trabajador, empresa] of filas) {
    const idTipo = byName[nombre];
    if (!idTipo) continue;
    await query(
      `INSERT INTO parametros_cotizacion
        (id_tipo_cotizacion, ejercicio, concepto, porcentaje_trabajador, porcentaje_empresa, fecha_inicio, fecha_fin)
       VALUES
        (:idTipo, 2026, :concepto, :trabajador, :empresa, '2026-01-01', '2026-12-31')`,
      { idTipo, concepto, trabajador, empresa },
    );
  }
}

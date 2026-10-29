import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { query } from './db.js';

const router = Router();

router.get('/usuarios/:id/perfil-fiscal', async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM perfiles_fiscales WHERE id_usuario = :id LIMIT 1',
    { id: req.params.id },
  );
  if (!rows.length) {
    res.status(404).json({ error: 'Perfil fiscal no encontrado' });
    return;
  }
  res.json(rows[0]);
});

router.get('/usuarios/:id/contratos', async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    `SELECT c.*,
            tc.nombre AS tipo_contrato,
            tj.nombre AS tipo_jornada,
            gc.nombre AS grupo_cotizacion
     FROM contratos c
     JOIN tipos_contrato tc ON tc.id_tipo_contrato = c.id_tipo_contrato
     JOIN tipos_jornada tj ON tj.id_tipo_jornada = c.id_tipo_jornada
     JOIN grupos_cotizacion gc ON gc.id_grupo_cotizacion = c.id_grupo_cotizacion
     WHERE c.id_usuario = :id`,
    { id: req.params.id },
  );
  res.json(rows);
});

router.get('/usuarios/:id/nominas', async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM nominas WHERE id_usuario = :id ORDER BY fecha_inicio_periodo DESC',
    { id: req.params.id },
  );
  res.json(rows);
});

router.get('/perfiles-fiscales/:id/descendientes', async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM descendientes WHERE id_perfil_fiscal = :id',
    { id: req.params.id },
  );
  res.json(rows);
});

router.get('/nominas/:id/detalle', async (req, res) => {
  const nominas = await query<RowDataPacket[]>(
    'SELECT * FROM nominas WHERE id_nomina = :id LIMIT 1',
    { id: req.params.id },
  );
  if (!nominas.length) {
    res.status(404).json({ error: 'Nómina no encontrada' });
    return;
  }

  const [conceptos, deducciones, bases] = await Promise.all([
    query<RowDataPacket[]>(
      `SELECT nc.*, cr.nombre, cr.tipo, cr.es_salarial, cr.cotiza_ss, cr.tributa_irpf
       FROM nomina_conceptos nc
       JOIN conceptos_retributivos cr ON cr.id_concepto = nc.id_concepto_retributivo
       WHERE nc.id_nomina = :id`,
      { id: req.params.id },
    ),
    query<RowDataPacket[]>(
      'SELECT * FROM deducciones WHERE id_nomina = :id',
      { id: req.params.id },
    ),
    query<RowDataPacket[]>(
      `SELECT bc.*, tb.nombre AS tipo_base
       FROM bases_cotizacion bc
       JOIN tipos_base tb ON tb.id_tipo_base = bc.id_tipo_base
       WHERE bc.id_nomina = :id`,
      { id: req.params.id },
    ),
  ]);

  res.json({
    nomina: nominas[0],
    conceptos,
    deducciones,
    bases,
  });
});

router.get('/configuracion-irpf/:id/tramos', async (req, res) => {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM tramos_irpf WHERE id_configuracion = :id ORDER BY base_minima ASC',
    { id: req.params.id },
  );
  res.json(rows);
});

export default router;

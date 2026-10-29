import bcrypt from 'bcryptjs';
import { Router } from 'express';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { query } from './db.js';
import type { ResourceConfig } from './types.js';

function pickWritable(body: Record<string, unknown>, writable: string[]) {
  const data: Record<string, unknown> = {};
  for (const field of writable) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }
  return data;
}

function hideFields<T extends Record<string, unknown>>(row: T, hidden: string[] = []): T {
  if (!hidden.length) return row;
  const clone = { ...row };
  for (const field of hidden) {
    delete clone[field];
  }
  return clone;
}

async function hashSensitive(data: Record<string, unknown>, hashFields: string[] = []) {
  for (const field of hashFields) {
    if (typeof data[field] === 'string' && data[field]) {
      data[field] = await bcrypt.hash(data[field] as string, 10);
    }
  }
}

export function createCrudRouter(config: ResourceConfig) {
  const router = Router();
  const { table, pk, writable, filterable = [], hidden = [], hashFields = [] } = config;

  router.get('/', async (req, res) => {
    const filters: Record<string, unknown> = {};
    const where: string[] = [];

    for (const field of filterable) {
      if (req.query[field] !== undefined) {
        filters[field] = req.query[field];
        where.push(`\`${field}\` = :${field}`);
      }
    }

    const sql = where.length
      ? `SELECT * FROM \`${table}\` WHERE ${where.join(' AND ')}`
      : `SELECT * FROM \`${table}\``;

    const rows = await query<RowDataPacket[]>(sql, filters);
    res.json(rows.map((row) => hideFields(row, hidden)));
  });

  router.get('/:id', async (req, res) => {
    const rows = await query<RowDataPacket[]>(
      `SELECT * FROM \`${table}\` WHERE \`${pk}\` = :id LIMIT 1`,
      { id: req.params.id },
    );
    if (!rows.length) {
      res.status(404).json({ error: 'Recurso no encontrado' });
      return;
    }
    res.json(hideFields(rows[0], hidden));
  });

  router.post('/', async (req, res) => {
    const data = pickWritable(req.body ?? {}, writable);
    if (!Object.keys(data).length) {
      res.status(400).json({ error: 'No hay campos válidos para crear' });
      return;
    }
    await hashSensitive(data, hashFields);

    const fields = Object.keys(data);
    const sql = `INSERT INTO \`${table}\` (${fields.map((f) => `\`${f}\``).join(', ')})
      VALUES (${fields.map((f) => `:${f}`).join(', ')})`;
    const result = await query<ResultSetHeader>(sql, data);
    const created = await query<RowDataPacket[]>(
      `SELECT * FROM \`${table}\` WHERE \`${pk}\` = :id LIMIT 1`,
      { id: result.insertId },
    );
    res.status(201).json(hideFields(created[0], hidden));
  });

  router.put('/:id', async (req, res) => {
    const data = pickWritable(req.body ?? {}, writable);
    if (!Object.keys(data).length) {
      res.status(400).json({ error: 'No hay campos válidos para actualizar' });
      return;
    }
    await hashSensitive(data, hashFields);

    const fields = Object.keys(data);
    const sql = `UPDATE \`${table}\` SET ${fields.map((f) => `\`${f}\` = :${f}`).join(', ')}
      WHERE \`${pk}\` = :id`;
    const result = await query<ResultSetHeader>(sql, { ...data, id: req.params.id });
    if (!result.affectedRows) {
      res.status(404).json({ error: 'Recurso no encontrado' });
      return;
    }
    const updated = await query<RowDataPacket[]>(
      `SELECT * FROM \`${table}\` WHERE \`${pk}\` = :id LIMIT 1`,
      { id: req.params.id },
    );
    res.json(hideFields(updated[0], hidden));
  });

  router.delete('/:id', async (req, res) => {
    const result = await query<ResultSetHeader>(
      `DELETE FROM \`${table}\` WHERE \`${pk}\` = :id`,
      { id: req.params.id },
    );
    if (!result.affectedRows) {
      res.status(404).json({ error: 'Recurso no encontrado' });
      return;
    }
    res.status(204).send();
  });

  return router;
}

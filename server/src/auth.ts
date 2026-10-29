import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { authRequired } from './auth-middleware.js';
import { query } from './db.js';

const router = Router();

function publicUser(row: RowDataPacket) {
  const { password: _password, ...user } = row;
  return user;
}

router.post('/register', async (req, res) => {
  const { nombre, email, password, rol } = req.body ?? {};
  if (!nombre || !email || !password) {
    res.status(400).json({ error: 'nombre, email y password son obligatorios' });
    return;
  }

  const hash = await bcrypt.hash(String(password), 10);
  try {
    const result = await query<ResultSetHeader>(
      `INSERT INTO usuarios (nombre, email, password, rol)
       VALUES (:nombre, :email, :password, :rol)`,
      { nombre, email, password: hash, rol: rol ?? 'usuario' },
    );
    const rows = await query<RowDataPacket[]>(
      'SELECT * FROM usuarios WHERE id_usuario = :id LIMIT 1',
      { id: result.insertId },
    );
    const usuario = publicUser(rows[0]);
    const secret = process.env.JWT_SECRET ?? 'dev-secret';
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, email: usuario.email, rol: usuario.rol },
      secret,
      { expiresIn: '7d' },
    );
    res.status(201).json({ token, usuario });
  } catch (error: unknown) {
    const err = error as { code?: string };
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ error: 'El email ya está registrado' });
      return;
    }
    throw error;
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) {
    res.status(400).json({ error: 'email y password son obligatorios' });
    return;
  }

  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE email = :email LIMIT 1',
    { email },
  );
  if (!rows.length) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const user = rows[0];
  const ok = await bcrypt.compare(String(password), String(user.password));
  if (!ok || !user.activo) {
    res.status(401).json({ error: 'Credenciales inválidas' });
    return;
  }

  const secret = process.env.JWT_SECRET ?? 'dev-secret';
  const token = jwt.sign(
    { id_usuario: user.id_usuario, email: user.email, rol: user.rol },
    secret,
    { expiresIn: '7d' },
  );

  res.json({ token, usuario: publicUser(user) });
});

router.get('/me', authRequired, async (_req, res) => {
  const rows = await query<RowDataPacket[]>(
    'SELECT * FROM usuarios WHERE id_usuario = :id LIMIT 1',
    { id: res.locals.auth.id_usuario },
  );
  if (!rows.length) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  res.json(publicUser(rows[0]));
});

export default router;

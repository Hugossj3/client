import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type AuthPayload = {
  id_usuario: number;
  email: string;
  rol: string;
};

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Inicia sesión para continuar' });
    return;
  }

  try {
    const payload = jwt.verify(
      header.slice(7),
      process.env.JWT_SECRET ?? 'dev-secret',
    ) as AuthPayload;
    res.locals.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Sesión no válida. Vuelve a iniciar sesión' });
  }
}

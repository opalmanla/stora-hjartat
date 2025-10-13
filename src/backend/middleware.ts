import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { AutentiseringsForfragan } from './types.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function autentiseraAnvandare(req: AutentiseringsForfragan, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Du har inte lggat in!' });
      return;
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string, anvandarNamn: string };
    req.anvandare = {id: decoded.id, anvandarNamn: decoded.anvandarNamn};
    next();
  } catch (error) {
    res.status(401).json({ error: 'Ogiltig token' });
  }
}
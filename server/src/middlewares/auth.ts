import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export interface AuthReq extends Request { user?: { id: string; role: 'ADMIN'|'USER'; fullName: string; email: string } }

export function verifyJWT(req: AuthReq, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return res.status(401).json({ message: 'Thiếu token' });
  try {
    const token = h.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ' });
  }
}

export function requireAdmin(req: AuthReq, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Cần quyền ADMIN' });
  next();
}

export function signToken(u:{id:string; role:'ADMIN'|'USER'; fullName:string; email:string}) {
  return jwt.sign(u, JWT_SECRET, { expiresIn: '7d' });
}

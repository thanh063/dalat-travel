import { NextFunction, Request, Response } from 'express';

export function errorHandler(err:any, _req:Request, res:Response, _next:NextFunction) {
  console.error('[ERR]', err);

  // Prisma P2002 (unique)
  if (err?.code === 'P2002') {
    return res.status(409).json({ message: 'Trùng dữ liệu unique', meta: err.meta });
  }
  // Validation
  if (err?.status && err?.message) {
    return res.status(err.status).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Có lỗi xảy ra, vui lòng thử lại.' });
}

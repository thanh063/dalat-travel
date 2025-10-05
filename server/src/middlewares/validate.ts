import { ZodError, ZodTypeAny } from 'zod';
import { Request, Response, NextFunction } from 'express';

/**
 * Dùng cho mọi schema Zod (v4). Schema có thể là ZodObject hoặc bất kỳ ZodType.
 * Ta parse { body, query, params } cho tiện validate tổng hợp.
 */
export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      }) as any;

      // nếu schema có các phần body/query/params thì gán lại (giữ nguyên nếu không có)
      if (parsed?.body) req.body = parsed.body;
      if (parsed?.query) req.query = parsed.query;
      if (parsed?.params) req.params = parsed.params;

      next();
    } catch (err) {
      const z = err as ZodError;
      return res
        .status(400)
        .json({ message: 'Dữ liệu không hợp lệ', errors: z.flatten?.() ?? String(err) });
    }
  };

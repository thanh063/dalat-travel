import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyJWT, requireAdmin } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { BookingCreateSchema, BookingUpdateSchema, PagingQuery } from '../validators/schemas';

const router = Router();

/** POST /api/bookings  (user) */
router.post('/', verifyJWT, validate(BookingCreateSchema), async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { placeId, visitDate, persons } = req.body as { placeId: string; visitDate: string | Date; persons: number };
    const place = await prisma.place.findUnique({ where: { id: placeId } });
    if (!place) return res.status(400).json({ message: 'Địa điểm không tồn tại' });

    const unitPrice = place.price;
    const total = unitPrice * persons;

    const booking = await prisma.booking.create({
      data: {
        userId, placeId,
        visitDate: new Date(visitDate),
        persons, unitPrice, total, status: 'PENDING'
      }
    });
    res.json(booking);
  } catch (e) { next(e); }
});

/** GET /api/bookings/me  (user) */
router.get('/me', verifyJWT, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const items = await prisma.booking.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { place: true }
    });
    res.json(items);
  } catch (e) { next(e); }
});

/** GET /api/bookings (ADMIN) + paginate/search/sort */
router.get('/', verifyJWT, requireAdmin, validate(PagingQuery), async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const pageSize = Number(req.query.pageSize || 20);
    const search = String(req.query.search || '');
    const [field, dirRaw] = String(req.query.sort || 'createdAt:desc').split(':');
    const dir = dirRaw === 'asc' ? 'asc' : 'desc';

    const allowed = new Set(['createdAt', 'total', 'status']);
    const orderBy = allowed.has(field) ? ({ [field]: dir } as any) : { createdAt: 'desc' };

    const where = search
      ? {
          OR: [
            { user: { fullName: { contains: search, mode: 'insensitive' as any } } },
            { place: { name: { contains: search, mode: 'insensitive' as any } } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { user: true, place: true },
      }),
      prisma.booking.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  } catch (e) { next(e); }
});

/** PUT /api/bookings/:id (ADMIN)  body:{status} */
router.put('/:id', verifyJWT, requireAdmin, validate(BookingUpdateSchema), async (req, res, next) => {
  try {
    const updated = await prisma.booking.update({
      where: { id: req.params.id },
      data: { status: req.body.status },
      include: { user: true, place: true },
    });
    res.json(updated);
  } catch (e) { next(e); }
});

export default router;

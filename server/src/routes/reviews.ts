import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyJWT } from '../middlewares/auth';
import { validate } from '../middlewares/validate';
import { ReviewCreateSchema, ReviewModifySchema } from '../validators/schemas';

const router = Router({ mergeParams: true });

/** GET /api/places/:placeId/reviews */
router.get('/:placeId/reviews', async (req, res, next) => {
  try {
    const items = await prisma.review.findMany({
      where: { placeId: req.params.placeId },
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    });
    res.json(items);
  } catch (e) { next(e); }
});

/** POST /api/places/:placeId/reviews  (đăng nhập) */
router.post('/:placeId/reviews', verifyJWT, validate(ReviewCreateSchema), async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const placeId = req.params.placeId;
    const { rating, content } = req.body;

    const existed = await prisma.review.findFirst({ where: { placeId, userId } });
    if (existed) return res.status(400).json({ message: 'Bạn đã đánh giá địa điểm này' });

    const rv = await prisma.review.create({ data: { placeId, userId, rating, content: content ?? '' } });

    const agg = await prisma.review.aggregate({ where: { placeId }, _avg: { rating: true }, _count: true });
    await prisma.place.update({ where: { id: placeId }, data: { rating: agg._avg.rating || 0, ratingCount: agg._count } });

    res.json(rv);
  } catch (e) { next(e); }
});

/** PUT /api/places/:placeId/reviews/:id  (chủ review hoặc admin) */
router.put('/:placeId/reviews/:id', verifyJWT, validate(ReviewModifySchema), async (req, res, next) => {
  try {
    const user = (req as any).user;
    const { placeId, id } = req.params;

    const found = await prisma.review.findUnique({ where: { id } });
    if (!found || found.placeId !== placeId) return res.status(404).json({ message: 'Không tìm thấy review' });
    if (user.role !== 'ADMIN' && found.userId !== user.id) return res.status(403).json({ message: 'Không có quyền' });

    const rv = await prisma.review.update({ where: { id }, data: { rating: req.body.rating, content: req.body.content } });

    const agg = await prisma.review.aggregate({ where: { placeId }, _avg: { rating: true }, _count: true });
    await prisma.place.update({ where: { id: placeId }, data: { rating: agg._avg.rating || 0, ratingCount: agg._count } });

    res.json(rv);
  } catch (e) { next(e); }
});

/** DELETE /api/places/:placeId/reviews/:id  (chủ review hoặc admin) */
router.delete('/:placeId/reviews/:id', verifyJWT, async (req, res, next) => {
  try {
    const user = (req as any).user;
    const { placeId, id } = req.params;

    const found = await prisma.review.findUnique({ where: { id } });
    if (!found || found.placeId !== placeId) return res.status(404).json({ message: 'Không tìm thấy review' });
    if (user.role !== 'ADMIN' && found.userId !== user.id) return res.status(403).json({ message: 'Không có quyền' });

    await prisma.review.delete({ where: { id } });

    const agg = await prisma.review.aggregate({ where: { placeId }, _avg: { rating: true }, _count: true });
    await prisma.place.update({ where: { id: placeId }, data: { rating: agg._avg.rating || 0, ratingCount: agg._count } });

    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;

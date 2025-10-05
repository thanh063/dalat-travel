import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

/** GET /api/analytics/overview (ADMIN) */
router.get('/analytics/overview', verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [
      totalPlaces,
      totalBookings,
      pendingBookings,
      paidThisMonth,
      topPlaces,
      latestBookings,
    ] = await Promise.all([
      prisma.place.count(),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'PENDING' } }),
      prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: 'PAID', createdAt: { gte: monthStart, lt: nextMonth } },
      }),
      prisma.place.findMany({
        orderBy: [{ ratingCount: 'desc' }, { rating: 'desc' }],
        take: 5,
        select: { id: true, name: true, rating: true, ratingCount: true, price: true, slug: true },
      }),
      prisma.booking.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true, status: true, total: true, createdAt: true,
          user: { select: { id: true, fullName: true, email: true } },
          place: { select: { id: true, name: true, slug: true } },
        },
      }),
    ]);

    res.json({
      totalPlaces,
      totalBookings,
      pendingBookings,
      revenueThisMonth: paidThisMonth._sum.total ?? 0,
      topPlaces,
      latestBookings,
      monthStart,
    });
  } catch (e) { next(e); }
});

/** GET /api/analytics/revenue-by-month (ADMIN) – 12 tháng gần nhất */
router.get('/analytics/revenue-by-month', verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    const now = new Date();
    const points: { label: string; total: number }[] = [];

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const sum = await prisma.booking.aggregate({
        _sum: { total: true },
        where: { status: 'PAID', createdAt: { gte: start, lt: end } },
      });

      points.push({ label: `${start.getMonth() + 1}/${start.getFullYear()}`, total: sum._sum.total ?? 0 });
    }

    res.json(points);
  } catch (e) { next(e); }
});

export default router;

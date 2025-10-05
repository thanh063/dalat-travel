import { Router } from 'express';
import { prisma } from '../utils/prisma';
import { verifyJWT, AuthReq } from '../middlewares/auth';

const router = Router();

// POST /api/payments/checkout { bookingId }
router.post('/checkout', verifyJWT, async (req: AuthReq, res, next) => {
  try {
    const { bookingId } = req.body as { bookingId: string };
    const bk = await prisma.booking.findUnique({ where: { id: bookingId, /* userId: req.user!.id */ } });
    if (!bk) return res.status(404).json({ message: 'Booking không tồn tại' });

    // Demo: trả về URL giả lập
    const success = encodeURIComponent(`http://localhost:5173/payments/success?bookingId=${bookingId}`);
    const cancel  = encodeURIComponent(`http://localhost:5173/payments/cancel?bookingId=${bookingId}`);
    const redirectUrl = `http://localhost:5173/payments/checkout?bookingId=${bookingId}&success=${success}&cancel=${cancel}`;
    res.json({ url: redirectUrl });
  } catch (e) { next(e); }
});

// GET /api/payments/success?bookingId=
router.get('/success', async (req, res, next) => {
  try {
    const { bookingId } = req.query as any;
    await prisma.booking.update({ where: { id: bookingId }, data: { status: 'PAID' } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// GET /api/payments/cancel
router.get('/cancel', async (_req, res) => res.json({ ok: true }));
export default router;

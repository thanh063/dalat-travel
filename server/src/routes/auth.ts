import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma';
import { validate } from '../middlewares/validate';
import { AuthLoginSchema, AuthRegisterSchema } from '../validators/schemas';
import { verifyJWT } from '../middlewares/auth';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

const router = Router();

router.post('/register', validate(AuthRegisterSchema), async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { fullName, email, password: hash } });
    // KHÔNG tự đăng nhập; trả về thông tin cơ bản
    res.status(201).json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
  } catch (e: any) {
    // Email trùng => P2002
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(409).json({ message: 'Email đã tồn tại' });
    }
    next(e);
  }
});
router.post('/login', validate(AuthLoginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Sai email hoặc mật khẩu' });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'dev_secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

router.get('/me', verifyJWT, async (req, res) => {
  const u = (req as any).user;
  const user = await prisma.user.findUnique({ where: { id: u.id } });
  if (!user) return res.status(401).json({ message: 'Token không hợp lệ' });
  res.json({ id: user.id, fullName: user.fullName, email: user.email, role: user.role });
});

export default router;

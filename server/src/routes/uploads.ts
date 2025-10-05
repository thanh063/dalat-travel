import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { verifyJWT, requireAdmin } from '../middlewares/auth';

const router = Router();

const dir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, dir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  }
});
const upload = multer({ storage });

// POST /api/uploads/image  (ADMIN)
router.post('/image', verifyJWT, requireAdmin, upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: 'Chưa chọn file' });
  // Trả URL tuyệt đối để client hiển thị ngay
  const url = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
  res.json({ url });
});

export default router;

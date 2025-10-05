import { Router } from 'express'
import { PrismaClient, Role } from '@prisma/client'
import { authRequired, requireRole } from '../middlewares/auth'
import { body, validationResult } from 'express-validator'

const prisma = new PrismaClient()
const router = Router()

// GET /users (admin)
router.get('/', authRequired, requireRole('ADMIN'), async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(users.map(u => ({ id: u.id, email: u.email, fullName: u.fullName, role: u.role })))
  } catch (e) { next(e) }
})

// PATCH /users/:id/role (admin)
router.patch('/:id/role',
  authRequired, requireRole('ADMIN'),
  body('role').isIn(['ADMIN', 'USER']),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: { role: req.body.role as Role }
      })
      res.json({ id: updated.id, role: updated.role })
    } catch (e) { next(e) }
  }
)

export default router

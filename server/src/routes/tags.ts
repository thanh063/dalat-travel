import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { authRequired, requireRole } from '../middlewares/auth'
import { body, validationResult } from 'express-validator'

const prisma = new PrismaClient()
const router = Router()

router.get('/', async (_req, res, next) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    res.json(tags)
  } catch (e) { next(e) }
})

router.post('/',
  authRequired, requireRole('ADMIN'),
  body('name').isLength({ min: 2 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })
      const tag = await prisma.tag.create({ data: { name: req.body.name } })
      res.json(tag)
    } catch (e) { next(e) }
  }
)

router.delete('/:id',
  authRequired, requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      await prisma.tag.delete({ where: { id: req.params.id } })
      res.json({ ok: true })
    } catch (e) { next(e) }
  }
)

export default router

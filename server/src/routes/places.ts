import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../utils/prisma';
import { requireAdmin, verifyJWT } from '../middlewares/auth';
import { toSlug } from '../utils/slug';
import { validate } from '../middlewares/validate';
import { PagingQuery, PlaceCreateSchema, PlaceUpdateSchema } from '../validators/schemas';

const router = Router();

/** GET /api/places?page=&pageSize=&search=&sort=createdAt:desc */
router.get('/', validate(PagingQuery), async (req, res, next) => {
  try {
    const page = parseInt((req.query.page as string) || '1', 10);
    const pageSize = parseInt((req.query.pageSize as string) || '12', 10);
    const search = (req.query.search as string) || '';
    const sort = (req.query.sort as string) || 'createdAt:desc';

    const [field, dirRaw] = sort.split(':');
    const dir = dirRaw === 'asc' ? 'asc' : 'desc';
    const allowedSortFields = new Set(['createdAt', 'price', 'rating']);
    const orderBy = allowedSortFields.has(field) ? ({ [field]: dir } as const) : ({ createdAt: 'desc' } as const);

    const where: Prisma.PlaceWhereInput = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { address: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const [items, total] = await Promise.all([
      prisma.place.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tags: { include: { tag: true } } },
      }),
      prisma.place.count({ where }),
    ]);

    res.json({ items, total, page, pageSize });
  } catch (e) {
    next(e);
  }
});

/** GET /api/places/by-id/:id  (dùng cho Admin edit) */
/** LƯU Ý: Route này đặt TRƯỚC '/:slug' để tránh nuốt '/by-id/...' vào slug */
router.get('/by-id/:id', async (req, res, next) => {
  try {
    const place = await prisma.place.findUnique({
      where: { id: req.params.id },
      include: { tags: { include: { tag: true } } },
    });
    if (!place) return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    res.json(place);
  } catch (e) {
    next(e);
  }
});

/** GET /api/places/:slug (public detail) */
router.get('/:slug', async (req, res, next) => {
  try {
    const place = await prisma.place.findUnique({
      where: { slug: req.params.slug },
      include: {
        tags: { include: { tag: true } },
        reviews: { include: { user: true }, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!place) return res.status(404).json({ message: 'Không tìm thấy địa điểm' });
    res.json(place);
  } catch (e) {
    next(e);
  }
});

/** ADMIN: POST /api/places */
router.post('/', verifyJWT, requireAdmin, validate(PlaceCreateSchema), async (req, res, next) => {
  try {
    const { name, address, price, description, tags, imageUrl } = req.body as {
      name: string;
      address: string;
      price?: number;
      description?: string;
      tags?: string;
      imageUrl?: string;
    };

    // Tạo slug unique
    let slug = toSlug(name);
    let suffix = 1;
    while (await prisma.place.findUnique({ where: { slug } })) {
      slug = `${toSlug(name)}-${suffix++}`;
    }

    // Parse tags "a, b, c" -> [{name, slug}]
    type TagEntry = { name: string; slug: string };
    const tagEntries: TagEntry[] = (tags || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((tn: string) => ({ name: tn, slug: toSlug(tn) }));

    const created = await prisma.place.create({
      data: {
        name,
        slug,
        address,
        price: price ?? 0,
        description,
        imageUrl: imageUrl || null,
        tags: {
          create: await Promise.all(
            tagEntries.map(async (t: TagEntry) => {
              const tag = await prisma.tag.upsert({
                where: { slug: t.slug },
                update: {},
                create: { name: t.name, slug: t.slug },
              });
              return { tagId: tag.id };
            })
          ),
        },
      },
      include: { tags: { include: { tag: true } } },
    });

    res.json(created);
  } catch (e) {
    next(e);
  }
});

/** ADMIN: PUT /api/places/:id */
router.put('/:id', verifyJWT, requireAdmin, validate(PlaceUpdateSchema), async (req, res, next) => {
  try {
    const { name, address, price, description, tags, imageUrl } = req.body as {
      name?: string;
      address?: string;
      price?: number;
      description?: string;
      tags?: string;
      imageUrl?: string | null;
    };

    // Nếu đổi tên -> cập nhật slug unique
    let slugUpdate: string | undefined = undefined;
    if (name) {
      let s = toSlug(name);
      let i = 1;
      while (
        await prisma.place.findFirst({
          where: { slug: s, NOT: { id: req.params.id } },
          select: { id: true },
        })
      ) {
        s = `${toSlug(name)}-${i++}`;
      }
      slugUpdate = s;
    }

    const updated = await prisma.place.update({
      where: { id: req.params.id },
      data: {
        name,
        address,
        price,
        description,
        imageUrl: imageUrl ?? undefined,
        ...(slugUpdate ? { slug: slugUpdate } : {}),
      },
    });

    // Cập nhật tags nếu truyền chuỗi tags
    if (typeof tags === 'string') {
      type TagEntry = { name: string; slug: string };
      const tagEntries: TagEntry[] = tags
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((tn: string) => ({ name: tn, slug: toSlug(tn) }));

      // Xoá toàn bộ mapping cũ rồi tạo lại
      await prisma.placeTag.deleteMany({ where: { placeId: updated.id } });
      for (const t of tagEntries) {
        const tag = await prisma.tag.upsert({
          where: { slug: t.slug },
          update: {},
          create: { name: t.name, slug: t.slug },
        });
        await prisma.placeTag.create({ data: { placeId: updated.id, tagId: tag.id } });
      }
    }

    const full = await prisma.place.findUnique({
      where: { id: updated.id },
      include: { tags: { include: { tag: true } } },
    });
    res.json(full);
  } catch (e) {
    next(e);
  }
});

/** ADMIN: DELETE /api/places/:id */
router.delete('/:id', verifyJWT, requireAdmin, async (req, res, next) => {
  try {
    await prisma.place.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;

import { z } from 'zod';

export const AuthRegisterSchema = z.object({
  body: z.object({
    fullName: z.string().min(1).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
});

export const AuthLoginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
  }),
});

export const PlaceCreateSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(200),
    address: z.string().min(1).max(300),
    price: z.number().int().nonnegative().default(0).optional(),
    description: z.string().max(2000).optional(),
    tags: z.string().max(300).optional(),
    imageUrl: z.string().url().optional(),
  }),
});

export const PlaceUpdateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    address: z.string().min(1).max(300).optional(),
    price: z.number().int().nonnegative().optional(),
    description: z.string().max(2000).optional(),
    tags: z.string().max(300).optional(),
    imageUrl: z.string().url().nullable().optional(),
  }),
});

export const ReviewCreateSchema = z.object({
  params: z.object({ placeId: z.string().min(1) }),
  body: z.object({
    rating: z.number().int().min(1).max(5),
    content: z.string().max(2000).optional().default(''),
  }),
});

export const ReviewModifySchema = z.object({
  params: z.object({ placeId: z.string().min(1), id: z.string().min(1) }),
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    content: z.string().max(2000).optional(),
  }),
});

export const BookingCreateSchema = z.object({
  body: z.object({
    placeId: z.string().min(1),
    visitDate: z.coerce.date(),
    persons: z.number().int().min(1),
  }),
});

export const BookingUpdateSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    status: z.enum(['PENDING', 'PAID', 'CANCELLED']),
  }),
});

export const PagingQuery = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    pageSize: z.coerce.number().int().min(1).max(100).default(12).optional(),
    search: z.string().optional().default(''),
    sort: z.string().optional().default('createdAt:desc'),
  }),
});

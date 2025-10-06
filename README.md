# Đà Lạt Travel

Monorepo:
- `client/` Vite + React
- `server/` Express + Prisma (Postgres)

## Chạy dev
```bash
# 1) Server
cd server
npm i
npx prisma generate
npm run dev

# 2) Client
cd ../client
npm i
npm run dev

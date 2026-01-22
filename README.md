# Orders Microservice

Small NestJS NATS microservice for managing orders and details.

Links
- Service entry: [src/main.ts](src/main.ts)
- App module: [`AppModule`](src/app.module.ts)
- Orders feature: [`OrdersModule`](src/orders/orders.module.ts), [`OrdersController`](src/orders/orders.controller.ts), [`OrdersService`](src/orders/orders.service.ts)
- DB service: [`PrismaService`](src/prisma.service.ts)
- Prisma schema: [prisma/schema.prisma](prisma/schema.prisma)
- Env validation: [`envs`](src/config/envs.ts)
- Scripts: [package.json](package.json)
- Example e2e test: [test/app.e2e-spec.ts](test/app.e2e-spec.ts)
- Env template: [.env.template](.env.template)

Requirements
- Node.js (see package engines; Node >= 18 recommended)
- PostgreSQL
- npx (for Prisma CLI)

Quick start

1. Install deps
```
pnpm install
```

2. Configure env

cp [.env.template](http://_vscodecontentref_/0) .env

Edit .env -> set PORT and DATABASE_URL (e.g. DATABASE_URL="postgres://postgres:postgres@localhost:5437/ordersdb?schema=public")

3. Prisma (generate client & run migrations)

```
npx prisma generate
npx prisma migrate dev --name init
# For production:
npx prisma migrate deploy
```
4. Levantar el servidor de NATS
```
docker run -d --name nats-main -p 4222:4222 -p 6222:6222 -p 8222:8222 nats

```
5. Run locally

```
pnpm run start:dev
```
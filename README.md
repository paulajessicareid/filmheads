# Filmheads

A simple app for tracking movies you want to watch and movies you've watched.

## Developing

```sh
pnpm install
pnpm dev
```

## Database

Local development connects to the shared live database via `DATABASE_URL` in `.env`. **Always use migrations — never `drizzle-kit push`.**

When you change the schema in `src/lib/server/db/schema.ts`:

```sh
pnpm db:generate   # create a new migration in drizzle/
pnpm db:migrate    # apply pending migrations
```

Other database commands:

```sh
pnpm db:studio     # open Drizzle Studio
```

`pnpm db:start` starts a local Docker Postgres instance (from the original scaffold). It is optional and not used when `DATABASE_URL` points at the live database.

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — PostgreSQL connection string
- `ORIGIN` — app URL (e.g. `http://localhost:5173`)
- `BETTER_AUTH_SECRET` — 32+ character secret

## Building

```sh
pnpm build
pnpm preview
```

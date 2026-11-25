# 🌸 Bloom — Fitness & Nutrition Tracker

A full-stack, mobile-first fitness tracker: workouts (with per-set progressive
overload), cardio, nutrition with photos, body-weight & strength progress,
weekly/weight goals, rule-based suggestions, a day/week/month dashboard, and a
fully customizable cute theme — installable to your iPhone home screen.

Built as a **real application**: typed end-to-end, layered architecture, a
proper backend with auth and a database, and all business logic in one shared,
unit-tested place (no duplicated logic across client and server).

---

## Tech stack

| Layer      | Choice |
| ---------- | ------ |
| Framework  | **Next.js 14** (App Router) — frontend **and** backend in one codebase |
| Language   | **TypeScript** (strict) |
| Backend    | Next.js Route Handlers → **service layer** → **Prisma ORM** |
| Database   | **SQLite** for dev (zero-config); swap to **Postgres/Supabase** for prod |
| Auth       | Email + password (scrypt hashing) with a signed **JWT session cookie** (`jose`) |
| Validation | **Zod** schemas shared by API and client |
| UI         | **React** + **Tailwind CSS** with CSS-variable theming; dependency-free SVG charts |

Runtime dependencies are intentionally minimal: `next`, `react`, `@prisma/client`,
`zod`, `jose`.

---

## Quick start

**Prerequisites:** Node.js ≥ 18.18 and npm.

```bash
# 1. Install dependencies
npm install

# 2. Create your env file
cp .env.example .env
#    then set AUTH_SECRET to a long random string, e.g.:
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
#    paste the output as AUTH_SECRET in .env

# 3. Generate the Prisma client, create the SQLite DB, and seed a demo user
npm run setup

# 4. Run it
npm run dev
```

Open <http://localhost:3000>.

**Demo login:** `demo@bloom.app` / `bloom1234` — or register a new account.

### Install on your iPhone
Deploy it (see below), open the URL in Safari → **Share** → **Add to Home
Screen**. It launches full-screen like a native app.

---

## Project structure

```
src/
├── app/
│   ├── (app)/                 # authenticated screens (server-guarded layout)
│   │   ├── today/ train/ meals/ progress/ settings/
│   │   └── layout.tsx         # redirects to /login if signed out; mounts AppShell
│   ├── api/                   # backend — thin Route Handlers
│   │   ├── auth/ (register, login, logout)
│   │   ├── workouts/ cardio/ meals/ weights/ exercises/
│   │   ├── settings/ uploads/ dashboard/ progress/
│   ├── login/ register/       # auth pages
│   ├── layout.tsx  globals.css  page.tsx
│   └── ...
├── components/                # UI kit, charts, screens, providers, theme
└── lib/
    ├── domain/                # PURE business logic — no React, no DB, no I/O
    │   ├── types · dates · units · exercises · theme
    │   ├── stats.ts           # volume, muscle distribution, strength, goals…
    │   └── suggestions.ts     # rule-based suggestion engine
    ├── validation/            # Zod schemas (single source of truth for input)
    ├── server/                # server-only: db, auth, session, http helpers
    │   └── services/          # the ONLY place that touches the database
    └── client/                # typed API client, hooks, image compression
prisma/                        # schema.prisma + seed.ts
docs/ARCHITECTURE.md           # design, data model, decisions, trade-offs
```

### The "no duplicated logic" design
All calculations (stats, muscle distribution, suggestions, macro/date/goal math)
live in **`src/lib/domain`** — pure functions with no framework or I/O imports.
The **server** runs them (in `dashboardService` / `progressService`) and returns
ready-to-render results; the **client** just displays them. One implementation,
used by both sides. Zod schemas in `src/lib/validation` are likewise shared by
the API (request validation) and the client (forms), so the two never drift.

Data flows one way: `app/api/*` (HTTP) → `lib/server/services` (business + DB) →
`lib/domain` (pure logic). Route handlers never touch Prisma directly; services
never render.

---

## npm scripts

| Script | What it does |
| ------ | ------------ |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run setup` | `prisma generate` + `db push` + seed (first-time setup) |
| `npm run db:push` | Apply the schema to the database |
| `npm run db:seed` | Seed the demo user |
| `npm run db:studio` | Open Prisma Studio (browse the DB) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next.js ESLint |

---

## Deployment

### Database (Postgres / Supabase)
1. In `prisma/schema.prisma`, change `datasource db { provider = "postgresql" }`.
2. Set `DATABASE_URL` to your Postgres connection string.
3. Run `npx prisma migrate deploy` (or `prisma db push`).

Because all DB access goes through the service layer and Prisma, no application
code changes are needed to switch databases.

### Hosting
Deploy to any Node host or Vercel (`vercel`). Set `AUTH_SECRET` and
`DATABASE_URL` as environment variables.

> **Note on meal photos:** uploads are written to `public/uploads` on the local
> filesystem, which is perfect for local/self-hosted use. On ephemeral
> serverless platforms (e.g. Vercel) that directory is not persistent — point
> `photoService` at object storage (S3 / Supabase Storage) for production. The
> upload seam is isolated in `src/lib/server/services/photoService.ts`.

---

## Testing & verification

The pure domain layer (the business logic) is unit-tested and type-checked. The
app's client/server boundary, import graph, and API/UI contracts were verified
during development. See `docs/ARCHITECTURE.md` for the testing approach and how
to extend it.

## License

MIT — do what you like.

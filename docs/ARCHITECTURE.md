# Architecture

This document explains how Bloom is put together, the data model, and the
decisions and trade-offs behind it.

## Goals

1. A **real full-stack application**, not a single-file prototype: backend,
   frontend, database, authentication.
2. **No duplicated logic** anywhere — one implementation of every calculation,
   shared by server and client.
3. Clean, layered, typed, and easy to extend or re-point at a cloud database.
4. Mobile-first, installable, cute and fully themeable.

## Layers (strict dependency direction)

```
          ┌─────────────────────────────────────────────┐
  HTTP →  │  app/api/*  (Route Handlers)                 │  validate → delegate
          └───────────────┬─────────────────────────────┘
                          ▼
          ┌─────────────────────────────────────────────┐
          │  lib/server/services/*                       │  business + DB access
          │  (the ONLY place that imports Prisma)        │
          └───────┬───────────────────────────┬─────────┘
                  ▼                             ▼
        ┌──────────────────┐        ┌────────────────────────┐
        │  Prisma (DB)     │        │  lib/domain/* (PURE)    │ ← also used by UI
        └──────────────────┘        │  stats, suggestions,    │
                                     │  dates, units, theme    │
                                     └────────────────────────┘
```

- **Route handlers** are thin: authenticate, validate the body/query with a Zod
  schema, call a service, and return JSON. Shared error handling lives in
  `lib/server/http.ts` (`handle()` maps `AuthError`/`NotFoundError`/`ZodError`
  to status codes), so no handler repeats try/catch logic.
- **Services** (`lib/server/services`) are the sole database boundary. They map
  Prisma rows to DTOs (`lib/server/mappers.ts`) and compose domain logic.
- **Domain** (`lib/domain`) is pure: no React, no Prisma, no I/O. This is where
  volume, muscle distribution, strength history, goal progress, macro/date math,
  and the suggestion engine live. It is imported by services **and** can be used
  by the client — a single source of truth. It is independently unit-tested.
- **Validation** (`lib/validation`) holds Zod schemas used by both the API (to
  validate input) and the client (types inferred from the same schemas).
- **Client** (`lib/client`) is a tiny typed `fetch` wrapper + a `useApi` hook +
  browser-side image compression. Screens render server-computed results.

### Why the dashboard is computed server-side
`dashboardService` and `progressService` run the domain functions on the server
and return ready-to-render summaries (day/week/month stats, muscle distribution,
suggestions, strength series, goal progress). The client never re-computes these
— it just displays them. This keeps the backend authoritative and guarantees
the logic exists in exactly one place.

## Data model (Prisma)

```
User ─┬─ Settings (1:1)      theme, unit, macro targets, weekly + weight goals
      ├─ Exercise (custom)   user-created exercises (built-ins are code constants)
      ├─ Workout (1 per day) ─ WorkoutEntry (per exercise) ─ WorkoutSet (per set)
      ├─ Cardio
      ├─ Meal                calories + macros + optional photo URL
      └─ WeightEntry (1 per day)
```

Key decisions:

- **Built-in exercises are code constants** (`lib/domain/exercises.ts`), not DB
  rows — so the catalog needs no seeding and is identical across installs.
  Custom exercises live in the `Exercise` table and are merged at read time.
- **Each set stores its own reps + weight** (`WorkoutSet`) — this is what makes
  progressive-overload tracking and per-set history possible, as specified.
- **Workout entries snapshot `exerciseName` + `muscleGroup`.** They reference an
  `exerciseId` string but there is deliberately **no foreign key** to `Exercise`.
  That keeps workout history intact even if a custom exercise is later deleted,
  and lets strength progression group by `exerciseId` cheaply.
- **`@@unique([userId, date])`** on `Workout` and `WeightEntry` models the
  "one per day" rule and makes upserts clean.
- Every list query is indexed on `(userId, date)`.

## Authentication

- Passwords hashed with **scrypt** (Node's built-in `crypto`, no native deps);
  format `scrypt$<salt>$<hash>`, compared with `timingSafeEqual`.
- Sessions are a **signed JWT** (`jose`, HS256) in an **httpOnly, SameSite=Lax**
  cookie. `AUTH_SECRET` signs it.
- Page protection is done in the `(app)` **server layout** (`getCurrentUser()` →
  redirect to `/login` if absent) rather than middleware — simpler, fewer
  runtime-specific gotchas. API routes call `requireUser()`.
- All queries are scoped by `userId`; mutations verify ownership before acting.

## Theming

`Settings` stores a preset key, light/dark mode, and optional custom accent
colors. `lib/domain/theme.ts` derives the full palette (a set of CSS variables)
purely from an accent pair + mode. `AppShell` applies those variables to
`:root` whenever settings change, so the entire UI re-themes live. Tailwind
colors map to the CSS variables, so components never hard-code a color.

## Storage efficiency

Meal photos are compressed in the browser (`lib/client/photo.ts`, canvas →
≤720px JPEG q0.6) **before** upload, so stored images stay tiny — matching the
"minimum storage" requirement. The server just persists the already-small file.

## Testing approach

- **Domain logic** is unit-tested (dates, stats, strength history, goal math,
  suggestion rules) — it is pure, so tests need no DB or network.
- The **client/server boundary** is enforced structurally: server modules import
  `server-only`, and no client module imports `@/lib/server`.
- To extend tests: compile `src/lib/domain` and assert against the pure
  functions, or add a test runner (e.g. Vitest) and test services against a
  throwaway SQLite database.

## Trade-offs / future work

- **Units** are stored as entered (a display setting), not converted on switch —
  avoids surprising rounding of logged lifts. Canonical-unit storage with
  conversion is a possible enhancement.
- **Photos** use the local filesystem — swap `photoService` for object storage
  in serverless production (see README).
- **Not yet included** (clean seams exist for each): body measurements &
  progress photos, a food/barcode database, offline support via a service
  worker, and multi-device real-time sync.

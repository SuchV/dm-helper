# DM Helper

DM Helper is a full-stack web application for Tabletop RPG (TTRPG) Game Masters.

It provides a widget-driven workspace to track in-game time, organize session notes, roll dice, and reference PDFs in one place with per-user persisted state.

Built to demonstrate practical product engineering: typed API design, authenticated multi-entity data modeling, and clean UI composition in a modern monorepo.

## Product Preview

<p align="center">
  <img src="docs/screenshots/dashboard-overview.png" alt="DM Helper dashboard overview" width="100%" />
</p>
<p align="center"><em>Main dashboard with notes, PDF reference, game clock, and dice roller widgets active in a single GM workspace.</em></p>

| Game Clock | Notes |
|---|---|
| <img src="docs/screenshots/game-clock-widget.png" alt="Game Clock widget" width="100%" /><br/><sub>Tracks in-world date, weekday, and time for campaign continuity.</sub> | <img src="docs/screenshots/notes-widget.png" alt="Notes widget" width="100%" /><br/><sub>Session note capture with ordering and pinning for fast prep.</sub> |

| Dice Roller | PDF Viewer |
|---|---|
| <img src="docs/screenshots/dice-roller-widget.png" alt="Dice Roller widget" width="100%" /><br/><sub>Roll history and transparent outcome tracking in-session.</sub> | <img src="docs/screenshots/pdf-viewer-widget.png" alt="PDF Viewer widget" width="100%" /><br/><sub>Tabbed rulebook/reference viewing with bookmarks.</sub> |

## Features

- **Widget dashboard** with draggable, per-user widget instances
- **Game Clock** to track in-world date, time, and weekday
- **Notes** with pinning and ordering for session prep
- **Dice Roller** with roll history logs
- **PDF Viewer** with tabs, bookmarks, and reading state
- **Authenticated user workspaces** (Google OAuth + credentials)

## Portfolio Highlights

- **Full-stack architecture:** Next.js App Router frontend with tRPC end-to-end typed procedures
- **Data modeling:** Prisma + SQLite schema with user-scoped relational entities per widget domain
- **Authentication:** NextAuth integration with OAuth and credentials providers
- **Monorepo engineering:** pnpm workspaces + Turborepo with shared UI, API, env, and validator packages
- **Product UX:** Modular widget dashboard designed for real session workflow, not isolated demos

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS
- **API:** tRPC (type-safe end-to-end)
- **Database:** Prisma ORM + SQLite
- **Auth:** NextAuth.js
- **Monorepo:** pnpm workspaces + Turborepo

## Repository Structure

```text
apps/
  webapp/          # Next.js app
packages/
  api/             # tRPC routers and appRouter
  auth/            # NextAuth configuration
  db/              # Prisma schema, client, seed
  env/             # Typed environment validation
  ui/              # Shared UI components
  validators/      # Shared Zod validators
  modal/           # Modal utilities
tooling/
  eslint/
  prettier/
  tailwind/
  typescript/
```

## Getting Started

### 1) Prerequisites

- Node.js **20+**
- pnpm **9+**

### 2) Install dependencies

```bash
pnpm install
```

### 3) Configure environment

Create a `.env` file in the repo root:

```env
DATABASE_URL="file:./packages/db/prisma/dev.db"
PREFIX="@"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_PDF_WORKER_SRC="/pdf.worker.min.mjs"
```

> Notes:
> - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` are required by the current auth config.
> - `NEXTAUTH_SECRET` should be a strong random value.

### 4) Push schema and generate Prisma client

```bash
pnpm --filter @repo/db run db:push
pnpm --filter @repo/db run db:generate
```

### 5) Run the app

```bash
pnpm dev:webapp
```

Open `http://localhost:3000`.

## Developer Commands

From the repository root:

```bash
pnpm dev            # Run workspace dev tasks in parallel
pnpm dev:webapp     # Run only the webapp
pnpm typecheck      # Type-check all packages/apps
pnpm lint           # Lint all packages/apps
pnpm format         # Check formatting
pnpm build          # Build all packages/apps
```

Database helpers:

```bash
pnpm --filter @repo/db run db:studio
pnpm --filter @repo/db run db:seed
```

## Architecture Notes

- Main API entrypoint: `packages/api/src/root.ts`
- Widget state and data are scoped per authenticated user
- Current widget types:
  - `game-clock`
  - `notes`
  - `dice-roller`
  - `pdf-viewer`

## Documentation

- The engineering thesis is currently unpublished and is not linked in this public repository.

## License

Licensed under the MIT License. See `LICENSE`.

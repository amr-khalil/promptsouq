# Implementation Plan: Supabase Database Migration

**Branch**: `002-supabase-db-migration` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-supabase-db-migration/spec.md`

## Summary

Migrate PromptSouq from in-memory mock data arrays to a persistent Supabase Postgres database using Drizzle ORM. This involves: creating Drizzle table schemas for 4 entities (categories, prompts, reviews, testimonials), generating and applying migrations, seeding with existing mock data, rewriting 7 API route handlers to query the database, applying RLS policies via Supabase MCP, and removing the static mock data file. The API response shapes remain identical — this is a backend infrastructure change with zero UI regression.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 18+
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM (new), postgres.js (new), drizzle-kit (new, dev), Zod 4.x
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via connection pooler (transaction mode)
**Testing**: `npm run lint && npm run build` (mandatory after each task per constitution). Playwright E2E deferred to separate feature.
**Target Platform**: Web (Next.js server-side + client-side), deployed to Vercel (future)
**Project Type**: Web application (Next.js monolith with App Router)
**Performance Goals**: No regression from current behavior. Sub-second API responses for all endpoints with 8 seed records.
**Constraints**: No server actions (constitution III). RLS via Supabase MCP only (constitution IV). `prepare: false` on postgres.js for pooler compatibility.
**Scale/Scope**: 4 database tables, 7 API routes to update, 1 seed script, ~22 total records (8 prompts + 8 categories + 3 reviews + 3 testimonials)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | **PASS** | No UI changes. All seeded data is Arabic. |
| II. Mobile-First Responsive | **PASS** | No UI changes. |
| III. Server Components — No Server Actions | **PASS** | API Route Handlers only. No server actions introduced. |
| IV. Supabase + Drizzle Migrations | **PASS** | Schema in `src/db/schema/`, drizzle-kit for migrations, RLS via Supabase MCP. |
| V. Stripe for Payments | **N/A** | No payment changes in this feature. |
| VI. Component-Driven UI (shadcn/ui) | **PASS** | No UI component changes. |
| VII. Playwright E2E Testing | **DEFERRED** | E2E tests for DB-backed flows will be added in a testing feature. Manual verification in this phase. |
| VIII. Zod Schema Validation | **PASS** | Existing Zod schemas preserved. API boundary validation unchanged. |
| IX. React Hook Form | **N/A** | No forms in this feature. |
| X. Page Loading & Error States | **PASS** | Existing loading.tsx and error.tsx files unchanged. DB errors handled in API routes. |

**Gate result**: PASS — no violations. Playwright E2E deferred with justification (infrastructure migration, not user-facing flow change).

### Post-Design Re-check

| Principle | Status | Notes |
|-----------|--------|-------|
| IV. Supabase + Drizzle | **PASS** | Schema files in `src/db/schema/`, barrel export in `index.ts`, client in `src/db/index.ts`, migrations via drizzle-kit, RLS via Supabase MCP. All per constitution. |
| VIII. Zod Validation | **PASS** | Zod schemas remain source of truth for API response types. Drizzle types used only internally in data layer. No duplicate manual interfaces. |

## Project Structure

### Documentation (this feature)

```text
specs/002-supabase-db-migration/
├── plan.md              # This file
├── research.md          # Phase 0: Research decisions
├── data-model.md        # Phase 1: Entity schemas and relationships
├── quickstart.md        # Phase 1: Setup guide
├── contracts/           # Phase 1: API contracts
│   └── api-contracts.md
└── tasks.md             # Phase 2: Task breakdown (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── db/
│   ├── index.ts                    # Drizzle client initialization (NEW)
│   ├── seed.ts                     # Seed script (NEW)
│   └── schema/
│       ├── index.ts                # Barrel export (NEW)
│       ├── categories.ts           # Categories table (NEW)
│       ├── prompts.ts              # Prompts table (NEW)
│       ├── reviews.ts              # Reviews table (NEW)
│       └── testimonials.ts         # Testimonials table (NEW)
├── app/
│   └── api/
│       ├── categories/route.ts     # MODIFIED: mock → Drizzle query
│       ├── testimonials/route.ts   # MODIFIED: mock → Drizzle query
│       └── prompts/
│           ├── route.ts            # MODIFIED: mock → Drizzle query with filters
│           ├── search/route.ts     # MODIFIED: mock → ILIKE search
│           └── [id]/
│               ├── route.ts        # MODIFIED: mock → Drizzle findFirst
│               ├── reviews/route.ts # MODIFIED: mock → Drizzle query with prompt_id filter
│               └── related/route.ts # MODIFIED: mock → Drizzle query by category
├── lib/
│   └── schemas/
│       └── api.ts                  # MINOR UPDATE: add promptId to reviewSchema
├── data/
│   └── mockData.ts                 # DELETED after migration verified

drizzle/                            # Generated migration SQL files (NEW)
drizzle.config.ts                   # Drizzle-kit configuration (NEW)
```

**Structure Decision**: Next.js monolith (existing). New `src/db/` directory for Drizzle schema and client, following constitution IV. No new top-level directories except `drizzle/` for migration output (standard drizzle-kit convention).

## Complexity Tracking

| Item | Constitution Principle | Status | Justification |
|------|----------------------|--------|---------------|
| Price stored as display currency (real) | V. Stripe for Payments | Accepted deviation | Migration preserves mock data parity. Converting to smallest currency unit (cents) deferred to Stripe payments feature to avoid API/UI regression. See R-013. |

## Phase Summary

### Phase 0: Research (Complete)

All unknowns resolved in [research.md](./research.md):
- R-001: Drizzle + postgres.js + Supabase pooler (transaction mode)
- R-002: Serial integer IDs, coerced to strings in API
- R-003: Seller embedded as flat columns on prompts table
- R-004: Tags as PostgreSQL text arrays
- R-005: Samples as PostgreSQL text arrays
- R-006: ILIKE search (matches current .includes() behavior)
- R-007: RLS via Supabase MCP — SELECT for anon, INSERT/UPDATE/DELETE for admin on prompts
- R-008: TypeScript seed script via tsx
- R-009: All 3 reviews assigned to prompt ID 1
- R-010: drizzle.config.ts at repo root
- R-011: Zod schemas preserved, Drizzle types internal only
- R-012: Admin role via Clerk publicMetadata, RLS admin write policies on prompts
- R-013: Price stored as display currency (accepted deviation for migration parity)

### Phase 1: Design & Contracts (Complete)

- [data-model.md](./data-model.md): 4 tables (categories, prompts, reviews, testimonials) with full column specs, relationships, and API response mapping
- [contracts/api-contracts.md](./contracts/api-contracts.md): All 7 API endpoints with request/response shapes (unchanged from current)
- [quickstart.md](./quickstart.md): Step-by-step setup guide

### Phase 2: Tasks (Complete)

Task breakdown generated in [tasks.md](./tasks.md): 28 tasks across 6 phases (Setup, Foundational, US1+US4, US2, US3, Polish).

# Implementation Plan: Market Search, Seed Data & Enhanced Filters

**Branch**: `007-market-search-seed` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-market-search-seed/spec.md`

## Summary

Seed the database with 100 realistic AI prompts across all categories/models/sellers, implement search with autocomplete suggestions, redesign the marketplace page with a forced dark theme, and add advanced filtering (Type, Model, Price) with sorting (Trending, Popular, Newest, Relevant, Price) and "Load more" pagination. The search bar with suggestions will be reusable across the Hero and marketplace page.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 16.x (App Router), React 19.x
**Primary Dependencies**: Drizzle ORM, postgres.js, Zod 4.x, Clerk 6.x, shadcn/ui, Tailwind CSS 4.x, Lucide React, Sonner (toast), Zustand (cart)
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E)
**Target Platform**: Web (desktop + mobile), Node.js 18+
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Search suggestions < 1s, filter updates < 1s, seed script completes in < 30s
**Constraints**: 100 seeded prompts, basic PostgreSQL text search (no Elasticsearch), Arabic-first UI
**Scale/Scope**: 100 prompts, ~10 sellers, 7 AI models, 5 generation types, 6+ categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All seed data uses Arabic titles/descriptions. UI text in Arabic. |
| II. Mobile-First Responsive | PASS | Marketplace: filter drawer on mobile, responsive grid (1/2/4 cols). |
| III. Server Components — No Server Actions | PASS | Market page is Client Component (needs URL state + fetch). API routes for search/suggestions. No server actions. |
| IV. Supabase + Drizzle Migrations | PASS | Seed script uses Drizzle ORM. No schema changes needed (existing columns suffice). |
| V. Stripe for Payments | N/A | No payment changes in this feature. |
| VI. shadcn/ui Components | PASS | All UI built with shadcn primitives (Sheet, Badge, Input, Select, Button, Card). |
| VII. Playwright E2E | DEFERRED | E2E tests for search/filter flows to be added in Polish phase. |
| VIII. Zod Validation | PASS | New suggestion/search schemas validated with Zod. |
| IX. React Hook Form | N/A | No forms in this feature (search input uses controlled state, not form submission). |
| X. Page Loading & Error States | PASS | Loading skeletons for marketplace, empty states for zero results. |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/007-market-search-seed/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── suggestions-api.md
│   └── prompts-api-enhanced.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── prompts/
│   │   │   ├── route.ts              # MODIFY: add search query, generationType filter, pagination (offset/limit)
│   │   │   └── search/route.ts       # MODIFY: add relevance sorting, limit
│   │   └── suggestions/
│   │       └── route.ts              # NEW: autocomplete suggestions endpoint
│   ├── market/
│   │   ├── page.tsx                  # REWRITE: dark theme, new filters, search bar, load more
│   │   └── loading.tsx               # MODIFY: dark skeleton
│   └── search/
│       └── page.tsx                  # MODIFY: integrate SearchInput with suggestions
├── components/
│   ├── SearchInput.tsx               # NEW: reusable search with autocomplete dropdown
│   ├── PromptCard.tsx                # MINOR: ensure works on dark background
│   └── Hero.tsx                      # MODIFY: integrate SearchInput component
├── db/
│   ├── schema/prompts.ts            # NO CHANGE (existing columns sufficient)
│   └── seed.ts                      # REWRITE: 100 prompts, 10 sellers, all categories/models
└── lib/
    ├── schemas/api.ts               # MODIFY: add suggestionsQuerySchema, update promptsQuerySchema
    └── mappers.ts                   # NO CHANGE
```

**Structure Decision**: Existing Next.js monolith structure. No new directories needed beyond `src/app/api/suggestions/`. The SearchInput is a shared component at `src/components/` level since it's used by both Hero and marketplace.

## Complexity Tracking

> No constitution violations — this section is empty.

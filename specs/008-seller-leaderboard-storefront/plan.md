# Implementation Plan: Seller Leaderboard & Public Storefront

**Branch**: `008-seller-leaderboard-storefront` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-seller-leaderboard-storefront/spec.md`

## Summary

Replace the hardcoded `FEATURED_SELLERS` mock array in `FeaturedSellers.tsx` with real seller data ranked by rating or sales (togglable tabs), fetched from a new `/api/sellers` endpoint that aggregates stats from `prompts` table grouped by `sellerId`. Add a public seller storefront page at `/seller/[sellerId]` showing profile, aggregated stats, tier badge, and prompt grid. Extend `seller_profiles` schema with display fields and update the seed script to create seller profile records linked to prompts.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Zod 4.x, shadcn/ui, Lucide React
**Storage**: Supabase Postgres 17.x via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E), `npm run lint && npm run build` (CI gate)
**Target Platform**: Web (mobile-first responsive, RTL Arabic)
**Project Type**: Web application (Next.js monolith)
**Scale/Scope**: 10 sellers, 100 prompts (seed data), 2 new API routes, 1 new page, 1 migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All UI text in Arabic, tier labels in Arabic (برونزي/فضي/ذهبي) |
| II. Mobile-First | PASS | Storefront and leaderboard designed mobile-first with responsive grid |
| III. Server Components — No Server Actions | PASS | Storefront page is client component fetching via API routes. No server actions. |
| IV. Supabase + Drizzle Migrations | PASS | Schema changes via Drizzle schema → drizzle-kit generate/migrate. RLS check via `get_advisors`. |
| V. Stripe for Payments | N/A | No payment changes in this feature |
| VI. Component-Driven UI (shadcn/ui) | PASS | Uses shadcn Card, Badge, Skeleton, Button. Icons from Lucide React. |
| VII. Playwright E2E | DEFERRED | E2E tests not in scope for this feature (seed data, no auth flows) |
| VIII. Zod Validation | PASS | New API endpoints validated with Zod schemas |
| IX. React Hook Form | N/A | No forms in this feature |
| X. Page Loading & Error States | PASS | Storefront has loading.tsx skeleton, calls notFound() for invalid IDs |

**Post-Phase 1 re-check**: All gates PASS. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/008-seller-leaderboard-storefront/
├── plan.md
├── spec.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── sellers-api.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Created by /speckit.tasks
```

### Source Code (files to create or modify)

```text
src/
├── db/
│   ├── schema/
│   │   └── seller-profiles.ts        # MODIFY: add displayName, avatar, bio columns
│   └── seed.ts                        # MODIFY: create seller_profiles records, set sellerId on prompts
├── app/
│   ├── api/
│   │   ├── sellers/
│   │   │   ├── route.ts               # NEW: GET /api/sellers (leaderboard)
│   │   │   └── [sellerId]/
│   │   │       └── route.ts           # NEW: GET /api/sellers/[sellerId] (profile + stats)
│   │   └── prompts/
│   │       └── route.ts               # MODIFY: add sellerId filter param
│   ├── seller/
│   │   └── [sellerId]/
│   │       ├── page.tsx               # NEW: public storefront page
│   │       └── loading.tsx            # NEW: skeleton loading state
│   └── page.tsx                       # MODIFY: pass sortBy to FeaturedSellers (if needed)
├── components/
│   └── FeaturedSellers.tsx            # MODIFY: fetch from API, functional tabs, seller card links
├── lib/
│   ├── mappers.ts                     # MODIFY: add mapSellerLeaderboardRow, mapSellerStorefrontRow
│   └── schemas/
│       └── api.ts                     # MODIFY: add sellersQuerySchema, sellerProfileSchema

drizzle/
└── NNNN_*.sql                         # AUTO-GENERATED: migration for new columns
```

**Structure Decision**: Next.js App Router monolith (existing). New API routes follow established `/api/[resource]/route.ts` pattern. New page follows `/app/[resource]/[id]/page.tsx` dynamic route pattern.

## Complexity Tracking

No constitution violations. No complexity justifications needed.

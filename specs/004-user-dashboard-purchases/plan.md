# Implementation Plan: User Dashboard & Purchases

**Branch**: `004-user-dashboard-purchases` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-user-dashboard-purchases/spec.md`

## Summary

Implement an authenticated user dashboard at `/dashboard` (replacing the existing `/profile` page) with sidebar navigation (Profile, Purchases, Favorites, Settings), a standalone purchase detail page at `/purchase/[id]` showing full prompt content with copy-to-clipboard, authenticated review submission/editing, and a server-side favorites system. Requires 3 DB schema changes (new `instructions` column on prompts, `userId` column on reviews, new `favorites` table), 6 new/enhanced API routes, and a new route group with shared sidebar layout.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Clerk 6.x (@clerk/nextjs), Zustand, Zod 4.x, shadcn/ui (New York), Tailwind CSS 4.x, Lucide React, Sonner (toast)
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E)
**Target Platform**: Web browser (desktop + mobile), Arabic-first RTL
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Purchase detail page loads within 2 seconds (SC-002), sidebar navigation without full page reloads (SC-006)
**Constraints**: No server actions (constitution III), all mutations via API Route Handlers, RLS via Supabase MCP (not Drizzle)
**Scale/Scope**: Marketplace with moderate user base; dashboard pages handle individual user's data (not admin-scale)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | ✅ Pass | All dashboard pages Arabic primary, sidebar RTL (right side), form errors in Arabic |
| II. Mobile-First | ✅ Pass | Sidebar responsive (collapses on mobile), cards grid responsive, touch targets ≥44px |
| III. Server Components — No Server Actions | ✅ Pass | Dashboard layout is Server Component; sidebar/forms use `"use client"` at narrowest boundary; all mutations via API routes |
| IV. Supabase + Drizzle Migrations | ✅ Pass | Schema changes in `src/db/schema/`, migrations via `drizzle-kit generate/migrate`, RLS via Supabase MCP |
| V. Stripe | ✅ Pass | No new payment logic; uses existing orders/order_items from checkout flow |
| VI. shadcn/ui Components | ✅ Pass | All UI built with shadcn primitives (Card, Button, Input, Tabs, Skeleton, Form), icons from Lucide |
| VII. Playwright E2E | ✅ Pass | Tests for purchase viewing, review submission, sidebar navigation, favorites toggle |
| VIII. Zod Validation | ✅ Pass | All new API endpoints validated with Zod; types inferred via `z.infer<>` |
| IX. React Hook Form + zodResolver | ✅ Pass | Review form uses `useForm` + `zodResolver`; settings form same pattern |
| X. Loading & Error States | ✅ Pass | `loading.tsx` for each dashboard sub-route and `/purchase/[id]`; error boundary inherited from root |

**Gate result**: All 10 principles pass. No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/004-user-dashboard-purchases/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model design
├── quickstart.md        # Phase 1 developer quickstart
├── contracts/           # Phase 1 API contracts
│   ├── purchases.md
│   ├── reviews.md
│   └── favorites.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── dashboard/                    # NEW — replaces /profile
│   │   ├── layout.tsx                # Shared sidebar layout (Server Component shell)
│   │   ├── page.tsx                  # Profile page (/dashboard)
│   │   ├── loading.tsx               # Dashboard skeleton
│   │   ├── purchases/
│   │   │   ├── page.tsx              # Purchases grid with search/filter
│   │   │   └── loading.tsx
│   │   ├── favorites/
│   │   │   ├── page.tsx              # Favorites grid
│   │   │   └── loading.tsx
│   │   └── settings/
│   │       ├── page.tsx              # Settings form
│   │       └── loading.tsx
│   ├── purchase/[id]/                # NEW — standalone purchase detail
│   │   ├── page.tsx                  # Full prompt content + review form
│   │   └── loading.tsx
│   ├── profile/                      # DELETE — replaced by /dashboard
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── api/
│       ├── user/
│       │   ├── purchases/route.ts    # MODIFY — enhance to return full details
│       │   └── reviews/route.ts      # NEW — get user's review for a prompt
│       ├── prompts/[id]/
│       │   └── reviews/route.ts      # MODIFY — add POST for new reviews, PUT for edits
│       ├── favorites/
│       │   ├── route.ts              # NEW — GET list, POST add
│       │   └── [promptId]/route.ts   # NEW — DELETE remove
│       └── purchase/[id]/route.ts    # NEW — GET purchase detail (auth + ownership)
├── components/
│   ├── dashboard/
│   │   ├── DashboardSidebar.tsx      # NEW — sidebar nav (client component)
│   │   ├── PurchaseCard.tsx          # NEW — card for purchases grid
│   │   └── FavoriteButton.tsx        # NEW — heart toggle (client component)
│   └── reviews/
│       └── ReviewForm.tsx            # NEW — star rating + comment (RHF + Zod)
├── db/schema/
│   ├── prompts.ts                    # MODIFY — add instructions column
│   ├── reviews.ts                    # MODIFY — add userId column + unique constraint
│   ├── favorites.ts                  # NEW — favorites table
│   └── index.ts                      # MODIFY — export favorites
├── lib/
│   ├── mappers.ts                    # MODIFY — add mapPurchaseRow, update mapPromptRow for instructions
│   └── schemas/
│       └── api.ts                    # MODIFY — add review submission, favorites, purchase detail schemas
└── proxy.ts                          # MODIFY — add /dashboard and /purchase to protected routes

drizzle/                              # Migration files generated by drizzle-kit
```

**Structure Decision**: Single Next.js web application (no monorepo split needed). New routes added under `src/app/dashboard/` with a shared layout providing the sidebar. Purchase detail page at `src/app/purchase/[id]/` is standalone (no sidebar). All API routes under `src/app/api/`. This aligns with the existing project structure.

## Complexity Tracking

No constitution violations to justify. All design decisions align with existing patterns.

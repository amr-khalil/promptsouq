# Implementation Plan: Seller & Admin Dashboards

**Branch**: `014-seller-admin-dashboards` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/014-seller-admin-dashboards/spec.md`

## Summary

Build seller and admin dashboard UI on top of existing API endpoints and database schema. The admin dashboard provides prompt moderation, marketplace analytics, order management, and commission control. The seller dashboard provides prompt management (edit via existing sell form, soft-delete), sales & earnings tracking, and profile editing. Both integrate into the existing dashboard sidebar with role-based visibility.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) + Next.js 16.x (App Router), React 19.x
**Primary Dependencies**: Drizzle ORM, Clerk 6.x, Stripe SDK (Connect), Zod 4.x, React Hook Form 7.x, shadcn/ui (New York), i18next + react-i18next, Lucide React, Sonner (toast)
**Storage**: Supabase Postgres 17.x via Drizzle ORM + postgres.js (`prepare: false`), Supabase Storage (avatars)
**Testing**: Playwright (E2E)
**Target Platform**: Web (responsive, mobile-first, RTL-primary)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Dashboard pages load within 2-3 seconds (SC-002, SC-003)
**Constraints**: Arabic-first RTL, no server actions, all mutations via API Route Handlers
**Scale/Scope**: ~10 new pages, ~8 new/modified API endpoints, 1 new DB table, 1 schema migration, 2 new i18n namespaces

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All new dashboard pages use i18n with Arabic primary. New `dashboard` namespace for translations. |
| II. Mobile-First Responsive | PASS | Dashboard uses existing responsive grid (sidebar desktop, horizontal nav mobile). New pages follow same pattern. |
| III. Server Components by Default — No Server Actions | PASS | Dashboard pages are Server Components where possible. Client Components only for interactive elements (moderation actions, forms). All mutations via API Route Handlers. |
| IV. Supabase + Drizzle Migrations | PASS | New `marketplace_settings` table via Drizzle schema + `drizzle-kit generate/migrate`. Soft-delete column added via migration. RLS checked via `get_advisors`. |
| V. Stripe for Payments | PASS | Payout status derived from existing Stripe Connect data. No new payment flows. |
| VI. Component-Driven UI (shadcn/ui) | PASS | All dashboard components compose shadcn primitives (Card, Table, Badge, Button, Dialog, Form). |
| VII. Playwright E2E Testing | PASS | Critical admin moderation and seller management flows get E2E tests. |
| VIII. Zod Schema Validation | PASS | New API endpoints validated with Zod schemas. Types inferred via `z.infer<>`. |
| IX. React Hook Form + zodResolver | PASS | Seller profile edit form and admin commission edit use React Hook Form. Prompt edit reuses existing sell form. |
| X. Page Loading & Error States | PASS | All new dashboard routes include `loading.tsx` skeletons and empty states. |

**Gate result: ALL PASS — proceed to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/014-seller-admin-dashboards/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── admin-stats.md
│   ├── admin-orders.md
│   ├── admin-settings.md
│   ├── seller-earnings.md
│   ├── seller-prompts-mutation.md
│   └── seller-profile.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                    # MODIFY — inject role-based sidebar data
│   │   │   ├── seller/
│   │   │   │   ├── prompts/
│   │   │   │   │   ├── page.tsx              # NEW — seller prompt management
│   │   │   │   │   └── loading.tsx           # NEW — skeleton
│   │   │   │   ├── earnings/
│   │   │   │   │   ├── page.tsx              # NEW — sales & earnings
│   │   │   │   │   └── loading.tsx           # NEW — skeleton
│   │   │   │   └── profile/
│   │   │   │       ├── page.tsx              # NEW — seller profile edit
│   │   │   │       └── loading.tsx           # NEW — skeleton
│   │   │   └── admin/
│   │   │       ├── page.tsx                  # NEW — admin overview (redirects to moderation)
│   │   │       ├── moderation/
│   │   │       │   ├── page.tsx              # NEW — prompt moderation queue
│   │   │       │   └── loading.tsx           # NEW — skeleton
│   │   │       ├── orders/
│   │   │       │   ├── page.tsx              # NEW — all orders list
│   │   │       │   └── loading.tsx           # NEW — skeleton
│   │   │       ├── analytics/
│   │   │       │   ├── page.tsx              # NEW — marketplace analytics
│   │   │       │   └── loading.tsx           # NEW — skeleton
│   │   │       └── settings/
│   │   │           ├── page.tsx              # NEW — commission rate
│   │   │           └── loading.tsx           # NEW — skeleton
│   │   └── sell/
│   │       └── page.tsx                      # MODIFY — support edit mode via ?edit=UUID
│   └── api/
│       ├── admin/
│       │   ├── stats/
│       │   │   └── route.ts                  # NEW — marketplace analytics aggregation
│       │   ├── orders/
│       │   │   ├── route.ts                  # NEW — paginated orders list
│       │   │   └── [id]/
│       │   │       └── route.ts              # NEW — order detail
│       │   └── settings/
│       │       └── route.ts                  # NEW — GET/PUT commission rate
│       └── seller/
│           ├── earnings/
│           │   └── route.ts                  # NEW — sales history with commission
│           ├── profile/
│           │   └── route.ts                  # NEW — GET/PUT seller profile
│           └── prompts/
│               └── [id]/
│                   └── route.ts              # NEW — PUT (edit) / DELETE (soft-delete)
├── components/
│   └── dashboard/
│       ├── DashboardSidebar.tsx              # MODIFY — add seller + admin sections
│       ├── AdminModerationQueue.tsx          # NEW — moderation list + actions
│       ├── AdminPromptReview.tsx             # NEW — prompt detail + approve/reject dialog
│       ├── AdminOrdersTable.tsx              # NEW — orders table with filters
│       ├── AdminAnalyticsCards.tsx           # NEW — analytics metric cards
│       ├── SellerPromptsTable.tsx            # NEW — seller prompt list with actions
│       ├── SellerEarningsOverview.tsx        # NEW — earnings summary cards
│       ├── SellerSalesHistory.tsx            # NEW — sales history table
│       ├── SellerProfileForm.tsx             # NEW — profile edit form
│       └── PromptStatusBadge.tsx             # NEW — reusable status badge
├── db/
│   └── schema/
│       ├── marketplace-settings.ts           # NEW — commission rate table
│       ├── prompts.ts                        # MODIFY — add deletedAt column
│       └── index.ts                          # MODIFY — export marketplaceSettings
├── i18n/
│   └── locales/
│       ├── ar/
│       │   └── dashboard.json               # NEW — Arabic dashboard translations
│       └── en/
│           └── dashboard.json               # NEW — English dashboard translations
└── lib/
    ├── mappers.ts                            # MODIFY — add order/earnings mappers
    └── schemas/
        └── api.ts                            # MODIFY — add new Zod schemas
```

**Structure Decision**: Extends the existing Next.js App Router monolith. Dashboard sub-routes nested under `[locale]/dashboard/seller/` and `[locale]/dashboard/admin/`. All new components under `src/components/dashboard/`. Reuses existing layout grid pattern.

## Complexity Tracking

> No constitution violations. No complexity justifications needed.

# Implementation Plan: Subscription & Credit System for AI Generation

**Branch**: `010-subscription-credits` | **Date**: 2026-02-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-subscription-credits/spec.md`

## Summary

Add a subscription-based credit system with three tiers (Standard/Pro/Legendary), one-time credit top-ups, and in-app AI content generation. Users subscribe via Stripe Billing, receive credits per billing cycle, and spend credits to generate text or images from purchased prompts directly within the app. Generation is mocked initially with placeholder responses. The prompt detail page gains a "Generate" button with an editable prompt field, model selector, and inline result display. Credit balance is visible in the header and dashboard.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 18+
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Stripe SDK (Billing + Customer Portal), Clerk 6.x, Zod 4.x, shadcn/ui, Zustand, Sonner
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E, mobile + desktop viewports)
**Target Platform**: Web (SSR + CSR via Next.js App Router)
**Project Type**: Web application (Next.js monolith)
**Performance Goals**: Subscription checkout < 3 minutes, credit update < 10 seconds post-payment, generation < 5 seconds (mocked)
**Constraints**: Arabic-first RTL layout, mobile-first responsive design, no server actions, atomic credit deduction (no overdraft)
**Scale/Scope**: 6 new database tables, ~12 new API routes, ~10 new components, 3 new pages, extend existing webhook + header + dashboard

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All subscription/generation UI will use Arabic text. Pricing page, generation interface, dashboard sections — all Arabic-first. |
| II. Mobile-First Responsive | PASS | Pricing cards stack vertically on mobile. Generation dialog is full-screen on mobile. Dashboard sections responsive. |
| III. Server Components — No Server Actions | PASS | Subscription plans page = Server Component. All mutations via API Route Handlers. Generation submitted via `fetch()` to POST /api/generate. |
| IV. Supabase + Drizzle Migrations | PASS | 6 new tables defined in `src/db/schema/`. Migrations via `drizzle-kit generate` + `drizzle-kit migrate`. RLS via Supabase MCP. |
| V. Stripe for Payments | PASS | Stripe Billing for subscriptions, Stripe Checkout for top-ups, Stripe Customer Portal for management. Webhook signature verification. Prices in cents. |
| VI. Component-Driven UI (shadcn) | PASS | Pricing cards, generation dialog, model selector, credit badge — all built with shadcn primitives. Icons from Lucide React. |
| VII. Playwright E2E | PASS | Tests for subscription flow, generation flow, credit balance verification. Mobile + desktop viewports. |
| VIII. Zod Validation | PASS | Zod schemas for all API request bodies (checkout, generate, topup). Arabic error messages. Types inferred via `z.infer<>`. |
| IX. React Hook Form + zodResolver | N/A | No traditional forms in this feature — generation interface uses controlled components, not form submission. |
| X. Page Loading & Error States | PASS | `loading.tsx` for subscription page, dashboard credit/generation pages. Error states on generation failure. 0-credit state with CTA. |

**Post-Phase 1 Re-check**: All principles maintained. No violations.

## Project Structure

### Documentation (this feature)

```text
specs/010-subscription-credits/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research decisions
├── data-model.md        # Phase 1 data model (6 new tables)
├── quickstart.md        # Phase 1 setup guide
├── contracts/           # Phase 1 API contracts
│   └── subscription-api.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── db/
│   └── schema/
│       ├── subscription-plans.ts      # NEW: subscription_plans table
│       ├── credit-topup-packs.ts      # NEW: credit_topup_packs table
│       ├── user-subscriptions.ts      # NEW: user_subscriptions table
│       ├── credit-balances.ts         # NEW: credit_balances table
│       ├── credit-transactions.ts     # NEW: credit_transactions table
│       ├── generations.ts             # NEW: generations table
│       └── index.ts                   # MODIFY: add new exports
│
├── app/
│   ├── subscription/
│   │   ├── page.tsx                   # NEW: Subscription plans page (Server Component)
│   │   └── loading.tsx                # NEW: Skeleton loader
│   ├── dashboard/
│   │   ├── credits/
│   │   │   ├── page.tsx               # NEW: Credit balance + transaction history
│   │   │   └── loading.tsx            # NEW: Skeleton loader
│   │   └── generations/
│   │       ├── page.tsx               # NEW: Generation history
│   │       └── loading.tsx            # NEW: Skeleton loader
│   └── api/
│       ├── subscription/
│       │   ├── plans/route.ts         # NEW: GET plans
│       │   ├── checkout/route.ts      # NEW: POST create subscription checkout
│       │   ├── status/route.ts        # NEW: GET subscription + credits
│       │   └── manage/route.ts        # NEW: POST get customer portal URL
│       ├── credits/
│       │   ├── balance/route.ts       # NEW: GET credit balance
│       │   ├── transactions/route.ts  # NEW: GET transaction history
│       │   └── topup/
│       │       └── checkout/route.ts  # NEW: POST create topup checkout
│       ├── generate/route.ts          # NEW: POST generate content
│       ├── generations/
│       │   ├── route.ts               # NEW: GET list generations
│       │   └── [id]/route.ts          # NEW: GET single generation
│       └── webhooks/
│           └── stripe/route.ts        # MODIFY: extend with subscription + topup events
│
├── lib/
│   ├── generation.ts                  # NEW: Mock generation service
│   ├── credits.ts                     # NEW: Credit deduction helpers (atomic)
│   └── schemas/
│       ├── subscription.ts            # NEW: Zod schemas for subscription endpoints
│       ├── generation.ts              # NEW: Zod schemas for generation endpoints
│       └── credits.ts                 # NEW: Zod schemas for credit endpoints
│
├── components/
│   ├── subscription/
│   │   ├── PricingCard.tsx            # NEW: Subscription tier card
│   │   ├── BillingCycleToggle.tsx     # NEW: Month/6-month/year toggle
│   │   └── TopupPackCard.tsx          # NEW: Credit top-up pack card
│   ├── generation/
│   │   ├── GenerateButton.tsx         # NEW: Generate CTA on prompt detail page
│   │   ├── GenerationDialog.tsx       # NEW: Full generation interface (modal/sheet)
│   │   ├── ModelSelector.tsx          # NEW: AI model dropdown
│   │   ├── PromptEditor.tsx           # NEW: Editable prompt with variable highlighting
│   │   └── GenerationResult.tsx       # NEW: Display generated text/image inline
│   └── credits/
│       └── CreditBadge.tsx            # NEW: Header credit balance indicator
│
└── hooks/
    └── use-credits.ts                 # NEW: Hook for credit balance fetching

tests/
└── e2e/
    ├── subscription.spec.ts           # NEW: Subscription flow E2E
    ├── generation.spec.ts             # NEW: Generation flow E2E
    └── credits.spec.ts                # NEW: Credit balance E2E
```

**Structure Decision**: Follows existing Next.js App Router monolith structure. New schema files in `src/db/schema/`, new API routes in `src/app/api/`, new components in `src/components/`. Consistent with existing patterns for prompts, orders, and checkout.

### Modified Existing Files

| File | Change |
|------|--------|
| `src/db/schema/index.ts` | Add exports for 6 new tables |
| `src/app/api/webhooks/stripe/route.ts` | Extend with subscription + topup event handlers |
| `src/components/Header.tsx` | Add CreditBadge component next to cart icon |
| `src/components/dashboard/DashboardSidebar.tsx` | Add "الرصيد" (Credits) and "التوليدات" (Generations) nav items |
| `src/app/prompt/[id]/page.tsx` | Add GenerateButton component for purchased prompts |
| `src/proxy.ts` | Add `/subscription(.*)` to public routes |

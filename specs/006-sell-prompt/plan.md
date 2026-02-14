# Implementation Plan: Sell Prompt

**Branch**: `006-sell-prompt` | **Date**: 2026-02-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-sell-prompt/spec.md`

## Summary

Enable users to sell AI prompts on PromptSouq through a 4-step submission flow (prompt details, prompt file with examples, Stripe Connect payout setup, confirmation). Includes a seller dashboard for managing listings, an admin review system for quality control, and commission tracking (0% direct / 20% marketplace). Extends the existing prompts table with seller fields, adds a new seller_profiles table for Stripe Connect data, and modifies checkout to use Stripe destination charges.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Stripe SDK (Connect), Clerk 6.x, Zod 4.x, React Hook Form 7.x, shadcn/ui, Zustand, Sonner
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E), `npm run lint && npm run build` after every task
**Target Platform**: Web (Next.js on Vercel-compatible hosting)
**Project Type**: Web application (Next.js App Router monolith)
**Performance Goals**: Dashboard loads in <2s, marketplace updates within 30s of approval, form submission in <10 min
**Constraints**: Arabic-first RTL, mobile-first, no server actions, all mutations via API Route Handlers
**Scale/Scope**: Up to 100 prompts per seller, standard marketplace traffic

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All form labels, errors, and UI text in Arabic. RTL layout respected. |
| II. Mobile-First | PASS | 4-step form designed mobile-first with touch-friendly targets. |
| III. Server Components / No Server Actions | PASS | Multi-step form is client component (needs hooks). All mutations via API Route Handlers. Server Components for dashboard data fetching. |
| IV. Supabase + Drizzle Migrations | PASS | Schema changes in `src/db/schema/`, migrations via `drizzle-kit generate/migrate`. RLS via Supabase MCP. |
| V. Stripe for Payments | PASS | Stripe Connect Express for payouts. Destination charges for marketplace commission. Webhooks verify signatures. |
| VI. shadcn/ui Components | PASS | Form built with shadcn Form, Input, Select, Textarea, Button, Badge, Card, Tabs. |
| VII. Playwright E2E | PASS | Tests for submission flow, seller dashboard, admin review. |
| VIII. Zod Validation | PASS | Submission schema, admin review schema, seller query schema. Types inferred via `z.infer<>`. Arabic error messages. |
| IX. React Hook Form + zodResolver | PASS | Single `useForm()` instance with step-scoped validation via `trigger()`. zodResolver with submission schema. |
| X. Page Loading & Error States | PASS | `loading.tsx` for sell, seller, admin routes. Empty states for dashboard. |

**Post-Phase 1 Re-check**: All principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/006-sell-prompt/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: implementation guide
├── contracts/           # Phase 1: API contracts
│   └── api-contracts.md
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── sell/                           # NEW: 4-step prompt submission form
│   │   ├── page.tsx                    # Sell page (client component, multi-step form)
│   │   └── loading.tsx                 # Loading skeleton
│   ├── seller/                         # MODIFIED: Replace mock seller dashboard
│   │   ├── page.tsx                    # Seller dashboard (prompt listings, stats)
│   │   ├── loading.tsx                 # Loading skeleton
│   │   └── onboarding/
│   │       └── complete/page.tsx       # Stripe Connect return URL handler
│   ├── admin/
│   │   └── review/                     # NEW: Admin review queue
│   │       ├── page.tsx                # Review list page
│   │       ├── loading.tsx             # Loading skeleton
│   │       └── [id]/
│   │           └── page.tsx            # Single prompt review detail
│   ├── api/
│   │   ├── prompts/route.ts            # MODIFIED: Add status='approved' filter
│   │   ├── seller/
│   │   │   ├── prompts/route.ts        # NEW: GET seller's prompts
│   │   │   └── stats/route.ts          # NEW: GET seller stats
│   │   ├── connect/
│   │   │   ├── create-account/route.ts # NEW: POST create Stripe Express account
│   │   │   ├── status/route.ts         # NEW: GET onboarding status
│   │   │   └── onboarding-link/route.ts# NEW: POST generate onboarding link
│   │   ├── admin/
│   │   │   └── prompts/
│   │   │       ├── route.ts            # NEW: GET pending prompts list
│   │   │       └── [id]/
│   │   │           ├── route.ts        # NEW: GET prompt detail for review
│   │   │           └── review/route.ts # NEW: POST approve/reject
│   │   ├── checkout/route.ts           # MODIFIED: Destination charges
│   │   └── webhooks/
│   │       ├── stripe/route.ts         # MODIFIED: Commission tracking
│   │       └── stripe-connect/route.ts # NEW: Connect webhook
│   └── ...existing routes
├── components/
│   └── sell/                           # NEW: Sell form step components
│       ├── PromptDetailsStep.tsx       # Step 1: Basic details
│       ├── PromptFileStep.tsx          # Step 2: Template + examples
│       ├── PayoutStep.tsx              # Step 3: Stripe Connect
│       ├── ConfirmationStep.tsx        # Step 4: Success
│       └── StepIndicator.tsx           # Progress indicator
├── db/
│   └── schema/
│       ├── prompts.ts                  # MODIFIED: Add seller columns
│       ├── seller-profiles.ts          # NEW: Seller profiles table
│       ├── orders.ts                   # MODIFIED: Add commission columns
│       └── index.ts                    # MODIFIED: Export seller_profiles
├── lib/
│   ├── schemas/
│   │   └── api.ts                      # MODIFIED: Add sell/admin schemas
│   ├── mappers.ts                      # MODIFIED: Add seller mappers
│   └── stripe.ts                       # EXISTING: Lazy proxy (shared)
└── proxy.ts                            # MODIFIED: Ensure /sell, /admin protected
```

**Structure Decision**: Next.js App Router monolith. New routes follow existing conventions. Sell form components co-located in `src/components/sell/`. API routes follow RESTful nesting under `src/app/api/`.

## Complexity Tracking

No constitution violations detected. No complexity justifications needed.

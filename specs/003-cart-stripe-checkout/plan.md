# Implementation Plan: Cart, Stripe Checkout & UUID Migration

**Branch**: `003-cart-stripe-checkout` | **Date**: 2026-02-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-cart-stripe-checkout/spec.md`

## Summary

Migrate prompt IDs from serial integers to UUIDs, build a client-side cart with toast feedback and header badge, integrate Stripe Checkout (hosted) for payment processing in USD, and unlock purchased prompt content for buyers. Uses Zustand for cart state, Stripe Checkout Sessions with inline `price_data`, and webhook-driven order fulfillment.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 18+
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Stripe SDK, Zustand, Zod 4.x, Clerk 6.x, Sonner (toast)
**Storage**: Supabase Postgres 17.x (project: `dyaflmsawxpqgmyojtbc`, region: eu-central-1) + localStorage (cart)
**Testing**: Playwright (E2E), Stripe test mode with card `4242 4242 4242 4242`
**Target Platform**: Web (desktop + mobile), RTL Arabic-first
**Project Type**: Web application (Next.js monolith with App Router)
**Performance Goals**: Toast feedback <1s, cart badge update <1s, checkout redirect <3s
**Constraints**: No server actions, all mutations via API Route Handlers, Stripe webhook signature verification mandatory
**Scale/Scope**: Pre-production, seed data only, 8 prompts, single-seller marketplace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Arabic-First & RTL | ✅ PASS | Toast messages in Arabic, all UI text Arabic, RTL layout preserved |
| II | Mobile-First Responsive | ✅ PASS | Cart badge, toast, checkout flow all mobile-first. Touch targets ≥44px |
| III | Server Components; No Server Actions | ✅ PASS | Stripe operations via API Route Handlers. Cart is client-side (Zustand). `"use client"` at narrowest boundary |
| IV | Supabase + Drizzle Migrations | ✅ PASS | Orders/order_items via Drizzle schema. `drizzle-kit generate/migrate`. RLS via Supabase MCP |
| V | Stripe for Payments | ⚠️ DEVIATION | Constitution: "Prices in smallest currency unit". Current DB stores display values (e.g., 49.99). Pre-existing deviation. Stripe receives `price × 100` at checkout. No DB change needed |
| VI | shadcn/ui Components | ✅ PASS | Sonner for toasts (already installed), Badge for cart count, Lucide icons only |
| VII | Playwright E2E | ✅ PASS | Tests required for purchase flow (mobile + desktop viewports) |
| VIII | Zod Validation | ✅ PASS | All new API routes validated: checkout request, UUID params, webhook payloads |
| IX | React Hook Form + zodResolver | ✅ N/A | No user-facing forms in this feature — Stripe handles payment form |
| X | Page Loading & Error States | ✅ PASS | Success/cancel pages need `loading.tsx`. Dynamic `[id]` route calls `notFound()` |

### Post-Design Re-check

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| V | Stripe for Payments | ✅ PASS | Webhook signature verification implemented. Server-side only Stripe operations. Price conversion to cents at checkout |
| IV | Supabase + Drizzle | ✅ PASS | New tables (orders, order_items) defined in Drizzle. RLS policies for anon/authenticated access |

## Project Structure

### Documentation (this feature)

```text
specs/003-cart-stripe-checkout/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: technical decisions
├── data-model.md        # Phase 1: schema design
├── quickstart.md        # Phase 1: dev setup guide
├── contracts/
│   └── api.md           # Phase 1: API contracts
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── checkout/
│   │   │   └── route.ts              # NEW: Create Stripe Checkout Session
│   │   ├── webhooks/
│   │   │   └── stripe/
│   │   │       └── route.ts          # NEW: Handle Stripe webhook events
│   │   ├── user/
│   │   │   └── purchases/
│   │   │       └── route.ts          # NEW: Check user's purchased prompts
│   │   └── prompts/
│   │       ├── route.ts              # MODIFIED: UUID in responses
│   │       ├── [id]/
│   │       │   ├── route.ts          # MODIFIED: Accept UUID param
│   │       │   ├── reviews/route.ts  # MODIFIED: Accept UUID param
│   │       │   └── related/route.ts  # MODIFIED: Accept UUID param
│   │       └── search/route.ts       # UNCHANGED (IDs in response are UUIDs)
│   ├── cart/
│   │   └── page.tsx                  # MODIFIED: Use Zustand cart store
│   ├── checkout/
│   │   ├── page.tsx                  # MODIFIED: Initiate Stripe Checkout
│   │   └── success/
│   │       ├── page.tsx              # NEW: Post-payment success page
│   │       └── loading.tsx           # NEW: Loading state
│   ├── prompt/
│   │   └── [id]/
│   │       └── page.tsx              # MODIFIED: Add to cart, purchased state
│   └── layout.tsx                    # MODIFIED: Add Sonner Toaster
├── components/
│   ├── Header.tsx                    # MODIFIED: Cart badge with count
│   └── PromptCard.tsx                # MODIFIED: UUID-based links
├── db/
│   └── schema/
│       ├── prompts.ts                # MODIFIED: UUID primary key
│       ├── reviews.ts                # MODIFIED: UUID foreign key
│       ├── orders.ts                 # NEW: Orders + order_items tables
│       └── index.ts                  # MODIFIED: Export new tables
├── stores/
│   └── cart-store.ts                 # NEW: Zustand cart with persist
├── hooks/
│   └── use-cart.ts                   # NEW: Hydration-safe cart accessor
├── lib/
│   ├── stripe.ts                     # NEW: Stripe client singleton
│   ├── mappers.ts                    # MODIFIED: Remove parseInt, UUID passthrough
│   └── schemas/
│       └── api.ts                    # MODIFIED: Add checkout/purchase schemas
└── db/
    └── seed.ts                       # MODIFIED: UUID-aware seed data
```

**Structure Decision**: Follows existing Next.js App Router monolith structure. New files added within established patterns — API routes in `src/app/api/`, schemas in `src/lib/schemas/`, DB schemas in `src/db/schema/`. Cart store in new `src/stores/` directory (Zustand convention). Stripe client in `src/lib/stripe.ts`.

## Complexity Tracking

| Deviation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Price stored as display value (e.g., 49.99) not cents | Pre-existing from 002 migration. Changing would break all API consumers | Convert to cents only at Stripe boundary (`Math.round(price * 100)`) |
| Zustand (new dependency) | Cart state shared across Header, cart page, prompt details without provider nesting | React Context requires CartProvider in layout.tsx, re-renders all consumers, ~3× more boilerplate |

## Design Artifacts

| Artifact | Path | Status |
|----------|------|--------|
| Research | [research.md](./research.md) | ✅ Complete |
| Data Model | [data-model.md](./data-model.md) | ✅ Complete |
| API Contracts | [contracts/api.md](./contracts/api.md) | ✅ Complete |
| Quickstart | [quickstart.md](./quickstart.md) | ✅ Complete |
| Tasks | tasks.md | Pending (`/speckit.tasks`) |

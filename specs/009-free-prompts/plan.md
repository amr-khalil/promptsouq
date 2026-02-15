# Implementation Plan: Free Prompts with Login-Gated Content

**Branch**: `009-free-prompts` | **Date**: 2026-02-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-free-prompts/spec.md`

## Summary

Enable sellers to publish free prompts (price = 0) via a dedicated toggle in the sell form, skipping Stripe payout setup. Free prompt content and examples are server-side gated: unauthenticated users see metadata only with a lock overlay + sign-in CTA; authenticated users see full content immediately. A new `free_prompt_access` table tracks per-user access, surfaced in a "My Free Prompts" dashboard section. Marketplace gains a price type filter (All/Free/Paid) and free prompts display a "مجاني" badge throughout.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Zod 4.x, Clerk 6.x, shadcn/ui, Zustand, Sonner
**Storage**: Supabase Postgres 17.x via Drizzle ORM + postgres.js (`prepare: false`)
**Testing**: Playwright (E2E), `npm run lint && npm run build` (CI gate)
**Target Platform**: Web (mobile-first responsive)
**Project Type**: Web application (Next.js monorepo)
**Performance Goals**: Free prompt content loads in < 1 second for authenticated users (SC-003)
**Constraints**: No server actions; all mutations via API Route Handlers; Arabic-first RTL
**Scale/Scope**: ~8 files modified, ~4 new files, 1 new DB table, 1 new migration

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All new UI text in Arabic ("مجاني", "سجل دخولك لرؤية المحتوى"). Lock overlay CTA and badge labels in Arabic. |
| II. Mobile-First | PASS | Lock overlay, badge, and filter designed mobile-first. Toggle is touch-friendly (44x44px). |
| III. Server Components / No Server Actions | PASS | Content gating via API Route Handler (GET /api/prompts/[id]). Free access recording via POST /api/free-access. No server actions. |
| IV. Supabase + Drizzle Migrations | PASS | New `free_prompt_access` table defined in Drizzle schema. Migration via `drizzle-kit generate` + `drizzle-kit migrate`. RLS via Supabase MCP. |
| V. Stripe for Payments | PASS | Free prompts skip Stripe entirely. No payment processing for price = 0. Existing Stripe flow unchanged for paid prompts. |
| VI. Component-Driven UI (shadcn) | PASS | Lock overlay, badge, and toggle built with shadcn primitives (Card, Badge, Switch, Button). Icons from Lucide. |
| VII. Playwright E2E | PASS | Tests cover: free prompt detail (locked/unlocked), sell form toggle, filter, badge display. |
| VIII. Zod Validation | PASS | Sell form schema uses discriminated validation (free toggle bypasses price min). New `priceType` query param validated. |
| IX. React Hook Form + zodResolver | PASS | Free toggle integrated into existing sell form via React Hook Form. Conditional field visibility. |
| X. Page Loading & Error States | PASS | Lock overlay has loading skeleton. Dashboard "My Free Prompts" has empty state. |

No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/009-free-prompts/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── get-prompt-detail.md
│   ├── post-free-access.md
│   ├── get-free-access.md
│   └── get-prompts-filter.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── api/
│   │   ├── prompts/
│   │   │   ├── route.ts              # MODIFY: add priceType filter param
│   │   │   └── [id]/
│   │   │       ├── route.ts          # MODIFY: conditional content gating
│   │   │       └── reviews/
│   │   │           └── route.ts      # MODIFY: allow reviews on free prompts
│   │   └── free-access/
│   │       └── route.ts              # NEW: POST record access, GET list accessed
│   ├── prompt/
│   │   └── [id]/
│   │       └── page.tsx              # MODIFY: lock overlay, free badge, no buy buttons
│   ├── market/
│   │   └── page.tsx                  # MODIFY: price type filter UI
│   ├── sell/
│   │   └── page.tsx                  # MODIFY: skip payout step for free
│   └── dashboard/
│       └── purchases/
│           └── page.tsx              # MODIFY: add "My Free Prompts" tab
├── components/
│   ├── sell/
│   │   └── PromptDetailsStep.tsx     # MODIFY: add free toggle, hide price
│   ├── prompt/
│   │   └── ContentLockOverlay.tsx    # NEW: blur overlay with sign-in CTA
│   ├── PromptCard.tsx                # MODIFY: show "مجاني" badge
│   └── ui/                           # Existing shadcn components (Badge, Switch)
├── db/
│   └── schema/
│       ├── free-prompt-access.ts     # NEW: free_prompt_access table
│       └── index.ts                  # MODIFY: export new table
├── lib/
│   ├── schemas/
│   │   └── api.ts                    # MODIFY: conditional price validation, priceType param
│   └── mappers.ts                    # MODIFY: add mapFreeAccessRow
└── stores/
    └── cart-store.ts                 # MODIFY: block free prompts from cart

drizzle/
└── XXXX_add_free_prompt_access.sql   # AUTO-GENERATED migration
```

**Structure Decision**: Follows existing Next.js App Router structure. One new API route group (`/api/free-access`), one new component (`ContentLockOverlay`), one new schema file. All other changes are modifications to existing files.

## Complexity Tracking

No constitution violations to justify. Feature follows all existing patterns.

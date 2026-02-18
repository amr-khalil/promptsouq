# Implementation Plan: Sell Form Enhancement

**Branch**: `013-sell-form-enhancement` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-sell-form-enhancement/spec.md`

## Summary

Enhance the sell prompt form with three key improvements: (1) reorder steps to payment-first with conditional skipping for already-activated sellers, (2) persist all form data in localStorage so drafts survive tab closes and browser restarts, (3) upload example images directly to Supabase Storage (10 MB max, public URLs) replacing ephemeral blob URLs. After submission, an inline success state replaces the form content with "View Prompt" and "Sell Another" actions.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, React Hook Form 7.x, Zod 4.x, @supabase/supabase-js (NEW), Clerk 6.x, Stripe SDK, i18next + react-i18next
**Storage**: Supabase Postgres 17.x (Drizzle ORM, existing), Supabase Storage (NEW — `prompt-images` bucket), localStorage (draft persistence, replacing sessionStorage)
**Testing**: Playwright (E2E for sell form flow)
**Target Platform**: Web — mobile-first, RTL Arabic-first
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Image uploads < 5s for files < 5 MB; payment status check < 2s on Step 3 load
**Constraints**: 10 MB max per image, public image URLs, Clerk auth (not Supabase Auth), RTL Arabic UI
**Scale/Scope**: 1 form page refactored, 3 step components modified, 1 new API route, 1 new storage bucket, ~6 modified files, ~4 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All new UI text uses i18n translation keys (ar/en). RTL layout unchanged. |
| II. Mobile-First | PASS | Form already mobile-first. Upload button and progress indicator fit existing responsive layout. |
| III. Server Components — No Server Actions | PASS | Image upload via API Route Handler (`POST /api/upload/image`). No server actions. Draft persistence is client-side (localStorage). |
| IV. Supabase as Data Layer + Drizzle | PASS | Images stored in Supabase Storage (new bucket). No schema changes to Drizzle tables. Bucket created via SQL migration. |
| V. Stripe for Payments | PASS | Existing Stripe Connect flow reused. Step reorder is UI-only; no payment logic changes. |
| VI. shadcn/ui Components | PASS | All new UI uses shadcn primitives (Badge, Progress, Button, Alert). Lucide icons for checkmark/warning. |
| VII. Playwright E2E | PASS | Tests required for: step order with/without payment activation, draft persistence, image upload flow. |
| VIII. Zod Validation | PASS | File upload validated with Zod in API route (MIME type, file size). Existing form schema unchanged. |
| IX. React Hook Form + zodResolver | PASS | Existing form continues to use React Hook Form. localStorage persistence wraps form state. |
| X. Page Loading & Error States | PASS | Upload progress indicator, upload error with retry, payment status loading state. |

**Gate result**: ALL PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/013-sell-form-enhancement/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research findings
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/           # Phase 1 API contracts
│   └── upload-image.md  # POST /api/upload/image contract
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── [locale]/sell/
│   │   └── page.tsx                    # MODIFIED — step reorder, localStorage, payment-first logic
│   └── api/
│       └── upload/
│           └── image/
│               └── route.ts            # NEW — image upload to Supabase Storage
├── components/sell/
│   ├── StepIndicator.tsx               # MODIFIED — new step labels, checkmark for Step 1
│   ├── PayoutStep.tsx                  # MODIFIED — now renders as Step 1 content
│   ├── PromptDetailsStep.tsx           # MODIFIED — now Step 2, no functional changes
│   ├── PromptFileStep.tsx              # MODIFIED — now Step 3, Supabase upload, payment badge
│   ├── ConfirmationStep.tsx            # REMOVED (replaced by inline success)
│   ├── PaymentBadge.tsx                # NEW — payment activation badge with checkmark
│   └── InlineSuccess.tsx               # NEW — success state after submission
├── lib/
│   ├── supabase-storage.ts             # NEW — Supabase JS client for Storage (server-side)
│   └── schemas/
│       └── api.ts                      # MODIFIED — add uploadImageSchema
└── i18n/locales/
    ├── ar/sell.json                    # MODIFIED — new translation keys
    └── en/sell.json                    # MODIFIED — new translation keys

tests/
└── e2e/
    └── sell-form.spec.ts               # NEW — Playwright tests for sell form flow
```

**Structure Decision**: Extends existing Next.js App Router structure. New API route under `src/app/api/upload/`. New components under `src/components/sell/`. Supabase Storage client isolated in `src/lib/supabase-storage.ts` (server-only, uses service role key).

## Complexity Tracking

> No constitution violations — this section is empty.

No violations found. All changes use existing patterns (API Route Handlers, shadcn components, Zod schemas, React Hook Form).

# Implementation Plan: Smart Search Bar

**Branch**: `012-smart-search-bar` | **Date**: 2026-02-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/012-smart-search-bar/spec.md`

## Summary

Enhance the existing search bar component to display recent user searches (stored in localStorage via Zustand) and trending searches (top-selling prompts via a new lightweight API endpoint) in a dropdown panel when the search input is focused and empty. The existing live suggestions behavior (2+ characters) remains unchanged. No database schema changes required.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Zustand (persist middleware), react-i18next, Drizzle ORM, Lucide React
**Storage**: Supabase Postgres (read-only for trending), localStorage (recent searches)
**Testing**: Playwright (E2E)
**Target Platform**: Web (mobile-first responsive, RTL Arabic-first)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Dropdown appears within 300ms of focus; recent searches are instant (localStorage)
**Constraints**: No new npm dependencies; no DB schema changes; preserve all existing search behaviors
**Scale/Scope**: 2 new files, 3 modified files, ~200 LOC net addition

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All new UI labels have Arabic translations; dropdown respects RTL layout |
| II. Mobile-First Responsive | PASS | Dropdown is full-width on mobile; touch targets ≥ 44px |
| III. Server Components — No Server Actions | PASS | SearchInput is already `"use client"`; trending data fetched via API route handler, not server action |
| IV. Supabase + Drizzle Migrations | PASS | No schema changes; trending query reads existing `prompts` table via Drizzle |
| V. Stripe for Payments | N/A | No payment involvement |
| VI. Component-Driven UI (shadcn/ui) | PASS | Uses existing shadcn primitives (Badge, Button); icons from Lucide React |
| VII. Playwright E2E Testing | PASS | Test plan covers mobile + desktop viewports |
| VIII. Zod Schema Validation | PASS | Trending API response uses Zod; no request params to validate |
| IX. React Hook Form + zodResolver | N/A | No forms in this feature |
| X. Page Loading & Error States | PASS | Trending loading state handled; empty/error states defined |

**Gate result**: PASS — no violations.

## Project Structure

### Documentation (this feature)

```text
specs/012-smart-search-bar/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── trending-api.md  # Trending endpoint contract
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── cart-store.ts              # Existing (reference pattern)
│   └── recent-searches-store.ts   # NEW — Zustand + persist for recent searches
├── components/
│   └── SearchInput.tsx            # MODIFY — add recent/trending dropdown panel
├── app/
│   └── api/
│       └── trending/
│           └── route.ts           # NEW — GET /api/trending endpoint
├── i18n/
│   └── locales/
│       ├── ar/
│       │   └── common.json        # MODIFY — add search.recentSearches, etc.
│       └── en/
│           └── common.json        # MODIFY — add search.recentSearches, etc.
```

**Structure Decision**: Follows existing Next.js App Router layout. New Zustand store in `src/stores/` (same directory as cart-store). New API route in `src/app/api/trending/`. No new directories needed beyond `api/trending/`.

## Complexity Tracking

No constitution violations to justify. Feature is straightforward:
- 1 new Zustand store (follows exact cart-store pattern)
- 1 new API route (simple DB read)
- 1 component enhancement (SearchInput dropdown states)
- i18n key additions (4 new keys per locale)

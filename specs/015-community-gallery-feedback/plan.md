# Implementation Plan: Community Gallery & Feedback System

**Branch**: `015-community-gallery-feedback` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-community-gallery-feedback/spec.md`

## Summary

Add three community features to PromptSouq: (1) a Midjourney-style AI image gallery with masonry grid, infinite scroll, image detail modal with prompt info/purchase link, and likes; (2) a feature request system with public browsing and authenticated voting; (3) an issue reporting system with admin resolution notes. Includes an in-app notification bell for sellers. Uses existing Drizzle ORM + Supabase Postgres stack with 7 new tables, 15+ new API routes, and 6 new pages.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 18+
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, Drizzle ORM, Clerk 6.x, Zod 4.x, React Hook Form 7.x, shadcn/ui (New York), i18next + react-i18next, Lucide React, Sonner (toast)
**Storage**: Supabase Postgres 17.x via Drizzle ORM + postgres.js (`prepare: false`), Supabase Storage (`prompt-images` bucket for gallery/issue images)
**Testing**: Playwright E2E (tests/ directory)
**Target Platform**: Web (responsive: mobile-first, RTL Arabic)
**Project Type**: Web application (Next.js monolith with App Router)
**Performance Goals**: Gallery initial load <2s, infinite scroll batches of 20 images, modal open <500ms
**Constraints**: Arabic-first RTL, no server actions, all mutations via API Route Handlers, Clerk auth
**Scale/Scope**: 1000+ gallery images, standard web traffic, 6 new pages + ~15 API routes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Arabic-First & RTL | PASS | All new pages/components will use Arabic text with i18n, RTL layout |
| II. Mobile-First Responsive | PASS | Masonry grid: 1 col mobile → 4-5 desktop. All pages mobile-first |
| III. Server Components, No Server Actions | PASS | All mutations via API Route Handlers. Gallery page = Server Component, modal = Client |
| IV. Supabase + Drizzle Migrations | PASS | 7 new tables via Drizzle pgTable(). RLS via Supabase MCP. Images in existing bucket |
| V. Stripe for Payments | N/A | No payment changes in this feature |
| VI. shadcn/ui Components | PASS | Dialog for image modal, Card for feature requests, Table for admin views |
| VII. Playwright E2E | PASS | Tests for gallery browse, image detail, voting, issue submit |
| VIII. Zod Schema Validation | PASS | All API request/response schemas via Zod. Types inferred with z.infer<> |
| IX. React Hook Form + zodResolver | PASS | Feature request form, issue report form, gallery upload form |
| X. Page Loading & Error States | PASS | loading.tsx for each new route segment, empty states for gallery/lists |

**Gate result: PASS** — No violations detected. All principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/015-community-gallery-feedback/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── gallery-api.md
│   ├── feature-requests-api.md
│   ├── issues-api.md
│   └── notifications-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── db/schema/
│   ├── gallery-images.ts        # NEW — gallery_images table
│   ├── gallery-likes.ts         # NEW — gallery_likes table
│   ├── feature-requests.ts      # NEW — feature_requests table
│   ├── feature-votes.ts         # NEW — feature_votes table
│   ├── issues.ts                # NEW — issues table
│   ├── issue-status-changes.ts  # NEW — issue_status_changes table
│   ├── notifications.ts         # NEW — notifications table
│   └── index.ts                 # MODIFIED — add 7 new exports
│
├── app/[locale]/
│   ├── gallery/
│   │   ├── page.tsx             # NEW — Gallery masonry grid page (Server Component)
│   │   └── loading.tsx          # NEW — Skeleton masonry grid
│   │
│   ├── feature-requests/
│   │   ├── page.tsx             # NEW — Feature requests list (Server Component)
│   │   └── loading.tsx          # NEW — Skeleton list
│   │
│   ├── dashboard/
│   │   ├── issues/
│   │   │   ├── page.tsx         # NEW — My Issues list
│   │   │   └── loading.tsx      # NEW
│   │   │
│   │   ├── seller/
│   │   │   └── gallery/
│   │   │       ├── page.tsx     # NEW — Seller gallery submissions
│   │   │       └── loading.tsx  # NEW
│   │   │
│   │   └── admin/
│   │       ├── issues/
│   │       │   ├── page.tsx     # NEW — Admin issues management
│   │       │   └── loading.tsx  # NEW
│   │       │
│   │       └── gallery/
│   │           ├── page.tsx     # NEW — Admin gallery moderation
│   │           └── loading.tsx  # NEW
│
├── app/api/
│   ├── gallery/
│   │   ├── route.ts             # NEW — GET (list), POST (seller upload)
│   │   └── [id]/
│   │       ├── route.ts         # NEW — GET (detail)
│   │       └── like/
│   │           └── route.ts     # NEW — POST (like), DELETE (unlike)
│   │
│   ├── feature-requests/
│   │   ├── route.ts             # NEW — GET (list), POST (create)
│   │   └── [id]/
│   │       └── vote/
│   │           └── route.ts     # NEW — POST (vote), DELETE (unvote)
│   │
│   ├── issues/
│   │   └── route.ts             # NEW — GET (user's own), POST (create)
│   │
│   ├── admin/
│   │   ├── issues/
│   │   │   ├── route.ts         # NEW — GET (all issues)
│   │   │   └── [id]/
│   │   │       └── status/
│   │   │           └── route.ts # NEW — PATCH (change status + note)
│   │   │
│   │   └── gallery/
│   │       ├── route.ts         # NEW — GET (pending gallery images)
│   │       └── [id]/
│   │           └── review/
│   │               └── route.ts # NEW — POST (approve/reject)
│   │
│   └── notifications/
│       ├── route.ts             # NEW — GET (list), PATCH (mark read)
│       └── count/
│           └── route.ts         # NEW — GET (unread count)
│
├── components/
│   ├── gallery/
│   │   ├── MasonryGrid.tsx      # NEW — Client Component, masonry layout
│   │   ├── GalleryImageCard.tsx  # NEW — Single image card in grid
│   │   ├── ImageDetailModal.tsx  # NEW — Full image + prompt info modal
│   │   ├── GalleryFilters.tsx   # NEW — Time/category filter bar
│   │   └── GalleryUploadForm.tsx # NEW — Seller upload form
│   │
│   ├── feature-requests/
│   │   ├── FeatureRequestList.tsx   # NEW — List with voting
│   │   ├── FeatureRequestCard.tsx   # NEW — Single request card
│   │   ├── FeatureRequestForm.tsx   # NEW — Submit form (RHF + Zod)
│   │   └── VoteButton.tsx           # NEW — Upvote toggle button
│   │
│   ├── issues/
│   │   ├── IssueForm.tsx            # NEW — Submit issue form
│   │   ├── IssueList.tsx            # NEW — User's issues list
│   │   └── AdminIssueTable.tsx      # NEW — Admin issues table
│   │
│   └── notifications/
│       ├── NotificationBell.tsx     # NEW — Header bell icon + badge
│       └── NotificationDropdown.tsx # NEW — Dropdown list of notifications
│
├── lib/
│   └── schemas/
│       ├── gallery.ts           # NEW — Zod schemas for gallery API
│       ├── feature-requests.ts  # NEW — Zod schemas for feature requests API
│       ├── issues.ts            # NEW — Zod schemas for issues API
│       └── notifications.ts     # NEW — Zod schemas for notifications API
│
└── i18n/locales/
    ├── ar/
    │   ├── gallery.json         # NEW — Arabic gallery translations
    │   ├── feature-requests.json # NEW — Arabic feature request translations
    │   └── issues.json          # NEW — Arabic issue translations
    └── en/
        ├── gallery.json         # NEW — English gallery translations
        ├── feature-requests.json # NEW — English feature request translations
        └── issues.json          # NEW — English issue translations
```

**Structure Decision**: Follows existing Next.js App Router monolith pattern. New pages go under `src/app/[locale]/`. New API routes under `src/app/api/`. Components organized by feature domain. Schemas co-located in `src/lib/schemas/`. Translations in existing i18n locale structure.

## Complexity Tracking

> No constitution violations detected. No complexity justifications needed.

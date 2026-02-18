# Implementation Plan: Supabase Auth Migration

**Branch**: `016-supabase-auth-migration` | **Date**: 2026-02-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-supabase-auth-migration/spec.md`

## Summary

Migrate all authentication from Clerk (`@clerk/nextjs`) to Supabase Auth (`@supabase/ssr`) across the entire PromptSouq codebase. This is a clean-break migration (no production data to migrate) that replaces 41+ files importing Clerk packages, rewrites middleware for cookie-based sessions with locale detection, adds a `profiles` table with auto-creation trigger, implements custom sign-in/sign-up/reset-password pages using Supabase Auth SDK, adds an onboarding wizard, and adds admin user management UI. The final step removes all Clerk dependencies.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Next.js 16.x (App Router), React 19.x, `@supabase/ssr` (new), `@supabase/supabase-js` 2.96.0 (existing), Drizzle ORM 0.45.1, Zod 4.x, React Hook Form 7.x, i18next 25.x
**Storage**: Supabase Postgres 17.x (project `dyaflmsawxpqgmyojtbc`), Supabase Storage (avatars)
**Testing**: Playwright (existing)
**Target Platform**: Web (Next.js on Vercel/Node.js)
**Project Type**: Web application (Next.js App Router)
**Performance Goals**: Auth page loads < 2s, session refresh transparent (no visible delay), route protection redirect < 1s
**Constraints**: Arabic-first RTL, mobile-first, no server actions, all mutations via API Route Handlers
**Scale/Scope**: 41+ files to modify, 33+ API routes with auth checks, 7 user stories, ~15 new files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Arabic-First & RTL | PASS | Auth pages already RTL with i18next; will preserve |
| II | Mobile-First Responsive | PASS | Auth pages already mobile-first; will preserve |
| III | Server Components, No Server Actions | PASS | All auth mutations via API Route Handlers or Supabase client SDK; no server actions |
| IV | Supabase as Data Layer + Drizzle | PASS | Profiles table via Drizzle schema + Supabase migration for trigger. Drizzle for type inference |
| V | Stripe for Payments | N/A | No payment changes |
| VI | shadcn/ui Components | PASS | Auth pages already use shadcn; will preserve |
| VII | Playwright E2E Testing | PASS | Auth flows are critical journeys requiring tests |
| VIII | Zod Schema Validation | PASS | Auth forms use Zod schemas with zodResolver |
| IX | React Hook Form + zodResolver | PASS | Auth forms use RHF; will preserve pattern |
| X | Page Loading & Error States | PASS | Auth pages have loading states; will add for new pages |

**Constitution Violation**: The constitution lists `Clerk (@clerk/nextjs) 6.x` as the mandatory auth technology (line 209). This migration intentionally replaces Clerk with Supabase Auth. This requires a **constitution amendment** to update the Auth row from Clerk to Supabase Auth + `@supabase/ssr`.

**Amendment**: After migration is complete, update `.specify/memory/constitution.md` Technology Stack table:
- Change: `Auth | Clerk (@clerk/nextjs) | 6.x` → `Auth | Supabase Auth (@supabase/ssr) | latest`
- Bump version to 1.4.0 (MINOR: principle changed)

## Project Structure

### Documentation (this feature)

```text
specs/016-supabase-auth-migration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── auth-api.md      # Auth route contracts
│   └── client-utilities.md  # Client utility contracts
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser Supabase client (createBrowserClient)
│   │   ├── server.ts          # Server Supabase client (createServerClient + cookies)
│   │   ├── admin.ts           # Admin Supabase client (service role key)
│   │   └── middleware.ts       # updateSession() for middleware token refresh
│   ├── auth.ts                 # checkAuth(), checkAdmin(), getAuthUser()
│   ├── schemas/
│   │   └── auth.ts            # Zod schemas for auth forms and API validation
│   └── supabase-storage.ts    # Unchanged (existing storage client)
├── hooks/
│   └── use-auth.ts            # Custom hook replacing useUser/useAuth/useClerk
├── db/
│   └── schema/
│       ├── profiles.ts        # Drizzle schema for profiles table
│       └── index.ts           # Updated barrel export
├── proxy.ts                    # Rewritten middleware (Supabase session + locale)
├── app/
│   ├── layout.tsx              # Remove ClerkProvider wrapper
│   ├── auth/
│   │   ├── callback/route.ts   # OAuth PKCE code exchange
│   │   └── confirm/route.ts    # Email/recovery token verification
│   ├── [locale]/
│   │   ├── (auth)/
│   │   │   ├── sign-in/[[...sign-in]]/page.tsx   # Rewrite with Supabase
│   │   │   ├── sign-up/[[...sign-up]]/page.tsx   # Rewrite with Supabase
│   │   │   ├── forgot-password/page.tsx           # New page
│   │   │   └── reset-password/page.tsx            # New page
│   │   └── (dashboard)/
│   │       └── dashboard/
│   │           ├── onboarding/page.tsx            # New wizard page
│   │           └── admin/users/page.tsx           # New admin user mgmt
│   └── api/
│       ├── auth/sign-out/route.ts                 # New route
│       ├── user/profile/route.ts                  # New route
│       └── admin/
│           └── users/
│               ├── route.ts                       # New: list users
│               └── [id]/role/route.ts             # New: set role
├── components/
│   ├── Header.tsx              # Replace Clerk hooks
│   ├── auth/                   # New auth UI components
│   │   ├── OAuthButtons.tsx    # Google/Facebook buttons
│   │   └── AuthGuard.tsx       # Client-side auth check wrapper
│   └── dashboard/
│       ├── DashboardNavUser.tsx # Replace Clerk hooks
│       └── OnboardingWizard.tsx # New: multi-step wizard
└── types/
    └── auth.ts                 # New: AuthUser, Profile types (replace clerk.d.ts)
```

**Structure Decision**: This follows the existing Next.js App Router structure. No new top-level directories — all new files integrate into the existing `src/` layout. The key addition is `src/lib/supabase/` for the three Supabase clients.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Constitution auth tech change (Clerk → Supabase) | User explicitly requested migration to consolidate on Supabase | Keeping Clerk means running two separate services for auth and data |

# Tasks: Supabase Auth Migration

**Input**: Design documents from `/specs/016-supabase-auth-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested. Test tasks omitted (Playwright E2E can be added in a follow-up).

**Organization**: Tasks grouped by user story. Each story is independently testable after foundational phase.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1–US7)
- Exact file paths included

---

## Phase 1: Setup

**Purpose**: Install dependencies, create Supabase client utilities, types, and schemas

- [x] T001 Install `@supabase/ssr` package via `npm install @supabase/ssr`
- [x] T002 [P] Create browser Supabase client in `src/lib/supabase/client.ts` — export `createClient()` using `createBrowserClient` from `@supabase/ssr` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- [x] T003 [P] Create server Supabase client in `src/lib/supabase/server.ts` — export async `createClient()` using `createServerClient` from `@supabase/ssr` with `cookies()` from `next/headers`, `getAll`/`setAll` pattern with try/catch on setAll
- [x] T004 [P] Create admin Supabase client in `src/lib/supabase/admin.ts` — export `createAdminClient()` using `createClient` from `@supabase/supabase-js` with `SUPABASE_SERVICE_ROLE_KEY`, lazy singleton pattern (like existing `src/lib/supabase-storage.ts`)
- [x] T005 [P] Create middleware session helper in `src/lib/supabase/middleware.ts` — export `updateSession(request)` that creates server client from request cookies, calls `supabase.auth.getUser()` to refresh token, returns response with updated cookies on both request and response
- [x] T006 [P] Create auth types in `src/types/auth.ts` — export `AuthUser` interface (id, email, firstName, lastName, displayName, avatarUrl, role, onboardingCompleted, emailVerified, createdAt, lastSignInAt) and `Profile` type inferred from Drizzle schema
- [x] T007 [P] Create Zod auth schemas in `src/lib/schemas/auth.ts` — sign-in schema (email, password), sign-up schema (fullName, email, password, confirmPassword, acceptTerms), profile update schema (firstName, lastName, displayName, avatarUrl, onboardingCompleted, locale), password reset schema (password, confirmPassword), role update schema (role enum). Arabic error messages via `.message()`

**Checkpoint**: Supabase client utilities and types ready. No Clerk code removed yet — both systems can coexist temporarily.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database, auth helpers, middleware, and server-side route handlers that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Create `profiles` table, trigger function, and RLS policies via Supabase MCP `apply_migration` — SQL: create `profiles` table (id uuid PK references auth.users ON DELETE CASCADE, first_name, last_name, display_name, avatar_url text nullable, onboarding_completed boolean default false, locale text default 'ar', created_at/updated_at timestamptz). Create `handle_new_user()` trigger function (security definer, set search_path = '') that inserts profile on auth.users INSERT reading raw_user_meta_data. Enable RLS: authenticated SELECT/UPDATE own row. Run `get_advisors(type: "security")` after
- [x] T009 Create Drizzle schema for profiles table in `src/db/schema/profiles.ts` — define `profiles` table using `pgTable()` matching the migration schema. Export `profiles`. Add `$inferSelect` and `$inferInsert` types
- [x] T010 Update barrel export in `src/db/schema/index.ts` — add `export { profiles } from "./profiles"`
- [x] T011 Rewrite `src/lib/auth.ts` — replace Clerk imports with Supabase server client. `checkAuth()`: create server client, call `getUser()`, return `user.id` or null. `checkAdmin()`: call `getUser()`, read `user.app_metadata?.role`, return `{ isAdmin, userId }`. Add `getAuthUser()`: join auth user with profiles table via Drizzle, return full `AuthUser` object
- [x] T012 Create `useAuth` hook in `src/hooks/use-auth.ts` — replaces `useUser()`, `useAuth()`, `useClerk()` from Clerk. Create browser client, listen to `onAuthStateChange`, fetch profile from `/api/user/profile` when authenticated, expose `{ user, isLoaded, isSignedIn, signOut }`. Use `useSyncExternalStore` pattern for hydration safety
- [x] T013 Rewrite `src/proxy.ts` middleware — remove `clerkMiddleware` and `createRouteMatcher`. Import `updateSession` from `src/lib/supabase/middleware.ts`. Merge Supabase session refresh with existing locale detection logic. Use `supabase.auth.getUser()` instead of Clerk `auth()` for userId check. Preserve all existing route protection logic (public routes, auth redirects, /ar prefix, /en rewrite). Add `/reset-password`, `/forgot-password`, `/auth/callback`, `/auth/confirm` to public routes. Preserve `config.matcher`
- [x] T014 Remove `ClerkProvider` from `src/app/layout.tsx` — remove `import { ClerkProvider } from "@clerk/nextjs"` and the `<ClerkProvider>` wrapper element. Keep all other layout structure (ThemeProvider, Toaster, fonts, locale detection) intact
- [x] T015 [P] Create OAuth callback route handler in `src/app/auth/callback/route.ts` — GET handler: extract `code` and `next` from searchParams, create server client, call `exchangeCodeForSession(code)`, redirect to `next` (default `/dashboard`) on success, redirect to `/sign-in?error=auth-code-error` on failure
- [x] T016 [P] Create email/recovery confirm route handler in `src/app/auth/confirm/route.ts` — GET handler: extract `token_hash`, `type`, `next` from searchParams, create server client, call `verifyOtp({ type, token_hash })`, redirect to `/dashboard` for type=email, redirect to `/reset-password` for type=recovery, redirect to `/sign-in?error=verification-failed` on failure
- [x] T017 [P] Create sign-out API route in `src/app/api/auth/sign-out/route.ts` — POST handler: create server client, call `supabase.auth.signOut()`, return `{ success: true }` or error
- [x] T018 Create user profile API route in `src/app/api/user/profile/route.ts` — GET: call `getAuthUser()`, return profile JSON per contract. PUT: validate body with Zod profile update schema, update profiles table via Drizzle `db.update(profiles).set(...)`, return updated profile. Both require auth (401 if not authenticated)
- [x] T019 Migrate all existing API routes that directly import from `@clerk/nextjs/server` — search for `import { auth } from "@clerk/nextjs/server"` and `import { currentUser } from "@clerk/nextjs/server"` across all `src/app/api/` routes. Replace with imports from `@/lib/auth`. Routes already using `checkAuth()`/`checkAdmin()` from `@/lib/auth` need NO changes (the helpers are rewritten in T011). Only routes with direct Clerk imports need updating. Key files: `src/app/api/prompts/route.ts` (uses `currentUser()`), `src/app/api/admin/prompts/[id]/review/route.ts` (uses `clerkClient()`). For `clerkClient()` usage, replace with admin Supabase client calls

**Checkpoint**: Foundation ready — all Supabase infrastructure in place, middleware protecting routes, auth helpers working, all API routes migrated. User story implementation can begin.

---

## Phase 3: User Story 1 — New User Registration (Priority: P1) MVP

**Goal**: Visitors can create accounts via email/password or OAuth (Google/Facebook) with email verification.

**Independent Test**: Navigate to `/sign-up`, create account with email, verify email via link, confirm redirect to dashboard. Also test Google/Facebook OAuth sign-up.

### Implementation

- [x] T020 [P] [US1] Create `OAuthButtons` component in `src/components/auth/OAuthButtons.tsx` — client component with Google and Facebook sign-in/sign-up buttons. Each calls `supabase.auth.signInWithOAuth({ provider, options: { redirectTo: origin + '/auth/callback' } })`. Accept `mode` prop ('sign-in' | 'sign-up') for label text. Use shadcn Button, Lucide icons, i18n translations. RTL-aware layout
- [x] T021 [US1] Rewrite sign-up page at `src/app/[locale]/(auth)/sign-up/[[...sign-up]]/page.tsx` — client component using React Hook Form + zodResolver with sign-up schema. Form fields: full name, email, password, confirm password, terms checkbox. On submit: call `supabase.auth.signUp({ email, password, options: { data: { full_name, first_name, last_name } } })`. Show email verification pending state after successful signup. Include OAuthButtons component. Arabic error messages. Preserve existing shadcn Card UI structure and RTL layout. Add loading states
- [x] T022 [US1] Add/update auth i18n translations for sign-up in `src/i18n/locales/ar/auth.json` and `src/i18n/locales/en/auth.json` — add keys for: sign-up form labels, password requirements, terms text, verification pending message, OAuth button labels, error messages (email taken, weak password, generic error)

**Checkpoint**: Users can register via email (with verification) or OAuth. Run `npm run lint && npm run build`.

---

## Phase 4: User Story 2 — Existing User Login (Priority: P1)

**Goal**: Returning users can sign in via email/password or OAuth and reach the dashboard.

**Independent Test**: Navigate to `/sign-in`, enter valid credentials, verify redirect to dashboard. Test Google OAuth sign-in. Test invalid credentials show Arabic error.

### Implementation

- [x] T023 [US2] Rewrite sign-in page at `src/app/[locale]/(auth)/sign-in/[[...sign-in]]/page.tsx` — client component using React Hook Form + zodResolver with sign-in schema. Form fields: email, password. On submit: call `supabase.auth.signInWithPassword({ email, password })`. Handle errors (invalid credentials, unverified email). Include OAuthButtons component. Add "Forgot password?" link to `/forgot-password`. Arabic error messages. Preserve existing shadcn Card UI structure and RTL layout. Add loading states
- [x] T024 [US2] Add/update auth i18n translations for sign-in in `src/i18n/locales/ar/auth.json` and `src/i18n/locales/en/auth.json` — add keys for: sign-in form labels, forgot password link, invalid credentials error, unverified email message
- [x] T025 [US2] Delete SSO callback pages at `src/app/[locale]/(auth)/sign-in/sso-callback/page.tsx` and `src/app/[locale]/(auth)/sign-up/sso-callback/page.tsx` — no longer needed, Supabase OAuth uses `/auth/callback` route handler instead

**Checkpoint**: Users can sign in and reach dashboard. Both registration and login flows work. Run `npm run lint && npm run build`.

---

## Phase 5: User Story 3 — User Profile & Settings (Priority: P2)

**Goal**: Authenticated users can view and update their profile (name, avatar) in dashboard and settings.

**Independent Test**: Sign in, navigate to dashboard profile page, verify user data displays. Go to settings, update name and avatar, verify changes reflect in header.

### Implementation

- [x] T026 [US3] Rewrite dashboard profile page at `src/app/[locale]/(dashboard)/dashboard/page.tsx` — replace `useUser()` from Clerk with `useAuth()` hook. Display profile data from `user` object (displayName, email, avatarUrl, createdAt, lastSignInAt). Update stats fetching to use the same API endpoints. Remove Clerk-specific fields (2FA badge, phone). Keep shadcn Card layout and i18n
- [x] T027 [US3] Rewrite settings page at `src/app/[locale]/(dashboard)/dashboard/settings/page.tsx` — replace Clerk `useUser()` with `useAuth()` hook. Avatar upload: use Supabase Storage via existing `src/lib/supabase-storage.ts` (or new auth-aware client) then PUT `/api/user/profile` with avatarUrl. Name editing: React Hook Form with Zod profile update schema, submit to PUT `/api/user/profile`. Remove Clerk-specific `user.setProfileImage()` and `user.update()`. Keep connected accounts display (read from Supabase auth identities). Remove 2FA status badge
- [x] T028 [US3] Update `src/components/Header.tsx` — replace `useUser()` and `useClerk()` imports from Clerk with `useAuth()` from `src/hooks/use-auth.ts`. Map `user.displayName`, `user.avatarUrl`, `user.email`, `user.role` to existing UI elements. Replace `signOut({ redirectUrl: "/" })` with `signOut()` from useAuth hook. Keep existing admin badge count logic, seller status check, and locale-aware navigation intact
- [x] T029 [US3] Update `src/components/dashboard/DashboardNavUser.tsx` — replace Clerk `useUser()` and `useClerk()` with `useAuth()` hook. Map user properties (name, email, avatar) to existing sidebar UI. Replace `signOut({ redirectUrl: "/" })` with `signOut()` from useAuth hook
- [x] T030 [US3] Update any remaining client components that import from `@clerk/nextjs` — search for remaining `useUser`, `useAuth` (Clerk version), `useClerk` imports in: `src/components/dashboard/FavoriteButton.tsx`, `src/components/gallery/ImageDetailModal.tsx`, `src/components/feature-requests/FeatureRequestList.tsx`, `src/components/feature-requests/VoteButton.tsx`, `src/hooks/use-credits.ts`, `src/app/[locale]/(main)/checkout/page.tsx`, `src/app/[locale]/(main)/prompt/[id]/page.tsx`. Replace each with `useAuth()` hook, using `user?.id` for userId checks and `isSignedIn` for auth state

**Checkpoint**: Profile displays correctly, settings page works, header shows user data. Run `npm run lint && npm run build`.

---

## Phase 6: User Story 4 — Password Reset (Priority: P2)

**Goal**: Users who forgot their password can request a reset email and set a new password via a dedicated page.

**Independent Test**: Go to `/sign-in`, click "Forgot password", enter email, click reset link from email, land on `/reset-password`, set new password, sign in with new password.

### Implementation

- [x] T031 [P] [US4] Create forgot-password page at `src/app/[locale]/(auth)/forgot-password/page.tsx` — client component with email input form (React Hook Form + Zod). On submit: call `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/auth/confirm?next=/reset-password' })`. Show success message regardless of whether email exists (prevent enumeration). Link back to sign-in. Arabic translations
- [x] T032 [P] [US4] Create reset-password page at `src/app/[locale]/(auth)/reset-password/page.tsx` — client component with new password + confirm password form (React Hook Form + Zod password reset schema). On submit: call `supabase.auth.updateUser({ password })`. Redirect to `/sign-in` on success. Handle invalid/expired token: show error with link to sign-in. Arabic translations
- [x] T033 [US4] Add i18n translations for password reset in `src/i18n/locales/ar/auth.json` and `src/i18n/locales/en/auth.json` — add keys for: forgot password title, email sent message, reset password title, password requirements, success message, expired token error
- [x] T034 [P] [US4] Create `loading.tsx` files for new auth pages — `src/app/[locale]/(auth)/forgot-password/loading.tsx` and `src/app/[locale]/(auth)/reset-password/loading.tsx` with skeleton placeholder matching page layout

**Checkpoint**: Full password reset flow works end-to-end. Run `npm run lint && npm run build`.

---

## Phase 7: User Story 5 — Admin Role & Access Control (Priority: P2)

**Goal**: Admin role works via `app_metadata`, admins can access admin pages and manage user roles via a new admin users page.

**Independent Test**: Set a user's `app_metadata.role` to "admin" in Supabase dashboard, sign in, verify access to admin pages. Promote/demote a user via the admin users page.

### Implementation

- [x] T035 [P] [US5] Create admin users list API route at `src/app/api/admin/users/route.ts` — GET handler: call `checkAdmin()` for auth (401/403). Use admin client `supabaseAdmin.auth.admin.listUsers()` with pagination. Join with profiles table via Drizzle for display names/avatars. Support `search` and `role` query params. Return paginated user list per contract
- [x] T036 [P] [US5] Create admin role update API route at `src/app/api/admin/users/[id]/role/route.ts` — PUT handler: call `checkAdmin()` for auth. Validate body with role update Zod schema. Prevent self-demotion (compare request userId with target id). Call `supabaseAdmin.auth.admin.updateUser(id, { app_metadata: { role } })`. Return updated user
- [x] T037 [US5] Create admin users management page at `src/app/[locale]/(dashboard)/dashboard/admin/users/page.tsx` — client component displaying user list table (shadcn Table). Columns: avatar, name, email, role, joined date. Search input for filtering. Role toggle button per row (promote/demote via PUT `/api/admin/users/[id]/role`). Confirmation dialog before role change. Arabic translations. Pagination controls
- [x] T038 [US5] Add admin users page to dashboard navigation — update dashboard sidebar/navigation component to include "Users" link under admin section. Add i18n translations for "Users" menu item in `src/i18n/locales/ar/dashboard.json` and `src/i18n/locales/en/dashboard.json`
- [x] T039 [US5] Create `loading.tsx` for admin users page at `src/app/[locale]/(dashboard)/dashboard/admin/users/loading.tsx` with table skeleton

**Checkpoint**: Admin users page works, role promotion/demotion functional. Run `npm run lint && npm run build`.

---

## Phase 8: User Story 6 — Route Protection & Session Management (Priority: P2)

**Goal**: Protected routes redirect unauthenticated users, sessions persist, sign-out works reliably.

**Independent Test**: Access `/dashboard` while signed out — verify redirect to `/sign-in`. Sign in, refresh page — verify session persists. Sign out — verify redirect to home.

### Implementation

- [x] T040 [US6] Verify middleware route protection covers all protected routes — test that `/dashboard`, `/checkout`, `/dashboard/seller/*`, `/dashboard/admin/*` all redirect to `/sign-in` for unauthenticated users. Test that `/`, `/market`, `/search`, `/prompt/*`, `/sign-in`, `/sign-up`, `/reset-password`, `/forgot-password`, `/auth/callback`, `/auth/confirm` are accessible without auth. Fix any gaps in `src/proxy.ts` public route list
- [x] T041 [US6] Verify sign-out clears session correctly — ensure the sign-out flow (useAuth hook `signOut()` → POST `/api/auth/sign-out` → redirect) properly clears all Supabase auth cookies. Test that accessing protected routes after sign-out triggers redirect. Verify the `onAuthStateChange` listener in `useAuth` updates state on sign-out
- [x] T042 [US6] Test authenticated user redirect from auth pages — verify that authenticated users accessing `/sign-in`, `/sign-up`, or `/` are redirected to `/dashboard` (matching existing Clerk behavior in proxy.ts). Test both `/ar` and unprefixed routes

**Checkpoint**: Route protection and session management fully verified. Run `npm run lint && npm run build`.

---

## Phase 9: User Story 7 — Onboarding Wizard (Priority: P3)

**Goal**: New users see a 2-step onboarding wizard on first sign-in (profile setup + feature highlights), skippable, never repeats.

**Independent Test**: Create new account, sign in, verify wizard appears. Complete Step 1 (name + avatar), advance to Step 2, complete or skip. Sign in again — wizard does not appear.

### Implementation

- [x] T043 [P] [US7] Create OnboardingWizard component in `src/components/dashboard/OnboardingWizard.tsx` — client component with 2 steps. Step 1: display name input + avatar upload (React Hook Form + Zod). Step 2: feature highlights cards (browse prompts, sell prompts, use credits) with Lucide icons. Progress indicator (dots/bar). "Next" and "Skip" buttons on every step. On complete/skip: PUT `/api/user/profile` with `onboardingCompleted: true`. shadcn Card + Button, RTL-aware, Arabic translations
- [x] T044 [US7] Create onboarding page at `src/app/[locale]/(dashboard)/dashboard/onboarding/page.tsx` — check `user.onboardingCompleted` via useAuth hook. If already completed, redirect to `/dashboard`. Otherwise render OnboardingWizard. On wizard completion, redirect to `/dashboard`
- [x] T045 [US7] Add onboarding redirect logic — update the middleware or dashboard layout to check `onboardingCompleted` flag from the user's profile. If `false` for an authenticated user, redirect to `/dashboard/onboarding`. This check should only trigger for the dashboard root, not sub-pages, to avoid redirect loops
- [x] T046 [US7] Add i18n translations for onboarding in `src/i18n/locales/ar/dashboard.json` and `src/i18n/locales/en/dashboard.json` — add keys for: wizard title, step 1 labels (name, avatar), step 2 feature highlights (browse, sell, credits), next/skip/complete buttons
- [x] T047 [P] [US7] Create `loading.tsx` for onboarding page at `src/app/[locale]/(dashboard)/dashboard/onboarding/loading.tsx` with centered spinner

**Checkpoint**: Onboarding wizard works for new users. Run `npm run lint && npm run build`.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Remove Clerk completely, update documentation, verify build

- [x] T048 Delete `src/types/clerk.d.ts` — Clerk type augmentations no longer needed
- [x] T049 Uninstall Clerk package via `npm uninstall @clerk/nextjs` — verify no remaining imports
- [x] T050 Search entire codebase for any remaining `@clerk` imports — run `grep -r "@clerk" src/` and fix any missed references. Verify zero results
- [x] T051 Update `.env.local` documentation — remove Clerk env var references from `CLAUDE.md` environment variables section. Add `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` and note about `SUPABASE_SERVICE_ROLE_KEY`
- [x] T052 Update `.specify/memory/constitution.md` — change Technology Stack Auth row from `Clerk (@clerk/nextjs) | 6.x` to `Supabase Auth (@supabase/ssr) | latest`. Bump version from 1.3.0 to 1.4.0. Update "Last Amended" date. Add sync impact report comment
- [x] T053 Run full verification: `npm run lint && npm run build` — fix any errors. Verify zero Clerk references in build output
- [x] T054 Verify Supabase security advisors — run `get_advisors(type: "security")` via Supabase MCP to check for any RLS gaps on the new profiles table

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Registration (Phase 3)**: Depends on Phase 2
- **US2 Login (Phase 4)**: Depends on Phase 2. Can run in parallel with US1
- **US3 Profile & Settings (Phase 5)**: Depends on Phase 2. Can run in parallel with US1/US2
- **US4 Password Reset (Phase 6)**: Depends on Phase 2. Can run in parallel with US1-US3
- **US5 Admin Roles (Phase 7)**: Depends on Phase 2. Can run in parallel with US1-US4
- **US6 Route Protection (Phase 8)**: Depends on Phase 2 (mostly verified there). Runs after US1-US5 to validate full integration
- **US7 Onboarding (Phase 9)**: Depends on Phase 2 + US3 profile API. Runs after profile management works
- **Polish (Phase 10)**: Depends on ALL user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS ALL
    ↓
┌───┬───┬───┬───┬───┐
US1 US2 US3 US4 US5   ← All can run in parallel
└───┴───┴─┬─┴───┴───┘
          ↓
        US6 (verification pass)
          ↓
        US7 (depends on US3 profile API)
          ↓
      Phase 10 (Polish)
```

### Parallel Opportunities

**Phase 1** (all [P] tasks):
```
T002 (browser client) | T003 (server client) | T004 (admin client) | T005 (middleware) | T006 (types) | T007 (schemas)
```

**Phase 2** (after T008-T011 sequential):
```
T015 (OAuth callback) | T016 (email confirm) | T017 (sign-out API)
```

**Phase 3-7** (user stories after Phase 2):
```
US1 (T020-T022) | US2 (T023-T025) | US3 (T026-T030) | US4 (T031-T034) | US5 (T035-T039)
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (T001-T007)
2. Complete Phase 2: Foundational (T008-T019) — this is the heaviest phase
3. Complete Phase 3: US1 Registration (T020-T022)
4. Complete Phase 4: US2 Login (T023-T025)
5. **STOP and VALIDATE**: Users can register and sign in via email/password + OAuth
6. Run `npm run lint && npm run build`

### Incremental Delivery

1. Setup + Foundational → Auth infrastructure ready
2. US1 + US2 → Registration + Login work (MVP)
3. US3 → Profile & settings migrated
4. US4 → Password reset flow added
5. US5 → Admin role management added
6. US6 → Full route protection verified
7. US7 → Onboarding wizard added
8. Polish → Clerk removed, constitution updated

---

## Notes

- **T019 is the bulk migration task**: ~33 API routes need import changes. Most already use `checkAuth()`/`checkAdmin()` from `src/lib/auth.ts` (rewritten in T011). Only routes that directly import from `@clerk/nextjs/server` need manual updates
- **Clerk removal (T049) MUST be last**: Keep `@clerk/nextjs` installed until all imports are removed to avoid build errors during incremental migration
- The `src/db/index.ts` Drizzle client is UNCHANGED — it uses direct Postgres connection and is unaffected by auth changes
- The `src/lib/supabase-storage.ts` is UNCHANGED — it uses service role for storage and is unaffected
- Sign-in/sign-up pages keep the `[[...catch-all]]` route pattern for backward compatibility with any bookmarked URLs

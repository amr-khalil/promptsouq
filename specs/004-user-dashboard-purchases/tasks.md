# Tasks: User Dashboard & Purchases

**Input**: Design documents from `/specs/004-user-dashboard-purchases/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: Not explicitly requested in the feature specification. Test tasks are omitted.

**Organization**: Tasks grouped by user story. US4 (Dashboard Sidebar) is absorbed into Phase 2 (Foundational) since the sidebar layout is required infrastructure for all dashboard pages.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Schema & Data Layer)

**Purpose**: Database schema changes, migration, RLS policies, mappers, Zod schemas, and seed data updates required before any feature work.

- [X] T001 [P] Add `instructions` text column to prompts schema in `src/db/schema/prompts.ts` — nullable, after `fullContent`. See `data-model.md` § prompts.
- [X] T002 [P] Add `userId` text column (not null) and `UNIQUE(userId, promptId)` constraint to reviews schema in `src/db/schema/reviews.ts`. See `data-model.md` § reviews. For existing rows, the migration must backfill `user_id = 'seed-user'`.
- [X] T003 [P] Create favorites schema in `src/db/schema/favorites.ts` — `id` (serial PK), `userId` (text), `promptId` (uuid FK → prompts.id), `createdAt` (timestamptz), `UNIQUE(userId, promptId)`. See `data-model.md` § favorites.
- [X] T004 Export `favorites` from barrel in `src/db/schema/index.ts`.
- [X] T005 Generate and apply Drizzle migration: run `npx drizzle-kit generate` then `npx drizzle-kit migrate`. Verify all 3 schema changes applied (instructions column, userId column + constraint, favorites table).
- [X] T006 Apply RLS policies for `favorites` table via Supabase MCP `apply_migration`: enable RLS, anon = no access, authenticated = SELECT/INSERT/DELETE where `auth.uid()::text = user_id`. Then run `get_advisors(type: "security")` to verify no RLS gaps.
- [X] T007 [P] Update `mapPromptRow()` in `src/lib/mappers.ts` to include `instructions` field. Add new `mapPurchaseRow()` function that returns prompt card data + `purchasedAt` date (used by purchases list API).
- [X] T008 [P] Add Zod schemas to `src/lib/schemas/api.ts`: `reviewSubmitSchema` (rating 1-5 int, comment optional max 1000 chars with Arabic messages), `favoriteRequestSchema` (promptId uuid), `favoriteCheckQuerySchema` (comma-separated promptIds). Add `instructions` to `promptSchema`. Add `purchaseListItemSchema` for the enhanced purchases response.
- [X] T009 Update seed data in `src/db/seed.ts`: add `instructions` field to prompt seed records (sample Arabic usage instructions), add `userId: 'seed-user'` to all review seed records.

**Checkpoint**: Schema migrated, RLS applied, mappers and schemas ready. Run `npm run lint && npm run build` to verify.

---

## Phase 2: Foundational (Dashboard Infrastructure + US4 Sidebar)

**Purpose**: Dashboard layout with sidebar navigation, route protection, and old profile page removal. This phase implements US4 (Dashboard Sidebar) as foundational infrastructure.

**⚠️ CRITICAL**: No dashboard page work can begin until this phase is complete.

**US4 Acceptance Criteria Built In**:
- Sidebar links: الملف الشخصي, المشتريات, المفضلة, الإعدادات
- Active link highlighting via `usePathname()`
- User avatar + name from Clerk `useUser()`
- Mobile responsive: collapsible sidebar (hamburger or top bar)
- RTL layout (sidebar on right side)

- [X] T010 Delete old profile page: remove `src/app/profile/page.tsx` and `src/app/profile/loading.tsx`.
- [X] T011 Create `DashboardSidebar` client component in `src/components/dashboard/DashboardSidebar.tsx`. Uses `usePathname()` for active link highlighting, `useUser()` from Clerk for avatar/name. Four links with Lucide icons: الملف الشخصي (`/dashboard`), المشتريات (`/dashboard/purchases`), المفضلة (`/dashboard/favorites`), الإعدادات (`/dashboard/settings`). Mobile: collapses to horizontal nav bar or sheet. RTL: sidebar on right. See spec US4 acceptance scenarios.
- [X] T012 Create dashboard layout in `src/app/dashboard/layout.tsx` — Server Component shell that renders `DashboardSidebar` (client boundary) + `{children}`. Arabic heading, RTL, responsive grid (sidebar + main content area).
- [X] T013 Create dashboard root loading skeleton in `src/app/dashboard/loading.tsx`.
- [X] T014 Verify route protection in `src/proxy.ts`: confirm `/dashboard` and `/purchase` are NOT in the `isPublicRoute` matcher (they should already be protected by default). If `/purchase(.*)` conflicts with `/prompt(.*)`, add explicit protection.
- [X] T015 Update header navigation links across the app to point to `/dashboard` instead of `/profile`. Check `src/app/checkout/success/page.tsx` and any header component that links to the profile.

**Checkpoint**: Dashboard shell renders with sidebar, navigation works between empty sub-pages. Run `npm run lint && npm run build`.

---

## Phase 3: User Story 1 — View Purchased Prompts (Priority: P1) 🎯 MVP

**Goal**: Authenticated users see a grid of all their purchased prompts at `/dashboard/purchases` with search and AI model filtering.

**Independent Test**: Navigate to `/dashboard/purchases` as an authenticated user with purchases → see prompt cards with thumbnail, title, AI model, purchase date. Search by title, filter by AI model. Empty state for users with no purchases.

### Implementation for User Story 1

- [X] T016 [US1] Enhance `GET /api/user/purchases` in `src/app/api/user/purchases/route.ts` — list mode (no `promptId` param) now joins `orderItems` → `orders` → `prompts` and returns full prompt details + `purchasedAt` (from `orders.createdAt`). Keep existing check mode unchanged. Use `mapPurchaseRow()`. See `contracts/purchases.md` § GET /api/user/purchases.
- [X] T017 [P] [US1] Create `PurchaseCard` component in `src/components/dashboard/PurchaseCard.tsx` — displays prompt thumbnail, title, AI model badge, purchase date, and price. Links to `/purchase/{id}`. Arabic text, RTL, responsive card. Uses shadcn `Card`, Lucide icons.
- [X] T018 [US1] Create purchases page in `src/app/dashboard/purchases/page.tsx` — client component that fetches `/api/user/purchases`, renders `PurchaseCard` grid. Includes search input (filters by title client-side), AI model dropdown filter. Empty state with CTA to `/market`. Arabic heading "المشتريات".
- [X] T019 [US1] Create loading skeleton in `src/app/dashboard/purchases/loading.tsx` — grid of card skeletons matching PurchaseCard layout.

**Checkpoint**: Purchases page shows real purchase data from orders. Search and filter work. Empty state displays for new users. Run `npm run lint && npm run build`.

---

## Phase 4: User Story 2 — View Purchase Detail Page (Priority: P1)

**Goal**: Clicking a purchased prompt opens `/purchase/[id]` showing the full prompt template (with placeholders highlighted), example outputs, usage instructions, seller info, and a copy-to-clipboard button.

**Independent Test**: Navigate to `/purchase/{uuid}` as the buyer → see prompt template, examples, instructions, copy button. Non-buyers get 403 access denied. Invalid IDs get 404.

### Implementation for User Story 2

- [X] T020 [US2] Create purchase detail API in `src/app/api/purchase/[id]/route.ts` — `GET` handler: auth required, verify ownership via `orderItems` + `orders` join, return full prompt data including `fullContent`, `samples`, `instructions`, plus `purchasedAt`. Return 403 if not owner, 404 if prompt not found. See `contracts/purchases.md` § GET /api/purchase/[id].
- [X] T021 [US2] Create purchase detail page in `src/app/purchase/[id]/page.tsx` — client component fetching `/api/purchase/{id}`. Layout per PromptBase reference: main content area with prompt template (variable placeholders in `[BRACKETS]` visually highlighted), "نسخ البرومبت" copy button using `navigator.clipboard` + Sonner toast, example outputs section (scrollable list from `samples`), instructions section (from `instructions` field). Sidebar/header: thumbnail, title, AI model badge, seller info, tags. Access denied state for 403. Arabic text, RTL.
- [X] T022 [US2] Create loading skeleton in `src/app/purchase/[id]/loading.tsx` — matches the purchase detail layout shape.

**Checkpoint**: Purchase detail page displays full prompt content for buyers, denies access to non-buyers. Copy button works. Run `npm run lint && npm run build`.

---

## Phase 5: User Story 3 — Rate and Review (Priority: P2)

**Goal**: Users can submit a star rating (1-5) and optional comment on the purchase detail page. One review per user per prompt. Editable but not deletable. Aggregate rating updates on the public prompt page.

**Independent Test**: On `/purchase/{id}`, submit a 4-star review with comment → see success toast. Revisit → see existing review with edit option. Check `/prompt/{id}` → rating and review count updated.

### Implementation for User Story 3

- [X] T023 [US3] Add `POST` and `PUT` handlers to `src/app/api/prompts/[id]/reviews/route.ts`. POST: auth required, verify purchase ownership, check no existing review (409 if exists), insert review with `userId` from Clerk + `userName`/`userAvatar` from Clerk user object, recalculate prompt aggregate rating/count. PUT: auth required, find existing review by userId+promptId, update rating+comment+date, recalculate aggregate. Both use `reviewSubmitSchema` validation. See `contracts/reviews.md`.
- [X] T024 [P] [US3] Create user reviews API in `src/app/api/user/reviews/route.ts` — `GET` handler: auth required, `promptId` query param required, returns the user's review for that prompt or `{ data: null }`. See `contracts/reviews.md` § GET /api/user/reviews.
- [X] T025 [US3] Create `ReviewForm` client component in `src/components/reviews/ReviewForm.tsx` — uses React Hook Form + `zodResolver(reviewSubmitSchema)`. Interactive star rating (1-5, clickable stars using Lucide `Star` icon), textarea for comment (optional, max 1000 chars), submit button. Handles both create (POST) and edit (PUT) modes. Shows existing review in read-only display with "تعديل" (Edit) button to switch to form. Arabic labels and error messages. Sonner toast on success.
- [X] T026 [US3] Integrate `ReviewForm` into purchase detail page `src/app/purchase/[id]/page.tsx` — fetch user's existing review via `/api/user/reviews?promptId={id}`, pass to ReviewForm as initial data. Position review form in the sidebar area (per PromptBase reference: "Review this prompt" section with stars and textarea).
- [X] T027 [US3] Update `mapReviewRow()` in `src/lib/mappers.ts` to include `userId` field in output.

**Checkpoint**: Reviews can be created and edited. Aggregate rating updates. ReviewForm shows correct state (empty form vs existing review). Run `npm run lint && npm run build`.

---

## Phase 6: User Story 5 — Favorites / Bookmarks (Priority: P3)

**Goal**: Authenticated users can favorite/unfavorite prompts. Favorites persist server-side. Favorites page in dashboard shows all favorited prompts.

**Independent Test**: Click heart on a prompt card → heart fills. Navigate to `/dashboard/favorites` → see the prompt. Click heart again → removed. Unauthenticated users prompted to sign in.

### Implementation for User Story 5

- [X] T028 [P] [US5] Create favorites list + add API in `src/app/api/favorites/route.ts` — `GET`: auth required, join `favorites` → `prompts`, return full prompt data + `favoritedAt`, use `mapPromptRow`. `POST`: auth required, validate `favoriteRequestSchema`, verify prompt exists, insert favorite (409 if duplicate). See `contracts/favorites.md`.
- [X] T029 [P] [US5] Create favorites delete API in `src/app/api/favorites/[promptId]/route.ts` — `DELETE`: auth required, validate UUID, delete favorite row for userId+promptId (404 if not found). See `contracts/favorites.md` § DELETE.
- [X] T030 [P] [US5] Create favorites check API in `src/app/api/favorites/check/route.ts` — `GET`: auth required, accept comma-separated `promptIds` query param (max 50), return map of `{ [promptId]: boolean }`. See `contracts/favorites.md` § GET /api/favorites/check.
- [X] T031 [US5] Create `FavoriteButton` client component in `src/components/dashboard/FavoriteButton.tsx` — heart icon (Lucide `Heart`), toggles filled/outline state. Calls `POST /api/favorites` to add, `DELETE /api/favorites/{promptId}` to remove. Optimistic UI update. If user not signed in (`useAuth().isSignedIn === false`), redirect to sign-in. Accepts `promptId` and `isFavorited` props.
- [X] T032 [US5] Create favorites page in `src/app/dashboard/favorites/page.tsx` — client component that fetches `/api/favorites`, renders prompt cards (reuse existing prompt card pattern or PurchaseCard variant) with `FavoriteButton`. Empty state with CTA to browse marketplace. Arabic heading "المفضلة".
- [X] T033 [US5] Create loading skeleton in `src/app/dashboard/favorites/loading.tsx`.
- [X] T034 [US5] Integrate `FavoriteButton` into existing prompt cards on marketplace (`src/app/market/page.tsx`) and prompt detail page (`src/app/prompt/[id]/page.tsx`). Use `/api/favorites/check` to batch-check favorite status for visible prompts.

**Checkpoint**: Favorites can be added/removed. Favorites page shows favorited prompts. Heart icons appear on marketplace and prompt detail pages. Run `npm run lint && npm run build`.

---

## Phase 7: User Story 6 — Profile & Settings Pages (Priority: P3)

**Goal**: Profile page shows user info from Clerk. Settings page allows display name editing.

**Independent Test**: Visit `/dashboard` → see avatar, name, email, join date. Visit `/dashboard/settings` → update display name → refresh → name persists.

### Implementation for User Story 6

- [X] T035 [P] [US6] Create profile page in `src/app/dashboard/page.tsx` — Server Component or client component using Clerk `useUser()` to display avatar, display name, email, `createdAt` date. Arabic labels. Stats summary (total purchases count, total favorites count) fetched from APIs. Responsive card layout.
- [X] T036 [P] [US6] Create settings page in `src/app/dashboard/settings/page.tsx` — client component using React Hook Form + zodResolver for display name editing. Calls Clerk `user.update({ firstName, lastName })` to persist name changes. Arabic labels and error messages. Success toast on save.
- [X] T037 [P] [US6] Create loading skeletons: `src/app/dashboard/loading.tsx` (profile skeleton) and `src/app/dashboard/settings/loading.tsx` (settings skeleton).

**Checkpoint**: Profile displays real Clerk user data. Display name can be updated and persists. Run `npm run lint && npm run build`.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Integration points, navigation updates, and final verification.

- [X] T038 Update checkout success page `src/app/checkout/success/page.tsx` — add a link/button "عرض مشترياتي" (View My Purchases) pointing to `/dashboard/purchases`.
- [X] T039 Verify all dashboard pages have `loading.tsx` files: `/dashboard`, `/dashboard/purchases`, `/dashboard/favorites`, `/dashboard/settings`, `/purchase/[id]`. Ensure skeletons match page layout shapes.
- [X] T040 Run `npm run lint && npm run build` — fix all lint errors and build failures. Ensure zero warnings related to new code.
- [ ] T041 Manual smoke test: complete a purchase end-to-end → verify prompt appears in `/dashboard/purchases` → click through to `/purchase/{id}` → copy prompt → submit review → check rating update on `/prompt/{id}` → favorite a prompt → verify in `/dashboard/favorites` → check profile and settings pages.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (schema + mappers must exist) — BLOCKS all user story phases
- **US1 (Phase 3)**: Depends on Phase 2 (dashboard layout must exist)
- **US2 (Phase 4)**: Depends on Phase 1 only (standalone route, no dashboard dependency) — can run in parallel with Phase 2 and US1
- **US3 (Phase 5)**: Depends on US2 (review form lives on purchase detail page)
- **US5 (Phase 6)**: Depends on Phase 2 (favorites page in dashboard)
- **US6 (Phase 7)**: Depends on Phase 2 (profile/settings in dashboard)
- **Polish (Phase 8)**: Depends on all user story phases

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ├──→ Phase 2 (Foundational + US4 Sidebar)
    │        │
    │        ├──→ Phase 3 (US1 - Purchases List)
    │        ├──→ Phase 6 (US5 - Favorites) [parallel with US1]
    │        └──→ Phase 7 (US6 - Profile/Settings) [parallel with US1]
    │
    └──→ Phase 4 (US2 - Purchase Detail) [parallel with Phase 2]
              │
              └──→ Phase 5 (US3 - Reviews)
                        │
                        └──→ Phase 8 (Polish)
```

### Parallel Opportunities

**Within Phase 1**: T001, T002, T003 can run in parallel (different schema files). T007 and T008 can run in parallel (different files).

**After Phase 2**: US1 (Phase 3), US5 (Phase 6), and US6 (Phase 7) can all start in parallel — they affect different routes and APIs.

**US2 (Phase 4)** can start in parallel with Phase 2 since `/purchase/[id]` is a standalone route outside the dashboard layout.

---

## Parallel Example: After Phase 2 Completes

```
# These can all run simultaneously:
Agent A: T016-T019 (US1 - Purchases page)
Agent B: T028-T034 (US5 - Favorites)
Agent C: T035-T037 (US6 - Profile/Settings)

# Meanwhile, if Phase 4 (US2) is also done:
Agent D: T023-T027 (US3 - Reviews)
```

---

## Implementation Strategy

### MVP First (US1 + US2 Only)

1. Complete Phase 1: Setup (schema, migrations, mappers, Zod)
2. Complete Phase 2: Foundational (dashboard layout, sidebar, route protection)
3. Complete Phase 3: US1 — Purchases page
4. Complete Phase 4: US2 — Purchase detail page
5. **STOP and VALIDATE**: Users can view purchases and access full prompt content
6. Deploy/demo MVP

### Incremental Delivery

1. Setup + Foundational → Dashboard shell ready
2. Add US1 (Purchases) → Users can see their purchased prompts
3. Add US2 (Purchase Detail) → Users can view full prompt content
4. Add US3 (Reviews) → Users can rate prompts
5. Add US5 (Favorites) → Users can bookmark prompts
6. Add US6 (Profile/Settings) → Dashboard complete
7. Polish → Integration links, final verification

### Suggested MVP Scope

**US1 + US2** (Phases 1-4): This delivers the core value — users can access and view the prompts they've paid for. Everything else (reviews, favorites, profile, settings) enhances but is not essential for the initial release.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in this phase
- [Story] label maps task to specific user story for traceability
- US4 (Sidebar) is absorbed into Phase 2 (Foundational) since it's required infrastructure
- After EVERY phase checkpoint: run `npm run lint && npm run build`
- Constitution compliance: all mutations via API routes (no server actions), Zod validation on all endpoints, RHF+zodResolver for forms, loading.tsx for every route, Arabic-first RTL

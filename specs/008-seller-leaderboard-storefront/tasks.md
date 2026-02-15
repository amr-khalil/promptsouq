# Tasks: Seller Leaderboard & Public Storefront

**Input**: Design documents from `/specs/008-seller-leaderboard-storefront/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/sellers-api.md

**Tests**: Not requested — test tasks omitted.

**Organization**: Tasks grouped by user story (US1=Leaderboard, US2=Storefront, US3=Seed Data).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Exact file paths included in descriptions

---

## Phase 1: Setup

**Purpose**: No new dependencies needed. Existing project structure is sufficient.

- [X] T001 Verify branch `008-seller-leaderboard-storefront` is checked out and clean

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema migration, Zod schemas, and mappers that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Extend `seller_profiles` Drizzle schema with `displayName`, `avatar`, `bio` columns in `src/db/schema/seller-profiles.ts`. Add `displayName: text("display_name").notNull()`, `avatar: text("avatar").notNull()`, `bio: text("bio")`. Existing columns unchanged.
- [X] T003 Generate and apply Drizzle migration: run `npx drizzle-kit generate` then `npx drizzle-kit migrate`. Verify migration file created in `drizzle/` and columns exist in Supabase.
- [X] T004 [P] Add Zod schemas in `src/lib/schemas/api.ts`: add `sellersQuerySchema` (sortBy: "rating"|"sales" default "rating", limit: coerce number 1-20 default 8) and `sellerProfileSchema` (response shape with userId, displayName, avatar, bio, country, totalSales, totalReviews, avgRating, promptCount, tier, topCategories). Add `sellerId` optional string field to existing `promptsQuerySchema`.
- [X] T005 [P] Add seller mapper functions in `src/lib/mappers.ts`: add `computeSellerTier(totalSales: number): string` returning "برونزي"/"فضي"/"ذهبي" based on thresholds (<100/100-499/500+). Add `mapSellerLeaderboardRow()` and `mapSellerStorefrontRow()` that transform raw aggregation query results into the API response shape per `contracts/sellers-api.md`.

**Checkpoint**: Schema migrated, validation schemas ready, mappers ready. User story implementation can begin.

---

## Phase 3: User Story 1 — Featured Sellers Leaderboard (Priority: P1) MVP

**Goal**: Replace hardcoded `FEATURED_SELLERS` mock array with real ranked sellers from the database, with functional sort tabs.

**Independent Test**: Load homepage → Featured Sellers section shows real sellers from DB ranked by rating (default). Click "الأكثر مبيعاً" tab → sellers re-sort by total sales. Verify tier badges display correctly.

### Implementation for User Story 1

- [X] T006 [US1] Create `src/app/api/sellers/route.ts`: implement `GET /api/sellers` endpoint. Validate query params with `sellersQuerySchema`. Execute aggregation query: join `seller_profiles` with `prompts` (where `status = 'approved'`), GROUP BY seller, compute SUM(sales), SUM(reviews_count), AVG(rating), COUNT(*), and top 3 categories. Sort by `sortBy` param (rating→AVG(rating) DESC, sales→SUM(sales) DESC). Exclude sellers with 0 approved prompts (HAVING COUNT > 0). Apply limit. Map results through `mapSellerLeaderboardRow()`. Return `{ data: [...] }`.
- [X] T007 [US1] Refactor `src/components/FeaturedSellers.tsx`: remove the hardcoded `FEATURED_SELLERS` array and all local mock data. Add state: `sellers`, `loading`, `error`, `activeTab` ("rating"|"sales"). Add `useEffect` that fetches from `/api/sellers?sortBy=${activeTab}&limit=8`. Show skeleton cards while loading. Show error state with retry on failure. Map API response to SellerCard components.
- [X] T008 [US1] Implement functional sort tabs in `src/components/FeaturedSellers.tsx`: make "الأعلى تقييماً" and "الأكثر مبيعاً" buttons toggle `activeTab` state. Re-fetch sellers when tab changes (add `activeTab` to useEffect dependency array). Style active tab with yellow underline, inactive with slate hover.
- [X] T009 [US1] Update SellerCard in `src/components/FeaturedSellers.tsx`: display `seller.tier` in the tier badge (replace hardcoded "ذهبي"). Show `seller.avgRating` and `seller.totalReviews` in the rating display. Show seller's `topCategories` (derived from API) instead of hardcoded categories. Wrap each card in a `<Link href={/seller/${seller.userId}}>` for storefront navigation (FR-007).
- [X] T010 [US1] Run `npm run lint && npm run build` — fix all errors before proceeding.

**Checkpoint**: Homepage Featured Sellers section shows real ranked sellers from DB with functional tab sorting and tier badges. Cards link to `/seller/[sellerId]`.

---

## Phase 4: User Story 2 — Public Seller Storefront (Priority: P2)

**Goal**: Create a public storefront page at `/seller/[sellerId]` showing seller profile, aggregated stats, tier badge, and a grid of their approved prompts.

**Independent Test**: Navigate to `/seller/seed-seller-1` → page shows seller profile (name, avatar, country, bio), stats (total sales, reviews, favorites, avg rating, prompt count), tier badge, and a grid of their prompts. Navigate to `/seller/invalid-id` → 404 page.

### Implementation for User Story 2

- [X] T011 [US2] Create `src/app/api/sellers/[sellerId]/route.ts`: implement `GET /api/sellers/[sellerId]` endpoint. Query `seller_profiles` by userId. If not found, return 404 with `{ error: { code: "NOT_FOUND", message: "لم يتم العثور على البائع" } }`. Aggregate stats from `prompts` (same aggregation as leaderboard but for single seller). Additionally query favorites count: `COUNT(*)` from `favorites` joined through `prompts` where `prompts.seller_id = sellerId`. Include `joinedAt` from `seller_profiles.created_at`. Map through `mapSellerStorefrontRow()`. Return `{ data: {...} }`.
- [X] T012 [US2] Add `sellerId` filter to existing `GET /api/prompts` endpoint in `src/app/api/prompts/route.ts`: after parsing `promptsQuerySchema` (which now has optional `sellerId` field from T004), add condition `eq(prompts.sellerId, sellerId)` to the WHERE clause conditions array when `sellerId` is provided.
- [X] T013 [US2] Create `src/app/seller/[sellerId]/page.tsx`: client component with `"use client"`. Use `useParams()` to get `sellerId`. Fetch in parallel: `/api/sellers/${sellerId}` for profile+stats and `/api/prompts?sellerId=${sellerId}` for prompts. Handle loading (skeleton), error (retry button), and not found (call `notFound()`). Layout: seller profile header (avatar, name, country flag, bio, tier badge), stats grid (6 stat cards: total prompts, total sales, total reviews, total favorites, avg rating, country), and prompts grid using existing `PromptCard` or `GamingPromptCard` component.
- [X] T014 [P] [US2] Create `src/app/seller/[sellerId]/loading.tsx`: skeleton loading state matching the storefront layout. Profile header skeleton (avatar circle, name bar, bio lines), stats grid skeleton (6 cards with icon + number placeholders), prompts grid skeleton (8 prompt card skeletons).
- [X] T015 [US2] Run `npm run lint && npm run build` — fix all errors before proceeding.

**Checkpoint**: Seller storefront page fully functional with profile, stats, tier badge, and prompt grid. 404 works for invalid IDs.

---

## Phase 5: User Story 3 — Seed Data (Priority: P3)

**Goal**: Update seed script to create realistic `seller_profiles` records and link all prompts via `sellerId`.

**Independent Test**: Run `source .env.local && npx tsx src/db/seed.ts` → verify `seller_profiles` has 10 records with display data. Verify all prompts have non-null `sellerId`. Load homepage → leaderboard shows ranked sellers. Navigate to any seller storefront → shows correct data.

### Implementation for User Story 3

- [X] T016 [US3] Update seller personas array in `src/db/seed.ts`: extend each seller object with `id` (e.g. `"seed-seller-1"` through `"seed-seller-10"`), `country` (mix of "SA", "EG", "AE", "JO", "MA", "KW", "QA", "BH", "OM", "TN"), and `bio` (Arabic short bio per seller, 1-2 sentences describing their expertise).
- [X] T017 [US3] Add seller profiles seeding in `src/db/seed.ts`: before inserting prompts, upsert 10 `seller_profiles` records using the extended personas. Set `userId`, `displayName`, `avatar` (DiceBear URL), `bio`, `country`. Use `onConflictDoUpdate` on `userId` PK to make re-runs idempotent. Clear old seed seller profiles at the start (delete where userId starts with "seed-seller-").
- [X] T018 [US3] Update prompt insertion in `src/db/seed.ts`: set `sellerId` on each prompt to the corresponding seller's synthetic ID (`sellers[i % sellers.length].id`). Vary `sales` values deliberately across sellers — some sellers with high sales (300-500), others with low (10-80) — to create non-trivial tier distribution (mix of Bronze, Silver, Gold). Similarly vary `reviewsCount` and `rating` per seller.
- [X] T019 [US3] Run the seed script: execute `source .env.local && npx tsx src/db/seed.ts`. Verify via Supabase MCP `execute_sql`: (1) `SELECT * FROM seller_profiles WHERE user_id LIKE 'seed-seller-%'` returns 10 rows with display data, (2) `SELECT COUNT(*) FROM prompts WHERE seller_id IS NOT NULL` returns 100, (3) leaderboard API returns ranked results.
- [X] T020 [US3] Run `npm run lint && npm run build` — fix all errors before proceeding.

**Checkpoint**: Database populated with 10 seller profiles linked to 100 prompts. Leaderboard and storefront pages display real data.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and security checks.

- [X] T021 Run RLS security check via Supabase MCP `get_advisors(type: "security")` to verify no RLS gaps on `seller_profiles` table after schema extension.
- [X] T022 Verify end-to-end flow: homepage → click seller card → storefront page loads with correct data → click prompt card → prompt detail page loads → seller info section links back to storefront.
- [X] T023 Final `npm run lint && npm run build` — ensure zero errors and warnings.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 Leaderboard (Phase 3)**: Depends on Foundational (Phase 2)
- **US2 Storefront (Phase 4)**: Depends on Foundational (Phase 2). Can run in parallel with US1 but linking from US1 cards to storefront requires both.
- **US3 Seed Data (Phase 5)**: Depends on Foundational (Phase 2) for schema. Should run before US1/US2 manual testing but can be done in parallel with API/UI work.
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2. Independent — needs only API + component.
- **US2 (P2)**: After Phase 2. Independent — needs only API + page. Card links from US1 enhance navigation but US2 works standalone via direct URL.
- **US3 (P3)**: After Phase 2 (schema must exist). Provides data for US1/US2 testing. Can be done first if preferred.

### Recommended Execution Order

1. Phase 2 (Foundational) — T002→T003→T004+T005 (parallel)
2. Phase 5 (Seed Data) — T016→T017→T018→T019→T020 (data first, so US1/US2 have something to display)
3. Phase 3 (Leaderboard) — T006→T007→T008→T009→T010
4. Phase 4 (Storefront) — T011+T012+T014 (parallel)→T013→T015
5. Phase 6 (Polish) — T021→T022→T023

### Parallel Opportunities

Within Phase 2:
- T004 (Zod schemas) and T005 (mappers) can run in parallel — different files

Within Phase 4:
- T011 (seller API), T012 (prompts filter), T014 (loading skeleton) can run in parallel — different files

---

## Parallel Example: Phase 2

```text
# These can run at the same time (different files):
Task T004: "Add Zod schemas in src/lib/schemas/api.ts"
Task T005: "Add seller mapper functions in src/lib/mappers.ts"
```

## Parallel Example: Phase 4

```text
# These can run at the same time (different files):
Task T011: "Create src/app/api/sellers/[sellerId]/route.ts"
Task T012: "Add sellerId filter to src/app/api/prompts/route.ts"
Task T014: "Create src/app/seller/[sellerId]/loading.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (schema + schemas + mappers)
2. Complete Phase 5: Seed Data (need data to display)
3. Complete Phase 3: User Story 1 (leaderboard on homepage)
4. **STOP and VALIDATE**: Homepage shows real ranked sellers with functional tabs
5. Deploy/demo if ready

### Full Delivery

1. Phase 2 → Phase 5 → Phase 3 → Phase 4 → Phase 6
2. Each phase adds value without breaking previous phases

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Run `npm run lint && npm run build` at each checkpoint (T010, T015, T020, T023)
- Seed data (US3) is recommended before UI work so leaderboard/storefront have data to display
- Tier computation is in the mapper (T005), not stored in DB
- All API endpoints are public (no auth required)

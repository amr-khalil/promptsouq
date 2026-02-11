# Tasks: API Layer with Mock Data

**Input**: Design documents from `/specs/001-api-mock-data/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-routes.md

**Tests**: Not requested in the feature specification. No test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify clean baseline before making changes

- [x] T001 Verify clean build baseline by running `npm run lint && npm run build` and confirming zero errors on branch `001-api-mock-data`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create shared schemas, types, error pages, and update PromptCard type import — all of which MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Create Zod schemas and inferred types for all entities and API query params in `src/lib/schemas/api.ts`. Must define: `promptSchema` (all Prompt fields including nested seller object), `categorySchema`, `reviewSchema`, `testimonialSchema`, `promptsQuerySchema` (category, aiModel, priceMin, priceMax, sortBy with default "bestselling", limit), `searchQuerySchema` (q: min 1 char), `relatedQuerySchema` (limit: default 3). Export inferred types: `Prompt`, `Category`, `Review`, `Testimonial`. All Zod validation messages MUST be in Arabic. Also export an `apiErrorResponse` helper function that returns consistent `{ error: { code, message, details? } }` JSON envelope per contracts/api-routes.md.
- [x] T003 [P] Create Arabic 404 not-found page at `src/app/not-found.tsx`. Must display a user-friendly Arabic message ("الصفحة غير موجودة"), a descriptive subtitle, and a link back to the homepage. Use shadcn/ui components and match the site's RTL theme. This is a Server Component (no "use client").
- [x] T004 [P] Create Arabic error boundary at `src/app/error.tsx`. Must be a Client Component ("use client"). Display an Arabic error message ("حدث خطأ غير متوقع"), a retry button that calls `reset()`, and a link to the homepage. Use shadcn/ui Button component.
- [x] T005 Update PromptCard type import in `src/components/PromptCard.tsx`. Change `import type { Prompt } from "@/data/mockData"` to `import type { Prompt } from "@/lib/schemas/api"`. Verify the component compiles correctly with the new type. Run `npm run lint && npm run build`.

**Checkpoint**: Foundation ready — Zod schemas defined, error/404 pages created, PromptCard type migrated. User story implementation can now begin.

---

## Phase 3: User Story 1 — Browse and Discover Prompts (Priority: P1)

**Goal**: Homepage and marketplace page fetch all data from API endpoints instead of importing from mockData.ts. Server-side filtering and sorting works via query parameters.

**Independent Test**: Load homepage — verify categories grid, 6 trending prompts, and testimonials display. Load marketplace — verify all prompts listed, category/model/price filters work, and all 5 sort options produce correct order.

### API Routes for User Story 1

- [x] T006 [P] [US1] Implement GET `/api/categories` route handler in `src/app/api/categories/route.ts`. Import `categories` array from `@/data/mockData`. Return `{ data: categories }` with 200 status. No query params needed. Wrap in try/catch returning 500 error envelope on failure.
- [x] T007 [P] [US1] Implement GET `/api/testimonials` route handler in `src/app/api/testimonials/route.ts`. Import `testimonials` array from `@/data/mockData`. Return `{ data: testimonials }` with 200 status. No query params needed. Wrap in try/catch returning 500 error envelope on failure.
- [x] T008 [US1] Implement GET `/api/prompts` route handler in `src/app/api/prompts/route.ts`. Import `prompts` array from `@/data/mockData` and `promptsQuerySchema` from `@/lib/schemas/api`. Parse and validate query params from `request.nextUrl.searchParams` using `promptsQuerySchema.safeParse()`. On validation failure return 400 with structured Zod error via `.flatten()`. Implement filtering: (1) if `category` provided, split on commas, keep prompts where `prompt.category` is in list, (2) if `aiModel` provided, split on commas, keep prompts where `prompt.aiModel` is in list, (3) if `priceMin` provided, keep `prompt.price >= priceMin`, (4) if `priceMax` provided, keep `prompt.price <= priceMax`. Implement sorting: bestselling → sort by sales desc, newest → original order, rating → sort by rating desc, price-low → sort by price asc, price-high → sort by price desc. If `limit` provided, slice results. Return `{ data: filteredSortedPrompts }`.

### Page Migrations for User Story 1

- [x] T009 [US1] Migrate home page (`src/app/page.tsx`) to fetch data from API. Remove all imports from `@/data/mockData`. Add state variables (`useState`) for categories, trendingPrompts, testimonials, loading, and error. Add `useEffect` that fetches from 3 endpoints in parallel: `GET /api/categories`, `GET /api/prompts?sortBy=bestselling&limit=6`, `GET /api/testimonials`. Parse JSON responses and extract `.data` field. Show loading indicator while fetching. Show Arabic error message on failure. Keep all existing JSX rendering logic unchanged — only the data source changes.
- [x] T010 [US1] Migrate marketplace page (`src/app/market/page.tsx`) to fetch data from API. Remove all imports from `@/data/mockData`. Keep all existing `useState` for filters (selectedCategories, selectedModels, priceRange, sortBy). Remove client-side filtering/sorting logic. Add `useEffect` that fetches from `GET /api/categories` (once on mount) and `GET /api/prompts` with current filter/sort params (re-fetch when any filter changes). Build query string from current filter state: `?category=${selectedCategories.join(",")}&aiModel=${selectedModels.join(",")}&priceMin=${priceRange[0]}&priceMax=${priceRange[1]}&sortBy=${sortBy}`. Omit empty params. Parse JSON `.data` field. Add loading and error states. Keep all existing UI rendering (sidebar filters, prompt grid, sort dropdown) unchanged.

### Loading States for User Story 1

- [x] T011 [P] [US1] Create home page skeleton in `src/app/loading.tsx`. Use shadcn `Skeleton` component. Layout should match home page structure: category grid row (8 skeleton cards), trending prompts section (6 skeleton PromptCard shapes), testimonials section (3 skeleton cards). Wrap in RTL-aware container matching the home page layout.
- [x] T012 [P] [US1] Create marketplace skeleton in `src/app/market/loading.tsx`. Use shadcn `Skeleton` component. Layout should match market page structure: sidebar filter panel (skeleton rectangles for category list, model checkboxes, price slider) and main content area (grid of 8 skeleton PromptCard shapes with sort dropdown skeleton).

### Verification for User Story 1

- [x] T013 [US1] Run `npm run lint && npm run build` and fix all errors. Verify homepage renders categories, 6 trending prompts, and testimonials from API. Verify marketplace filtering by category, AI model, and price range returns correct results. Verify all 5 sort options work correctly.

**Checkpoint**: User Story 1 complete. Homepage and marketplace fully functional with API-sourced data.

---

## Phase 4: User Story 2 — View Prompt Details (Priority: P2)

**Goal**: Prompt detail page fetches prompt data, reviews, and related prompts from dedicated API endpoints. Invalid IDs trigger the 404 page.

**Independent Test**: Navigate to `/prompt/1` — verify full prompt info, reviews, and 3 related prompts display. Navigate to `/prompt/999` — verify Arabic 404 page appears.

### API Routes for User Story 2

- [x] T014 [P] [US2] Implement GET `/api/prompts/[id]` route handler in `src/app/api/prompts/[id]/route.ts`. Import `prompts` from `@/data/mockData`. Extract `id` from route params. Find prompt where `prompt.id === id`. If not found, return 404 with `{ error: { code: "NOT_FOUND", message: "البرومبت غير موجود" } }`. If found, return `{ data: prompt }` with 200 status.
- [x] T015 [P] [US2] Implement GET `/api/prompts/[id]/reviews` route handler in `src/app/api/prompts/[id]/reviews/route.ts`. Import `prompts` and `reviews` from `@/data/mockData`. Extract `id` from route params. Verify prompt exists (find by id); if not, return 404. If valid, return `{ data: reviews }` (all reviews returned for any valid prompt in mock phase).
- [x] T016 [P] [US2] Implement GET `/api/prompts/[id]/related` route handler in `src/app/api/prompts/[id]/related/route.ts`. Import `prompts` from `@/data/mockData` and `relatedQuerySchema` from `@/lib/schemas/api`. Extract `id` from route params. Find current prompt; if not found, return 404. Parse `limit` query param via `relatedQuerySchema`. Filter prompts where `prompt.category === currentPrompt.category && prompt.id !== id`. Slice to `limit` (default 3). Return `{ data: relatedPrompts }`.

### Page Migration for User Story 2

- [x] T017 [US2] Migrate prompt detail page (`src/app/prompt/[id]/page.tsx`) to fetch data from API. Remove all imports from `@/data/mockData`. Import `Prompt` and `Review` types from `@/lib/schemas/api`. Add state for prompt, reviews, relatedPrompts, loading, error, and notFound. In `useEffect`, fetch 3 endpoints in parallel: `GET /api/prompts/${id}`, `GET /api/prompts/${id}/reviews`, `GET /api/prompts/${id}/related`. If prompt endpoint returns 404, call `notFound()` from `next/navigation` to trigger the 404 page. Parse JSON `.data` fields. Add loading indicator while fetching. Keep all existing rendering logic (prompt info, samples, tags, seller card, reviews list, related prompts grid) unchanged.

### Loading State for User Story 2

- [x] T018 [P] [US2] Create prompt detail skeleton in `src/app/prompt/[id]/loading.tsx`. Use shadcn `Skeleton` component. Layout: large image skeleton, title bar, rating/reviews row, price section, seller card skeleton, description block, tags row, samples section, reviews list (3 skeleton items), related prompts grid (3 skeleton cards).

### Verification for User Story 2

- [x] T019 [US2] Run `npm run lint && npm run build` and fix all errors. Verify `/prompt/1` shows full prompt details, reviews, and related prompts. Verify `/prompt/999` shows Arabic 404 page. Confirm previous US1 pages still work correctly.

**Checkpoint**: User Story 2 complete. Prompt detail page fully functional with 404 handling.

---

## Phase 5: User Story 3 — Search for Prompts (Priority: P3)

**Goal**: Search page fetches results from API search endpoint. Server-side case-insensitive matching across titles (AR/EN), descriptions, and tags.

**Independent Test**: Navigate to `/search?q=تسويق` — verify matching prompts appear. Search for a nonsense term — verify Arabic "no results" message. Submit empty search — verify no request made.

### API Route for User Story 3

- [x] T020 [US3] Implement GET `/api/prompts/search` route handler in `src/app/api/prompts/search/route.ts`. Import `prompts` from `@/data/mockData` and `searchQuerySchema` from `@/lib/schemas/api`. Parse `q` from query params via `searchQuerySchema.safeParse()`. On validation failure return 400 with Arabic error. Implement case-insensitive substring matching: a prompt matches if `q.toLowerCase()` appears in any of `prompt.title.toLowerCase()`, `prompt.titleEn.toLowerCase()`, `prompt.description.toLowerCase()`, or any element of `prompt.tags` (lowercased). Return `{ data: matchingPrompts }`.

### Page Migration for User Story 3

- [x] T021 [US3] Migrate search page (`src/app/search/page.tsx`) to fetch data from API. Remove all imports from `@/data/mockData`. Import `Prompt` type from `@/lib/schemas/api`. Remove client-side filtering logic. Add state for results, loading, error. In `useEffect` (triggered when `queryParam` changes and is non-empty), fetch `GET /api/prompts/search?q=${encodeURIComponent(queryParam)}`. Parse JSON `.data` field. If `queryParam` is empty, skip fetch and show empty state. Show loading indicator during fetch. Show Arabic "لا توجد نتائج" message when results array is empty. Keep all existing rendering unchanged.

### Loading State for User Story 3

- [x] T022 [P] [US3] Create search page skeleton in `src/app/search/loading.tsx`. Use shadcn `Skeleton` component. Layout: search bar skeleton, results count text skeleton, grid of 4 skeleton PromptCard shapes.

### Verification for User Story 3

- [x] T023 [US3] Run `npm run lint && npm run build` and fix all errors. Verify search for "تسويق" returns matching prompts. Verify search for "xyznonexistent" shows Arabic no-results message. Verify empty search preserves current view. Confirm US1 and US2 pages still work.

**Checkpoint**: User Story 3 complete. Search fully functional with server-side matching.

---

## Phase 6: User Story 4 — Cart, Checkout, Profile, and Seller Pages (Priority: P4)

**Goal**: Remaining 4 pages fetch prompt/category data from API instead of importing mockData. Cart items, checkout summary, profile purchases/saved, and seller listings all source data from endpoints.

**Independent Test**: Visit `/cart` — verify 3 items with prices. Visit `/checkout` — verify order summary totals. Visit `/profile` — verify purchases and saved prompts. Visit `/seller` — verify listings and category dropdown.

### Page Migrations for User Story 4

- [x] T024 [P] [US4] Migrate cart page (`src/app/cart/page.tsx`) to fetch data from API. Remove imports from `@/data/mockData`. Import `Prompt` type from `@/lib/schemas/api`. Add state for prompts, loading, error. Fetch `GET /api/prompts?sortBy=bestselling&limit=3` on mount. Initialize `cartItems` state from fetched data instead of `prompts.slice(0, 3)`. Keep all existing cart logic (remove item, price calculations with 5% tax) and rendering unchanged.
- [x] T025 [P] [US4] Migrate checkout page (`src/app/checkout/page.tsx`) to fetch data from API. Remove imports from `@/data/mockData`. Import `Prompt` type from `@/lib/schemas/api`. Add state for cartItems, loading, error. Fetch `GET /api/prompts?sortBy=bestselling&limit=3` on mount. Set `cartItems` from response instead of `prompts.slice(0, 3)`. Keep all existing checkout logic (form data, payment method, tax calculation, submit handler) and rendering unchanged.
- [x] T026 [P] [US4] Migrate profile page (`src/app/profile/page.tsx`) to fetch data from API. Remove imports from `@/data/mockData`. Import `Prompt` type from `@/lib/schemas/api`. Add state for allPrompts, loading, error. Fetch `GET /api/prompts` on mount. Derive `userPurchases = allPrompts.slice(0, 4)` and `savedPrompts = allPrompts.slice(4, 7)` from response data. Keep all existing profile UI (tabs, purchase history, saved items, wallet) unchanged.
- [x] T027 [P] [US4] Migrate seller page (`src/app/seller/page.tsx`) to fetch data from API. Remove imports from `@/data/mockData`. Import `Prompt` and `Category` types from `@/lib/schemas/api`. Add state for prompts, categories, loading, error. Fetch `GET /api/prompts?sortBy=bestselling&limit=3` and `GET /api/categories` in parallel on mount. Derive `myListings` from prompts response. Populate category dropdown from categories response instead of static import. Keep all existing seller UI (tabs, stats, form, earnings) unchanged.

### Loading States for User Story 4

- [x] T028 [P] [US4] Create loading skeletons for cart, checkout, profile, and seller pages. Create 4 files: `src/app/cart/loading.tsx` (3 item skeletons + price summary), `src/app/checkout/loading.tsx` (form skeleton + order summary), `src/app/profile/loading.tsx` (profile header + tab content skeletons), `src/app/seller/loading.tsx` (stats row + listings grid skeletons). All use shadcn `Skeleton` component and match respective page layouts.

### Verification for User Story 4

- [x] T029 [US4] Run `npm run lint && npm run build` and fix all errors. Verify cart shows 3 items with correct prices and tax. Verify checkout shows order summary. Verify profile shows purchases and saved prompts. Verify seller shows listings and categories in dropdown. Confirm all previous US1–US3 pages still work.

**Checkpoint**: User Story 4 complete. All 8 pages migrated to API data sourcing.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final verification that all success criteria are met and no mock data imports remain

- [x] T030 Verify SC-001: Run `grep -r "from.*mockData" src/app/ src/components/` and confirm zero matches. If any page or component still imports data (not just types) from `@/data/mockData`, fix the import. The only file that should import from mockData is API route handlers in `src/app/api/`. Update `src/components/PromptCard.tsx` if it still has a data import (type import from `@/lib/schemas/api` is correct).
- [x] T031 Run final `npm run lint && npm run build` to confirm SC-006. Run quickstart.md validation steps: curl all 7 API endpoints, test error cases (invalid ID → 404, invalid params → 400), visit all 8 pages in browser and confirm identical rendering to pre-migration (SC-002). Verify filter/sort under 1 second (SC-003) and search results instant (SC-004).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all user stories
- **Phase 3 (US1 P1)**: Depends on Phase 2 completion
- **Phase 4 (US2 P2)**: Depends on Phase 2 completion; independent of US1 (uses its own endpoints)
- **Phase 5 (US3 P3)**: Depends on Phase 2 completion; independent of US1/US2
- **Phase 6 (US4 P4)**: Depends on Phase 3 (US1) because it reuses `GET /api/prompts` and `GET /api/categories` endpoints created in US1
- **Phase 7 (Polish)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: After Phase 2. Creates the core prompts, categories, and testimonials endpoints used by other stories.
- **US2 (P2)**: After Phase 2. Creates its own endpoints (`/api/prompts/[id]`, `/reviews`, `/related`). Independently testable.
- **US3 (P3)**: After Phase 2. Creates its own endpoint (`/api/prompts/search`). Independently testable.
- **US4 (P4)**: After Phase 3 (US1). Reuses `GET /api/prompts` and `GET /api/categories`. No new endpoints.

### Within Each User Story

1. API routes before page migrations (pages need endpoints to call)
2. Page migrations can run in parallel if they hit different endpoints
3. Loading skeletons can run in parallel with anything (separate files, no dependencies)
4. Verification is always the last task in each phase

### Parallel Opportunities

- Phase 2: T003 and T004 can run in parallel (different files)
- US1: T006 and T007 can run in parallel; T011 and T012 can run in parallel
- US2: T014, T015, T016 can all run in parallel (3 independent route files)
- US4: T024, T025, T026, T027 can all run in parallel (4 independent page files)

---

## Parallel Examples

### Phase 2 — Foundational

```text
# After T002 (Zod schemas) is complete, launch in parallel:
Task: T003 "Create Arabic 404 not-found page in src/app/not-found.tsx"
Task: T004 "Create Arabic error boundary in src/app/error.tsx"
Task: T005 "Update PromptCard type import in src/components/PromptCard.tsx"
```

### User Story 1 — API Routes

```text
# Launch simple route handlers in parallel:
Task: T006 "GET /api/categories in src/app/api/categories/route.ts"
Task: T007 "GET /api/testimonials in src/app/api/testimonials/route.ts"
# T008 (prompts route with filtering) can also run in parallel since different file
```

### User Story 2 — API Routes

```text
# Launch all 3 prompt sub-routes in parallel:
Task: T014 "GET /api/prompts/[id] in src/app/api/prompts/[id]/route.ts"
Task: T015 "GET /api/prompts/[id]/reviews in src/app/api/prompts/[id]/reviews/route.ts"
Task: T016 "GET /api/prompts/[id]/related in src/app/api/prompts/[id]/related/route.ts"
```

### User Story 4 — Page Migrations

```text
# Launch all 4 page migrations in parallel:
Task: T024 "Migrate cart page in src/app/cart/page.tsx"
Task: T025 "Migrate checkout page in src/app/checkout/page.tsx"
Task: T026 "Migrate profile page in src/app/profile/page.tsx"
Task: T027 "Migrate seller page in src/app/seller/page.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002–T005)
3. Complete Phase 3: User Story 1 (T006–T013)
4. **STOP and VALIDATE**: Homepage and marketplace work with API data
5. Deploy/demo if ready — core browsing experience is live

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 → Homepage + Marketplace live (MVP!)
3. Add US2 → Prompt detail pages work with 404 handling
4. Add US3 → Search works with server-side matching
5. Add US4 → All remaining pages migrated → Feature complete
6. Polish → Final verification of all success criteria

### Recommended Sequential Execution (Single Developer)

Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (US4) → Phase 7

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable at its checkpoint
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `npm run lint && npm run build` MUST pass at every verification task before proceeding
- Total: 31 tasks across 7 phases

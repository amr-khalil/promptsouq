# Tasks: Supabase Database Migration

**Input**: Design documents from `/specs/002-supabase-db-migration/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested for this feature. Playwright E2E deferred per constitution check.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure Drizzle ORM, initialize database client

- [x] T001 Install Drizzle ORM dependencies: `npm install drizzle-orm postgres` and `npm install -D drizzle-kit dotenv` per research R-001
- [x] T002 [P] Create Drizzle configuration file at `drizzle.config.ts` — set schema path to `./src/db/schema`, output to `./drizzle`, dialect `postgresql`, dbCredentials from `DATABASE_URL` env var per research R-010
- [x] T003 [P] Create Drizzle client initialization at `src/db/index.ts` — import `drizzle` from `drizzle-orm/postgres-js`, `postgres` from `postgres`, connect with `prepare: false` for Supabase transaction mode pooler, export `db` instance with schema per research R-001

---

## Phase 2: Foundational (Schema, Migrations & Seed)

**Purpose**: Define all database tables, generate migrations, seed data. MUST be complete before any API route work.

**CRITICAL**: No user story work can begin until this phase is complete.

### Schema Definitions

- [x] T004 [P] Create categories table schema at `src/db/schema/categories.ts` — define `pgTable('categories')` with columns: id (serial PK), slug (text, unique, notNull), name (text, notNull), nameEn (text, notNull), icon (text, notNull), count (integer, notNull, default 0), createdAt (timestamp, defaultNow), updatedAt (timestamp, defaultNow) per data-model.md
- [x] T005 [P] Create prompts table schema at `src/db/schema/prompts.ts` — define `pgTable('prompts')` with columns: id (serial PK), title (text, notNull), titleEn (text, notNull), description (text, notNull), descriptionEn (text, notNull), price (real, notNull), category (text, notNull, references categories.slug), aiModel (text, notNull), rating (real, notNull, default 0), reviewsCount (integer, notNull, default 0), sales (integer, notNull, default 0), thumbnail (text, notNull), sellerName (text, notNull), sellerAvatar (text, notNull), sellerRating (real, notNull, default 0), tags (text array, notNull, default []), difficulty (text, notNull), samples (text array, notNull, default []), fullContent (text, nullable), createdAt (timestamp, defaultNow), updatedAt (timestamp, defaultNow) per data-model.md
- [x] T006 [P] Create reviews table schema at `src/db/schema/reviews.ts` — define `pgTable('reviews')` with columns: id (serial PK), promptId (integer, notNull, references prompts.id), userName (text, notNull), userAvatar (text, notNull), rating (integer, notNull), date (text, notNull), comment (text, notNull), createdAt (timestamp, defaultNow) per data-model.md
- [x] T007 [P] Create testimonials table schema at `src/db/schema/testimonials.ts` — define `pgTable('testimonials')` with columns: id (serial PK), name (text, notNull), role (text, notNull), content (text, notNull), avatar (text, notNull), rating (integer, notNull), createdAt (timestamp, defaultNow) per data-model.md
- [x] T008 Create barrel export at `src/db/schema/index.ts` — re-export all tables from categories.ts, prompts.ts, reviews.ts, testimonials.ts per constitution IV

### Migrations

- [x] T009 Generate and apply Drizzle migrations — run `npx drizzle-kit generate` then `npx drizzle-kit migrate` to create tables in Supabase. Verify migration files appear in `drizzle/` directory and tables exist in database

### Seed Data

- [x] T010 [US4] Create seed script at `src/db/seed.ts` — import `db` client and all schema tables, truncate all tables (reviews first for FK), insert all 8 categories from mockData (mapping mock `id` to `slug`), all 8 prompts (mapping mock `reviews` field to `reviewsCount`, flattening seller to `sellerName`/`sellerAvatar`/`sellerRating`), all 3 reviews (all assigned `promptId: 1` per research R-009), all 3 testimonials. Script must be idempotent (truncate before insert) and runnable via `npx tsx src/db/seed.ts` per research R-008
- [x] T011 [US4] Run seed script (`npx tsx src/db/seed.ts`) and verify data — confirm 8 categories, 8 prompts, 3 reviews, 3 testimonials exist in database with correct field values matching mockData.ts per spec US4

### Schema Updates

- [x] T012 Update Zod review schema in `src/lib/schemas/api.ts` — add optional `promptId` field to `reviewSchema` (z.string().optional()) so the API contract can optionally include the prompt association per research R-011

**Checkpoint**: Database schema created, migrated, seeded. All 4 tables populated with mock data. Ready for API route migration.

---

## Phase 3: User Story 1 + 4 — Browse and View Prompts from Persistent Storage (Priority: P1)

**Goal**: All browsing, filtering, sorting, and detail view endpoints serve data from Supabase instead of mock arrays. Seed data matches current experience exactly.

**Independent Test**: Navigate to homepage, marketplace (with filters), prompt detail pages, and verify all data renders correctly from database. Restart dev server and confirm data persists.

### Shared Helpers

- [x] T013 [US1] Create DB-to-API response mapper utility at `src/lib/mappers.ts` — export `mapPromptRow(row)` that transforms a Drizzle prompt select result to the API response shape: `id.toString()`, reconstruct nested `seller: { name, avatar, rating }` from flat `sellerName`/`sellerAvatar`/`sellerRating`, rename `reviewsCount` → `reviews`, `titleEn` → `titleEn`, `descriptionEn` → `descriptionEn`, `aiModel` → `aiModel`, `fullContent` → `fullContent`. Also export `mapCategoryRow(row)` (return `slug` as `id`, rename `nameEn`), `mapReviewRow(row)` (id.toString(), rename `userName`, `userAvatar`), `mapTestimonialRow(row)` (id.toString()). Follow data-model.md API Response Mapping table.

### API Route Rewrites

- [x] T014 [P] [US1] Rewrite GET /api/categories in `src/app/api/categories/route.ts` — replace mockData import with Drizzle query: `db.select().from(categories)`, map results using `mapCategoryRow`, return `{ data: mapped }`. Keep existing try/catch with `apiErrorResponse` for 500 errors per contracts
- [x] T015 [P] [US1] Rewrite GET /api/testimonials in `src/app/api/testimonials/route.ts` — replace mockData import with Drizzle query: `db.select().from(testimonials)`, map results using `mapTestimonialRow`, return `{ data: mapped }`. Keep existing error handling per contracts
- [x] T016 [US1] Rewrite GET /api/prompts in `src/app/api/prompts/route.ts` — replace mockData import with Drizzle query. Build dynamic query with: category filter using `inArray(prompts.category, cats)`, aiModel filter using `inArray(prompts.aiModel, models)`, price range using `gte`/`lte` on `prompts.price`, sorting using `orderBy` (bestselling → `desc(prompts.sales)`, newest → `desc(prompts.createdAt)`, rating → `desc(prompts.rating)`, price-low → `asc(prompts.price)`, price-high → `desc(prompts.price)`), limit using `.limit()`. Map results using `mapPromptRow`. Keep existing Zod validation with `promptsQuerySchema` per contracts
- [x] T017 [US1] Rewrite GET /api/prompts/[id] in `src/app/api/prompts/[id]/route.ts` — replace mockData import with Drizzle query: `db.select().from(prompts).where(eq(prompts.id, parseInt(id)))` then `.limit(1)`. Map result using `mapPromptRow`. Return 404 if no result. Keep existing error handling per contracts
- [x] T018 [US1] Rewrite GET /api/prompts/[id]/reviews in `src/app/api/prompts/[id]/reviews/route.ts` — replace mockData imports with Drizzle queries: first verify prompt exists (same as T017), then `db.select().from(reviews).where(eq(reviews.promptId, parseInt(id)))`. Map results using `mapReviewRow`. This fixes the bug where all reviews were returned regardless of prompt ID (FR-013) per contracts
- [x] T019 [US1] Rewrite GET /api/prompts/[id]/related in `src/app/api/prompts/[id]/related/route.ts` — replace mockData import with Drizzle queries: first find prompt to get its category, then `db.select().from(prompts).where(and(eq(prompts.category, currentPrompt.category), ne(prompts.id, parseInt(id)))).limit(limit)`. Map results using `mapPromptRow`. Keep existing `relatedQuerySchema` validation per contracts
- [x] T020 [US1] Run `npm run lint && npm run build` — fix all TypeScript, ESLint errors. Verify no remaining imports from `@/data/mockData` in any modified files

**Checkpoint**: All browsing endpoints serve data from Supabase. Homepage, marketplace with filters, prompt detail with reviews and related prompts all work. Data persists across server restarts (SC-001, SC-002, SC-003).

---

## Phase 4: User Story 2 — Search Prompts from Database (Priority: P2)

**Goal**: Search endpoint performs database-level text search using ILIKE instead of in-memory filtering.

**Independent Test**: Enter search terms in the search bar (Arabic and English) and verify matching results are returned from the database.

### Implementation

- [x] T021 [US2] Rewrite GET /api/prompts/search in `src/app/api/prompts/search/route.ts` — replace mockData import with Drizzle query using `or()` with `ilike()` on title, titleEn, description, descriptionEn columns, plus `ilike(sql\`array_to_string(${prompts.tags}, ' ')\`, pattern)` for tag search. Use `%${q}%` pattern for substring matching per research R-006. Map results using `mapPromptRow`. Keep existing `searchQuerySchema` validation per contracts
- [x] T022 [US2] Run `npm run lint && npm run build` — verify search route compiles and works with Arabic query "تسويق" and English query "marketing"

**Checkpoint**: Search works against database with both Arabic and English queries (FR-008).

---

## Phase 5: User Story 3 — Data Integrity and Security (Priority: P3)

**Goal**: Enable RLS on all tables, allow public read, deny anonymous writes, allow admin write on prompts.

**Independent Test**: Verify anonymous queries return data, anonymous INSERT/DELETE attempts are denied, and admin write policies exist on prompts table.

### Implementation

- [x] T023 [US3] Enable RLS and add policies on all 4 tables via Supabase MCP `apply_migration` — for each table (categories, prompts, reviews, testimonials): `ALTER TABLE <table> ENABLE ROW LEVEL SECURITY;` then `CREATE POLICY "allow_public_read_<table>" ON <table> FOR SELECT TO anon USING (true);`. Additionally, on prompts table only, add admin write policies: `CREATE POLICY "allow_admin_insert_prompts" ON prompts FOR INSERT TO authenticated WITH CHECK ((auth.jwt() -> 'publicMetadata' ->> 'role') = 'admin');` and equivalent UPDATE (USING + WITH CHECK) and DELETE (USING) policies per data-model.md RLS Policies section
- [x] T024 [US3] Run Supabase security advisors via `get_advisors(type: "security")` on project `dyaflmsawxpqgmyojtbc` — verify no RLS gaps reported per constitution IV
- [x] T025 [US3] Verify RLS enforcement — use Supabase MCP `execute_sql` to confirm: (1) SELECT works for anon role (`SELECT count(*) FROM prompts;` should return 8), (2) INSERT is denied for anon role, (3) admin write policies exist on prompts table for authenticated role per spec SC-005

**Checkpoint**: All tables have RLS enabled with public read, denied anonymous writes, and admin write access on prompts (SC-005, FR-009, FR-014).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Remove mock data, final verification, ensure clean codebase

- [x] T026 Delete `src/data/mockData.ts` and remove `src/data/` directory — verify no remaining imports from `@/data/mockData` exist anywhere in the codebase (grep for "mockData" and "@/data") per spec FR-011
- [x] T027 Final verification: run `npm run lint && npm run build` — must pass with zero errors (SC-006). Verify no TypeScript errors, no unused imports, no broken references
- [x] T028 Manual page verification — start dev server, navigate to: homepage (trending prompts, categories, testimonials), marketplace with filters (category, aiModel, price, sort), prompt detail page with reviews and related, search page with Arabic and English queries. Confirm all pages render correctly with database-sourced data matching the original mock data experience (SC-001, SC-002, SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001 must complete before T004-T008; T002-T003 parallel with T004-T007). BLOCKS all user stories
- **US1+US4 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **US2 (Phase 4)**: Depends on Foundational (Phase 2). Can run in parallel with US1 since it touches a different API route file
- **US3 (Phase 5)**: Depends on Foundational (Phase 2) — specifically T009 (migrations applied). Can run in parallel with US1/US2
- **Polish (Phase 6)**: Depends on ALL user stories (Phases 3-5) being complete

### User Story Dependencies

- **US1+US4 (P1)**: Depends on Phase 2 — no dependencies on other stories
- **US2 (P2)**: Depends on Phase 2 and T013 mapper (from US1). Must run after T013 completes — NOT fully parallel with US1
- **US3 (P3)**: Depends on Phase 2 (tables must exist) — independent of US1/US2 (RLS is DB-level, not app-level)

### Within Each User Story

- Mapper (T013) before API routes (T014-T019)
- Simple routes (categories, testimonials) before complex routes (prompts with filters)
- All routes complete before lint/build verification

### Parallel Opportunities

**Phase 1** (after T001):
- T002 and T003 can run in parallel (different files)

**Phase 2** (after T001):
- T004, T005, T006, T007 can ALL run in parallel (4 separate schema files)

**Phase 3** (after T013):
- T014 and T015 can run in parallel (categories + testimonials — different files)

**Phase 4 + Phase 5** can run in parallel with late Phase 3 tasks (different files and concerns)

---

## Parallel Example: Foundational Schema Creation

```bash
# After T001 (npm install), launch all 4 schema files in parallel:
Task: "Create categories schema in src/db/schema/categories.ts"     # T004
Task: "Create prompts schema in src/db/schema/prompts.ts"            # T005
Task: "Create reviews schema in src/db/schema/reviews.ts"            # T006
Task: "Create testimonials schema in src/db/schema/testimonials.ts"  # T007
```

## Parallel Example: Simple API Route Rewrites

```bash
# After T013 (mapper), launch simple routes in parallel:
Task: "Rewrite GET /api/categories in src/app/api/categories/route.ts"     # T014
Task: "Rewrite GET /api/testimonials in src/app/api/testimonials/route.ts" # T015
```

---

## Implementation Strategy

### MVP First (Phase 1 + 2 + 3)

1. Complete Phase 1: Setup (install deps, config, client)
2. Complete Phase 2: Foundational (schemas, migrations, seed)
3. Complete Phase 3: US1+US4 (all browsing endpoints)
4. **STOP and VALIDATE**: All pages work with database data, data persists
5. This covers the core value — persistent marketplace

### Incremental Delivery

1. Setup + Foundational → Database ready with seeded data
2. Add US1+US4 → All browsing works from DB → **MVP!**
3. Add US2 → Search works from DB → Enhanced discovery
4. Add US3 → RLS enabled → Security foundation
5. Polish → Remove mock data → Clean codebase

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- After EVERY task per constitution: run `npm run lint && npm run build` and fix errors before proceeding
- The mapper utility (T013) is a lightweight DRY helper — not an abstraction layer
- All Drizzle column names use camelCase in TypeScript but map to snake_case in PostgreSQL (Drizzle convention)
- `reviews_count` in DB maps to `reviews` in API response (avoid collision with reviews table name)
- Categories return `slug` as `id` in API (not the serial PK) for backward compat
- Review route (T018) fixes existing bug: now filters by prompt_id instead of returning all reviews

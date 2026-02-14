# Tasks: Market Search, Seed Data & Enhanced Filters

**Input**: Design documents from `/specs/007-market-search-seed/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks grouped by user story. US1 and US2 (both P1) can run in parallel after Setup. US3 depends on US1+US2. US4 depends on US3.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Zod validation schemas needed by both the suggestions endpoint (US2) and enhanced prompts API (US4).

- [X] T001 Add `suggestionsQuerySchema` and update `promptsQuerySchema` with search, filter, sort, and pagination params in `src/lib/schemas/api.ts`

**Details for T001**:
- `suggestionsQuerySchema`: `q` (string, min 2, max 100), `limit` (coerce number, 1-10, default 6)
- `promptsQuerySchema`: add `search` (string, max 200, optional), `category` (string, optional), `aiModel` (string, optional), `generationType` (enum: text/image/code/marketing/design, optional), `priceMin` (coerce number, optional), `priceMax` (coerce number, optional), `sortBy` (enum: trending/popular/newest/price-low/price-high/relevant/rating/bestselling, optional), `limit` (coerce number, 1-100, default 20), `offset` (coerce number, min 0, default 0)

---

## Phase 2: User Story 1 — Database Seeding with 100 Realistic Prompts (Priority: P1)

**Goal**: Populate the marketplace with 100 diverse, realistic Arabic AI prompts across all categories, models, sellers, and price points.

**Independent Test**: Run `source .env.local && npx tsx src/db/seed.ts`, visit `/market`, verify 100 prompts with thumbnails, prices, sellers, ratings, and category distribution.

### Implementation for User Story 1

- [X] T002 [US1] Rewrite seed script with 10 seller personas, 100 prompts across all categories/models/types in `src/db/seed.ts`

**Details for T002**:
- 10 seller personas: Arabic names, `ui-avatars.com` avatars, ratings 3.5-5.0
- 100 prompts: Arabic titles/descriptions, `picsum.photos/seed/{index}/400/300` thumbnails
- Distribution: all 7 AI models (chatgpt, claude, midjourney, dall-e, stable-diffusion, gemini, copilot), all 5 generation types (text, image, code, marketing, design), all existing category slugs
- Prices: $1.99-$29.99 range, ratings: 3.0-5.0, sales: 0-500, varied `createdAt` over 30 days
- Each prompt: `status: "approved"`, tags array, samples, fullContent, instructions, exampleOutputs (4), examplePrompts (jsonb, 4 sets)
- Script must be idempotent: clear existing seed data before inserting (delete all prompts where sellerId is null, matching seed pattern)
- ~10 prompts per seller

**Checkpoint**: Marketplace should display 100 seeded prompts with images, prices, and seller info.

---

## Phase 3: User Story 2 — Search with Autocomplete Suggestions (Priority: P1)

**Goal**: Users type a keyword and see a dropdown of up to 6 matching prompt suggestions in real-time, with navigation to prompt detail or filtered marketplace.

**Independent Test**: Type "شعار" in the search bar on Hero or marketplace, verify dropdown shows matching prompts within 1 second, click a suggestion to navigate to `/prompt/[id]`.

> **Note**: US2 can run in parallel with US1 (different files). However, testing suggestions requires seeded data.

### Implementation for User Story 2

- [X] T003 [P] [US2] Create suggestions API endpoint in `src/app/api/suggestions/route.ts`
- [X] T004 [P] [US2] Create reusable SearchInput component with debounced autocomplete dropdown in `src/components/SearchInput.tsx`
- [X] T005 [US2] Integrate SearchInput into Hero component in `src/components/Hero.tsx`

**Details for T003**:
- GET handler: parse `q` and `limit` via `suggestionsQuerySchema`
- Query: `SELECT id, title, ai_model FROM prompts WHERE status = 'approved' AND (title ILIKE '%q%' OR title_en ILIKE '%q%' OR array_to_string(tags, ' ') ILIKE '%q%') ORDER BY CASE WHEN title ILIKE '%q%' THEN 0 WHEN title_en ILIKE '%q%' THEN 1 ELSE 2 END LIMIT limit`
- Return `{ data: [{ id, title, aiModel }] }`
- 400 on validation error with Arabic message

**Details for T004**:
- Props: `onSearch(query: string)`, `placeholder`, `className`, optional `defaultValue`
- Controlled input with 300ms debounce via `useRef` + `setTimeout`
- Fetch `/api/suggestions?q=...&limit=6` when input >= 2 chars
- Dropdown: list of suggestions showing title + AI model badge (shadcn Badge)
- Click suggestion → `router.push(/prompt/${id})`
- Press Enter or click search icon → call `onSearch(query)`
- X button to clear input and close dropdown
- Close dropdown on blur (with delay for click handling)
- "لا توجد نتائج" empty state in dropdown
- Keyboard: Escape closes dropdown

**Details for T005**:
- Replace existing search input in Hero with `<SearchInput />`
- `onSearch` navigates to `/market?search={query}`
- Preserve existing Hero layout and styling

**Checkpoint**: Search suggestions work from Hero. Typing shows dropdown, clicking suggestion navigates to prompt detail.

---

## Phase 4: User Story 3 — Dark Marketplace UI (Priority: P2)

**Goal**: The marketplace page renders with a forced dark theme (hero, filters, results grid, cards) regardless of the user's app theme toggle.

**Independent Test**: Visit `/market`, verify dark background on hero and grid. Toggle app theme to light, verify marketplace stays dark. Navigate away to `/`, verify homepage respects light theme.

> **Depends on**: US1 (needs seeded data to display), US2 (uses SearchInput in hero)

### Implementation for User Story 3

- [X] T006 [US3] Rewrite marketplace page with forced dark theme wrapper, dark hero section with SearchInput, and prompt card grid in `src/app/market/page.tsx`
- [X] T007 [P] [US3] Update marketplace loading skeleton with dark theme in `src/app/market/loading.tsx`
- [X] T008 [P] [US3] Verify and adjust PromptCard for dark background rendering in `src/components/PromptCard.tsx`

**Details for T006**:
- Wrap entire page in `<div className="dark bg-gray-950 min-h-screen">` to force dark mode
- Hero section: dark bg (gray-950 or similar), marketplace title in Arabic, subtitle, centered `<SearchInput />` with `onSearch` that sets URL search param
- Below hero: responsive grid of prompt cards (1 col mobile / 2 col tablet / 4 col desktop)
- Fetch prompts from `/api/prompts` on mount (client component with `"use client"`)
- Display prompt count: "عرض X من Y"
- Empty state for zero results: "لا توجد نتائج" with suggestion to adjust filters
- Mobile-first responsive layout

**Details for T007**:
- Dark background skeleton cards matching the market page layout
- Use `animate-pulse` with dark variant colors (gray-800/gray-700)

**Details for T008**:
- Ensure card text, borders, and backgrounds look correct on `dark` parent
- May need `dark:` variant adjustments on card backgrounds, text colors, borders

**Checkpoint**: Marketplace page displays prompt cards on a dark background with a dark hero containing the search bar.

---

## Phase 5: User Story 4 — Advanced Marketplace Filters & Sorting (Priority: P2)

**Goal**: Users can filter by Type (generation type), Model (AI model), sort results, see active filter chips, share filtered URLs, and load more results progressively.

**Independent Test**: Select Model "Claude", verify only Claude prompts shown and "Claude" chip appears. Change sort to "Newest", verify reordering. Copy URL with filters, paste in new tab, verify same filters applied.

> **Depends on**: US3 (marketplace page must exist with dark theme)

### Implementation for User Story 4

- [X] T009 [US4] Enhance prompts API with search, filters, sorting, pagination, and total count in `src/app/api/prompts/route.ts`
- [X] T010 [US4] Add filter sidebar (desktop) and Sheet drawer (mobile) with Type and Model radio groups to marketplace page in `src/app/market/page.tsx`
- [X] T011 [US4] Add sort dropdown, active filter chips with remove/reset, and "Load more" pagination to marketplace page in `src/app/market/page.tsx`
- [X] T012 [US4] Wire URL search params as single source of truth for all marketplace filter/sort/search state in `src/app/market/page.tsx`

**Details for T009**:
- Parse query params via updated `promptsQuerySchema`
- Base query: `WHERE status = 'approved'`
- Search: `AND (title ILIKE '%search%' OR title_en ILIKE '%search%' OR description ILIKE '%search%' OR description_en ILIKE '%search%' OR array_to_string(tags, ' ') ILIKE '%search%')`
- `generationType` filter: `AND generation_type = ?`
- `aiModel` filter (comma-separated): `AND ai_model IN (...)`
- `category` filter (comma-separated): `AND category IN (...)`
- `priceMin`/`priceMax`: `AND price >= ? AND price <= ?`
- Sort: trending (`sales * 2 + recency_score`), popular (`sales DESC`), newest (`created_at DESC`), price-low (`price ASC`), price-high (`price DESC`), relevant (CASE-based title > description > tag match), rating (`rating DESC`), bestselling (alias for popular)
- When `search` provided and `sortBy` not explicitly set, default to `relevant`
- Separate `SELECT COUNT(*)` for total
- Return `{ data: [...mapPromptRow], total: number }`
- `LIMIT` and `OFFSET` from params

**Details for T010**:
- Desktop (>= 768px): visible sidebar on the right side with filter groups
- Mobile (< 768px): hidden sidebar, "الفلاتر" button triggers shadcn Sheet (slide from right)
- Filter groups:
  - **النوع (Type)**: radio group with "الكل" (all), "نص" (text), "صورة" (image), "كود" (code), "تسويق" (marketing), "تصميم" (design)
  - **النموذج (Model)**: radio group with "الكل" (all), ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion, Gemini, Copilot
- Selecting a filter triggers URL update and re-fetch
- "إعادة تعيين" (Reset) button to clear all filters

**Details for T011**:
- Sort dropdown (shadcn Select): "الأكثر رواجاً" (Trending), "الأكثر شعبية" (Popular), "الأحدث" (Newest), "السعر: من الأقل" (Price low), "السعر: من الأعلى" (Price high), "الأكثر صلة" (Relevant — shown when search active), "الأعلى تقييماً" (Rating)
- Active filter chips (shadcn Badge): each chip shows filter value with X to remove
- "عرض المزيد" (Load more) button: fetches next 20 results, appends to existing
- Result counter: "عرض X من Y"
- Button hidden when all results loaded

**Details for T012**:
- Read initial state from `useSearchParams()` on mount
- On filter/sort/search change: update URL via `router.replace` with new params (shallow)
- Params: `search`, `generationType`, `aiModel`, `sortBy`, `offset` (offset resets to 0 on filter/sort change)
- Derive all UI state from URL params — no separate React state for filters
- "Load more" increments offset param but keeps existing results in local state (append pattern)

**Checkpoint**: Full marketplace with dark theme, search, filters, sorting, pagination, and shareable URLs.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories.

- [X] T013 Run `npm run lint && npm run build` and fix all errors
- [X] T014 Validate all 7 quickstart.md scenarios manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Setup (needs Zod schemas in place) — FOUNDATIONAL for all other stories
- **US2 (Phase 3)**: Depends on Setup — can run in PARALLEL with US1 (different files)
- **US3 (Phase 4)**: Depends on US1 (needs data) + US2 (uses SearchInput component)
- **US4 (Phase 5)**: Depends on US3 (adds filters to marketplace page)
- **Polish (Phase 6)**: Depends on all user stories complete

### Execution Graph

```text
Phase 1 (Setup)
    ├──→ Phase 2 (US1: Seed) ──┐
    └──→ Phase 3 (US2: Search) ─┤
                                 └──→ Phase 4 (US3: Dark UI) ──→ Phase 5 (US4: Filters) ──→ Phase 6 (Polish)
```

### Within Each User Story

- API routes before UI components (data before presentation)
- Shared components before page integration
- Core layout before progressive enhancement

### Parallel Opportunities

**Between stories (after Setup)**:
- US1 (seed script) and US2 (search API + component) can run in parallel — zero file overlap

**Within US2**:
- T003 (suggestions API) and T004 (SearchInput component) can run in parallel — different files

**Within US3**:
- T007 (loading skeleton) and T008 (PromptCard check) can run in parallel with T006

---

## Parallel Example: US1 + US2

```bash
# After Phase 1 (Setup) completes, launch US1 and US2 together:
Task: "Rewrite seed script in src/db/seed.ts"           # US1
Task: "Create suggestions API in src/app/api/suggestions/route.ts"  # US2
Task: "Create SearchInput in src/components/SearchInput.tsx"         # US2
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (Zod schemas)
2. Complete Phase 2: US1 (seed 100 prompts)
3. Complete Phase 3: US2 (search with suggestions)
4. **STOP and VALIDATE**: Marketplace has data, search works from Hero
5. Proceed to US3 + US4 for full marketplace experience

### Incremental Delivery

1. Setup → Foundation ready
2. US1 (seed) → Marketplace has data (MVP!)
3. US2 (search) → Users can find prompts
4. US3 (dark UI) → Polished marketplace look
5. US4 (filters) → Full filtering/sorting/pagination
6. Polish → Production-ready

---

## Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| 1 - Setup | — | 1 | — |
| 2 - Seed | US1 | 1 | Can parallel with US2 |
| 3 - Search | US2 | 3 | T003 ∥ T004 |
| 4 - Dark UI | US3 | 3 | T007 ∥ T008 |
| 5 - Filters | US4 | 4 | — (same file) |
| 6 - Polish | — | 2 | — |
| **Total** | | **14** | |

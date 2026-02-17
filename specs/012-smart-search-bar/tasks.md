# Tasks: Smart Search Bar

**Input**: Design documents from `/specs/012-smart-search-bar/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add i18n translation keys needed by all user stories

- [x] T001 [P] Add search dropdown i18n keys to `src/i18n/locales/ar/common.json` — add `search.recentSearches` ("عمليات البحث الأخيرة"), `search.trendingSearches` ("الأكثر بحثاً"), `search.removeSearch` ("إزالة") under the existing `search` object
- [x] T002 [P] Add search dropdown i18n keys to `src/i18n/locales/en/common.json` — add `search.recentSearches` ("Recent Searches"), `search.trendingSearches` ("Trending Searches"), `search.removeSearch` ("Remove") under the existing `search` object

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the data layer (store + API) that user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 [P] Create recent searches Zustand store in `src/stores/recent-searches-store.ts` — follow the exact pattern from `src/stores/cart-store.ts` using `create()` + `persist()` middleware. Interface: `{ searches: { term: string; timestamp: number }[]; addSearch: (term: string) => void; removeSearch: (term: string) => void; clearAll: () => void }`. localStorage key: `promptsouq-recent-searches`. `addSearch` must deduplicate (case-insensitive), prepend, and trim to max 10 entries. Per FR-001 clarification: only called on explicit form submit
- [x] T004 [P] Create trending searches API route in `src/app/api/trending/route.ts` — GET handler that queries `prompts` table via Drizzle: `SELECT title, title_en FROM prompts WHERE status = 'approved' ORDER BY sales DESC LIMIT 5`. Return `{ data: [{ title, titleEn }] }`. Use `apiErrorResponse` from `src/lib/schemas/api.ts` for error handling. No request params needed (no Zod validation on request). Per contracts/trending-api.md

**Checkpoint**: Store and API ready — SearchInput integration can begin

---

## Phase 3: User Story 1 — Recent Searches (Priority: P1) MVP

**Goal**: Users see their recent search terms in a dropdown when focusing the empty search bar. They can click to re-execute, remove individual items, or clear all.

**Independent Test**: Perform 3-4 searches via form submit, re-focus search bar with empty input → recent terms appear most-recent-first. Click one → search executes. Click X → item removed. Click "Clear all" → section disappears.

### Implementation for User Story 1

- [x] T005 [US1] Wire recent searches store into `src/components/SearchInput.tsx` — import `useRecentSearchesStore`, call `addSearch(query)` inside `handleSearch()` (only on form submit, not on suggestion/trending clicks). Add `useTranslation` hook import for `common` namespace
- [x] T006 [US1] Add recent searches dropdown panel to `src/components/SearchInput.tsx` — when `isFocused && query.length < 2 && recentSearches.length > 0`, render a new panel section with: section header label (i18n `search.recentSearches`), list of recent search items (each with term text + clickable area + X remove button), and a "Clear all" button in the header (reuse `buttons.clearAll` i18n key). Each item must have `onMouseDown` with `e.preventDefault()` (same pattern as existing suggestions). Clicking an item calls `onSearch` or navigates with the term. Touch targets min 44px. RTL-compatible layout
- [x] T007 [US1] Implement remove and clear-all actions in the recent searches panel in `src/components/SearchInput.tsx` — X button calls `removeSearch(term)` on the store, "Clear all" calls `clearAll()`. After clearing all, if no trending data exists either, close the dropdown. Use Lucide `X` icon for remove (already imported)

**Checkpoint**: Recent searches fully functional — users can save, view, click, remove, and clear search history

---

## Phase 4: User Story 2 — Trending Searches (Priority: P2)

**Goal**: Users see top 5 bestselling prompt titles as "Trending Searches" in the dropdown when focusing the empty search bar.

**Independent Test**: Focus the search bar with empty input → trending items appear below recent searches (or alone if no recent searches). Click a trending item → search executes with that term.

### Implementation for User Story 2

- [x] T008 [US2] Add trending data fetch to `src/components/SearchInput.tsx` — create state `trendingItems: { title: string; titleEn: string }[]` initialized to `[]`. Fetch from `/api/trending` on component mount (single `useEffect` with empty deps), cache result in state. Handle fetch failure silently (trending section simply won't appear). No refetch on subsequent focuses
- [x] T009 [US2] Add trending searches section to the dropdown panel in `src/components/SearchInput.tsx` — render below the recent searches section (or as the only section if no recent searches). Section header with i18n `search.trendingSearches` label. Each item shows the prompt title (use `title` for Arabic locale, `titleEn` for English — determine from current i18n language). Clicking a trending item calls `onSearch` or navigates with the title as the search term. Use a trending icon (Lucide `TrendingUp`) next to each item. Show panel when `isFocused && query.length < 2 && trendingItems.length > 0`

**Checkpoint**: Trending searches appear in dropdown — new users see popular content immediately on focus

---

## Phase 5: User Story 3 — Combined Search Experience (Priority: P3)

**Goal**: Smooth transitions between three dropdown states: recent/trending (empty input) → live suggestions (2+ chars) → back to recent/trending (input cleared). No regressions in existing behavior.

**Independent Test**: Focus → see recent/trending. Type 2 chars → suggestions appear. Delete all chars → recent/trending reappears. Press Escape → closes. Click outside → closes.

### Implementation for User Story 3

- [x] T010 [US3] Implement three-state dropdown logic in `src/components/SearchInput.tsx` — refactor the dropdown rendering to use a computed panel state: (1) `query.length >= 2` → show existing suggestions panel (unchanged), (2) `query.length < 2 && isFocused && (hasRecent || hasTrending)` → show recent/trending panel, (3) otherwise → hide dropdown. Ensure `handleInputChange` correctly triggers panel switches: when user clears input (deletes back to empty or < 2 chars), recent/trending panel should reappear. Update `onFocus` handler to open recent/trending panel if query is empty (instead of only opening suggestions)
- [x] T011 [US3] Add deduplication logic in `src/components/SearchInput.tsx` — before rendering trending items, filter out any trending item whose title (case-insensitive) matches a term in the recent searches list. Compute `filteredTrending = trendingItems.filter(t => !recentSearches.some(r => r.term.toLowerCase() === t.title.toLowerCase() || r.term.toLowerCase() === t.titleEn.toLowerCase()))`. This ensures per FR-012 that overlapping terms only appear in "Recent Searches"
- [x] T012 [US3] Verify and preserve existing keyboard/mouse behaviors in `src/components/SearchInput.tsx` — ensure Escape key closes both panel types (recent/trending and suggestions), click-outside closes dropdown (existing `handleClickOutside`), clear button (X) resets query and shows recent/trending if available, `onBlur` behavior unchanged. No functional changes needed here — this is a verification/test task to confirm no regressions after T005-T011 modifications

**Checkpoint**: All three user stories independently functional — full search experience works end-to-end

---

## Phase 6: Polish & Verification

**Purpose**: Build validation and final checks

- [x] T013 Run `npm run lint && npm run build` and fix all errors in modified files
- [x] T014 Manual smoke test per `specs/012-smart-search-bar/quickstart.md` — verify all 6 test scenarios pass on both mobile and desktop viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: No dependencies on Phase 1 — can run in parallel with Setup
- **US1 (Phase 3)**: Depends on Phase 1 (i18n keys) + T003 (store)
- **US2 (Phase 4)**: Depends on Phase 1 (i18n keys) + T004 (API) + Phase 3 (SearchInput already modified)
- **US3 (Phase 5)**: Depends on Phase 3 + Phase 4 (both panels must exist)
- **Polish (Phase 6)**: Depends on all previous phases

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — no dependency on other stories
- **US2 (P2)**: Should start after US1 since both modify `SearchInput.tsx` (same file — sequential to avoid conflicts)
- **US3 (P3)**: Must start after US1 AND US2 are complete (combines both features)

### Within Each User Story

- Store/API creation → SearchInput integration → refinement
- Each story adds to the same `SearchInput.tsx` file incrementally

### Parallel Opportunities

```
Phase 1 + Phase 2 can run concurrently:
  T001 ║ T002 ║ T003 ║ T004  (all different files)

Phase 3 (US1) sequential within:
  T005 → T006 → T007  (same file: SearchInput.tsx)

Phase 4 (US2) sequential within:
  T008 → T009  (same file: SearchInput.tsx)

Phase 5 (US3) sequential within:
  T010 → T011 → T012  (same file: SearchInput.tsx)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 + Phase 2 (Setup + Foundational) — parallel
2. Complete Phase 3: US1 — Recent Searches
3. **STOP and VALIDATE**: Users can save, view, and manage recent searches
4. Run lint + build to confirm no regressions

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Add US1 (Recent Searches) → Test independently → Functional MVP
3. Add US2 (Trending Searches) → Test independently → Enhanced discovery
4. Add US3 (Combined Experience) → Test transitions → Polished UX
5. Phase 6 → Final lint/build + smoke test

---

## Notes

- All SearchInput.tsx modifications are sequential (same file, incremental changes)
- Store and API are independent files — safe to build in parallel
- No database migrations needed — trending reads existing `prompts.sales` column
- i18n keys are small additions — low risk of merge conflicts
- The `buttons.clearAll` key already exists in common.json — reuse it
- Commit after each completed phase for clean git history

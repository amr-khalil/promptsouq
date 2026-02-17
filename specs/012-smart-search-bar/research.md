# Research: Smart Search Bar

**Branch**: `012-smart-search-bar` | **Date**: 2026-02-17

## R1: Recent Searches Storage Approach

**Decision**: Zustand store with `persist` middleware, localStorage key `promptsouq-recent-searches`.

**Rationale**: The project already uses this exact pattern for the cart store (`src/stores/cart-store.ts`). Using the same approach ensures consistency, leverages existing infrastructure (hydration-safe patterns via `useSyncExternalStore`), and avoids introducing new dependencies. localStorage persists across sessions and doesn't require authentication.

**Alternatives considered**:
- Raw `localStorage` with custom hooks — rejected because Zustand persist is already a project pattern and provides reactivity out of the box.
- Server-side storage (DB table) — rejected per spec: no auth required for search, and this would add unnecessary DB complexity.
- `sessionStorage` — rejected because it doesn't persist across browser sessions (spec requires cross-session persistence).

## R2: Trending Searches Data Source

**Decision**: New API endpoint `GET /api/trending` that queries the `prompts` table for top 5 approved prompts ordered by `sales DESC`, returning only `title` and `titleEn`.

**Rationale**: The `prompts` table already has a `sales` integer column with an existing index (`idx_prompts_status`). A simple query with `WHERE status = 'approved' ORDER BY sales DESC LIMIT 5` is efficient. No new tables or columns needed.

**Alternatives considered**:
- Reuse `/api/prompts?sortBy=bestselling&limit=5` — rejected because it returns full prompt objects (heavy payload, exposes unnecessary data for search suggestions).
- Aggregate search query logs — rejected per spec clarification (no analytics infrastructure).
- Hardcoded trending terms — rejected because it doesn't reflect actual platform data.

## R3: Dropdown State Management

**Decision**: Extend the existing `SearchInput` component with a new state variable to track which dropdown panel to show: `"idle" | "recent-trending" | "suggestions"`.

**Rationale**: The component already manages `isOpen`, `suggestions`, `isFocused`. Adding a panel type state cleanly separates the two dropdown modes. When `query.length < 2` and input is focused, show recent/trending. When `query.length >= 2`, show live suggestions (existing behavior).

**Alternatives considered**:
- Separate overlay component — rejected because it would duplicate focus/click-outside/escape logic.
- Render both panels and toggle visibility — rejected because it causes unnecessary API calls for both panels.

## R4: Trending Data Caching Strategy

**Decision**: Fetch trending data on component mount (first focus), cache in component state for the session. No refetch on subsequent focuses unless the component remounts.

**Rationale**: Trending data is based on sales counts which change infrequently. Fetching once per page load is sufficient. The API endpoint is lightweight (5 rows, 2 columns). Over-fetching on every focus would add unnecessary latency.

**Alternatives considered**:
- SWR/React Query with stale-while-revalidate — rejected because it introduces a new dependency not in the project stack.
- Cache in Zustand store — rejected because trending data is ephemeral per session, not user-specific, and doesn't need cross-page persistence.

## R5: i18n Keys for Search Dropdown

**Decision**: Add new keys under `search` namespace in `common.json` for both Arabic and English: `recentSearches`, `trendingSearches`, `clearAll`, `removeSearch`.

**Rationale**: The existing `common.json` already has a `search` section with `placeholder`. Adding sibling keys keeps the namespace organized. The `buttons.clearAll` key already exists in common and can be reused.

**Alternatives considered**:
- Separate `search.json` namespace — rejected because these are part of the search bar component which uses common namespace.
- Inline Arabic strings — rejected because the project has full i18n support via react-i18next.

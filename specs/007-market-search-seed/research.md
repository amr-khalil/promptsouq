# Research: 007-market-search-seed

## Decision 1: Search Strategy for 100 Prompts

**Decision**: Use PostgreSQL `ILIKE` pattern matching with `OR` across title, titleEn, description, descriptionEn, and array-to-string(tags).

**Rationale**: With only 100 prompts, full-text search (tsvector/GIN) adds unnecessary complexity. Simple `ILIKE '%query%'` is fast enough and works for both Arabic and English without language-specific dictionaries. The existing `/api/prompts/search` endpoint already uses this pattern.

**Alternatives considered**:
- PostgreSQL full-text search (tsvector + GIN index): Overkill for 100 rows. Worth revisiting at 10k+ prompts.
- pg_trgm trigram extension: Good for fuzzy matching but adds extension dependency. Not needed at this scale.
- External search service (Algolia, Elasticsearch): Explicitly out of scope per spec.

## Decision 2: Relevance Sorting

**Decision**: Use a combined scoring approach: exact title match > title contains > description contains > tag match. Implemented by ordering with CASE expressions in SQL.

**Rationale**: Simple and deterministic. Users searching "شعار" should see prompts with "شعار" in the title before those only mentioning it in description/tags.

**Alternatives considered**:
- `ts_rank` with tsvector: Requires full-text search setup. Deferred.
- Client-side sorting: Moves computation to browser. Not ideal.

## Decision 3: Suggestions Endpoint Design

**Decision**: Dedicated `/api/suggestions?q=...&limit=6` endpoint that returns `{ id, title, aiModel }` for the top 6 matching approved prompts. Matches on title and tags using `ILIKE`.

**Rationale**: Lightweight response (no descriptions, no images) for fast autocomplete. Separate from the full search endpoint to keep responses small and fast.

**Alternatives considered**:
- Reuse `/api/prompts/search` with a `fields` param: Overcomplicates the existing endpoint. Better separation of concerns.
- Client-side filtering of already-fetched prompts: Requires loading all prompts upfront. Not scalable.

## Decision 4: Marketplace Dark Theme Approach

**Decision**: Force dark mode on the `/market` route by wrapping the page in a `<div className="dark">` container with a dark background. This leverages Tailwind's dark mode variant (`dark:` prefix) without affecting the global theme toggle.

**Rationale**: The app uses `next-themes` with class-based dark mode. Wrapping just the marketplace in a `dark` class forces all child components to render in dark mode, regardless of the user's theme preference. This is a CSS-only solution with no JavaScript overhead.

**Alternatives considered**:
- Route-specific theme override via `next-themes`: Would require modifying the theme provider, more complex.
- Hardcoded dark colors without dark mode class: Would require duplicating all color values, not maintainable.
- Global dark-only mode for the whole app: Contradicts spec — only marketplace should be dark.

## Decision 5: Seed Data Image Strategy

**Decision**: Use `picsum.photos` with deterministic seed IDs (e.g., `https://picsum.photos/seed/{promptIndex}/400/300`) for thumbnails and `ui-avatars.com` for seller avatars.

**Rationale**: Both services are free, require no API keys, and produce consistent images for the same seed. `picsum.photos` returns varied landscape photos suitable for prompt thumbnails. `ui-avatars.com` generates letter-based avatars from seller names.

**Alternatives considered**:
- Unsplash API: Requires API key, rate limited.
- Local placeholder images: Adds files to repo, less variety.
- AI-generated placeholder images: Over-engineered for seed data.

## Decision 6: Pagination Strategy

**Decision**: Offset-based pagination with `limit=20` and `offset` query param. "Load more" button on the client increments offset by 20. API returns `{ data: [...], total: number }` so the client knows when to hide the button.

**Rationale**: Offset pagination is the simplest approach and works well for small datasets (100 prompts = max 5 pages). Adding `total` count lets the UI show progress ("عرض 20 من 100") and hide the button at the end.

**Alternatives considered**:
- Cursor-based pagination: More complex, better for real-time feeds. Not needed here.
- Client-side pagination (load all, slice): Loads 100 images upfront. Too heavy.

## Decision 7: Filter State Management

**Decision**: URL search params as single source of truth. Use `useSearchParams` + `useRouter` to read/write filter state. No Zustand or React state for filters — derive everything from URL.

**Rationale**: Enables shareable/bookmarkable filtered views (FR-009). Avoids state synchronization issues between URL and component state. Standard pattern for marketplace filtering.

**Alternatives considered**:
- Zustand store for filters: Would need constant sync with URL. Extra complexity.
- React state + URL sync on change: Two sources of truth, risk of drift.

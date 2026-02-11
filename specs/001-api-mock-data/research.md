# Research: API Layer with Mock Data

**Feature**: 001-api-mock-data | **Date**: 2026-02-11

## Decision 1: API Route Structure

**Decision**: RESTful nested routes under `/api/`

**Rationale**: Next.js App Router supports file-system-based API routes. Nesting under resource names (`/api/prompts/[id]/reviews`) provides clear ownership and matches REST conventions. This structure maps cleanly to future Supabase table queries.

**Alternatives considered**:
- Flat routes with query params (`/api/reviews?promptId=X`): Simpler but loses resource hierarchy. Rejected because related data (reviews, related prompts) logically belongs under the parent prompt.
- Single catch-all route: Would require manual path parsing. Rejected as unnecessary complexity.

**Endpoints**:

| Method | Path | Maps to FR |
|--------|------|-----------|
| GET | `/api/prompts` | FR-001 |
| GET | `/api/prompts/search` | FR-005 |
| GET | `/api/prompts/[id]` | FR-002 |
| GET | `/api/prompts/[id]/reviews` | FR-003 |
| GET | `/api/prompts/[id]/related` | FR-006 |
| GET | `/api/categories` | FR-004 |
| GET | `/api/testimonials` | FR-007 |

## Decision 2: Zod Schema Location

**Decision**: Single shared file at `src/lib/schemas/api.ts`

**Rationale**: Constitution VIII mandates Zod schemas in `src/lib/schemas/` for shared schemas. A single file is appropriate for this phase given the small number of endpoints (7) and the shared nature of entity types across endpoints. API route handlers import schemas for validation; page components import inferred types.

**Alternatives considered**:
- Co-located `schemas.ts` per route: Constitution allows this but adds file proliferation for 7 simple GET endpoints. Better suited for complex mutation routes.
- Separate files per entity: Overkill for 4 entities. Can split later if schemas grow.

## Decision 3: Mock Data Import Strategy

**Decision**: API route handlers import directly from `src/data/mockData.ts`. No other file imports from mockData.

**Rationale**: The spec (FR-009) requires preserving mock data as the data source. Importing in route handlers centralizes the data access point, making future migration to Supabase a single-location change per entity. The mockData.ts file itself remains unchanged.

**Alternatives considered**:
- Copy mock data into each route handler: Duplicates data, harder to maintain. Rejected.
- Create a data access layer/repository: Over-engineering for this phase. The route handlers themselves serve as the data access layer. Deferred to database phase.

## Decision 4: Page Data Fetching Pattern

**Decision**: `useEffect` + `useState` + `fetch()` in Client Components

**Rationale**: All 8 pages are currently Client Components (`"use client"`). The spec says "existing UI rendering logic and component structure remain unchanged." Using plain `fetch()` in `useEffect` with loading/error state is the simplest migration path. The constitution (III) mandates Client Components call API Route Handlers via `fetch()`.

**Alternatives considered**:
- Convert pages to Server Components: Would require significant restructuring of pages that use `useState`, `useEffect`, URL params, and event handlers. Violates spec assumption that "UI rendering logic and component structure remain unchanged."
- SWR or React Query: Adds a dependency not in the constitution's tech stack. Over-engineering for mock data. Can be added later.
- Custom `useFetch` hook: Reasonable but creates an abstraction for a one-phase feature. Each page's fetch is straightforward enough to inline.

## Decision 5: Error Response Format

**Decision**: Consistent JSON error envelope

```json
{
  "error": {
    "code": "NOT_FOUND" | "VALIDATION_ERROR" | "INTERNAL_ERROR",
    "message": "Arabic error message",
    "details": {} // Optional: Zod .flatten() output for validation errors
  }
}
```

**Rationale**: FR-011 and FR-012 require structured error responses. Using a consistent envelope with Arabic messages satisfies constitution I (Arabic-first) and VIII (structured Zod errors via `.flatten()`). The `code` field enables programmatic error handling; the `message` field enables user-facing display.

**Alternatives considered**:
- HTTP status codes only: Not structured enough for field-level validation errors.
- RFC 7807 Problem Details: More formal than needed for mock data phase.

## Decision 6: Filter Parameter Format

**Decision**: Comma-separated values for multi-value filters

Example: `?category=marketing,design&aiModel=ChatGPT&priceMin=0&priceMax=50&sortBy=rating`

**Rationale**: The marketplace page supports selecting multiple categories and AI models simultaneously. Comma-separated values are simpler to construct in `fetch()` URLs than repeated query params. Zod's `.transform()` can split on commas.

**Alternatives considered**:
- Repeated params (`?category=marketing&category=design`): Standard but requires `searchParams.getAll()`. Slightly more verbose.
- JSON body: Not appropriate for GET requests.

## Decision 7: Loading State Components

**Decision**: Skeleton components using shadcn `Skeleton` primitives in `loading.tsx` files

**Rationale**: Constitution X mandates `loading.tsx` files with skeleton placeholders matching page layout shape. shadcn provides a `Skeleton` component that integrates with the existing design system. Each route segment gets a dedicated loading file.

**Alternatives considered**:
- Spinner only: Constitution X prefers skeletons that "match the page layout shape." Spinners are allowed but skeletons provide better UX.
- Shared generic skeleton: Each page has different layout structure, so skeletons should be page-specific.

## Decision 8: Search Implementation

**Decision**: Case-insensitive substring matching across title (AR/EN), description, and tags

**Rationale**: The existing search page (src/app/search/page.tsx) uses `.toLowerCase().includes()` for matching. The API endpoint replicates this exact logic server-side per the clarification (server-side filtering). Search covers `title`, `titleEn`, `description`, and `tags[]` fields.

**Alternatives considered**:
- Full-text search engine: Over-engineering for 8 mock prompts. Deferred to database phase.
- Fuzzy matching: Not in the spec. Simple substring matching matches current behavior.

## Decision 9: PromptCard Type Import

**Decision**: Keep `PromptCard.tsx` importing the `Prompt` type from `mockData.ts`

**Rationale**: `PromptCard.tsx` only imports the `Prompt` type (not data). TypeScript types are erased at build time and don't constitute a data dependency. Moving the type to the Zod schema file (`src/lib/schemas/api.ts`) and re-exporting from there is cleaner long-term, but the spec says to remove data imports, not type imports. We will migrate the type to be inferred from the Zod schema in `src/lib/schemas/api.ts` and update the type import in `PromptCard.tsx` and all page files.

**Alternatives considered**:
- Leave type in mockData.ts: Creates a continued dependency on the file. Pages would still import types from mockData.ts.
- Duplicate types: Violates constitution VIII (Zod as single source of truth).

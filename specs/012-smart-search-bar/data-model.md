# Data Model: Smart Search Bar

**Branch**: `012-smart-search-bar` | **Date**: 2026-02-17

## Entities

### Recent Search Entry (Client-Side Only)

Stored in localStorage via Zustand persist middleware. No database table needed.

| Field     | Type     | Description                          |
|-----------|----------|--------------------------------------|
| term      | string   | The search query text                |
| timestamp | number   | Unix timestamp (ms) when search was submitted |

**Storage format**: Array of `{ term: string; timestamp: number }` objects, ordered by timestamp descending (most recent first).

**Constraints**:
- Maximum 10 entries
- No duplicate terms (case-insensitive match); re-searching an existing term moves it to the top
- localStorage key: `promptsouq-recent-searches`

**State transitions**:
- **Add**: On form submit → deduplicate → prepend → trim to 10
- **Remove single**: User clicks X on item → filter out that term
- **Clear all**: User clicks "Clear all" → reset to empty array

### Trending Search Item (API Response)

No new database table. Data sourced from existing `prompts` table.

| Field   | Type   | Description                                    |
|---------|--------|------------------------------------------------|
| title   | string | Arabic prompt title (used as search term)      |
| titleEn | string | English prompt title (for EN locale display)   |

**Source query**: `SELECT title, title_en FROM prompts WHERE status = 'approved' ORDER BY sales DESC LIMIT 5`

## No Schema Changes

This feature does not modify any Drizzle schema files or database tables. All data sources already exist:
- `prompts.sales` (integer) — used for trending ranking
- `prompts.title` / `prompts.title_en` — used for trending display
- `prompts.status` — filter to approved only

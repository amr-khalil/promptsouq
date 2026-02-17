# Quickstart: Smart Search Bar

**Branch**: `012-smart-search-bar`

## What This Feature Does

Enhances the existing search bar dropdown to show two new panels when the input is focused and empty:
1. **Recent Searches** — user's last 10 search submissions, stored in localStorage
2. **Trending Searches** — top 5 bestselling prompt titles from the platform

When the user starts typing (2+ characters), the existing live suggestions behavior takes over unchanged.

## Files to Create

| File | Purpose |
|------|---------|
| `src/stores/recent-searches-store.ts` | Zustand store with persist middleware for recent search history |
| `src/app/api/trending/route.ts` | API endpoint returning top 5 prompts by sales |

## Files to Modify

| File | Change |
|------|--------|
| `src/components/SearchInput.tsx` | Add recent/trending dropdown panel alongside existing suggestions dropdown |
| `src/i18n/locales/ar/common.json` | Add `search.recentSearches`, `search.trendingSearches`, `search.removeSearch` keys |
| `src/i18n/locales/en/common.json` | Same keys in English |

## No Changes Needed

- No Drizzle schema changes
- No database migrations
- No RLS policy changes
- No new npm dependencies

## Key Implementation Notes

1. **Store pattern**: Follow `src/stores/cart-store.ts` exactly — Zustand `create()` + `persist()` middleware
2. **Dropdown states**: SearchInput manages which panel to show via query length: empty → recent/trending, 2+ chars → suggestions
3. **Save trigger**: Only `handleSearch()` (form submit) saves to recent searches — not suggestion clicks
4. **Trending fetch**: Single fetch on component mount, cached in local state
5. **Deduplication**: Terms in both recent and trending → show only in recent section
6. **i18n**: Use `useTranslation` with `common` namespace (existing pattern in SearchInput)

## How to Test

```bash
npm run dev
# 1. Focus search bar → see trending (if prompts exist in DB)
# 2. Search for "ChatGPT" → submit → refocus → see "ChatGPT" in recent
# 3. Type 2+ chars → recent/trending replaced by live suggestions
# 4. Clear input → recent/trending reappears
# 5. Click X on recent item → removed
# 6. Click "Clear all" → all recent cleared
```

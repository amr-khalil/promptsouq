# Quickstart: 007-market-search-seed

## Prerequisites

- Node.js 18+, npm
- Supabase project running (project: `dyaflmsawxpqgmyojtbc`)
- `.env.local` with `DATABASE_URL` set

## Scenario 1: Seed the Database

```bash
# Source env vars and run seed script
source .env.local && npx tsx src/db/seed.ts
```

**Expected**: Console outputs "Seeded 100 prompts across 10 sellers" (or similar). Visit `http://localhost:3000/market` to see populated marketplace.

**Verify**:
- 100 prompt cards visible (after clicking "Load more" 4 times)
- Thumbnails load from picsum.photos
- Prices range $1.99-$29.99
- All 7 AI models represented
- All 5 generation types represented

## Scenario 2: Search with Suggestions

1. Navigate to `http://localhost:3000/market`
2. Type "شعار" in the search bar
3. **Expected**: Dropdown shows up to 6 matching prompts within ~500ms
4. Click a suggestion → navigated to `/prompt/[id]`
5. Type "logo" and press Enter → marketplace filters to matching results

**Verify**:
- Suggestions show title + AI model badge
- "X" button clears search
- Empty query shows no dropdown
- 1-character query shows no dropdown (need min 2)

## Scenario 3: Filter by Type and Model

1. Navigate to `http://localhost:3000/market`
2. In the sidebar, select Type: "صورة" (Image)
3. **Expected**: Only image-generation prompts shown, "صورة" chip appears above results
4. Additionally select Model: "Midjourney"
5. **Expected**: Only Midjourney image prompts shown, both chips visible
6. Click X on "صورة" chip
7. **Expected**: All Midjourney prompts shown (image filter removed)
8. Click "إعادة تعيين" (Reset)
9. **Expected**: All filters cleared, all prompts shown

**Verify**:
- URL updates with each filter: `?generationType=image&aiModel=midjourney`
- Copying and pasting the URL in a new tab restores the filters
- Sort dropdown shows "الأكثر رواجاً" (Trending) by default

## Scenario 4: Sorting

1. From filtered results, change sort to "الأحدث" (Newest)
2. **Expected**: Results reorder by creation date, URL updates to `?sortBy=newest`
3. Search for "تصميم", sort auto-changes to "الأكثر صلة" (Most relevant)
4. **Expected**: Title matches appear before description-only matches

## Scenario 5: Load More Pagination

1. Navigate to `http://localhost:3000/market`
2. **Expected**: 20 prompt cards shown, "عرض المزيد" (Load more) button visible
3. Click "عرض المزيد"
4. **Expected**: 40 total cards shown, button still visible
5. Continue clicking until all 100 shown
6. **Expected**: Button disappears, counter shows "عرض 100 من 100"

## Scenario 6: Mobile Filters

1. Resize to < 768px (or use mobile device)
2. **Expected**: Sidebar hidden, "الفلاتر" (Filters) button visible
3. Tap "الفلاتر" button
4. **Expected**: Sheet/drawer slides in from the right with all filter options
5. Select a filter and close drawer
6. **Expected**: Results update, filter chip visible above grid

## Scenario 7: Dark Marketplace Theme

1. Set app theme to "light" via theme toggle
2. Navigate to `/market`
3. **Expected**: Marketplace page renders in dark theme regardless of app setting
4. Navigate away to `/` (homepage)
5. **Expected**: Homepage uses light theme as selected

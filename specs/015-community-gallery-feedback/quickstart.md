# Quickstart: Community Gallery & Feedback System

**Feature**: 015-community-gallery-feedback
**Date**: 2026-02-18

## Prerequisites

- Node.js 18+, npm
- Running Supabase project (`dyaflmsawxpqgmyojtbc`)
- `.env.local` with DATABASE_URL, Clerk keys, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
- Existing `prompt-images` Supabase Storage bucket (already exists)

## Implementation Order

### Phase 1: Database Schema & Migrations

1. Create 7 new Drizzle schema files in `src/db/schema/`:
   - `gallery-images.ts`, `gallery-likes.ts`
   - `feature-requests.ts`, `feature-votes.ts`
   - `issues.ts`, `issue-status-changes.ts`
   - `notifications.ts`

2. Export all from `src/db/schema/index.ts`

3. Generate and apply migrations:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. Apply RLS policies via Supabase MCP `apply_migration`

5. Run `get_advisors(type: "security")` to verify

### Phase 2: Zod Schemas

Create validation schemas in `src/lib/schemas/`:
- `gallery.ts` — gallery list params, upload body, review body
- `feature-requests.ts` — create body, vote params, list params
- `issues.ts` — create body, status change body, list params
- `notifications.ts` — mark read body, list params

### Phase 3: API Routes

Build in this order (each layer depends on previous):

1. **Notifications** — `GET /api/notifications/count`, `GET /api/notifications`, `PATCH /api/notifications`
2. **Gallery** — `GET /api/gallery`, `GET /api/gallery/[id]`, `POST /api/gallery`, `POST/DELETE /api/gallery/[id]/like`
3. **Feature Requests** — `GET /api/feature-requests`, `POST /api/feature-requests`, `POST/DELETE /api/feature-requests/[id]/vote`
4. **Issues** — `GET/POST /api/issues`
5. **Admin Gallery** — `GET /api/admin/gallery`, `POST /api/admin/gallery/[id]/review`
6. **Admin Issues** — `GET /api/admin/issues`, `PATCH /api/admin/issues/[id]/status`

### Phase 4: i18n Translations

Add translation files for `ar` and `en` locales:
- `gallery.json`, `feature-requests.json`, `issues.json`

### Phase 5: UI Components

Build bottom-up:

1. **NotificationBell** — Header component, polls unread count
2. **MasonryGrid** — CSS columns layout, intersection observer for infinite scroll
3. **GalleryImageCard** — Single card in grid
4. **ImageDetailModal** — Dialog with image + prompt info
5. **GalleryFilters** — Time period + category filter bar
6. **FeatureRequestCard** + **VoteButton** — Card with voting
7. **FeatureRequestList** + **FeatureRequestForm** — Full page components
8. **IssueForm** + **IssueList** — Issue submission and user list
9. **GalleryUploadForm** — Seller upload form
10. **AdminIssueTable** — Admin issues management
11. Admin gallery moderation view

### Phase 6: Pages

1. `/gallery` — Public gallery page (Server Component shell + Client masonry grid)
2. `/feature-requests` — Public feature requests page
3. `/dashboard/issues` — User's issues page
4. `/dashboard/seller/gallery` — Seller's gallery submissions
5. `/dashboard/admin/gallery` — Admin gallery moderation
6. `/dashboard/admin/issues` — Admin issue management

### Phase 7: Integration

1. Add Gallery + Feature Requests links to header navigation
2. Add NotificationBell to header (next to cart)
3. Add sidebar items for new dashboard pages
4. Add "Report Issue" entry point (footer or help menu)
5. Update public route matcher in `src/proxy.ts` for `/gallery` and `/feature-requests`

### Phase 8: Testing & Verification

1. `npm run lint && npm run build` — zero errors
2. Playwright E2E tests for:
   - Gallery browse + infinite scroll
   - Image detail modal (free vs paid prompt)
   - Feature request submit + vote toggle
   - Issue submit + status view
   - Admin moderation flows

## Key Files to Modify (Existing)

| File | Change |
|------|--------|
| `src/db/schema/index.ts` | Add 7 new table exports |
| `src/components/Header.tsx` | Add NotificationBell, Gallery nav link, Feature Requests nav link |
| `src/app/[locale]/dashboard/layout.tsx` | Add sidebar items for Issues, Seller Gallery |
| `src/proxy.ts` | Add `/gallery`, `/feature-requests` to public routes |
| `src/i18n/locales/ar/common.json` | Add nav labels |
| `src/i18n/locales/en/common.json` | Add nav labels |
| `src/i18n/locales/ar/dashboard.json` | Add sidebar labels |
| `src/i18n/locales/en/dashboard.json` | Add sidebar labels |

## Verification Checklist

- [ ] All 7 new tables created and migrated
- [ ] RLS policies applied on all 7 tables
- [ ] Security advisor shows no gaps
- [ ] All API routes return correct status codes
- [ ] Gallery masonry renders on mobile (1 col), tablet (2-3), desktop (4-5)
- [ ] Image detail modal shows prompt text (free) or blurred preview (paid)
- [ ] Voting toggle works with optimistic updates
- [ ] Notification bell shows unread count
- [ ] Issue form submits with optional image
- [ ] Admin can approve/reject gallery images
- [ ] Admin can change issue status with note
- [ ] `npm run lint` passes
- [ ] `npm run build` passes

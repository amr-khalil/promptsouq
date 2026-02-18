# Quickstart: Seller & Admin Dashboards

**Feature**: 014-seller-admin-dashboards
**Branch**: `014-seller-admin-dashboards`

## Prerequisites

1. Node.js 18+, npm
2. `.env.local` with all required environment variables (DATABASE_URL, Clerk keys, Stripe keys)
3. Supabase project running with existing schema applied
4. Clerk account with at least one admin user (`publicMetadata.role = "admin"`)

## Setup

```bash
# Switch to feature branch
git checkout 014-seller-admin-dashboards

# Install dependencies (if any new ones added)
npm install

# Apply new Drizzle migrations (marketplace_settings table + prompts.deletedAt)
npx drizzle-kit generate
npx drizzle-kit migrate

# Seed marketplace settings (if needed)
# The admin settings API will auto-create the row on first GET with defaults

# Start dev server
npm run dev
```

## Testing the Feature

### Admin Dashboard
1. Sign in as a Clerk user with `publicMetadata.role = "admin"`
2. Navigate to `/dashboard/admin/moderation` — see pending prompts queue
3. Click a prompt to review details, approve or reject
4. Navigate to `/dashboard/admin/analytics` — see marketplace metrics
5. Navigate to `/dashboard/admin/orders` — see all orders
6. Navigate to `/dashboard/admin/settings` — view/change commission rate

### Seller Dashboard
1. Sign in as a user with a seller profile (submit a prompt first via `/sell`)
2. Navigate to `/dashboard/seller/prompts` — see your prompts by status
3. Click "Edit" on a prompt — redirects to `/sell?edit=UUID` with pre-populated form
4. Click "Delete" on a prompt — confirmation dialog, then soft-delete
5. Navigate to `/dashboard/seller/earnings` — see sales history and earnings
6. Navigate to `/dashboard/seller/profile` — edit display name, bio, avatar

### Verify Sidebar Navigation
- Buyer-only user: sees standard 6 nav items (Profile, Purchases, Credits, Generations, Favorites, Settings)
- Seller user: sees buyer items + Seller section (My Prompts, Sales & Earnings, Seller Profile)
- Admin user: sees buyer items + Admin section (Moderation, Orders, Analytics, Settings)
- Admin + Seller: sees all three sections

## Key Files

| Area | Path |
|------|------|
| DB Schema (new) | `src/db/schema/marketplace-settings.ts` |
| DB Schema (modified) | `src/db/schema/prompts.ts` (deletedAt) |
| Admin APIs | `src/app/api/admin/stats/`, `orders/`, `settings/` |
| Seller APIs | `src/app/api/seller/earnings/`, `profile/`, `prompts/[id]/` |
| Admin Pages | `src/app/[locale]/dashboard/admin/` |
| Seller Pages | `src/app/[locale]/dashboard/seller/` |
| Sidebar | `src/components/dashboard/DashboardSidebar.tsx` |
| Sell Form (edit) | `src/app/[locale]/sell/page.tsx` |
| i18n | `src/i18n/locales/ar/dashboard.json`, `en/dashboard.json` |

## Verification Commands

```bash
# After every task
npm run lint && npm run build
```

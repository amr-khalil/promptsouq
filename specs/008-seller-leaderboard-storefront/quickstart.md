# Quickstart: Seller Leaderboard & Public Storefront

## Prerequisites

- Node.js 18+, npm
- Supabase project running (project: `dyaflmsawxpqgmyojtbc`)
- `.env.local` with `DATABASE_URL` set

## Setup Steps

### 1. Apply Schema Migration

```bash
# Generate migration from updated Drizzle schema
npx drizzle-kit generate

# Apply migration to Supabase
npx drizzle-kit migrate
```

This adds `display_name`, `avatar`, `bio` columns to `seller_profiles`.

### 2. Seed Database

```bash
# Source env vars and run seed
source .env.local && npx tsx src/db/seed.ts
```

Creates 10 seller profiles + links 100 prompts via `sellerId`.

### 3. Run Dev Server

```bash
npm run dev
```

### 4. Verify

- **Homepage**: http://localhost:3000 — Featured Sellers section shows ranked sellers from DB
- **Leaderboard tabs**: Click "الأعلى تقييماً" / "الأكثر مبيعاً" to toggle sort
- **Storefront**: Click any seller card → `/seller/[sellerId]` page with stats + prompt grid
- **API**: http://localhost:3000/api/sellers?sortBy=rating&limit=8

## Verification Checklist

- [ ] `npm run lint` passes with 0 errors
- [ ] `npm run build` succeeds
- [ ] Homepage loads sellers from API (no hardcoded data)
- [ ] Tabs toggle sort order (rating vs sales)
- [ ] Seller cards link to storefront page
- [ ] Storefront shows correct aggregated stats
- [ ] Storefront shows seller's prompts grid
- [ ] Invalid seller ID returns 404 page
- [ ] Tier badges display correctly (Bronze/Silver/Gold)

## Key Files

| File | Purpose |
|------|---------|
| `src/db/schema/seller-profiles.ts` | Extended schema (3 new columns) |
| `src/db/seed.ts` | Updated seed with seller profiles |
| `src/app/api/sellers/route.ts` | Leaderboard API (NEW) |
| `src/app/api/sellers/[sellerId]/route.ts` | Seller profile API (NEW) |
| `src/app/seller/[sellerId]/page.tsx` | Public storefront page (NEW) |
| `src/components/FeaturedSellers.tsx` | Refactored to fetch from API |
| `src/lib/mappers.ts` | New seller mappers |
| `src/lib/schemas/api.ts` | New Zod schemas |

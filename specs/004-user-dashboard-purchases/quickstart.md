# Quickstart: User Dashboard & Purchases

**Feature**: 004-user-dashboard-purchases
**Branch**: `004-user-dashboard-purchases`

## Prerequisites

- Node.js 18+, npm
- `.env.local` with: `DATABASE_URL`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Supabase project `dyaflmsawxpqgmyojtbc` accessible

## Implementation Order

Follow this order to satisfy dependencies:

### Phase A: Schema & Data Layer

1. **Add `instructions` column to prompts schema** (`src/db/schema/prompts.ts`)
2. **Add `userId` column + unique constraint to reviews schema** (`src/db/schema/reviews.ts`)
3. **Create favorites schema** (`src/db/schema/favorites.ts`)
4. **Update barrel export** (`src/db/schema/index.ts` — add `favorites`)
5. **Generate & apply migration**: `npx drizzle-kit generate && npx drizzle-kit migrate`
6. **Apply RLS policies** for favorites table via Supabase MCP
7. **Run security advisors**: `get_advisors(type: "security")`
8. **Update mappers** (`src/lib/mappers.ts` — add `instructions` to `mapPromptRow`, add `mapPurchaseRow`)
9. **Update Zod schemas** (`src/lib/schemas/api.ts` — add `reviewSubmitSchema`, `favoriteRequestSchema`, `instructions` to `promptSchema`)
10. **Update seed data** (`src/db/seed.ts` — add `instructions` and `userId` to seed records)

### Phase B: API Routes

11. **Enhance purchases API** (`src/app/api/user/purchases/route.ts` — full prompt details in list mode)
12. **Create purchase detail API** (`src/app/api/purchase/[id]/route.ts`)
13. **Add POST/PUT to reviews API** (`src/app/api/prompts/[id]/reviews/route.ts`)
14. **Create user reviews API** (`src/app/api/user/reviews/route.ts`)
15. **Create favorites API** (`src/app/api/favorites/route.ts` — GET, POST)
16. **Create favorites delete API** (`src/app/api/favorites/[promptId]/route.ts` — DELETE)
17. **Create favorites check API** (`src/app/api/favorites/check/route.ts` — GET batch check)

### Phase C: Dashboard Layout & Pages

18. **Delete old profile page** (`src/app/profile/`)
19. **Create dashboard layout** (`src/app/dashboard/layout.tsx` — Server Component with client sidebar)
20. **Create DashboardSidebar component** (`src/components/dashboard/DashboardSidebar.tsx`)
21. **Create profile page** (`src/app/dashboard/page.tsx`)
22. **Create purchases page** (`src/app/dashboard/purchases/page.tsx` — grid with search/filter)
23. **Create PurchaseCard component** (`src/components/dashboard/PurchaseCard.tsx`)
24. **Create favorites page** (`src/app/dashboard/favorites/page.tsx`)
25. **Create FavoriteButton component** (`src/components/dashboard/FavoriteButton.tsx`)
26. **Create settings page** (`src/app/dashboard/settings/page.tsx`)
27. **Add `loading.tsx`** for each dashboard sub-route

### Phase D: Purchase Detail & Reviews

28. **Create purchase detail page** (`src/app/purchase/[id]/page.tsx` + `loading.tsx`)
29. **Create ReviewForm component** (`src/components/reviews/ReviewForm.tsx` — RHF + zodResolver)
30. **Integrate FavoriteButton** into existing prompt cards and prompt detail page

### Phase E: Integration & Polish

31. **Update route protection** (`src/proxy.ts` — verify `/dashboard` and `/purchase` are protected)
32. **Update header nav links** (point to `/dashboard` instead of `/profile`)
33. **Update checkout success page** (add link to `/dashboard/purchases`)
34. **Run `npm run lint && npm run build`** — fix all errors

## Verification Commands

```bash
npm run lint          # Zero errors
npm run build         # Successful production build
npm run dev           # Manual testing at localhost:3000
```

## Key Files to Reference

| What | Where |
|------|-------|
| Existing DB schemas | `src/db/schema/*.ts` |
| Existing mappers | `src/lib/mappers.ts` |
| Existing Zod schemas | `src/lib/schemas/api.ts` |
| Existing purchases API | `src/app/api/user/purchases/route.ts` |
| Existing reviews API | `src/app/api/prompts/[id]/reviews/route.ts` |
| Existing prompt detail | `src/app/prompt/[id]/page.tsx` |
| Route protection | `src/proxy.ts` |
| Cart store (pattern ref) | `src/stores/cartStore.ts` |
| Constitution | `.specify/memory/constitution.md` |

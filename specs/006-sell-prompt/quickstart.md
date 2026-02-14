# Quickstart: 006-sell-prompt

**Date**: 2026-02-14
**Branch**: `006-sell-prompt`

## Prerequisites

1. Existing PromptSouq development environment running (`npm run dev`)
2. Supabase project `dyaflmsawxpqgmyojtbc` accessible
3. Stripe account with Connect enabled
4. Clerk project with at least one user configured as admin (`publicMetadata.role = "admin"`)

## New Environment Variables

Add to `.env.local`:
```
# Stripe Connect (new)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_xxx

# App URL for Stripe return/refresh URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Implementation Order

### Phase 1: Schema & Data Layer

1. **Drizzle schema changes**:
   - Add new columns to `src/db/schema/prompts.ts` (seller_id, status, generation_type, model_version, max_tokens, temperature, example_outputs, example_prompts, rejection_reason, reviewed_at, reviewed_by)
   - Create `src/db/schema/seller-profiles.ts` (new table)
   - Extend `src/db/schema/orders.ts` order_items with commission columns
   - Update barrel export in `src/db/schema/index.ts`

2. **Generate & apply migrations**:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

3. **RLS policies**: Apply via Supabase MCP for `seller_profiles` table and update `prompts` anon SELECT to filter by `status = 'approved'`

4. **Zod schemas**: Add submission schemas to `src/lib/schemas/api.ts`

5. **Mappers**: Extend `src/lib/mappers.ts` with seller submission mapper

### Phase 2: API Routes

6. **Prompt submission**: `POST /api/prompts` — validate, save with status "pending"
7. **Seller dashboard API**: `GET /api/seller/prompts`, `GET /api/seller/stats`
8. **Stripe Connect API**: `POST /api/connect/create-account`, `GET /api/connect/status`, `POST /api/connect/onboarding-link`
9. **Admin review API**: `GET /api/admin/prompts`, `GET /api/admin/prompts/[id]`, `POST /api/admin/prompts/[id]/review`
10. **Connect webhook**: `POST /api/webhooks/stripe-connect`
11. **Modify existing**: Update `GET /api/prompts` with status filter, update checkout with destination charges

### Phase 3: UI

12. **Sell page**: `/sell` — 4-step form with React Hook Form + zodResolver
13. **Seller dashboard rewrite**: `/seller` — replace mock data with real API calls
14. **Admin review page**: `/admin/review` — pending queue + detail view + approve/reject
15. **Loading states**: `loading.tsx` for all new routes

### Phase 4: Integration & Testing

16. **Stripe Connect E2E**: Test onboarding flow with test mode
17. **Checkout modification**: Destination charges for seller prompts
18. **Playwright tests**: Submission flow, seller dashboard, admin review

## Verification

After each task:
```bash
npm run lint && npm run build
```

## Key Files to Create/Modify

### New Files
- `src/db/schema/seller-profiles.ts`
- `src/app/sell/page.tsx` (+ components)
- `src/app/admin/review/page.tsx`
- `src/app/api/seller/prompts/route.ts`
- `src/app/api/seller/stats/route.ts`
- `src/app/api/connect/create-account/route.ts`
- `src/app/api/connect/status/route.ts`
- `src/app/api/connect/onboarding-link/route.ts`
- `src/app/api/admin/prompts/route.ts`
- `src/app/api/admin/prompts/[id]/route.ts`
- `src/app/api/admin/prompts/[id]/review/route.ts`
- `src/app/api/webhooks/stripe-connect/route.ts`
- `src/lib/schemas/sell.ts` (or extend api.ts)

### Modified Files
- `src/db/schema/prompts.ts` — add seller columns
- `src/db/schema/orders.ts` — add commission columns to order_items
- `src/db/schema/index.ts` — add seller_profiles export
- `src/lib/mappers.ts` — add seller submission mapper
- `src/lib/schemas/api.ts` — add new Zod schemas
- `src/app/api/prompts/route.ts` — add status filter
- `src/app/api/checkout/route.ts` — destination charges
- `src/app/api/webhooks/stripe/route.ts` — commission tracking
- `src/app/seller/page.tsx` — rewrite with real API
- `src/proxy.ts` — ensure /sell and /admin are protected

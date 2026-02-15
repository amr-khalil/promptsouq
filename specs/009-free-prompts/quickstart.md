# Quickstart: Free Prompts with Login-Gated Content

**Feature**: 009-free-prompts | **Date**: 2026-02-15

## Prerequisites

- Node.js 18+, npm
- Supabase project `dyaflmsawxpqgmyojtbc` accessible
- `.env.local` with `DATABASE_URL`, Clerk keys, Stripe keys
- Current branch: `009-free-prompts`

## Implementation Order

### Phase 1: Data Layer

1. **Create schema file** `src/db/schema/free-prompt-access.ts`
   - Define `freePromptAccess` table with `pgTable()`
   - Columns: id (serial PK), user_id (text), prompt_id (uuid FK), accessed_at (timestamp)
   - Unique constraint on (user_id, prompt_id)
   - Index on user_id

2. **Export from barrel** `src/db/schema/index.ts`
   - Add `export { freePromptAccess } from "./free-prompt-access"`

3. **Generate & apply migration**
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit migrate
   ```

4. **Apply RLS** via Supabase MCP
   - Enable RLS on `free_prompt_access`
   - anon: no access
   - authenticated: SELECT WHERE `auth.uid()::text = user_id`

5. **Update Zod schemas** `src/lib/schemas/api.ts`
   - Add `isFree` to `promptSubmissionSchema` with `superRefine` for conditional price validation
   - Add `priceType` to `promptsQuerySchema`
   - Add `isFree` and `contentLocked` to `promptSchema`

6. **Update mapper** `src/lib/mappers.ts`
   - Add `mapFreeAccessRow()` function
   - Modify `mapPromptRow()` to include `isFree` computed field

### Phase 2: API Routes

7. **Modify GET /api/prompts/[id]** — add auth-aware content gating for free prompts
8. **Modify GET /api/prompts** — add `priceType` filter parameter
9. **Create POST /api/free-access** — record free prompt access
10. **Create GET /api/free-access** — list user's accessed free prompts
11. **Modify POST /api/prompts/[id]/reviews** — allow reviews on free prompts
12. **Modify POST /api/prompts** — accept `isFree` field, set price to 0
13. **Modify POST /api/checkout** — reject free prompts in cart

### Phase 3: UI Components

14. **Create `ContentLockOverlay`** component — blur effect + sign-in CTA
15. **Modify `PromptDetailsStep`** — add "مجاني" toggle, hide price when active
16. **Modify sell page** — skip payout step when free
17. **Modify prompt detail page** — lock overlay for unauth, no buy buttons for free
18. **Modify `PromptCard`** — show "مجاني" badge
19. **Modify marketplace page** — add price type filter buttons
20. **Modify dashboard purchases page** — add "My Free Prompts" tab
21. **Block cart** — prevent free prompts from being added (client-side)

### Phase 4: Seed & Verify

22. **Update seed script** — add 2-3 free prompts to test data
23. **Run `npm run lint && npm run build`** — verify zero errors
24. **Security check** — `get_advisors(type: "security")` for RLS gaps

## Key Files to Modify

| File | Change |
|------|--------|
| `src/db/schema/free-prompt-access.ts` | NEW — table definition |
| `src/db/schema/index.ts` | Add export |
| `src/lib/schemas/api.ts` | isFree field, priceType param, conditional validation |
| `src/lib/mappers.ts` | mapFreeAccessRow, isFree computed field |
| `src/app/api/prompts/[id]/route.ts` | Content gating logic |
| `src/app/api/prompts/route.ts` | priceType filter, isFree in POST |
| `src/app/api/prompts/[id]/reviews/route.ts` | Skip purchase check for free |
| `src/app/api/free-access/route.ts` | NEW — POST + GET handlers |
| `src/app/api/checkout/route.ts` | Reject free prompts |
| `src/components/prompt/ContentLockOverlay.tsx` | NEW — lock overlay component |
| `src/components/sell/PromptDetailsStep.tsx` | Free toggle + conditional price |
| `src/app/sell/page.tsx` | Skip payout step |
| `src/app/prompt/[id]/page.tsx` | Lock overlay, free badge, no buy buttons |
| `src/components/PromptCard.tsx` | Free badge on cards |
| `src/app/market/page.tsx` | Price type filter UI |
| `src/app/dashboard/purchases/page.tsx` | My Free Prompts tab |
| `src/stores/cart-store.ts` | Block free prompts |
| `src/db/seed.ts` | Add free prompt seed data |

## Verification Checklist

- [ ] Free prompt created via sell form (toggle works, price = 0, payout skipped)
- [ ] Unauthenticated user sees lock overlay on free prompt detail (no content in network tab)
- [ ] Authenticated user sees full content on free prompt detail
- [ ] Free access recorded in `free_prompt_access` table
- [ ] "My Free Prompts" shows in dashboard
- [ ] "مجاني" badge on cards in marketplace and search
- [ ] Price type filter works (All/Free/Paid)
- [ ] Free prompts cannot be added to cart
- [ ] Authenticated users can review free prompts
- [ ] `npm run lint && npm run build` passes
- [ ] RLS advisors show no gaps

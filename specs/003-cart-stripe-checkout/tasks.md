# Tasks: Cart, Toasts, UUID Prompts & Stripe Checkout

**Input**: Design documents from `/specs/003-cart-stripe-checkout/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md

**Tests**: Not explicitly requested in the spec. Test tasks omitted. Manual verification via quickstart.md checklist.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies, configure environment, create shared utilities

- [X] T001 Install stripe and zustand packages via `npm install stripe zustand`
- [X] T002 [P] Create Stripe server client singleton in `src/lib/stripe.ts` — initialize with `STRIPE_SECRET_KEY` env var, export single instance
- [X] T003 [P] Add Zod schemas for UUID param validation (`uuidParamSchema`), checkout request (`checkoutRequestSchema`), and purchase query (`purchaseQuerySchema`) in `src/lib/schemas/api.ts` — per contracts/api.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: UUID schema migration, cart store, toast infrastructure — MUST complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 [P] Update prompts table — change `serial("id")` to `uuid("id").defaultRandom().primaryKey()` in `src/db/schema/prompts.ts`
- [X] T005 [P] Update reviews table — change `prompt_id` column from `integer` to `uuid` type, update FK reference in `src/db/schema/reviews.ts`
- [X] T006 [P] Create orders and order_items table schemas in `src/db/schema/orders.ts` — per data-model.md (orders: uuid PK, user_id, stripe_session_id, amount_total, currency, status; order_items: serial PK, order_id FK, prompt_id FK, price_at_purchase)
- [X] T007 Export orders and orderItems tables from `src/db/schema/index.ts`
- [X] T008 Generate and apply Drizzle migration — run `npx drizzle-kit generate` then `npx drizzle-kit migrate`
- [X] T009 Update seed script to remove `parseInt`-based prompt IDs (let UUID auto-generate), update review FK references to use prompt UUIDs, then re-seed via `npx tsx src/db/seed.ts` in `src/db/seed.ts`
- [X] T010 Apply RLS policies for orders and order_items tables via Supabase MCP — anon: no access; authenticated: SELECT own rows; per data-model.md RLS section
- [X] T011 Run `get_advisors(type: "security")` to verify no RLS gaps on new tables
- [X] T012 [P] Create Zustand cart store with persist middleware in `src/stores/cart-store.ts` — CartItem interface (promptId, title, price, thumbnail), actions (addItem, removeItem, clearCart, isInCart, totalPrice, itemCount), localStorage key `promptsouq-cart`
- [X] T013 [P] Create hydration-safe cart hook in `src/hooks/use-cart.ts` — returns 0 during SSR, syncs from store after mount via useEffect to prevent hydration mismatch
- [X] T014 [P] Add Sonner `<Toaster />` component to root layout in `src/app/layout.tsx` — import from `@/components/ui/sonner`
- [X] T015 Update prompt mappers in `src/lib/mappers.ts` — remove `id: row.id.toString()` conversion (UUID is already a string), keep all other mappings unchanged

**Checkpoint**: Database migrated to UUIDs, cart store ready, toast infrastructure ready. User story implementation can begin.

---

## Phase 3: User Story 3 — Browse Prompts via UUID URLs (Priority: P1) 🎯 MVP

**Goal**: All prompt URLs use UUID format. Numeric IDs return 404. API responses contain UUIDs.

**Independent Test**: Navigate to `/prompt/{uuid}` — correct page loads. Navigate to `/prompt/123` — 404 displayed. Click prompt card on market page — UUID URL in address bar.

### Implementation

- [X] T016 [US3] Update GET `/api/prompts/[id]` route — replace `parseInt(id)` with Zod UUID validation, query by UUID, return 400 for invalid format in `src/app/api/prompts/[id]/route.ts`
- [X] T017 [P] [US3] Update GET `/api/prompts/[id]/reviews` route — replace `parseInt` with UUID validation in `src/app/api/prompts/[id]/reviews/route.ts`
- [X] T018 [P] [US3] Update GET `/api/prompts/[id]/related` route — replace `parseInt` with UUID validation in `src/app/api/prompts/[id]/related/route.ts`
- [X] T019 [P] [US3] Verify PromptCard links use `prompt.id` (now UUID string) in `src/components/PromptCard.tsx` — no change expected since links already use string IDs, but verify href is `/prompt/${prompt.id}`
- [X] T020 [US3] Update prompt details page — remove any `parseInt` on the `id` param, pass UUID string directly to API fetch in `src/app/prompt/[id]/page.tsx`
- [X] T021 [US3] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: All prompt URLs are UUID-based. API routes validate UUID format. Prompt detail pages load correctly with UUID params.

---

## Phase 4: User Story 1 — Add Prompt to Cart with Feedback (Priority: P1)

**Goal**: User clicks "Add to Cart" on prompt details → success toast appears. Cart persists across navigations. Duplicate items show info toast.

**Independent Test**: Navigate to any prompt, click "Add to Cart" → success toast. Reload page → cart still has item. Click "Add to Cart" again → info toast "already in cart".

### Implementation

- [X] T022 [US1] Wire "Add to Cart" button on prompt details page — import cart store, on click: check `isInCart()`, if yes show info toast (Arabic: "هذا المنتج موجود بالفعل في السلة"), if no call `addItem()` and show success toast (Arabic: "تمت الإضافة إلى السلة") in `src/app/prompt/[id]/page.tsx`
- [X] T023 [US1] Rebuild cart page to use Zustand store — replace mock API fetch with `useCartStore`, wire `removeItem()` with toast (Arabic: "تم الحذف من السلة"), calculate subtotal/tax/total from store items, link "إتمام الشراء" to `/checkout` in `src/app/cart/page.tsx`
- [X] T024 [US1] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: Cart fully functional with localStorage persistence. Toast feedback on add/remove/duplicate. Cart page displays real cart items.

---

## Phase 5: User Story 2 — View Cart Count in Header (Priority: P1)

**Goal**: Header cart icon shows a badge with the number of items in the cart. Badge updates instantly on add/remove. Persists across reload.

**Independent Test**: Add 2 items to cart → badge shows "2". Remove 1 → badge shows "1". Reload → badge still shows "1". Empty cart → no badge shown.

### Implementation

- [X] T025 [US2] Add cart count badge to cart icon in Header — import `useCartItemCount` hook, render count badge (use shadcn Badge or styled span) next to ShoppingCart icon, hide badge when count is 0, ensure mobile and desktop layouts both show badge in `src/components/Header.tsx`
- [X] T026 [US2] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: Header badge shows accurate, real-time cart count across all pages. Survives page reload.

---

## Phase 6: User Story 5 — Improved Prompt Details Page (Priority: P2)

**Goal**: "Buy Now" button adds item to cart and navigates to checkout. Both action buttons are fully functional.

**Independent Test**: Click "Buy Now" on any prompt → item added to cart + navigated to `/checkout`. Cart contains the prompt.

### Implementation

- [X] T027 [US5] Implement "Buy Now" button — on click: call `addItem()` from cart store (skip if already in cart), then `router.push("/checkout")`, show success toast in `src/app/prompt/[id]/page.tsx`
- [X] T028 [US5] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: Both "Add to Cart" and "Buy Now" buttons fully functional on prompt details page.

---

## Phase 7: User Story 4 — Complete Purchase with Stripe (Priority: P2)

**Goal**: User checks out → redirected to Stripe → pays with test card → returns to success page → cart cleared → order stored in DB.

**Independent Test**: Add items, go to checkout, complete payment with test card `4242 4242 4242 4242` → see success confirmation. Check `orders` table for new row. Cart is empty.

### Implementation

- [X] T029 [US4] Implement POST `/api/checkout` route — verify Clerk auth, validate body with `checkoutRequestSchema`, fetch prompts from DB, create Stripe Checkout Session with `price_data` line items (unit_amount = `Math.round(price * 100)`), mode "payment", success/cancel URLs, client_reference_id = userId, metadata with promptIds, return session.url in `src/app/api/checkout/route.ts`
- [X] T030 [US4] Implement POST `/api/webhooks/stripe` route — read raw body via `request.text()`, verify signature with `stripe.webhooks.constructEvent()`, handle `checkout.session.completed` event: extract userId from client_reference_id, create order + order_items rows in DB, return 200 in `src/app/api/webhooks/stripe/route.ts`
- [X] T031 [US4] Update checkout page — check Clerk auth (redirect to sign-in if not), read cart from store, POST to `/api/checkout` with cart item UUIDs, redirect to `session.url`, show loading state during API call in `src/app/checkout/page.tsx`
- [X] T032 [US4] Create checkout success page — retrieve session_id from URL params, display Arabic success message, clear cart via store's `clearCart()`, link back to marketplace in `src/app/checkout/success/page.tsx`
- [X] T033 [P] [US4] Create loading skeleton for checkout success page in `src/app/checkout/success/loading.tsx`
- [X] T034 [US4] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: Full purchase flow works end-to-end with Stripe test card. Orders stored in DB. Cart cleared on success.

---

## Phase 8: User Story 6 — Access Purchased Prompt Content (Priority: P2)

**Goal**: Buyer revisits prompt page → sees "Purchased" badge, fullContent revealed, purchase buttons hidden.

**Independent Test**: After purchasing a prompt, navigate to its detail page → full content visible, "Purchased" badge shown, no "Add to Cart"/"Buy Now" buttons.

### Implementation

- [X] T035 [US6] Implement GET `/api/user/purchases` route — verify Clerk auth, query order_items joined with orders where user_id matches, support optional `promptId` query param for single-prompt check, return purchased prompt UUIDs array or boolean in `src/app/api/user/purchases/route.ts`
- [X] T036 [US6] Add purchased state to prompt details page — if user is authenticated, fetch `/api/user/purchases?promptId={id}`, if purchased: show "Purchased" badge (Arabic: "تم الشراء"), reveal fullContent section, hide "Add to Cart" and "Buy Now" buttons in `src/app/prompt/[id]/page.tsx`
- [X] T037 [US6] Run `npm run lint && npm run build` — fix all errors before proceeding

**Checkpoint**: Purchased prompts show full content and "Purchased" badge. Non-purchased prompts show normal purchase buttons.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, final verification, build validation

- [X] T038 Handle edge case: stale/deleted prompts in cart — on cart page, validate cart items still exist via API, show notice and remove button for missing prompts in `src/app/cart/page.tsx`
- [ ] T039 Run full quickstart.md verification checklist — test all 11 items manually
- [X] T040 Final `npm run lint && npm run build` — zero errors required

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US3 (Phase 3)**: Depends on Phase 2 — foundational data model change
- **US1 (Phase 4)**: Depends on Phase 2 + Phase 3 (cart references UUIDs)
- **US2 (Phase 5)**: Depends on Phase 4 (needs cart store wired to UI)
- **US5 (Phase 6)**: Depends on Phase 4 (needs cart + toast on prompt details)
- **US4 (Phase 7)**: Depends on Phase 4 + Phase 6 (needs functional cart + checkout initiation)
- **US6 (Phase 8)**: Depends on Phase 7 (needs orders table populated via webhook)
- **Polish (Phase 9)**: Depends on all user stories complete

### User Story Dependencies

```
Phase 1 (Setup)
  └→ Phase 2 (Foundational)
       └→ Phase 3 (US3: UUID URLs) ←── foundational for all
            └→ Phase 4 (US1: Cart + Toast)
                 ├→ Phase 5 (US2: Header Badge)
                 └→ Phase 6 (US5: Prompt Details)
                      └→ Phase 7 (US4: Stripe Checkout)
                           └→ Phase 8 (US6: Purchased Content)
                                └→ Phase 9 (Polish)
```

### Within Each User Story

- Schema/model changes before API routes
- API routes before UI integration
- Core implementation before polish
- `npm run lint && npm run build` at end of each phase

### Parallel Opportunities

**Phase 2 (Foundational)**:
```
Parallel group A: T004, T005, T006 (different schema files)
Parallel group B: T012, T013, T014 (different files: store, hook, layout)
```

**Phase 3 (US3)**:
```
Parallel: T017, T018, T019 (different route/component files)
```

**Phase 7 (US4)**:
```
Parallel: T029, T030 (different API route files — checkout vs webhook)
T033 parallel with T032 (different files — loading.tsx vs page.tsx)
```

---

## Implementation Strategy

### MVP First (User Stories 1-3: P1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (UUID migration + cart store + toast)
3. Complete Phase 3: US3 (UUID URLs work)
4. Complete Phase 4: US1 (Cart + toast functional)
5. Complete Phase 5: US2 (Header badge)
6. **STOP and VALIDATE**: All P1 stories independently functional
7. Deploy/demo if ready — users can browse by UUID, add to cart, see badge

### Full Delivery (Add P2 Stories)

7. Complete Phase 6: US5 (Buy Now button)
8. Complete Phase 7: US4 (Stripe Checkout — requires Stripe API keys)
9. Complete Phase 8: US6 (Purchased content access)
10. Complete Phase 9: Polish
11. Full end-to-end purchase flow validated

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks in same phase
- [Story] label maps task to specific user story for traceability
- Each phase ends with `npm run lint && npm run build` per constitution
- Stripe webhook testing requires Stripe CLI: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
- All toast messages MUST be in Arabic per constitution principle I
- Cart store uses `promptsouq-cart` as localStorage key
- Price conversion to cents: `Math.round(price * 100)` at checkout API boundary only

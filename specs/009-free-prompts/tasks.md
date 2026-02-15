# Tasks: Free Prompts with Login-Gated Content

**Input**: Design documents from `/specs/009-free-prompts/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted. Verification via `npm run lint && npm run build` after each phase.

**Organization**: Tasks grouped by user story. Each story is independently testable after its phase completes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Shared Schema & Data)

**Purpose**: Update shared Zod schemas, mappers, and seed data that multiple user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T001 Update `promptSchema` in `src/lib/schemas/api.ts` — add `isFree: z.boolean()` and `contentLocked: z.boolean().optional()` computed response fields. These are API response fields only (not DB columns).
- [X] T002 [P] Update `mapPromptRow()` in `src/lib/mappers.ts` — add `isFree: row.price === 0` computed field to the returned object. All API responses now include `isFree`.
- [X] T003 [P] Add 3 free prompts (price = 0, status = "approved") to seed data in `src/db/seed.ts`. Distribute across different categories and sellers. Reseed the database.
- [X] T004 Verify foundational changes compile: `npm run lint && npm run build`

**Checkpoint**: Shared schemas and seed data ready. User story implementation can begin.

---

## Phase 2: User Story 1 — Seller Publishes a Free Prompt (Priority: P1) MVP

**Goal**: Sellers can create free prompts via a dedicated toggle, skipping payout setup.

**Independent Test**: Log in as a seller, navigate to `/sell`, activate the "مجاني" toggle, fill in prompt details and content, submit. Prompt is created with price = 0 without Stripe onboarding.

### Implementation for User Story 1

- [X] T005 [US1] Add `isFree: z.boolean().default(false)` field to `promptSubmissionSchema` in `src/lib/schemas/api.ts`. Replace the standalone `.min(1.99)` price constraint with a `superRefine` that enforces min $1.99 only when `isFree` is false. When `isFree` is true, price is ignored (set to 0 by handler). Per research R-002.
- [X] T006 [US1] Add "مجاني" (Free) toggle to `src/components/sell/PromptDetailsStep.tsx`. Use shadcn `Switch` component. When active: hide the price `FormField`, set form value `isFree: true`. When inactive: show price field with existing min/max validation. Place toggle above the price field in the form layout.
- [X] T007 [US1] Modify sell page step progression in `src/app/sell/page.tsx`. When form value `isFree` is true: skip Step 3 (PayoutStep), submit the prompt at the end of Step 2 (PromptFileStep), advance directly to Step 4 (ConfirmationStep). Update `StepIndicator` to show 3 steps ("تفاصيل البرومبت" / "ملف البرومبت" / "تأكيد") when isFree is active. Per research R-008.
- [X] T008 [US1] Update POST handler in `src/app/api/prompts/route.ts`. Accept `isFree` from validated body. Set `price: data.isFree ? 0 : data.price` when inserting into DB. The `isFree` field is NOT stored in the database — only `price` is persisted.
- [X] T009 [US1] Verify: `npm run lint && npm run build`

**Checkpoint**: Sellers can create free prompts. The sell form correctly toggles between free/paid flows.

---

## Phase 3: User Story 2 — Visitor Sees Locked Free Prompt (Priority: P1)

**Goal**: Unauthenticated visitors see free prompt metadata with content locked behind a blur overlay + sign-in CTA. Free prompt cards show "مجاني" badge.

**Independent Test**: Visit `/prompt/{free-prompt-id}` while logged out. Full content and examples are NOT in the network response. A lock overlay with sign-in CTA is displayed. Marketplace cards show "مجاني" badge.

### Implementation for User Story 2

- [X] T010 [US2] Modify GET handler in `src/app/api/prompts/[id]/route.ts`. Import `checkAuth` from `@/lib/auth`. After fetching the prompt, compute `isFree = prompt.price === 0`. If `isFree && !userId`: set `fullContent`, `samples`, `exampleOutputs`, `examplePrompts`, `instructions` to null/empty, add `contentLocked: true` to response. Otherwise: `contentLocked: false`. Always include `isFree` in response. Per contract `get-prompt-detail.md`.
- [X] T011 [P] [US2] Create `ContentLockOverlay` component in `src/components/prompt/ContentLockOverlay.tsx`. Client component using shadcn `Card`, `Button`, and Lucide `Lock` icon. Renders a decorative blurred placeholder area (gradient + `backdrop-blur-xl`) with centered Arabic CTA: "سجل دخولك لرؤية المحتوى". Two buttons: "تسجيل الدخول" (sign in) and "إنشاء حساب" (register). Both link to `/sign-in?redirect_url={currentPath}` and `/sign-up?redirect_url={currentPath}` respectively. Mobile-first, RTL-aware layout. Per research R-004.
- [X] T012 [US2] Update prompt detail page `src/app/prompt/[id]/page.tsx`. When `prompt.contentLocked === true`: render `ContentLockOverlay` in place of fullContent and samples sections. When `prompt.isFree === true`: hide "شراء الآن" and "إضافة للسلة" buttons (regardless of auth state). Add "مجاني" `Badge` next to the price display in the prompt header. Pass current path to overlay for redirect URL.
- [X] T013 [P] [US2] Add "مجاني" badge to `src/components/PromptCard.tsx`. When `prompt.price === 0` (or `prompt.isFree === true`): display a green shadcn `Badge` with text "مجاني" instead of the price. Hide the "Add to Cart" button in the card preview modal for free prompts.
- [X] T014 [US2] Verify: `npm run lint && npm run build`

**Checkpoint**: Unauthenticated visitors see locked content with badges. No content leaks in network tab (FR-014).

---

## Phase 4: User Story 3 — Logged-in User Accesses Free Prompt Content (Priority: P1)

**Goal**: Authenticated users see full free prompt content immediately. Access is tracked in a new table. Users can review free prompts. Dashboard shows "My Free Prompts" tab.

**Independent Test**: Log in, visit `/prompt/{free-prompt-id}`. Full content visible, no buy buttons. Access recorded in DB. Review submission works. Dashboard shows prompt under "Free Prompts" tab.

### Implementation for User Story 3

- [X] T015 [P] [US3] Create `freePromptAccess` Drizzle schema in `src/db/schema/free-prompt-access.ts`. Table `free_prompt_access` with: `id` (serial PK), `userId` (text, not null), `promptId` (uuid FK → prompts.id, not null), `accessedAt` (timestamp with timezone, default now). Add unique constraint on `(userId, promptId)`. Add index on `userId`. Per data-model.md.
- [X] T016 [US3] Export `freePromptAccess` from barrel file `src/db/schema/index.ts`.
- [X] T017 [US3] Generate and apply Drizzle migration: run `npx drizzle-kit generate` then `npx drizzle-kit migrate`. Verify the migration creates the `free_prompt_access` table with correct columns and constraints.
- [X] T018 [US3] Apply RLS policies on `free_prompt_access` table via Supabase MCP `apply_migration`. Enable RLS. Policies: anon — no access; authenticated — SELECT where `auth.uid()::text = user_id`. Then run `get_advisors(type: "security")` to verify no gaps.
- [X] T019 [US3] Add `mapFreeAccessRow()` function to `src/lib/mappers.ts`. Maps a joined `free_prompt_access` + `prompts` row to the dashboard list item shape: `{ id, title, titleEn, thumbnail, aiModel, category, seller: { name, avatar, rating }, accessedAt }`.
- [X] T020 [US3] Create `src/app/api/free-access/route.ts` with POST and GET handlers. POST: authenticate, validate `{ promptId }`, verify prompt exists and price === 0, INSERT ON CONFLICT DO NOTHING, return 201/200 with accessedAt. GET: authenticate, query `free_prompt_access` joined with `prompts` for current user, ORDER BY `accessed_at` DESC, return paginated list with `total`. Per contracts `post-free-access.md` and `get-free-access.md`.
- [X] T021 [US3] Update prompt detail page `src/app/prompt/[id]/page.tsx` — for authenticated users viewing a free prompt (`isFree && !contentLocked`): show full content and samples sections directly (no purchase check needed). Fire `POST /api/free-access` with `{ promptId }` after content loads (fire-and-forget, don't block rendering). Ensure no duplicate calls via a ref guard.
- [X] T022 [P] [US3] Modify POST handler in `src/app/api/prompts/[id]/reviews/route.ts`. Before the existing purchase ownership check, fetch the prompt's price. If `price === 0`: skip the purchase check entirely and allow any authenticated user to submit a review. If `price > 0`: keep existing purchase verification logic. Per research R-007.
- [X] T023 [US3] Add "برومبتات مجانية" (Free Prompts) tab to `src/app/dashboard/purchases/page.tsx`. Add shadcn `Tabs` component with two tabs: "مشترياتي" (existing purchases list) and "برومبتات مجانية" (new free prompts list). Free tab fetches from GET `/api/free-access`. Display items using a card layout matching `PurchaseCard` style, showing access date instead of purchase date. Include empty state: "لم تقم بالوصول إلى أي برومبتات مجانية بعد". Per research R-009.
- [X] T024 [US3] Verify: `npm run lint && npm run build`

**Checkpoint**: Full free prompt access flow works end-to-end. Authenticated users see content, access is tracked, reviews work, dashboard shows free prompts.

---

## Phase 5: User Story 4 — User Filters by Free Prompts (Priority: P2)

**Goal**: Marketplace has a price type filter (All / Free / Paid) that integrates with existing filters.

**Independent Test**: Visit `/market`, select "مجاني" filter. Only free prompts (price = 0) appear. Combine with category filter — both apply.

### Implementation for User Story 4

- [X] T025 [US4] Add `priceType` filter logic to GET handler in `src/app/api/prompts/route.ts`. Add `priceType` to the `promptsQuerySchema` as `z.enum(["all", "free", "paid"]).default("all").optional()`. In the query builder: if `"free"` → `conditions.push(eq(prompts.price, 0))`; if `"paid"` → `conditions.push(gt(prompts.price, 0))`; `"all"` → no additional condition. Per contract `get-prompts-filter.md`.
- [X] T026 [US4] Add price type filter UI to marketplace page `src/app/market/page.tsx`. Add a segmented button group (3 buttons: "الكل" / "مجاني" / "مدفوع") in the filter sidebar/area. Wire to URL search params as `priceType`. Integrate with existing filter state — selecting a price type triggers a re-fetch with the new param. Style as active/inactive toggle buttons using shadcn `Button` variants.
- [X] T027 [US4] Verify: `npm run lint && npm run build`

**Checkpoint**: Marketplace filtering works with All/Free/Paid options.

---

## Phase 6: User Story 5 — Free Prompt in Search Results (Priority: P2)

**Goal**: Free prompts display "مجاني" badge in search results. "Price low to high" sort places free prompts first.

**Independent Test**: Search for a keyword matching a free prompt. Card shows "مجاني" badge. Sort by "price low to high" — free prompts appear at top.

### Implementation for User Story 5

- [X] T028 [US5] Verify search result badge and sort behavior. The "مجاني" badge on PromptCard (T013) already applies to search results since the same component is used. The "price low to high" sort already places price=0 first via `asc(prompts.price)` in the existing sort logic. Manually verify both behaviors work correctly with seeded free prompts. No code changes expected — this story is satisfied by US2 and US4 implementation.

**Checkpoint**: Free prompts are discoverable in search with correct badge and sort order.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Defensive safety nets and final verification across all stories

- [X] T029 [P] Block free prompts from cart — add price check guard in `src/stores/cart-store.ts` `addItem()` to reject items with `price === 0` (with toast: "البرومبتات المجانية لا تحتاج إلى سلة"). Also add server-side guard in `src/app/api/checkout/route.ts` POST handler to reject any cart containing a prompt with price = 0 (return 400).
- [X] T030 Run security advisor check via Supabase MCP `get_advisors(type: "security")` to verify no RLS gaps on `free_prompt_access` and existing tables.
- [X] T031 Final comprehensive verification: `npm run lint && npm run build`. Verify all features work together.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately. BLOCKS all user stories.
- **US1 (Phase 2)**: Depends on Foundational. No dependencies on other stories.
- **US2 (Phase 3)**: Depends on Foundational. No strict dependency on US1, but benefits from having free prompts in DB (T003 seeds provide this).
- **US3 (Phase 4)**: Depends on Foundational. Benefits from US2 (lock overlay already exists for detail page context). Creates its own DB table independently.
- **US4 (Phase 5)**: Depends on Foundational. Independent of US1/US2/US3.
- **US5 (Phase 6)**: Depends on US2 (PromptCard badge) and US4 (filter). Verification only.
- **Polish (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

```
Foundational ──┬──► US1 (Seller creates free prompt)
               ├──► US2 (Visitor sees locked content + badge) ───┐
               ├──► US3 (Authed user sees content + tracking)    ├──► US5 (Search badge — verify only)
               └──► US4 (Marketplace filter) ────────────────────┘
                                                                  └──► Polish (cart blocking, security)
```

### Within Each User Story

- Schema/validation changes before API route changes
- API route changes before UI component changes
- Shared components before page-level integration
- Verify (`lint && build`) at end of each phase

### Parallel Opportunities

**Within Foundational**: T002 and T003 can run in parallel (different files)

**Within US2**: T011 and T013 can run in parallel (different component files)

**Within US3**: T015 and T022 can run in parallel (different files). T019 can start after T015 (needs type).

**Cross-story parallelism**: After Foundational, US1, US2, US3, and US4 can all start in parallel if team capacity allows.

---

## Parallel Example: User Story 2

```bash
# Launch parallel tasks (different files, no dependencies):
Task: "Create ContentLockOverlay in src/components/prompt/ContentLockOverlay.tsx"     # T011
Task: "Add مجاني badge to src/components/PromptCard.tsx"                              # T013

# Then sequential (depends on T011):
Task: "Update prompt detail page src/app/prompt/[id]/page.tsx"                        # T012
```

## Parallel Example: User Story 3

```bash
# Launch parallel tasks (different files):
Task: "Create freePromptAccess schema in src/db/schema/free-prompt-access.ts"         # T015
Task: "Modify reviews route in src/app/api/prompts/[id]/reviews/route.ts"             # T022

# Then sequential chain (T015 → T016 → T017 → T018 → T020 → T021 → T023):
Task: "Export from barrel, generate migration, apply RLS, create API, update UI, add dashboard tab"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Foundational (schemas, mapper, seed)
2. Complete Phase 2: US1 — Seller can create free prompts
3. Complete Phase 3: US2 — Visitors see locked content with badges
4. **STOP and VALIDATE**: Free prompts exist, content is gated, badges visible
5. Deploy/demo if ready — core free prompt experience works

### Full Delivery (All Stories)

1. Foundational → US1 → US2 → **MVP ready**
2. US3 → Access tracking + reviews + dashboard
3. US4 → Marketplace filter
4. US5 → Verify search (no new code)
5. Polish → Cart blocking + security check
6. **Feature complete**

### Parallel Team Strategy

With multiple developers after Foundational:
- **Developer A**: US1 (sell form) → US4 (marketplace filter)
- **Developer B**: US2 (content gating + badge) → US5 (verify search)
- **Developer C**: US3 (access tracking + dashboard + reviews) → Polish

---

## Notes

- [P] tasks = different files, no dependencies — safe for parallel execution
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable after its phase
- Commit after each task or logical group
- `npm run lint && npm run build` is mandatory after each phase — fix all errors before proceeding
- No Playwright E2E tests included (not explicitly requested). Add if desired via `/speckit.tasks` with test flag.

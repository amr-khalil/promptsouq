# Tasks: Sell Prompt

**Input**: Design documents from `/specs/006-sell-prompt/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Test tasks omitted.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment and type configuration needed before any feature work.

- [x] T001 Add Clerk custom metadata type augmentation for admin role in `src/types/clerk.d.ts` — declare `publicMetadata.role` as `string | undefined` so `sessionClaims?.metadata?.role` is typed
- [x] T002 [P] Add new environment variables to `.env.local`: `STRIPE_CONNECT_WEBHOOK_SECRET`, `NEXT_PUBLIC_APP_URL` — document in quickstart but do NOT commit secrets
- [x] T003 [P] Create admin auth helper function `isAdmin(sessionClaims)` in `src/lib/auth.ts` — checks `sessionClaims?.metadata?.role === "admin"`, returns boolean. Reusable across all admin API routes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, migrations, RLS, Zod schemas, and mappers that ALL user stories depend on.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Extend prompts Drizzle schema in `src/db/schema/prompts.ts` — add columns: `sellerId` (text, nullable), `status` (text, notNull, default "approved"), `generationType` (text, nullable), `modelVersion` (text, nullable), `maxTokens` (integer, nullable), `temperature` (real, nullable), `exampleOutputs` (text array, nullable), `examplePrompts` (jsonb, nullable), `rejectionReason` (text, nullable), `reviewedAt` (timestamp with tz, nullable), `reviewedBy` (text, nullable). Add indexes on `sellerId`, `status`, and composite `(sellerId, status)`.
- [x] T005 [P] Create seller_profiles Drizzle schema in `src/db/schema/seller-profiles.ts` — new table with columns: `userId` (text, PK), `stripeAccountId` (text, unique nullable), `country` (text, nullable), `chargesEnabled` (boolean, default false), `payoutsEnabled` (boolean, default false), `detailsSubmitted` (boolean, default false), `totalEarnings` (integer, default 0), `totalSales` (integer, default 0), `createdAt`, `updatedAt`. Export from `src/db/schema/index.ts`.
- [x] T006 [P] Extend order_items schema in `src/db/schema/orders.ts` — add columns: `referralSource` (text, nullable), `commissionRate` (real, nullable), `sellerPayoutAmount` (integer, nullable), `sellerStripeAccountId` (text, nullable)
- [x] T007 Generate and apply Drizzle migrations — run `npx drizzle-kit generate` then `npx drizzle-kit migrate`. Verify all 3 schema changes (prompts extensions, seller_profiles table, order_items extensions) are reflected in generated SQL in `drizzle/` directory.
- [x] T008 Apply RLS policies via Supabase MCP for `seller_profiles` table — anon: no access; authenticated: SELECT/INSERT/UPDATE own profile (`auth.uid()::text = user_id`). Update existing `prompts` anon SELECT policy to add `status = 'approved'` filter. Run `get_advisors(type: "security")` to verify no RLS gaps.
- [x] T009 Add Zod schemas for sell feature in `src/lib/schemas/api.ts` — add: `promptSubmissionSchema` (all fields from POST /api/prompts contract with Arabic error messages, [variable] pattern validation via regex `.refine()`), `sellerPromptsQuerySchema` (status enum, search string, sortBy enum), `adminPromptsQuerySchema` (status enum, limit), `adminReviewSchema` (action enum approve/reject, reason string required when action=reject via `.refine()`), `connectAccountSchema` (country ISO code). Export inferred types.
- [x] T010 [P] Add seller-related mappers in `src/lib/mappers.ts` — add: `mapSellerPromptRow()` (maps DB row to seller dashboard response shape with status, rejectionReason, generationType), `mapAdminPromptRow()` (maps DB row to admin review response with full details including seller info, template, examples), `mapSellerStatsRow()` (aggregates prompt counts by status)
- [x] T011 Modify GET `/api/prompts` route in `src/app/api/prompts/route.ts` — add `eq(prompts.status, "approved")` condition to the WHERE clause so only approved prompts appear in public marketplace listings and search. Verify existing marketplace/search pages still work correctly.

**Checkpoint**: Foundation ready — all schema, validation, and data access patterns in place. User story implementation can begin.

---

## Phase 3: User Story 1 — Submit a Prompt for Sale (Priority: P1) MVP

**Goal**: An authenticated user completes a 4-step form to submit a prompt for sale. The prompt is saved with status "pending". Stripe Connect onboarding is integrated for payouts.

**Independent Test**: Authenticated user navigates to `/sell`, completes all 4 steps, and the prompt appears in the database with `status = "pending"` and correct `seller_id`.

### Implementation for User Story 1

- [x] T012 [US1] Implement POST handler in `src/app/api/prompts/route.ts` — validate request body with `promptSubmissionSchema`, check Clerk auth via `auth()`, populate `sellerId` from Clerk userId, populate `sellerName`/`sellerAvatar`/`sellerRating` from Clerk user profile via `currentUser()`, set `status = "pending"`, insert into prompts table via Drizzle, return `{ data: { id, status, title, createdAt } }` with 201. Handle validation errors with `apiErrorResponse()` and Zod `.flatten()`.
- [x] T013 [P] [US1] Implement POST `/api/connect/create-account` in `src/app/api/connect/create-account/route.ts` — check Clerk auth, check if seller already has a profile with Stripe account (409 if exists), create Stripe Connect Express account via `stripe.accounts.create({ type: "express", metadata: { clerk_user_id } })`, upsert seller_profiles row with stripeAccountId and country, generate Account Link via `stripe.accountLinks.create()` with return/refresh URLs using `NEXT_PUBLIC_APP_URL`, return `{ data: { accountId, onboardingUrl } }` with 201.
- [x] T014 [P] [US1] Implement GET `/api/connect/status` in `src/app/api/connect/status/route.ts` — check Clerk auth, query seller_profiles by userId, if no profile return `{ hasAccount: false, ... }`, if profile exists retrieve Stripe account via `stripe.accounts.retrieve()` and return `{ hasAccount, chargesEnabled, payoutsEnabled, detailsSubmitted, isFullyOnboarded }`.
- [x] T015 [P] [US1] Implement POST `/api/connect/onboarding-link` in `src/app/api/connect/onboarding-link/route.ts` — check Clerk auth, query seller_profiles for stripeAccountId (404 if none), generate fresh Account Link via `stripe.accountLinks.create()`, return `{ data: { url } }`.
- [x] T016 [US1] Implement Stripe Connect webhook in `src/app/api/webhooks/stripe-connect/route.ts` — read raw body with `request.text()`, verify signature with `STRIPE_CONNECT_WEBHOOK_SECRET`, handle `account.updated` event: extract `account.id`, find seller_profiles row by stripeAccountId, update `chargesEnabled`, `payoutsEnabled`, `detailsSubmitted`. Return `{ received: true }`.
- [x] T017 [US1] Create StepIndicator component in `src/components/sell/StepIndicator.tsx` — renders a 4-step progress bar with Arabic labels (١/٤ تفاصيل البرومبت, ٢/٤ ملف البرومبت, ٣/٤ تفعيل المدفوعات, ٤/٤ تأكيد). Active/completed/upcoming states with visual styling. Mobile-first, RTL layout. Uses shadcn UI primitives.
- [x] T018 [P] [US1] Create PromptDetailsStep component in `src/components/sell/PromptDetailsStep.tsx` — Step 1/4 form fields: generation type (Select), AI model (Select), name (Input, max 60 chars with counter), description (Textarea, max 500 chars with counter), price (Input number, $1.99–$99.99), category (Select, loaded from `/api/categories`), difficulty (Select). All labels and placeholders in Arabic. Uses shadcn Form fields with React Hook Form context. Receives `form` prop from parent.
- [x] T019 [P] [US1] Create PromptFileStep component in `src/components/sell/PromptFileStep.tsx` — Step 2/4 form fields: prompt template (Textarea with token counter, max 8192 tokens, validates [variable] pattern), model version (Input), max tokens (Input number), temperature (Input number 0–2), example outputs (4 Textarea fields, all required), example prompts (4 dynamic key-value input groups based on detected [variables] from template), buyer instructions (Textarea). Uses shadcn Form fields. Receives `form` prop.
- [x] T020 [P] [US1] Create PayoutStep component in `src/components/sell/PayoutStep.tsx` — Step 3/4: fetches Connect status from `GET /api/connect/status`. If not connected: shows country Select + "تفعيل المدفوعات" Button that calls `POST /api/connect/create-account` and redirects to Stripe onboarding URL. If connected: shows green checkmark with "تم ربط حساب Stripe" status. If partially onboarded: shows warning with "إكمال الإعداد" button that calls `POST /api/connect/onboarding-link`. Does NOT use React Hook Form (separate flow from form data).
- [x] T021 [P] [US1] Create ConfirmationStep component in `src/components/sell/ConfirmationStep.tsx` — Step 4/4: displays success message "تم رفع البرومبت بنجاح! 🎉", review timeline text ("عادةً ما تستغرق المراجعة من 15 دقيقة إلى 36 ساعة"), and CTA buttons: "عرض البرومبتات الخاصة بي" (link to /seller) and "رفع برومبت آخر" (resets form).
- [x] T022 [US1] Create sell page in `src/app/sell/page.tsx` — "use client" component. Single `useForm()` instance with `zodResolver(promptSubmissionSchema)`. Manages current step state (1–4). Step navigation: "التالي" (next) button triggers `form.trigger(stepFields)` for validation; "رجوع" (back) button decrements step. On step 3→4 transition: calls `POST /api/prompts` with complete form data. Shows toast on success/error via Sonner. Renders StepIndicator + current step component. Mobile-first layout.
- [x] T023 [US1] Create Stripe Connect return handler in `src/app/seller/onboarding/complete/page.tsx` — Server component that redirects to `/sell` (or back to the sell form step 3) after Stripe onboarding completes. Checks Connect status to show appropriate message.
- [x] T024 [US1] Add loading skeleton in `src/app/sell/loading.tsx` — shadcn Skeleton components matching the sell form layout shape (step indicator skeleton + form field skeletons).
- [x] T025 [US1] Verify lint and build — run `npm run lint && npm run build`, fix any errors.

**Checkpoint**: User Story 1 complete. An authenticated user can submit a prompt via the 4-step form, connect Stripe, and see the prompt saved as "pending". This is the MVP.

---

## Phase 4: User Story 2 — Seller Dashboard (Priority: P2)

**Goal**: A seller can view all their submitted prompts with status badges, search, filter by status, sort by date, and see summary statistics.

**Independent Test**: A seller with multiple prompts (pending/approved/rejected) sees them all listed with correct statuses, can filter and search, and sees accurate stats.

### Implementation for User Story 2

- [x] T026 [P] [US2] Implement GET `/api/seller/prompts` in `src/app/api/seller/prompts/route.ts` — check Clerk auth, validate query params with `sellerPromptsQuerySchema`, query prompts where `sellerId = userId` with optional status filter, search via `ilike` on title, sort by `createdAt` (newest/oldest), map rows via `mapSellerPromptRow()`, return `{ data: [...] }`.
- [x] T027 [P] [US2] Implement GET `/api/seller/stats` in `src/app/api/seller/stats/route.ts` — check Clerk auth, run aggregate queries: `COUNT(*)` total prompts for seller, `COUNT(*) WHERE status = X` for each status, `SUM(sales)` total sales, `total_earnings` from seller_profiles. Return `{ data: { totalPrompts, approvedCount, pendingCount, rejectedCount, totalSales, totalEarnings } }`.
- [x] T028 [US2] Rewrite seller dashboard page in `src/app/seller/page.tsx` — replace existing mock implementation with real API calls. Server Component wrapper fetches initial data. Client component renders: stats cards (total, approved, pending), prompt list with status badges ("قيد المراجعة", "مقبول", "مرفوض" using shadcn Badge), search Input, status filter Select, sort Select (newest/oldest). Empty state with CTA "ابدأ ببيع أول برومبت" linking to `/sell`. Mobile-first grid layout with RTL.
- [x] T029 [US2] Add loading skeleton in `src/app/seller/loading.tsx` — shadcn Skeleton components matching the seller dashboard layout (stats cards + prompt list grid).
- [x] T030 [US2] Verify lint and build — run `npm run lint && npm run build`, fix any errors.

**Checkpoint**: User Stories 1 AND 2 complete. Sellers can submit prompts and view them in their dashboard with real data.

---

## Phase 5: User Story 3 — Admin Review (Priority: P3)

**Goal**: An admin user can view pending prompt submissions, inspect full details, and approve or reject prompts. Approved prompts become visible in the marketplace.

**Independent Test**: An admin views the review queue, clicks a pending prompt, sees full details (template, examples, seller info), approves it, and it appears in the public marketplace.

### Implementation for User Story 3

- [x] T031 [P] [US3] Implement GET `/api/admin/prompts` in `src/app/api/admin/prompts/route.ts` — check Clerk auth + `isAdmin()` (403 if not admin), validate query with `adminPromptsQuerySchema`, query prompts by status (default "pending") with limit, order by `createdAt ASC` (oldest first for FIFO review), map via `mapAdminPromptRow()`, return `{ data: [...] }`.
- [x] T032 [P] [US3] Implement GET `/api/admin/prompts/[id]` in `src/app/api/admin/prompts/[id]/route.ts` — check Clerk auth + `isAdmin()`, validate UUID param, query single prompt with all fields including template, examples, instructions, seller info, return full detail response per contract.
- [x] T033 [US3] Implement POST `/api/admin/prompts/[id]/review` in `src/app/api/admin/prompts/[id]/review/route.ts` — check Clerk auth + `isAdmin()`, validate body with `adminReviewSchema`, verify prompt exists and `status = "pending"` (409 if already reviewed), update prompt: set `status` to "approved" or "rejected", set `reviewedAt = now()`, `reviewedBy = userId`, set `rejectionReason` if rejected. Return `{ data: { id, status, reviewedAt } }`.
- [x] T034 [US3] Create admin review list page in `src/app/admin/review/page.tsx` — Server Component that checks admin role (redirect if not admin). Fetches pending prompts from DB directly (Server Component pattern). Renders: count of pending prompts, list with prompt cards showing title, AI model, seller name, price, submission date. Each card links to `/admin/review/[id]`. Filter tabs for pending/approved/rejected. Mobile-first RTL layout.
- [x] T035 [US3] Create admin review detail page in `src/app/admin/review/[id]/page.tsx` — Server Component that fetches full prompt details. Displays: prompt metadata (title, description, price, category, model), prompt template with syntax highlighting for [variables], example outputs, example prompts with variable mappings, buyer instructions, seller info. Client component section for approve/reject buttons: "قبول" (green) calls `POST /api/admin/prompts/[id]/review { action: "approve" }`, "رفض" (red) opens a Textarea for rejection reason then calls with `{ action: "reject", reason }`. Toast on success, redirect to review list.
- [x] T036 [US3] Add loading skeletons in `src/app/admin/review/loading.tsx` — Skeleton layout for review queue (list of cards).
- [x] T037 [US3] Verify lint and build — run `npm run lint && npm run build`, fix any errors.

**Checkpoint**: User Stories 1, 2, AND 3 complete. Full submission → review → marketplace flow works end-to-end.

---

## Phase 6: User Story 4 — Earnings & Commission Model (Priority: P4)

**Goal**: Sales commission is tracked per purchase (0% direct, 20% marketplace). Checkout uses Stripe destination charges. Seller dashboard shows earnings.

**Independent Test**: A purchase via marketplace applies 20% commission; a purchase via seller's direct link applies 0% commission. Earnings display correctly on seller dashboard.

### Implementation for User Story 4

- [x] T038 [US4] Implement referral tracking — when a user visits `/prompt/[id]?ref=[seller_id]`, store the referral source in sessionStorage (key: `ref_[promptId]`). Modify the prompt detail page `src/app/prompt/[id]/page.tsx` to detect and store the `ref` query param client-side. Clear referral after checkout.
- [x] T039 [US4] Modify checkout API in `src/app/api/checkout/route.ts` — for prompts with a `sellerId`: look up seller's `stripeAccountId` from seller_profiles, determine referral source from request metadata (passed from client), use destination charges: add `payment_intent_data.application_fee_amount` (0 for direct, 20% of total for marketplace) and `payment_intent_data.transfer_data.destination` (seller's Stripe account). Store `referral_source` in session metadata. Handle multi-seller carts by grouping items per seller into separate checkout sessions (or blocking multi-seller carts initially).
- [x] T040 [US4] Modify Stripe webhook in `src/app/api/webhooks/stripe/route.ts` — when creating order_items, extract `referral_source` from session metadata, compute `commission_rate` (0 or 0.20), compute `seller_payout_amount` = `price_at_purchase * (1 - commission_rate)`, store `seller_stripe_account_id`. Update seller_profiles: increment `total_sales` and `total_earnings` for the seller.
- [x] T041 [US4] Add shareable link feature to seller dashboard — on the seller dashboard `src/app/seller/page.tsx`, for each approved prompt, show a "نسخ رابط المشاركة" (Copy Share Link) button that copies `/prompt/[id]?ref=[seller_id]` to clipboard with toast confirmation. Only visible for approved prompts.
- [x] T042 [US4] Add earnings section to seller dashboard in `src/app/seller/page.tsx` — extend the existing dashboard with an earnings tab/section: total earnings, per-prompt earnings breakdown (sales count, revenue, commission source split), payout status. Fetch from `/api/seller/stats` which already returns `totalSales` and `totalEarnings`.
- [x] T043 [US4] Verify lint and build — run `npm run lint && npm run build`, fix any errors.

**Checkpoint**: All 4 user stories complete. Full sell → review → purchase → commission flow works end-to-end.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Route protection, final integration verification, and cleanup.

- [x] T044 Ensure route protection in `src/proxy.ts` — verify `/sell` and `/admin(.*)` are NOT in the public routes matcher (they should already be protected by default since Clerk middleware protects all non-public routes). Add `/seller/onboarding(.*)` if needed.
- [x] T045 [P] Add "بيع برومبت" (Sell a Prompt) link to the site header in `src/components/Header.tsx` — visible to authenticated users, links to `/sell`. Show in both mobile and desktop navigation.
- [x] T046 Final integration verification — run `npm run lint && npm run build` one last time, verify no errors. Manually test the full flow: submit prompt → view in seller dashboard → admin approves → prompt appears in marketplace.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phases 3–6)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Phase 2 — no dependencies on other stories
  - US2 (Phase 4): Can start after Phase 2 — reads from same tables as US1 but independent
  - US3 (Phase 5): Can start after Phase 2 — reads/updates prompts table independently
  - US4 (Phase 6): Depends on US1 (needs Stripe Connect) and US3 (needs approved prompts for purchases) — should run last
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

```
Phase 1 (Setup)
    │
    ▼
Phase 2 (Foundational) ─── BLOCKS ALL ───┐
    │                                      │
    ▼                                      ▼
Phase 3 (US1: Submit) ──────────────► Phase 6 (US4: Earnings)
    │                                      ▲
Phase 4 (US2: Dashboard) ─ independent     │
    │                                      │
Phase 5 (US3: Admin Review) ──────────────┘
    │
    ▼
Phase 7 (Polish)
```

### Within Each User Story

- Schema & Zod first (done in Foundational)
- API routes before UI pages
- API routes marked [P] can run in parallel within a story
- UI pages depend on their API routes
- Lint/build verification at end of each story

### Parallel Opportunities

**Phase 1** (all 3 tasks can run in parallel):
- T001, T002, T003

**Phase 2** (T005, T006, T010 can run in parallel with each other; T004 must complete before T007):
- T004 → T007 (sequential: schema change → migration)
- T005, T006 (parallel with T004 — different files)
- T009, T010 (parallel after T004/T005/T006 — depend on schema types)
- T008 (after T007 — needs tables to exist)
- T011 (after T007 — needs status column)

**Phase 3** (API routes can run in parallel):
- T013, T014, T015 (parallel — different route files)
- T017, T018, T019, T020, T021 (parallel — different component files)

**Phase 4** (API routes can run in parallel):
- T026, T027 (parallel — different route files)

**Phase 5** (API routes can run in parallel):
- T031, T032 (parallel — different route files)

---

## Parallel Example: User Story 1

```bash
# Launch all Connect API routes in parallel (different files):
Task: T013 "POST /api/connect/create-account in src/app/api/connect/create-account/route.ts"
Task: T014 "GET /api/connect/status in src/app/api/connect/status/route.ts"
Task: T015 "POST /api/connect/onboarding-link in src/app/api/connect/onboarding-link/route.ts"

# Launch all step components in parallel (different files):
Task: T017 "StepIndicator in src/components/sell/StepIndicator.tsx"
Task: T018 "PromptDetailsStep in src/components/sell/PromptDetailsStep.tsx"
Task: T019 "PromptFileStep in src/components/sell/PromptFileStep.tsx"
Task: T020 "PayoutStep in src/components/sell/PayoutStep.tsx"
Task: T021 "ConfirmationStep in src/components/sell/ConfirmationStep.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T011)
3. Complete Phase 3: User Story 1 (T012–T025)
4. **STOP and VALIDATE**: Test prompt submission independently
5. Deploy/demo — sellers can submit prompts

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Submit Prompt) → Test → Deploy (MVP!)
3. Add US2 (Seller Dashboard) → Test → Deploy
4. Add US3 (Admin Review) → Test → Deploy (full submission→approval flow!)
5. Add US4 (Earnings & Commission) → Test → Deploy (monetization complete!)
6. Each story adds value without breaking previous stories

### Recommended Sequence (Solo Developer)

Since US4 depends on US1+US3, the recommended order is:
**US1 → US2 → US3 → US4** (matches priority order perfectly)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Run `npm run lint && npm run build` after EVERY task (constitution requirement)
- After each Phase checkpoint, the feature should be in a deployable state
- Existing marketplace pages (market, search, prompt detail) continue to work — the `status = "approved"` filter in Phase 2 is backward compatible since existing rows default to "approved"

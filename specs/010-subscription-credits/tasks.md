# Tasks: Subscription & Credit System for AI Generation

**Input**: Design documents from `/specs/010-subscription-credits/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/subscription-api.md, research.md, quickstart.md

**Tests**: Playwright E2E tests included (requested in feature spec).

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create all database schemas, Zod validation schemas, and shared configuration needed across user stories.

- [x] T001 [P] Create subscription_plans Drizzle schema in src/db/schema/subscription-plans.ts — define pgTable with columns: id (text PK), name, nameAr, monthlyCredits, monthlyPrice, sixMonthPrice, yearlyPrice, stripePriceIdMonthly, stripePriceIdSixMonth, stripePriceIdYearly, features (jsonb), theme, icon, sortOrder, createdAt. Per data-model.md.
- [x] T002 [P] Create credit_topup_packs Drizzle schema in src/db/schema/credit-topup-packs.ts — define pgTable with columns: id (text PK), credits, price (cents), stripePriceId, sortOrder, createdAt. Per data-model.md.
- [x] T003 [P] Create user_subscriptions Drizzle schema in src/db/schema/user-subscriptions.ts — define pgTable with columns: id (uuid PK), userId (text, unique), planId (text FK → subscription_plans.id), stripeSubscriptionId (text, unique), stripeCustomerId, status, billingCycle, currentPeriodStart, currentPeriodEnd, cancelAtPeriodEnd, createdAt, updatedAt. Add indexes per data-model.md.
- [x] T004 [P] Create credit_balances Drizzle schema in src/db/schema/credit-balances.ts — define pgTable with columns: userId (text PK), subscriptionCredits (int default 0), topupCredits (int default 0), stripeCustomerId (text, unique), updatedAt. Per data-model.md.
- [x] T005 [P] Create credit_transactions Drizzle schema in src/db/schema/credit-transactions.ts — define pgTable with columns: id (serial PK), userId, type, amount, creditSource, referenceType, referenceId, balanceAfter, createdAt. Add indexes on userId and createdAt. Per data-model.md.
- [x] T006 [P] Create generations Drizzle schema in src/db/schema/generations.ts — define pgTable with columns: id (uuid PK), userId, promptId (uuid FK → prompts.id), generationType, model, inputPrompt, resultText, resultImageUrl, status, creditsConsumed, creditSource, errorMessage, createdAt, completedAt. Add indexes on userId, promptId, createdAt. Per data-model.md.
- [x] T007 Update barrel export in src/db/schema/index.ts — add exports for subscriptionPlans, creditTopupPacks, userSubscriptions, creditBalances, creditTransactions, generations.
- [x] T008 Generate and apply Drizzle migrations — run `npx drizzle-kit generate` then `npx drizzle-kit migrate` to create the 6 new tables in Supabase Postgres.
- [x] T009 [P] Create Zod schemas for subscription endpoints in src/lib/schemas/subscription.ts — define subscriptionCheckoutSchema (planId enum, billingCycle enum), subscriptionPlanResponseSchema, subscriptionStatusResponseSchema. Arabic error messages. Export inferred types.
- [x] T010 [P] Create Zod schemas for generation endpoints in src/lib/schemas/generation.ts — define generateRequestSchema (promptId uuid, generationType enum, model enum, inputPrompt string min 1 max 10000), generationResponseSchema, generationsListQuerySchema (limit, offset, promptId optional). Arabic error messages. Export inferred types.
- [x] T011 [P] Create Zod schemas for credit endpoints in src/lib/schemas/credits.ts — define topupCheckoutSchema (packId enum), creditBalanceResponseSchema, creditTransactionsQuerySchema (limit, offset). Arabic error messages. Export inferred types.
- [x] T012 Apply RLS policies for 6 new tables via Supabase MCP — subscription_plans and credit_topup_packs: anon SELECT; user_subscriptions, credit_balances, credit_transactions, generations: authenticated SELECT WHERE auth.uid()::text = user_id. Then run get_advisors(type: "security") to verify.

**Checkpoint**: All schemas created, migrations applied, validation defined, RLS in place.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core business logic helpers and infrastructure that ALL user stories depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T013 Implement atomic credit deduction helper in src/lib/credits.ts — export `deductCredits(userId, amount)` function that uses a DB transaction with conditional UPDATE on credit_balances (subscription_credits first, then topup_credits). Returns updated balance or throws InsufficientCreditsError. Also export `grantSubscriptionCredits(userId, amount)`, `grantTopupCredits(userId, amount)`, `resetSubscriptionCredits(userId, newAmount)`, and `getOrCreateCreditBalance(userId)`. Per research.md Decision 3.
- [x] T014 [P] Implement mock generation service in src/lib/generation.ts — export `generateContent(params: { type: "text" | "image", model: string, prompt: string })` that returns `{ resultText, resultImageUrl }`. Text mock returns Arabic lorem ipsum placeholder. Image mock returns a static placeholder image URL. Service interface designed for future swap to real AI APIs. Per research.md Decision 4.
- [x] T015 [P] Add /subscription(.*) to public routes in src/proxy.ts — update the public route matcher array so unauthenticated users can view subscription plans.
- [x] T016 Create seed script for subscription plans and top-up packs in src/db/seed-subscriptions.ts — insert 3 subscription plans (Standard/Pro/Legendary with Arabic names, pricing in cents, features lists, theme colors, icons) and 3 top-up packs (10/$3, 50/$12, 100/$20). Use placeholder Stripe Price IDs (to be replaced with real ones after Stripe product creation). Run via `source .env.local && npx tsx src/db/seed-subscriptions.ts`.
- [x] T017 [P] Create useCredits hook in src/hooks/use-credits.ts — custom hook that fetches credit balance from GET /api/credits/balance. Returns `{ subscription, topup, total, isLoading, refresh }`. Used by CreditBadge and generation interface. Handle unauthenticated state (return null).

**Checkpoint**: Foundation ready — credit logic, mock generation, routing, and seed data prepared. User story implementation can now begin.

---

## Phase 3: User Story 1 — Subscribe to a Credit Plan (Priority: P1) 🎯 MVP

**Goal**: Users can view subscription plans, select a tier and billing cycle, complete Stripe Checkout, and receive credits.

**Independent Test**: Navigate to /subscription, see 3 plans with billing toggle, click subscribe, complete Stripe test checkout, verify credits appear.

### Implementation for User Story 1

- [x] T018 [US1] Implement GET /api/subscription/plans route in src/app/api/subscription/plans/route.ts — query subscription_plans table ordered by sortOrder, map snake_case to camelCase response. Public endpoint (no auth). Per contracts/subscription-api.md.
- [x] T019 [US1] Implement POST /api/subscription/checkout route in src/app/api/subscription/checkout/route.ts — validate with subscriptionCheckoutSchema, check auth (Clerk), check no existing active subscription (409 if exists), get-or-create Stripe Customer (store in credit_balances), look up Stripe Price ID from subscription_plans table, create Stripe Checkout Session (mode: "subscription") with metadata (userId, planId, billingCycle), return checkout URL. Per contracts/subscription-api.md.
- [x] T020 [US1] Implement GET /api/subscription/status route in src/app/api/subscription/status/route.ts — check auth, query user_subscriptions joined with subscription_plans, query credit_balances. Return subscription details + credit breakdown (subscription, topup, total). Return null subscription if none. Per contracts/subscription-api.md.
- [x] T021 [US1] Extend Stripe webhook in src/app/api/webhooks/stripe/route.ts — add handlers for: customer.subscription.created (create user_subscriptions record, upsert credit_balances with subscription credits, log subscription_grant transaction), customer.subscription.updated (update status/period/cancel fields), customer.subscription.deleted (set status to canceled), invoice.payment_succeeded for renewals (reset subscription_credits to plan allocation, log subscription_reset + subscription_grant transactions). Route existing checkout.session.completed to existing handler. Per contracts/subscription-api.md webhook section.
- [x] T022 [P] [US1] Create BillingCycleToggle component in src/components/subscription/BillingCycleToggle.tsx — client component with 3 options (شهري/6 أشهر/سنوي) rendered as segmented control using shadcn Button group. Props: selectedCycle, onCycleChange. Styled per reference component.md (amber active state, rounded-full). Mobile-first responsive.
- [x] T023 [P] [US1] Create PricingCard component in src/components/subscription/PricingCard.tsx — client component displaying plan tier card. Props: plan data, selected billing cycle, current user subscription (if any). Shows: themed gradient header with icon (Sword/Zap/Crown from Lucide), plan name, feature list with scroll icons, dynamic price based on cycle, subscribe button. Highlighted state if user is on this plan. Per reference component.md theming (blue/green/purple). Arabic text. Mobile-first.
- [x] T024 [US1] Create subscription page in src/app/subscription/page.tsx — Server Component that fetches plans from DB directly (not API route). Renders page title "ترقية حسابك", BillingCycleToggle (client boundary), grid of 3 PricingCards. Subscribe button calls POST /api/subscription/checkout and redirects to Stripe. Show current plan status if subscribed (fetch via subscription status). Arabic-first, RTL, mobile-first (cards stack on mobile). Include loading.tsx skeleton with 3 card placeholders.
- [x] T025 [US1] Create subscription loading skeleton in src/app/subscription/loading.tsx — skeleton layout matching subscription page: title skeleton, toggle skeleton, 3 card skeletons using shadcn Skeleton components.

**Checkpoint**: Users can view plans, subscribe via Stripe, and receive credits via webhook. Core monetization flow complete.

---

## Phase 4: User Story 2 — Generate Content Using a Purchased Prompt (Priority: P1) 🎯 MVP

**Goal**: Users with credits and a purchased prompt can generate text or image content directly in-app with an editable prompt interface.

**Independent Test**: Open a purchased prompt, click Generate (توليد), edit prompt text, select text/image, submit, see result inline, verify credit deducted.

### Implementation for User Story 2

- [x] T026 [US2] Implement POST /api/generate route in src/app/api/generate/route.ts — validate with generateRequestSchema, check auth, verify user owns the prompt (query orderItems+orders or freePromptAccess), atomically deduct 1 credit via deductCredits() from src/lib/credits.ts, call mock generation service, save generation record to generations table (status: completed, result content, credits consumed), return generation data + updated balance. On generation failure: refund credit, save failed record. Return 402 if insufficient credits, 403 if not owned. Per contracts/subscription-api.md.
- [x] T027 [P] [US2] Create PromptEditor component in src/components/generation/PromptEditor.tsx — client component. Props: initialPrompt (string), onChange. Renders textarea with the prompt text. Detects variables matching `[text]` regex pattern and highlights them with colored badges/chips above the textarea. Variables can be filled via dedicated inline inputs that replace the placeholder in the textarea. User can also edit the full text freely. Arabic RTL layout.
- [x] T028 [P] [US2] Create GenerationResult component in src/components/generation/GenerationResult.tsx — client component. Props: generation record (type, resultText, resultImageUrl, model, creditsConsumed). Renders text results as formatted Arabic content in a styled card. Renders image results as a rendered image with download option. Shows model name badge and "1 رصيد مستخدم" credit indicator. Loading state with spinner during generation.
- [x] T029 [US2] Create GenerationDialog component in src/components/generation/GenerationDialog.tsx — client component using shadcn Sheet (full-screen on mobile) or Dialog (desktop). Contains: PromptEditor, generation type selector (text/image toggle using shadcn ToggleGroup), model selector (default model pre-selected), generate button (توليد), credit balance display, GenerationResult area. Handles submit flow: calls POST /api/generate, shows loading, displays result. Shows "no credits" message with link to /subscription when balance is 0. Refreshes credit balance after generation.
- [x] T030 [US2] Create GenerateButton component in src/components/generation/GenerateButton.tsx — client component. Props: promptId, promptContent, userOwnsPrompt, creditBalance. Renders a primary "توليد" button (with Sparkles icon from Lucide) only if userOwnsPrompt === true AND creditBalance > 0. Opens GenerationDialog on click. Shows disabled state with tooltip if no credits. Hidden entirely if user doesn't own the prompt.
- [x] T031 [US2] Integrate GenerateButton into prompt detail page in src/app/prompt/[id]/page.tsx — add GenerateButton to the sidebar (right column) below the price card, visible only for purchased/free prompts. Fetch credit balance from /api/credits/balance. Pass prompt fullContent as the initial prompt text. Ensure button only renders for authenticated users who own the prompt (purchased via orders or free via freePromptAccess).

**Checkpoint**: End-to-end generation flow works. Users can generate text/image from purchased prompts, see results inline, credits deducted.

---

## Phase 5: User Story 3 — Switch Models Before Generating (Priority: P2)

**Goal**: Users can choose between AI models in the generation interface before generating.

**Independent Test**: Open generation dialog, see model dropdown, switch model, generate, verify result shows selected model name.

### Implementation for User Story 3

- [x] T032 [US3] Create ModelSelector component in src/components/generation/ModelSelector.tsx — client component using shadcn Select. Props: selectedModel, onModelChange. Shows available models: Gemini (default), ChatGPT, Claude. Each option shows model name with a small icon/badge. Pre-selects "gemini" as default. Arabic labels. Compact design for mobile.
- [x] T033 [US3] Integrate ModelSelector into GenerationDialog in src/components/generation/GenerationDialog.tsx — add ModelSelector between generation type toggle and generate button. Pass selected model to POST /api/generate request. Display selected model name in GenerationResult after generation completes.

**Checkpoint**: Model switching works within generation dialog. Results show which model was used.

---

## Phase 6: User Story 4 — View Credit Balance and Usage History (Priority: P2)

**Goal**: Users can see their credit balance in the header and view detailed transaction and generation history on their dashboard.

**Independent Test**: Subscribe and generate content, check header shows updated balance, visit dashboard to see transactions and generation history.

### Implementation for User Story 4

- [x] T034 [US4] Implement GET /api/credits/balance route in src/app/api/credits/balance/route.ts — check auth, query credit_balances by userId, return { subscription, topup, total }. Return zeros if no record exists. Lightweight endpoint for header polling.
- [x] T035 [P] [US4] Implement GET /api/credits/transactions route in src/app/api/credits/transactions/route.ts — check auth, validate query with creditTransactionsQuerySchema, query credit_transactions by userId ordered by createdAt DESC with pagination (limit/offset). Return { data: transactions[], total: count }. Per contracts/subscription-api.md.
- [x] T036 [P] [US4] Implement GET /api/generations route in src/app/api/generations/route.ts — check auth, validate query with generationsListQuerySchema, query generations table joined with prompts (for title) by userId, ordered by createdAt DESC with pagination. Optional promptId filter. Return { data: generations[], total: count }. Per contracts/subscription-api.md.
- [x] T037 [P] [US4] Implement GET /api/generations/[id] route in src/app/api/generations/[id]/route.ts — check auth, validate id param as UUID, query generations joined with prompts. Return 403 if userId doesn't match. Return 404 if not found. Return full generation details. Per contracts/subscription-api.md.
- [x] T038 [US4] Create CreditBadge component in src/components/credits/CreditBadge.tsx — client component using useCredits hook. Shows coin icon (Coins from Lucide) with total credit count as badge. Compact design matching existing cart badge pattern. Shows nothing for unauthenticated users. Links to /dashboard/credits on click.
- [x] T039 [US4] Add CreditBadge to Header in src/components/Header.tsx — insert CreditBadge inside `<SignedIn>` block, next to cart icon and before user profile. Match existing badge styling pattern (see cart icon implementation).
- [x] T040 [US4] Update DashboardSidebar in src/components/dashboard/DashboardSidebar.tsx — add two new navigation items: "الرصيد" (Credits, Coins icon) linking to /dashboard/credits, and "التوليدات" (Generations, Sparkles icon) linking to /dashboard/generations. Insert after "المشتريات" (Purchases) item.
- [x] T041 [US4] Create dashboard credits page in src/app/dashboard/credits/page.tsx — client component. Shows: credit balance card (subscription credits, topup credits, total with visual bar), current subscription plan name and billing cycle, transaction history table (date, type badge, amount with +/- coloring, balance after, reference). Fetches from /api/subscription/status and /api/credits/transactions. Arabic text, RTL layout, mobile-first. Include loading.tsx skeleton.
- [x] T042 [US4] Create dashboard credits loading skeleton in src/app/dashboard/credits/loading.tsx — skeleton matching credits page layout: balance card skeleton, plan info skeleton, transactions table skeleton.
- [x] T043 [US4] Create dashboard generations page in src/app/dashboard/generations/page.tsx — client component. Shows: grid/list of past generations with cards showing prompt title, generation type badge (text/image), model badge, result preview (truncated text or thumbnail image), credits consumed, date. Click opens full result view. Fetches from /api/generations with pagination. Arabic text, RTL layout, mobile-first. Include loading.tsx skeleton.
- [x] T044 [US4] Create dashboard generations loading skeleton in src/app/dashboard/generations/loading.tsx — skeleton matching generations page layout: grid of generation card skeletons.

**Checkpoint**: Credit balance visible in header. Dashboard shows credit transactions and full generation history with persistent results.

---

## Phase 7: User Story 5 — Manage Subscription (Priority: P3)

**Goal**: Users can upgrade, downgrade, or cancel their subscription via Stripe Customer Portal.

**Independent Test**: Subscribe, click "Manage Subscription" on dashboard/subscription page, verify Stripe Portal opens, cancel subscription, verify status updates.

### Implementation for User Story 5

- [x] T045 [US5] Implement POST /api/subscription/manage route in src/app/api/subscription/manage/route.ts — check auth, look up Stripe Customer ID from credit_balances table, create Stripe Billing Portal session with return_url to /dashboard/credits, return portal URL. Return 404 if no Stripe customer found. Per contracts/subscription-api.md.
- [x] T046 [US5] Add subscription management UI to subscription page in src/app/subscription/page.tsx — when user has active subscription: show current plan card with highlighted border, "إدارة الاشتراك" (Manage Subscription) button that calls POST /api/subscription/manage and redirects to Stripe Portal URL. Show "ترقية" (Upgrade) labels on higher-tier cards, "تخفيض" (Downgrade) on lower. Disable subscribe button on current plan.
- [x] T047 [US5] Add subscription management link to dashboard credits page in src/app/dashboard/credits/page.tsx — in the plan info section, add "إدارة الاشتراك" button that opens Stripe Customer Portal. Only visible when user has active subscription.

**Checkpoint**: Users can manage their subscription lifecycle through Stripe Customer Portal. Status changes reflected via webhook.

---

## Phase 8: User Story 6 — Purchase Credit Top-Up Pack (Priority: P2)

**Goal**: Users can buy one-time credit packs to add credits beyond their subscription allocation.

**Independent Test**: Navigate to subscription page, see top-up packs, purchase a pack, verify credits added to balance immediately.

### Implementation for User Story 6

- [x] T048 [US6] Implement POST /api/credits/topup/checkout route in src/app/api/credits/topup/checkout/route.ts — validate with topupCheckoutSchema, check auth, get-or-create Stripe Customer, look up Stripe Price ID from credit_topup_packs table, create Stripe Checkout Session (mode: "payment") with metadata: { type: "topup", packId, userId, credits }, return checkout URL. Per contracts/subscription-api.md.
- [x] T049 [US6] Extend Stripe webhook for top-up handling in src/app/api/webhooks/stripe/route.ts — in the checkout.session.completed handler, check metadata.type === "topup". If so: extract packId and credits from metadata, upsert credit_balances (add to topupCredits), log topup_grant transaction. Do not route to existing prompt purchase handler. Per contracts/subscription-api.md webhook section.
- [x] T050 [P] [US6] Create TopupPackCard component in src/components/subscription/TopupPackCard.tsx — client component. Props: pack data (credits, price), onPurchase callback. Shows credit amount prominently, price, "شراء" (Buy) button. Compact card design. Arabic text.
- [x] T051 [US6] Add top-up packs section to subscription page in src/app/subscription/page.tsx — below subscription plans grid, add "رصيد إضافي" (Extra Credits) section. Fetch credit_topup_packs from DB (Server Component). Render TopupPackCards in a row. Purchase button calls POST /api/credits/topup/checkout and redirects to Stripe.
- [x] T052 [US6] Update no-credits message in GenerationDialog in src/components/generation/GenerationDialog.tsx — when credit balance is 0, show message with two CTAs: "اشتراك" (Subscribe) linking to /subscription, and "شراء رصيد" (Buy Credits) linking to /subscription#topup (scrolls to top-up section).

**Checkpoint**: Top-up flow complete. Users can buy credit packs. Webhook grants credits. 0-credit state offers both subscription and top-up options.

---

## Phase 9: E2E Tests (Playwright)

**Purpose**: End-to-end tests covering critical user journeys on mobile + desktop viewports.

- [x] T053 [P] Create subscription flow E2E test in tests/e2e/subscription.spec.ts — test: visit /subscription page, verify 3 plans render with correct names/prices, toggle billing cycles and verify price updates, click subscribe on a plan (mock or test Stripe Checkout). Test mobile (375px) and desktop (1280px) viewports. Arabic text assertions.
- [x] T054 [P] Create generation flow E2E test in tests/e2e/generation.spec.ts — test: as an authenticated user with credits and a purchased prompt, visit prompt detail page, verify Generate button visible, click Generate, verify dialog opens with editable prompt and type selector, submit text generation, verify result displays inline and credit balance decrements. Test 0-credit state shows subscription CTA. Mobile + desktop viewports.
- [x] T055 [P] Create credit balance E2E test in tests/e2e/credits.spec.ts — test: as an authenticated subscribed user, verify credit badge shows in header, visit /dashboard/credits, verify balance card and transaction history render. Visit /dashboard/generations, verify generation history renders with past results. Mobile + desktop viewports.

**Checkpoint**: All critical user journeys covered by E2E tests.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, build verification, and cross-cutting improvements.

- [x] T056 Run npm run lint && npm run build — fix all lint errors and build errors across all new and modified files. Required per constitution before completion.
- [x] T057 Run Supabase security advisors — execute get_advisors(type: "security") via Supabase MCP to verify no RLS gaps on the 6 new tables.
- [x] T058 Validate quickstart.md checklist — walk through each item in specs/010-subscription-credits/quickstart.md verification checklist and confirm all pass.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion (schemas must exist for credit helpers)
- **Phase 3 (US1)**: Depends on Phase 2 — subscription checkout needs credit helpers and seed data
- **Phase 4 (US2)**: Depends on Phase 2 + Phase 3 — generation needs credits (from subscription) and mock service
- **Phase 5 (US3)**: Depends on Phase 4 — model selector integrates into generation dialog
- **Phase 6 (US4)**: Depends on Phase 2 — can run in parallel with US1/US2 for API routes, but UI needs data from subscriptions/generations
- **Phase 7 (US5)**: Depends on Phase 3 — manage requires active subscription
- **Phase 8 (US6)**: Depends on Phase 2 — top-up is independent of subscription but needs credit system
- **Phase 9 (E2E Tests)**: Depends on Phases 3-8 — tests exercise complete flows
- **Phase 10 (Polish)**: Depends on all previous phases

### User Story Dependencies

- **US1 (Subscribe)**: Foundational only → independent entry point
- **US2 (Generate)**: Foundational + US1 (user needs credits from subscription)
- **US3 (Model Switch)**: US2 (model selector integrates into generation dialog)
- **US4 (Balance/History)**: Foundational (API routes independent, but meaningful data requires US1 + US2)
- **US5 (Manage Sub)**: US1 (requires existing subscription)
- **US6 (Top-Up)**: Foundational only → independent of US1, but best after US1 for full context

### Within Each User Story

- API routes before UI components (data layer first)
- Components before page integration
- Shared components before consuming components

### Parallel Opportunities

**Phase 1**: T001-T006 all parallel (different schema files). T009-T011 all parallel (different Zod schema files).

**Phase 2**: T013, T014, T015, T017 all parallel (different files, no interdependencies).

**Phase 3 (US1)**: T022, T023 parallel (different components). T018-T020 parallel (different API routes).

**Phase 4 (US2)**: T027, T028 parallel (different components).

**Phase 6 (US4)**: T034-T037 all parallel (different API routes). T041-T044 partially parallel (different pages).

**Phase 9**: T053-T055 all parallel (different test files).

---

## Parallel Example: Phase 1

```bash
# All schema files in parallel:
Task: "Create subscription_plans schema in src/db/schema/subscription-plans.ts"
Task: "Create credit_topup_packs schema in src/db/schema/credit-topup-packs.ts"
Task: "Create user_subscriptions schema in src/db/schema/user-subscriptions.ts"
Task: "Create credit_balances schema in src/db/schema/credit-balances.ts"
Task: "Create credit_transactions schema in src/db/schema/credit-transactions.ts"
Task: "Create generations schema in src/db/schema/generations.ts"

# Then sequentially:
Task: "Update barrel export in src/db/schema/index.ts"
Task: "Generate and apply Drizzle migrations"

# All Zod schemas in parallel:
Task: "Create subscription Zod schemas in src/lib/schemas/subscription.ts"
Task: "Create generation Zod schemas in src/lib/schemas/generation.ts"
Task: "Create credit Zod schemas in src/lib/schemas/credits.ts"
```

## Parallel Example: Phase 4 (US2)

```bash
# Components in parallel:
Task: "Create PromptEditor component in src/components/generation/PromptEditor.tsx"
Task: "Create GenerationResult component in src/components/generation/GenerationResult.tsx"

# Then sequentially (depends on above):
Task: "Create GenerationDialog in src/components/generation/GenerationDialog.tsx"
Task: "Create GenerateButton in src/components/generation/GenerateButton.tsx"
Task: "Integrate into prompt detail page"
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Complete Phase 1: Setup (schemas, migrations, validation)
2. Complete Phase 2: Foundational (credit helpers, mock service, routing)
3. Complete Phase 3: US1 — Subscribe to plan
4. **VALIDATE**: Test subscription end-to-end with Stripe test mode
5. Complete Phase 4: US2 — Generate content
6. **VALIDATE**: Test full flow: subscribe → get credits → generate → see result
7. **MVP COMPLETE**: Core value delivered

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. US1 (Subscribe) → Monetization live
3. US2 (Generate) → Core value proposition live (MVP!)
4. US3 (Model Switch) → Enhanced generation UX
5. US4 (Balance/History) → Transparency and trust
6. US6 (Top-Up) → Additional revenue stream
7. US5 (Manage Sub) → Lifecycle management
8. E2E Tests → Quality assurance
9. Polish → Production-ready

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after its phase completes
- Run `npm run lint && npm run build` after each phase (mandatory per constitution)
- Stripe Products/Prices must be created in Stripe Dashboard before seed script (T016)
- Webhook must be configured in Stripe Dashboard to send subscription events to existing endpoint
- All UI text must be in Arabic (Arabic-first per constitution)
- All pages must be mobile-first (< 640px primary viewport)

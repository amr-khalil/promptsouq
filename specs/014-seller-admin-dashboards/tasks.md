# Tasks: Seller & Admin Dashboards

**Input**: Design documents from `/specs/014-seller-admin-dashboards/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested — test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: i18n namespace, shared components, and new shadcn/ui components needed across stories

- [x] T001 [P] Create Arabic dashboard translation file with sidebar, seller, admin, and common sections in `src/i18n/locales/ar/dashboard.json`. Include keys for: `sidebar.seller.*` (myPrompts, salesEarnings, sellerProfile), `sidebar.admin.*` (moderation, orders, analytics, settings), `seller.prompts.*` (title, status labels, empty state, delete confirmation, edit button), `seller.earnings.*` (title, summary labels, sales history headers, payout status, empty state), `seller.profile.*` (title, fields, save button), `admin.moderation.*` (title, queue headers, approve/reject buttons, rejection reason label/placeholder, status counts), `admin.analytics.*` (title, metric labels, top prompts), `admin.orders.*` (title, table headers, filters, order detail labels), `admin.settings.*` (title, commission rate label, save button, validation messages), `common.*` (loading, error, noData, confirm, cancel)
- [x] T002 [P] Create English dashboard translation file mirroring all Arabic keys in `src/i18n/locales/en/dashboard.json`
- [x] T003 [P] Create reusable `PromptStatusBadge` component in `src/components/dashboard/PromptStatusBadge.tsx` — accepts `status: "pending" | "approved" | "rejected"` and optional `deletedAt: string | null` prop. Renders shadcn `Badge` with color coding: pending=yellow, approved=green, rejected=red, deleted=gray. Uses i18n `dashboard` namespace for labels. Include RTL-safe styling
- [x] T004 Add `dashboard` to the i18n namespace loading configuration. Find the i18n config file (likely `src/i18n/index.ts` or `src/i18n/config.ts`) and register the new `dashboard` namespace so it loads on dashboard routes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: DB schema changes, Drizzle migration, Zod schemas, mappers, sidebar navigation — MUST complete before user stories

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `marketplace_settings` Drizzle schema in `src/db/schema/marketplace-settings.ts`. Define `pgTable("marketplace_settings")` with columns: `id` (integer PK, default 1), `commissionRate` (real, NOT NULL, default 0.20), `updatedAt` (timestamp with timezone, NOT NULL, defaultNow), `updatedBy` (text, nullable). Export the table constant
- [x] T006 Add `deletedAt` column to `prompts` table in `src/db/schema/prompts.ts`. Add `deletedAt: timestamp("deleted_at", { withTimezone: true })` as a nullable column (no default — NULL means active)
- [x] T007 Update barrel export in `src/db/schema/index.ts` to add `export { marketplaceSettings } from "./marketplace-settings"`
- [x] T008 Generate and apply Drizzle migration: run `npx drizzle-kit generate` then `npx drizzle-kit migrate` to create the `marketplace_settings` table and add the `deleted_at` column to `prompts`. Verify migration succeeds against Supabase
- [x] T009 Seed the `marketplace_settings` table with default row via Supabase MCP `execute_sql`: `INSERT INTO marketplace_settings (id, commission_rate, updated_at) VALUES (1, 0.20, NOW()) ON CONFLICT (id) DO NOTHING`
- [x] T010 Apply RLS policies for the new `marketplace_settings` table via Supabase MCP `apply_migration`: enable RLS, grant anon SELECT (read-only for commission rate display), grant authenticated SELECT, restrict INSERT/UPDATE/DELETE to service role only (admin operations go through API route handlers which use the service role connection). Then run `get_advisors(type: "security")` to verify no RLS gaps
- [x] T011 [P] Add new Zod schemas to `src/lib/schemas/api.ts`: (1) `adminStatsResponseSchema` for marketplace analytics response, (2) `adminOrdersQuerySchema` with status, sellerId, dateFrom, dateTo, limit, offset params, (3) `adminSettingsUpdateSchema` with commissionRate (0.01–0.50), (4) `sellerEarningsQuerySchema` with limit and offset, (5) `sellerProfileUpdateSchema` with displayName (2–50 chars), bio (max 500, optional nullable), avatar (url, optional). Use Arabic error messages. Export all schemas and inferred types
- [x] T012 [P] Add new mapper functions to `src/lib/mappers.ts`: (1) `mapAdminOrderRow()` — maps order + item count to admin order list response, (2) `mapAdminOrderDetailRow()` — maps order with items array including prompt title and seller info, (3) `mapSellerEarningRow()` — maps orderItem joined with order and prompt to earnings sale entry with computed commission amount and payout status, (4) `mapSellerProfileEditRow()` — maps sellerProfiles row to profile edit response
- [x] T013 Update existing public prompts query in `src/app/api/prompts/route.ts` GET handler: add `isNull(prompts.deletedAt)` to the conditions array so soft-deleted prompts are excluded from marketplace listings. Import `isNull` from drizzle-orm
- [x] T014 Update existing admin prompts query in `src/app/api/admin/prompts/route.ts` GET handler: add `isNull(prompts.deletedAt)` condition to exclude soft-deleted prompts from the moderation queue
- [x] T015 Update existing admin prompt DELETE in `src/app/api/admin/prompts/[id]/route.ts` DELETE handler: change from hard delete (`db.delete()`) to soft-delete by setting `deletedAt = new Date()` via `db.update()`. Return the updated prompt id and deletedAt timestamp
- [x] T016 Modify the dashboard layout in `src/app/[locale]/dashboard/layout.tsx` to be a Server Component that: (1) calls `checkAdmin()` to get `isAdmin` and `userId`, (2) if userId exists, queries `sellerProfiles` table for a row matching `userId` to determine `isSeller`, (3) passes `isSeller` and `isAdmin` as props to `DashboardSidebar`
- [x] T017 Update `DashboardSidebar` component in `src/components/dashboard/DashboardSidebar.tsx`: (1) Accept `isSeller` and `isAdmin` boolean props, (2) Add seller nav group (with `Separator` divider and group label "البائع" / i18n key) with items: My Prompts (`/dashboard/seller/prompts`, icon: FileText), Sales & Earnings (`/dashboard/seller/earnings`, icon: DollarSign), Seller Profile (`/dashboard/seller/profile`, icon: Store) — shown only when `isSeller === true`, (3) Add admin nav group (with divider and label "الإدارة" / i18n key) with items: Moderation (`/dashboard/admin/moderation`, icon: Shield), Orders (`/dashboard/admin/orders`, icon: Receipt), Analytics (`/dashboard/admin/analytics`, icon: BarChart3), Settings (`/dashboard/admin/settings`, icon: SlidersHorizontal) — shown only when `isAdmin === true`, (4) Update mobile horizontal nav to include these groups, (5) Use `useTranslation("dashboard")` for all new labels
- [x] T018 Run `npm run lint && npm run build` to verify all foundational changes compile without errors. Fix any issues before proceeding

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Admin Reviews and Moderates Submitted Prompts (Priority: P1)

**Goal**: Admin can view pending prompts queue, review full details, and approve/reject prompts from the dashboard UI

**Independent Test**: Submit a prompt as a seller, log in as admin, navigate to `/dashboard/admin/moderation`, view the prompt, approve or reject it. Verify status changes on the marketplace.

### Implementation for User Story 1

- [x] T019 [P] [US1] Create `AdminModerationQueue` client component in `src/components/dashboard/AdminModerationQueue.tsx`. This component: (1) fetches `GET /api/admin/prompts?status=pending` on mount plus status counts via `countOnly=true` for pending/approved/rejected, (2) renders three count badges at top (pending, approved, rejected) with tab-style navigation to switch status filter, (3) renders a list of prompt cards showing: thumbnail, title (bilingual), seller name, AI model, price, submission date, and `PromptStatusBadge`, (4) clicking a card opens a detail/review dialog, (5) includes empty state when no prompts match filter, (6) uses i18n `dashboard` namespace. Mobile-first: stack cards vertically, single column
- [x] T020 [P] [US1] Create `AdminPromptReview` client component in `src/components/dashboard/AdminPromptReview.tsx`. This component: (1) accepts a prompt ID prop, (2) fetches full prompt detail from `GET /api/admin/prompts/[id]`, (3) renders a shadcn `Dialog` or full-page view with: prompt title, description (bilingual), full content preview (scrollable), seller info card, pricing, category, AI model, difficulty, tags, example outputs, (4) renders "Approve" (green) and "Reject" (red) action buttons, (5) "Reject" button shows a textarea for rejection reason (minimum 10 chars, validated client-side), (6) calls `POST /api/admin/prompts/[id]/review` with `{ action, reason }`, (7) shows toast on success/error via Sonner, (8) refreshes the queue after action. Use React Hook Form for rejection reason form
- [x] T021 [US1] Create admin moderation page at `src/app/[locale]/dashboard/admin/moderation/page.tsx`. Server Component that renders the page header and `AdminModerationQueue` client component. Include page title from i18n
- [x] T022 [P] [US1] Create loading skeleton at `src/app/[locale]/dashboard/admin/moderation/loading.tsx` with card-shaped skeletons matching the moderation queue layout
- [x] T023 [US1] Create admin dashboard index page at `src/app/[locale]/dashboard/admin/page.tsx` that redirects to `/dashboard/admin/moderation` using `redirect()` from `next/navigation`. This ensures navigating to `/dashboard/admin` lands on the moderation queue
- [x] T024 [US1] Add admin route protection: in the admin moderation page (and later admin pages), verify admin access server-side. If user is not admin, call `redirect("/dashboard")`. This handles the edge case of direct URL access by non-admins (FR-001)
- [x] T025 [US1] Run `npm run lint && npm run build` to verify User Story 1 compiles cleanly

**Checkpoint**: Admin moderation queue is fully functional — admins can review, approve, and reject prompts

---

## Phase 4: User Story 2 — Seller Manages Their Prompts (Priority: P1)

**Goal**: Seller can view their prompts by status, edit (via sell form reuse), and soft-delete prompts from the dashboard

**Independent Test**: Create prompts as a seller, navigate to `/dashboard/seller/prompts`, filter by status, click Edit (redirects to sell form), delete a prompt (confirmation dialog).

### Implementation for User Story 2

- [x] T026 [P] [US2] Create `GET /api/seller/prompts/[id]` route handler in `src/app/api/seller/prompts/[id]/route.ts`. Auth: `checkAuth()`, verify `sellerId === userId`. Return full prompt data (all fields needed by sell form) including status, rejectionReason, gallery, exampleOutputs, examplePrompts, fullContent. Map `price === 0` to `isFree: true`. This is the endpoint used to pre-populate the edit form
- [x] T027 [P] [US2] Create `PUT /api/seller/prompts/[id]` route handler in the same file `src/app/api/seller/prompts/[id]/route.ts`. Auth: `checkAuth()`, verify `sellerId === userId`. Validate body with `promptSubmissionSchema`. Update all prompt fields, reset `status` to `"pending"`, clear `rejectionReason`, `reviewedAt`, `reviewedBy`, set `updatedAt = new Date()`. Return `{ id, status, title, updatedAt }`
- [x] T028 [P] [US2] Create `DELETE /api/seller/prompts/[id]` route handler in the same file. Auth: `checkAuth()`, verify `sellerId === userId`. Soft-delete by setting `deletedAt = new Date()`. Return `{ id, deletedAt }`
- [x] T029 [US2] Create `SellerPromptsTable` client component in `src/components/dashboard/SellerPromptsTable.tsx`. This component: (1) fetches `GET /api/seller/prompts` with optional status and search filters, (2) renders a filter bar with status tabs (All, Pending, Approved, Rejected) and a search input, (3) renders a responsive table/card list showing: thumbnail, title, AI model, price, sales count, `PromptStatusBadge`, created date, and action buttons (Edit, Delete), (4) rejected prompts show rejection reason in an expandable section or tooltip, (5) "Edit" button navigates to `/sell?edit={promptId}`, (6) "Delete" button opens a shadcn `AlertDialog` confirmation — if prompt has sales > 0, show message about soft-delete/buyer access, (7) Delete calls `DELETE /api/seller/prompts/[id]`, shows toast, refreshes list, (8) empty state with link to `/sell`, (9) uses i18n `dashboard` namespace. Mobile: stack as cards, desktop: table layout
- [x] T030 [US2] Create seller prompts page at `src/app/[locale]/dashboard/seller/prompts/page.tsx`. Server Component rendering page header and `SellerPromptsTable` client component
- [x] T031 [P] [US2] Create loading skeleton at `src/app/[locale]/dashboard/seller/prompts/loading.tsx`
- [x] T032 [US2] Modify the sell page at `src/app/[locale]/sell/page.tsx` to support edit mode: (1) Read `searchParams.edit` (prompt UUID) from the URL, (2) If `edit` param exists: fetch `GET /api/seller/prompts/[id]` on mount, call `form.reset()` with fetched data mapped to `PromptSubmission` shape (set `isFree: price === 0`), disable localStorage draft persistence, change submit handler to call `PUT /api/seller/prompts/[id]` instead of `POST /api/prompts`, update success messaging (i18n: "updated" instead of "uploaded"), (3) If edit param missing: keep existing create flow unchanged, (4) Handle fetch errors (prompt not found, not owner) by showing toast and redirecting back, (5) Update page title to reflect edit vs create mode
- [x] T033 [US2] Run `npm run lint && npm run build` to verify User Story 2 compiles cleanly

**Checkpoint**: Seller prompt management is fully functional — sellers can view, filter, edit, and delete their prompts

---

## Phase 5: User Story 3 — Seller Views Sales & Earnings (Priority: P2)

**Goal**: Seller can view earnings summary (gross, commission, net) and detailed sales history with payout status

**Independent Test**: Complete a purchase as a buyer, then log in as the seller and navigate to `/dashboard/seller/earnings`. Verify the sale appears with correct amounts and payout status.

### Implementation for User Story 3

- [x] T034 [P] [US3] Create `GET /api/seller/earnings` route handler in `src/app/api/seller/earnings/route.ts`. Auth: `checkAuth()`. Query: (1) Join `orderItems` → `orders` → `prompts` where `prompts.sellerId === userId`, (2) Compute summary: totalSales (count), grossRevenue (SUM priceAtPurchase), totalCommission (SUM priceAtPurchase - sellerPayoutAmount), netEarnings (SUM sellerPayoutAmount), (3) Fetch seller's `payoutsEnabled` from `sellerProfiles`, (4) Query paginated sales list with: orderId, promptId, prompt title, order createdAt as saleDate, priceAtPurchase, commissionRate, computed commissionAmount, sellerPayoutAmount as netAmount, payoutStatus ("paid" if payoutsEnabled else "pending"), (5) Return total count for pagination. Use `sellerEarningsQuerySchema` for query validation. Handle null `sellerPayoutAmount` gracefully (default to 0)
- [x] T035 [P] [US3] Create `SellerEarningsOverview` client component in `src/components/dashboard/SellerEarningsOverview.tsx`. Renders 4 metric cards in a responsive grid: Total Sales (count), Gross Revenue (formatted currency), Commission Deducted (formatted currency), Net Earnings (formatted currency). Include a Stripe Connect status indicator — if `payoutsEnabled` is true show green badge "المدفوعات مفعّلة", else show warning with link to `/sell` for onboarding. Use shadcn `Card` components. Format amounts from cents to dollars
- [x] T036 [P] [US3] Create `SellerSalesHistory` client component in `src/components/dashboard/SellerSalesHistory.tsx`. Renders a paginated table of individual sales: date (formatted Arabic locale), prompt title (as link to prompt), sale price, commission %, commission amount, net amount, payout status badge ("paid" green or "pending" yellow). Include empty state. Mobile: stack as cards. Use shadcn `Table` on desktop
- [x] T037 [US3] Create seller earnings page at `src/app/[locale]/dashboard/seller/earnings/page.tsx`. Server Component rendering page header, `SellerEarningsOverview`, and `SellerSalesHistory` client components. Compose as a vertical stack with spacing
- [x] T038 [P] [US3] Create loading skeleton at `src/app/[locale]/dashboard/seller/earnings/loading.tsx` with metric card skeletons and table row skeletons
- [x] T039 [US3] Run `npm run lint && npm run build` to verify User Story 3 compiles cleanly

**Checkpoint**: Seller earnings view is fully functional — sellers can see revenue breakdown and sales history

---

## Phase 6: User Story 4 — Admin Views Marketplace Analytics (Priority: P2)

**Goal**: Admin can view marketplace-wide metrics (sales, revenue, commission, sellers, prompts) and top-performing prompts

**Independent Test**: Log in as admin, navigate to `/dashboard/admin/analytics`. Verify metrics match database totals.

### Implementation for User Story 4

- [x] T040 [P] [US4] Create `GET /api/admin/stats` route handler in `src/app/api/admin/stats/route.ts`. Auth: `checkAdmin()`. Queries: (1) COUNT all orders for totalSales, (2) SUM orders.amountTotal for totalRevenue, (3) SUM (orderItems.priceAtPurchase - orderItems.sellerPayoutAmount) for totalCommission — handle nulls with COALESCE, (4) COUNT DISTINCT prompts.sellerId WHERE status='approved' AND deletedAt IS NULL for activeSellers, (5) COUNT prompts WHERE status='approved' AND deletedAt IS NULL for activePrompts, (6) COUNT prompts WHERE status='pending' AND deletedAt IS NULL for pendingPrompts, (7) Top 5 prompts by sales (approved, non-deleted) with id, title, titleEn, sales, thumbnail, and computed revenue from orderItems SUM. Return all in a single response object
- [x] T041 [P] [US4] Create `AdminAnalyticsCards` client component in `src/components/dashboard/AdminAnalyticsCards.tsx`. Fetches `GET /api/admin/stats` on mount. Renders: (1) Top metric cards in 2x3 grid: Total Sales, Total Revenue, Commission Collected, Active Sellers, Active Prompts, Pending Prompts — each with icon, value, and label, (2) "Top 5 Best-Selling Prompts" section below as a ranked list showing: rank number, thumbnail, title, sales count, revenue — each prompt links to admin detail view, (3) Empty state when all metrics are zero. Use shadcn `Card`. Format currency from cents. Use i18n `dashboard` namespace
- [x] T042 [US4] Create admin analytics page at `src/app/[locale]/dashboard/admin/analytics/page.tsx`. Server Component with admin protection (redirect non-admins), renders page header and `AdminAnalyticsCards` client component
- [x] T043 [P] [US4] Create loading skeleton at `src/app/[locale]/dashboard/admin/analytics/loading.tsx` with 6 metric card skeletons and a list skeleton
- [x] T044 [US4] Run `npm run lint && npm run build` to verify User Story 4 compiles cleanly

**Checkpoint**: Admin analytics view is fully functional — admins can see marketplace health metrics

---

## Phase 7: User Story 5 — Admin Manages Orders & Payments (Priority: P2)

**Goal**: Admin can view paginated orders list with filters and drill into order details with commission breakdown

**Independent Test**: Create orders through checkout, log in as admin, navigate to `/dashboard/admin/orders`. Filter by status/date/seller, click an order to see details.

### Implementation for User Story 5

- [x] T045 [P] [US5] Create `GET /api/admin/orders` route handler in `src/app/api/admin/orders/route.ts`. Auth: `checkAdmin()`. Validate query with `adminOrdersQuerySchema`. Query: (1) Select orders with COUNT of orderItems as itemCount, (2) Apply filters: status, dateFrom/dateTo (createdAt range), sellerId (join through orderItems → prompts), (3) Order by createdAt DESC, (4) Paginate with limit/offset, (5) Return total count. Map rows via `mapAdminOrderRow()`
- [x] T046 [P] [US5] Create `GET /api/admin/orders/[id]` route handler in `src/app/api/admin/orders/[id]/route.ts`. Auth: `checkAdmin()`. Validate UUID param. Query: (1) Fetch order by id, (2) Fetch all orderItems for this order joined with prompts for title and sellerName/sellerId, (3) Return order details with items array including commission breakdown per item. Map via `mapAdminOrderDetailRow()`
- [x] T047 [P] [US5] Create `AdminOrdersTable` client component in `src/components/dashboard/AdminOrdersTable.tsx`. This component: (1) fetches `GET /api/admin/orders` with filter params, (2) renders a filter bar with: status dropdown (All, Completed, Refunded), date range inputs (from/to), seller search input, (3) renders a paginated table: order ID (truncated UUID), date, buyer ID, total amount (formatted), item count, status badge, (4) clicking a row opens an order detail dialog/panel showing: full order info, payment intent ID, and items table with prompt title, seller name, price, commission rate, commission amount, seller payout, seller Stripe account, (5) pagination controls (Previous/Next with page indicator), (6) empty state. Mobile: card layout. Use shadcn `Table`, `Select`, `Input`, `Dialog`
- [x] T048 [US5] Create admin orders page at `src/app/[locale]/dashboard/admin/orders/page.tsx`. Server Component with admin protection, renders page header and `AdminOrdersTable` client component
- [x] T049 [P] [US5] Create loading skeleton at `src/app/[locale]/dashboard/admin/orders/loading.tsx` with filter bar skeleton and table row skeletons
- [x] T050 [US5] Run `npm run lint && npm run build` to verify User Story 5 compiles cleanly

**Checkpoint**: Admin orders view is fully functional — admins can browse and inspect all marketplace orders

---

## Phase 8: User Story 6 — Seller Edits Profile Information (Priority: P3)

**Goal**: Seller can edit their public display name, bio, and avatar from the dashboard

**Independent Test**: Log in as seller, navigate to `/dashboard/seller/profile`, edit fields, save, verify changes on public storefront.

### Implementation for User Story 6

- [x] T051 [P] [US6] Create `GET /api/seller/profile` route handler in `src/app/api/seller/profile/route.ts`. Auth: `checkAuth()`. Query: fetch from `sellerProfiles` where `userId === userId`. Return full profile data (displayName, avatar, bio, country, Stripe status, earnings, sales, createdAt). Return 404 if no profile exists. Map via `mapSellerProfileEditRow()`
- [x] T052 [P] [US6] Create `PUT /api/seller/profile` route handler in the same file. Auth: `checkAuth()`. Validate body with `sellerProfileUpdateSchema`. Update `sellerProfiles` row: displayName, bio, avatar, updatedAt. Also update denormalized `sellerName` and `sellerAvatar` columns on all prompts owned by this seller (`UPDATE prompts SET seller_name = :displayName, seller_avatar = :avatar WHERE seller_id = :userId`). Return updated profile data
- [x] T053 [US6] Create `SellerProfileForm` client component in `src/components/dashboard/SellerProfileForm.tsx`. This component: (1) fetches `GET /api/seller/profile` on mount, (2) renders a form with React Hook Form + zodResolver using `sellerProfileUpdateSchema`: display name input, bio textarea (max 500 chars with counter), avatar upload (click to upload, preview current avatar, uses existing `/api/upload/image` endpoint), (3) Stripe Connect status section showing: account status badges (chargesEnabled, payoutsEnabled), link to complete onboarding if not fully set up, (4) read-only fields: country, total earnings, total sales, member since date, (5) "Save" button calls `PUT /api/seller/profile`, shows toast on success/error, (6) Loading state while fetching. Use shadcn `Form`, `Input`, `Textarea`, `Avatar`, `Button`, `Card`
- [x] T054 [US6] Create seller profile page at `src/app/[locale]/dashboard/seller/profile/page.tsx`. Server Component rendering page header and `SellerProfileForm` client component
- [x] T055 [P] [US6] Create loading skeleton at `src/app/[locale]/dashboard/seller/profile/loading.tsx` with avatar skeleton, input field skeletons, and card skeletons
- [x] T056 [US6] Run `npm run lint && npm run build` to verify User Story 6 compiles cleanly

**Checkpoint**: Seller profile editing is fully functional — sellers can update their public identity

---

## Phase 9: User Story 7 — Admin Controls Commission & Pricing (Priority: P3)

**Goal**: Admin can view and update the marketplace commission rate from the dashboard settings page

**Independent Test**: Log in as admin, navigate to `/dashboard/admin/settings`, see current rate (20%), change to 15%, save, verify the new rate is stored.

### Implementation for User Story 7

- [x] T057 [P] [US7] Create `GET /api/admin/settings` route handler in `src/app/api/admin/settings/route.ts`. Auth: `checkAdmin()`. Query: fetch from `marketplaceSettings` where id = 1. If no row exists, insert default row (commissionRate: 0.20) and return it. Return commissionRate, updatedAt, updatedBy
- [x] T058 [P] [US7] Create `PUT /api/admin/settings` route handler in the same file. Auth: `checkAdmin()`. Validate body with `adminSettingsUpdateSchema`. Upsert `marketplaceSettings` row with `INSERT ... ON CONFLICT (id) DO UPDATE SET commission_rate = :rate, updated_at = NOW(), updated_by = :userId`. Return updated settings
- [x] T059 [US7] Create admin settings page at `src/app/[locale]/dashboard/admin/settings/page.tsx`. This can be a Client Component (or Server + client child). Renders: (1) page header "إعدادات السوق", (2) current commission rate displayed prominently, (3) a form with React Hook Form + zodResolver using `adminSettingsUpdateSchema`: commission rate input (number, step 0.01, min 0.01, max 0.50) displayed as percentage (multiply by 100 for display, divide by 100 for submission), (4) "Last updated by" and "Last updated at" metadata, (5) Save button calls `PUT /api/admin/settings`, shows toast, (6) Admin route protection (redirect non-admins). Use shadcn `Card`, `Form`, `Input`, `Button`
- [x] T060 [P] [US7] Create loading skeleton at `src/app/[locale]/dashboard/admin/settings/loading.tsx`
- [x] T061 [US7] Run `npm run lint && npm run build` to verify User Story 7 compiles cleanly

**Checkpoint**: Admin commission control is fully functional — admins can adjust the marketplace commission rate

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final verification, edge cases, and quality assurance across all stories

- [x] T062 Verify all dashboard pages render correctly in RTL (Arabic) by checking: text alignment, icon placement (ml vs mr → use logical properties), sidebar layout direction, table column order, form field alignment. Fix any RTL issues found
- [x] T063 Verify all dashboard pages render correctly in LTR (English) by switching locale and checking the same items. Fix any layout issues
- [x] T064 Verify mobile responsiveness of all new dashboard pages at viewport < 640px: sidebar collapses to horizontal nav, tables switch to card layout, forms are single-column, touch targets are >= 44px. Fix any mobile issues
- [x] T065 Verify empty states across all pages: seller with no prompts, seller with no sales, admin with no pending prompts, admin with no orders, admin analytics with zero data. Ensure each shows a clear, helpful empty state message with guidance
- [x] T066 Verify edge case: user who is both admin and seller sees both navigation sections simultaneously and can access all pages. Test switching between admin and seller sections
- [x] T067 Verify edge case: non-admin accessing admin URLs directly gets redirected to `/dashboard` (not a blank page or error)
- [x] T068 Verify soft-delete: after seller deletes a prompt, (1) it disappears from marketplace search, (2) it disappears from admin moderation queue, (3) buyer who purchased it can still see it in purchases. Test the full flow
- [x] T069 Final `npm run lint && npm run build` — ensure zero errors and zero warnings across the entire codebase
- [x] T070 Run quickstart.md validation: follow the manual testing steps in `specs/014-seller-admin-dashboards/quickstart.md` for both admin and seller flows to confirm end-to-end functionality

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T004) for i18n and shared components — BLOCKS all user stories
- **User Stories (Phase 3–9)**: All depend on Foundational (Phase 2) completion
  - US1 and US2 (P1): Can proceed in parallel after Foundation
  - US3, US4, US5 (P2): Can proceed in parallel after Foundation
  - US6, US7 (P3): Can proceed in parallel after Foundation
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Foundation only — uses existing admin API endpoints
- **US2 (P1)**: Foundation only — creates new seller prompt mutation endpoints + modifies sell form
- **US3 (P2)**: Foundation only — new earnings API + UI
- **US4 (P2)**: Foundation only — new stats API + UI
- **US5 (P2)**: Foundation only — new orders API + UI
- **US6 (P3)**: Foundation only — new profile API + UI
- **US7 (P3)**: Foundation only — uses marketplace_settings table from Foundation

### Within Each User Story

- API route handlers before UI components (components fetch from APIs)
- Components before pages (pages compose components)
- Loading skeletons are [P] — can be created alongside main components
- lint/build check at end of each story

### Parallel Opportunities

- T001, T002, T003, T004 (Setup) — all different files, fully parallel
- T005, T006, T007 (Foundation schemas) — different files, parallel
- T011, T012 (Zod schemas + mappers) — different files, parallel
- T013, T014, T015 (existing query updates) — different files, parallel
- Within each US phase: API route [P] tasks can run in parallel, loading.tsx [P] tasks can run alongside main components
- US1 and US2 can run fully in parallel (different API routes, different pages)
- US3, US4, US5 can run fully in parallel
- US6 and US7 can run fully in parallel

---

## Parallel Example: User Story 1

```bash
# Launch API-independent tasks together:
Task: T019 "AdminModerationQueue component"
Task: T020 "AdminPromptReview component"
Task: T022 "Loading skeleton"

# Then compose:
Task: T021 "Moderation page" (uses T019, T020)
Task: T023 "Admin index redirect"
Task: T024 "Admin route protection"
```

## Parallel Example: User Story 5

```bash
# Launch API routes in parallel:
Task: T045 "GET /api/admin/orders"
Task: T046 "GET /api/admin/orders/[id]"

# Then UI:
Task: T047 "AdminOrdersTable component"
Task: T049 "Loading skeleton"

# Then compose:
Task: T048 "Admin orders page"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (T001–T004)
2. Complete Phase 2: Foundational (T005–T018)
3. Complete Phase 3: US1 — Admin Moderation (T019–T025)
4. Complete Phase 4: US2 — Seller Prompt Management (T026–T033)
5. **STOP and VALIDATE**: Both P1 stories independently functional
6. Deploy/demo if ready — admins can moderate, sellers can manage prompts

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. + US1 (Admin Moderation) → Admins can review prompts (MVP!)
3. + US2 (Seller Prompts) → Sellers can manage their catalog
4. + US3 (Seller Earnings) → Sellers see financial data
5. + US4 (Admin Analytics) → Admins see marketplace metrics
6. + US5 (Admin Orders) → Admins have financial oversight
7. + US6 (Seller Profile) → Sellers can customize identity
8. + US7 (Admin Commission) → Admins control pricing
9. Polish → RTL, mobile, edge cases verified

---

## Summary

| Phase | Story | Tasks | Parallel |
|-------|-------|-------|----------|
| 1. Setup | — | T001–T004 (4) | 4 parallel |
| 2. Foundational | — | T005–T018 (14) | 6 parallel groups |
| 3. US1 Admin Moderation | P1 | T019–T025 (7) | 3 parallel |
| 4. US2 Seller Prompts | P1 | T026–T033 (8) | 3 parallel |
| 5. US3 Seller Earnings | P2 | T034–T039 (6) | 3 parallel |
| 6. US4 Admin Analytics | P2 | T040–T044 (5) | 3 parallel |
| 7. US5 Admin Orders | P2 | T045–T050 (6) | 3 parallel |
| 8. US6 Seller Profile | P3 | T051–T056 (6) | 2 parallel |
| 9. US7 Admin Commission | P3 | T057–T061 (5) | 2 parallel |
| 10. Polish | — | T062–T070 (9) | sequential |
| **Total** | | **70 tasks** | |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Run `npm run lint && npm run build` after every completed task per CLAUDE.md

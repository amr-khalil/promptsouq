# Research: Seller & Admin Dashboards

**Feature**: 014-seller-admin-dashboards
**Date**: 2026-02-18

## R-001: Soft-Delete Strategy for Purchased Prompts

**Decision**: Add a nullable `deletedAt` timestamp column to the `prompts` table.

**Rationale**: Soft-delete via timestamp is the cleanest approach because:
- Preserves the original `status` column semantics (pending/approved/rejected) — no conflation with deletion state.
- Existing public queries filter on `status === "approved"` AND will additionally check `deletedAt IS NULL`.
- Buyer purchase queries join `orderItems → prompts` and should NOT filter on `deletedAt`, ensuring buyers retain access.
- The seller dashboard can show deleted prompts separately (or hide them) while preserving history.

**Alternatives considered**:
- Adding `"deleted"` as a status enum value — rejected because it loses the prompt's original approval status and complicates analytics queries.
- Hard delete with orphaned `orderItems` — rejected because it breaks buyer access (spec requires soft-delete per clarification).

---

## R-002: Marketplace Settings Table for Commission Rate

**Decision**: Create a single-row `marketplace_settings` table in Drizzle schema.

**Rationale**: A database table is the right choice because:
- Commission rate must be updatable at runtime by admins without redeployment (SC-008).
- Environment variables require a redeploy to change.
- A DB row can be read by both API routes and webhook handlers.
- Single-row pattern is simple: `id = 1` always, with `INSERT ON CONFLICT` for upsert.

**Schema**:
- `id` integer PK (default 1)
- `commissionRate` real (default 0.20, range 0.01–0.50)
- `updatedAt` timestamp
- `updatedBy` text (admin userId from Clerk)

**Alternatives considered**:
- Environment variable — rejected because requires redeploy.
- JSON config file — rejected because not accessible at runtime in serverless.
- In-memory cache with DB backing — over-engineering for current scale.

---

## R-003: Seller Earnings Query Strategy

**Decision**: Query `orderItems` joined with `orders` and `prompts`, filtered by seller ID, to compute earnings.

**Rationale**: The `orderItems` table already has:
- `commissionRate` (real, e.g. 0.20)
- `sellerPayoutAmount` (integer, in cents)
- `sellerStripeAccountId` (text)
- `priceAtPurchase` (integer, in cents)

These fields are populated at checkout time. Earnings can be computed as:
- Gross revenue = `SUM(priceAtPurchase)` for items where prompt seller matches
- Commission = `SUM(priceAtPurchase - sellerPayoutAmount)`
- Net = `SUM(sellerPayoutAmount)`

**Payout status**: Derived from whether Stripe has completed the transfer. For MVP, payout status is simplified to:
- "paid" — if `sellerStripeAccountId` is set and the seller's Connect account has `payoutsEnabled`
- "pending" — otherwise

For a more accurate approach in the future, we'd query Stripe Transfer objects. For MVP, the above heuristic is sufficient.

**Alternatives considered**:
- Pre-computed aggregates in `sellerProfiles.totalEarnings` — already exists but doesn't provide per-sale breakdown. Use it for summary cards; use raw query for detailed history.

---

## R-004: Dashboard Navigation Architecture

**Decision**: Extend the existing `DashboardSidebar` component with conditional sections based on user role.

**Rationale**:
- The sidebar currently has 6 static nav items for buyers.
- Seller sections appear when user has a `sellerProfiles` record (checked via API or passed as prop).
- Admin sections appear when user has `publicMetadata.role === "admin"` (from Clerk).
- Both conditions can be true simultaneously (admin who is also a seller).

**Implementation approach**:
- The dashboard layout (`layout.tsx`) fetches seller profile existence and admin status server-side.
- Passes `isSeller` and `isAdmin` as props to `DashboardSidebar`.
- Sidebar renders additional nav groups conditionally.
- Admin routes are protected both client-side (navigation hidden) and server-side (API returns 403).

**Alternatives considered**:
- Separate `/admin` route outside dashboard — rejected because user wants unified dashboard with sidebar.
- Middleware-level route protection — the existing pattern uses route handler checks, keep consistent.

---

## R-005: Edit Prompt via Sell Form Reuse

**Decision**: Add an `?edit=UUID` query parameter to the sell page. When present, fetch the prompt and pre-populate the form.

**Rationale**:
- The sell form already handles all prompt fields, validation, and image uploads.
- Building a separate edit form would duplicate ~300 lines of form logic and all field components.
- The form's localStorage draft feature should be disabled in edit mode (use server data instead).
- On submit, use `PUT /api/seller/prompts/[id]` instead of `POST /api/prompts`.

**Changes needed**:
1. Sell page reads `?edit=UUID` from searchParams.
2. If present, fetches `GET /api/seller/prompts/[id]` (new endpoint returning full prompt data for the owner).
3. Pre-populates `form.reset(fetchedData)` instead of `defaultValues`.
4. Disables draft persistence in edit mode.
5. Submit handler calls PUT instead of POST.
6. Success state shows "updated" instead of "uploaded" messaging.

**Alternatives considered**:
- Inline edit modal in dashboard — rejected per clarification (Option A selected).
- Separate edit page component — rejected because it duplicates the entire sell form.

---

## R-006: Admin Orders Query with Filters

**Decision**: New `GET /api/admin/orders` endpoint with pagination, status filter, date range, and seller filter.

**Rationale**: The existing orders schema stores `userId` (buyer), and `orderItems` links to `prompts` which has `sellerId`. To show seller info in the admin orders list:
- Join `orders` → `orderItems` → `prompts` (for seller info)
- Or denormalize: the `orderItems` already has `sellerStripeAccountId` but not seller name/ID directly.

**Approach**: Join through `prompts` for seller name, or aggregate `orderItems` per order. For the list view, show order-level summary (total, buyer, date, status). For detail view, show individual items with seller info.

**Pagination**: Use offset/limit with total count for simple pagination. Cursor-based not needed at current scale.

---

## R-007: i18n Dashboard Namespace

**Decision**: Create a new `dashboard` i18n namespace with translations for all seller and admin dashboard strings.

**Rationale**:
- Existing namespaces: `auth`, `common`, `home`, `market`, `prompt`, `search`, `sell`, `subscription`.
- The current dashboard pages use hardcoded Arabic strings.
- A single `dashboard` namespace covers both seller and admin sections (they share the layout).
- Key structure: `dashboard.sidebar.*`, `dashboard.seller.*`, `dashboard.admin.*`, `dashboard.common.*`.

**Alternatives considered**:
- Separate `seller-dashboard` and `admin-dashboard` namespaces — over-splitting for the amount of strings involved.
- Adding to `common` namespace — too broad, would bloat the common file.

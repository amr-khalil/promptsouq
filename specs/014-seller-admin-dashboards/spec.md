# Feature Specification: Seller & Admin Dashboards

**Feature Branch**: `014-seller-admin-dashboards`
**Created**: 2026-02-18
**Status**: Draft
**Input**: User description: "Create seller and admin dashboards with prompt moderation, sales analytics, earnings tracking, and marketplace control"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin Reviews and Moderates Submitted Prompts (Priority: P1)

An admin navigates to the admin dashboard and sees a queue of pending prompts awaiting review. They can view full prompt details (title, description, content preview, seller info, pricing), then approve or reject each prompt with an optional reason. The dashboard shows counts of pending, approved, and rejected prompts.

**Why this priority**: Prompt moderation is the core marketplace quality gate. Without it, low-quality or harmful content reaches buyers. The API already exists; this adds the UI layer.

**Independent Test**: Can be fully tested by submitting a prompt as a seller, then logging in as admin to approve/reject it. Delivers immediate marketplace quality control.

**Acceptance Scenarios**:

1. **Given** an admin user with `publicMetadata.role === "admin"`, **When** they navigate to `/dashboard/admin`, **Then** they see the admin dashboard with a prompt moderation queue showing all pending prompts.
2. **Given** an admin viewing the moderation queue, **When** they click on a pending prompt, **Then** they see full prompt details including content preview, seller info, pricing, and category.
3. **Given** an admin reviewing a prompt, **When** they click "Approve", **Then** the prompt status changes to "approved" and it becomes visible on the marketplace.
4. **Given** an admin reviewing a prompt, **When** they click "Reject" and provide a reason, **Then** the prompt status changes to "rejected" and the rejection reason is stored for the seller to see.
5. **Given** a non-admin user, **When** they attempt to access `/dashboard/admin`, **Then** they are redirected to the regular dashboard with no admin sections visible.

---

### User Story 2 - Seller Manages Their Prompts (Priority: P1)

A seller navigates to their dashboard and sees all their submitted prompts organized by status (draft, pending, approved, rejected). They can edit existing prompts, delete prompts, and see the rejection reason for rejected prompts so they can fix and resubmit.

**Why this priority**: Sellers need to manage their catalog. The prompt list API exists but has no dedicated management UI in the dashboard.

**Independent Test**: Can be fully tested by creating prompts, then viewing/editing/deleting them from the seller dashboard section.

**Acceptance Scenarios**:

1. **Given** an authenticated seller, **When** they navigate to the "My Prompts" section of the dashboard, **Then** they see a list of their prompts with status badges (pending, approved, rejected).
2. **Given** a seller viewing their prompts, **When** they click "Edit" on an approved or rejected prompt, **Then** they are navigated to the sell form pre-populated with the prompt's current data, and upon resubmission the status returns to "pending" for re-review.
3. **Given** a seller with a rejected prompt, **When** they view the prompt, **Then** they see the admin's rejection reason.
4. **Given** a seller viewing their prompts, **When** they click "Delete" on a prompt, **Then** the system asks for confirmation before removing the prompt. If the prompt has been purchased, the confirmation message indicates it will be hidden from the marketplace but buyers will retain access.
5. **Given** a seller deleting a purchased prompt, **When** the deletion completes, **Then** the prompt no longer appears in marketplace search or the seller's public storefront, but existing buyers can still access the purchased content from their purchases page.
5. **Given** a seller with no prompts, **When** they visit the "My Prompts" section, **Then** they see an empty state with a link to the sell page.

---

### User Story 3 - Seller Views Sales & Earnings (Priority: P2)

A seller views their sales history and earnings breakdown in the dashboard. They see total sales count, gross revenue, marketplace commission deducted, and net earnings. Each sale shows the date, prompt title, price, and payout status.

**Why this priority**: Financial visibility is essential for seller retention. Sellers need to understand their earnings and payout timeline.

**Independent Test**: Can be tested by completing a purchase flow as a buyer, then viewing the seller dashboard to confirm the sale appears with correct amounts.

**Acceptance Scenarios**:

1. **Given** a seller with completed sales, **When** they navigate to the "Sales & Earnings" section, **Then** they see total sales count, gross revenue, commission amount, and net earnings.
2. **Given** a seller viewing sales history, **When** they look at individual sales, **Then** each entry shows the date, prompt title, sale price, commission deducted, and net amount.
3. **Given** a seller with Stripe Connect set up, **When** they view earnings, **Then** they see payout status indicators (pending or paid) for each earnings period.
4. **Given** a seller with no sales, **When** they visit the earnings section, **Then** they see an empty state showing zero earnings with a message encouraging promotion of their prompts.

---

### User Story 4 - Admin Views Marketplace Analytics (Priority: P2)

An admin accesses an analytics overview showing total marketplace sales, total revenue, commission collected, number of active sellers, and top-performing prompts. This provides a bird's-eye view of marketplace health.

**Why this priority**: Admins need data to make decisions about marketplace direction, identify popular categories, and spot trends.

**Independent Test**: Can be tested by viewing the admin analytics page and verifying the displayed numbers match the sum of all orders and seller data in the database.

**Acceptance Scenarios**:

1. **Given** an admin on the dashboard, **When** they view the analytics overview, **Then** they see total sales count, total revenue, total commission collected, active seller count, and active prompt count.
2. **Given** an admin viewing analytics, **When** they look at the best-selling section, **Then** they see the top 5 best-selling prompts with their sales count and revenue.
3. **Given** an admin viewing analytics, **When** the marketplace has no data, **Then** all metrics show zero with an appropriate empty state message.

---

### User Story 5 - Admin Manages Orders & Payments (Priority: P2)

An admin views all marketplace orders with details including buyer, seller, amount, payment status, and commission. They can see which orders have been paid out to sellers and which are still pending.

**Why this priority**: Financial oversight is required for dispute handling, refund decisions, and ensuring correct payouts.

**Independent Test**: Can be tested by creating orders through the checkout flow, then verifying they appear correctly in the admin orders list with accurate payment details.

**Acceptance Scenarios**:

1. **Given** an admin on the dashboard, **When** they navigate to the "Orders" section, **Then** they see a paginated list of all marketplace orders with buyer info, seller info, amount, and status.
2. **Given** an admin viewing an order, **When** they click on it, **Then** they see full order details including individual items, payment intent ID, commission breakdown, and payout status.
3. **Given** an admin viewing orders, **When** they use the search/filter options, **Then** they can filter by status, date range, seller, or buyer.

---

### User Story 6 - Seller Edits Profile Information (Priority: P3)

A seller can edit their public profile from the dashboard including display name, bio, and avatar. This information appears on their public seller storefront page and next to their prompts.

**Why this priority**: Seller identity builds trust. The seller profile table exists but there's no editing UI in the dashboard.

**Independent Test**: Can be tested by editing profile fields and verifying the changes reflect on the public seller storefront page.

**Acceptance Scenarios**:

1. **Given** a seller on the dashboard, **When** they navigate to "Seller Profile", **Then** they see their current display name, bio, and avatar with edit options.
2. **Given** a seller editing their profile, **When** they update fields and save, **Then** the changes are persisted and reflected on their public storefront.
3. **Given** a seller editing their profile, **When** they upload a new avatar, **Then** the image is uploaded and the old avatar is replaced.

---

### User Story 7 - Admin Controls Commission & Pricing (Priority: P3)

An admin can view and update the marketplace commission rate. The current rate is displayed on the admin dashboard, and changes apply to future sales only.

**Why this priority**: Commission control is important for marketplace economics but can start with a simple display/edit rather than complex rule engines.

**Independent Test**: Can be tested by viewing the current commission rate, updating it, and verifying the new rate applies to subsequent sales.

**Acceptance Scenarios**:

1. **Given** an admin on the dashboard, **When** they navigate to "Settings", **Then** they see the current marketplace commission rate (default: 20%).
2. **Given** an admin editing commission, **When** they change the rate and save, **Then** the new rate is stored and applied to all future sales.
3. **Given** an admin changing commission, **When** they set an invalid rate (negative or above 50%), **Then** the system shows a validation error.

---

### Edge Cases

- What happens when a seller's Stripe Connect account is deactivated or suspended? The dashboard shows a warning banner and disables new prompt submissions until resolved.
- What happens when an admin tries to approve a prompt whose seller has no Stripe Connect? The system allows approval but flags that the seller cannot receive payouts until onboarding completes.
- What happens if the same user is both an admin and a seller? They see both admin and seller sections in the dashboard navigation.
- What happens when a prompt is edited while it has "pending" status? The edit is allowed and resets the review queue position.
- What happens when an admin rejects a prompt without providing a reason? The system requires a rejection reason (minimum 10 characters).
- What happens when a seller deletes a prompt that has been purchased? The system soft-deletes it (hidden from marketplace) but buyers retain access to purchased content.

## Requirements *(mandatory)*

### Functional Requirements

#### Admin Dashboard

- **FR-001**: System MUST restrict all admin dashboard pages and admin API endpoints to users with Clerk `publicMetadata.role === "admin"`.
- **FR-002**: System MUST display a prompt moderation queue showing all prompts with "pending" status, sorted by submission date (oldest first).
- **FR-003**: System MUST allow admins to approve a pending prompt, changing its status to "approved" and making it visible on the marketplace.
- **FR-004**: System MUST allow admins to reject a pending prompt with a mandatory rejection reason (minimum 10 characters), changing its status to "rejected".
- **FR-005**: System MUST display marketplace-wide analytics: total sales count, total revenue, total commission collected, active seller count, and active prompt count.
- **FR-006**: System MUST display the top 5 best-selling prompts by sales count.
- **FR-007**: System MUST display a paginated list of all marketplace orders with buyer, seller, amount, status, and date.
- **FR-008**: System MUST allow admins to filter orders by status, date range, and seller.
- **FR-009**: System MUST display the current marketplace commission rate and allow admins to update it (valid range: 1%–50%).
- **FR-010**: Commission rate changes MUST only apply to future sales, not retroactively modify existing order data.

#### Seller Dashboard

- **FR-011**: System MUST display all prompts owned by the current seller, grouped or filterable by status (pending, approved, rejected).
- **FR-012**: System MUST allow sellers to edit any of their prompts by navigating to the existing sell form pre-populated with the prompt's current data. Editing an approved or rejected prompt MUST reset its status to "pending" for re-review.
- **FR-013**: System MUST allow sellers to delete their own prompts with a confirmation step. If the prompt has been purchased by any buyer, the system MUST perform a soft-delete (hide from marketplace and seller catalog) while preserving buyer access to the purchased content.
- **FR-014**: System MUST display the admin rejection reason on rejected prompts so sellers can understand what to fix.
- **FR-015**: System MUST display seller earnings summary: total sales count, gross revenue, commission deducted, and net earnings.
- **FR-016**: System MUST display a sales history list showing each sale's date, prompt title, sale price, commission, net amount, and payout status.
- **FR-017**: System MUST display payout status indicators: "pending" for unpaid earnings and "paid" for completed payouts.
- **FR-018**: System MUST allow sellers to edit their public profile (display name, bio, avatar) from the dashboard.
- **FR-019**: System MUST show a Stripe Connect status indicator in the seller dashboard, with a link to complete onboarding if not fully set up.

#### Shared / Navigation

- **FR-020**: System MUST extend the existing dashboard sidebar navigation with seller-specific sections (My Prompts, Sales & Earnings, Seller Profile) visible only to users who have a seller profile record (created during Stripe Connect onboarding or first prompt submission).
- **FR-021**: System MUST extend the existing dashboard sidebar with an admin section (Moderation, Orders, Analytics, Settings) visible only to admin users.
- **FR-022**: All dashboard pages MUST support Arabic (RTL) as the primary language with English as a secondary option, consistent with the existing i18n setup.
- **FR-023**: All dashboard pages MUST include loading states (skeletons) and handle empty states gracefully.

### Key Entities

- **Seller Profile**: Represents a seller's identity and payment status. Contains display name, bio, avatar, Stripe Connect details, lifetime earnings, and total sales count.
- **Prompt (seller context)**: A prompt from the seller's management perspective, including its moderation status, rejection reason, creation/update timestamps, and performance metrics.
- **Order**: A completed marketplace transaction linking buyer, seller, purchased prompts, amounts, commission, and payout status.
- **Marketplace Settings**: Global configuration including commission rate. Applies to all future transactions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admins can review and approve/reject a pending prompt within 3 clicks from the moderation queue.
- **SC-002**: Sellers can view their complete sales history and earnings breakdown within 2 seconds of navigating to the earnings page.
- **SC-003**: Admin analytics page loads all marketplace-wide metrics within 3 seconds.
- **SC-004**: Sellers can edit and resubmit a rejected prompt within 5 clicks from the rejection notification.
- **SC-005**: 100% of admin-only pages and endpoints are inaccessible to non-admin users.
- **SC-006**: All dashboard pages render correctly in both Arabic (RTL) and English (LTR) layouts.
- **SC-007**: Empty states are displayed with clear guidance when sellers have no prompts or sales.
- **SC-008**: Commission rate changes take effect immediately for all new sales without requiring a system restart.

## Clarifications

### Session 2026-02-18

- Q: What happens when a seller deletes a prompt that has been purchased by buyers? → A: Soft-delete — prompt is hidden from marketplace but buyers retain access to purchased content.
- Q: What defines a "seller" for dashboard navigation visibility? → A: A user with a `sellerProfiles` record (created during Stripe Connect onboarding or first prompt submission).
- Q: How does the prompt edit experience work? → A: Reuse the existing sell form — "Edit" navigates to the sell page pre-populated with the prompt's current data.

## Assumptions

- The marketplace commission rate is stored as a global setting (database row or environment variable), defaulting to 20%.
- Payout status is derived from Stripe Connect data. The system does not initiate payouts directly — Stripe handles automatic payout schedules for Connect accounts.
- "Active sellers" in analytics means sellers with at least one approved prompt.
- "Active prompts" in analytics means prompts with "approved" status.
- The existing dashboard sidebar navigation pattern (used by the user dashboard) will be extended rather than replaced.
- Admin users are identified exclusively via Clerk `publicMetadata.role === "admin"` — there is no separate admin user table.
- Profile avatar uploads use the existing Supabase Storage integration (`prompt-images` bucket or a new `avatars` bucket).
- Order item data already includes `commissionRate` and `sellerPayoutAmount` columns, which will be used for earnings calculations.

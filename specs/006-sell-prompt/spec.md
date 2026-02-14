# Feature Specification: Sell Prompt

**Feature Branch**: `006-sell-prompt`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Multi-step prompt selling flow with submission, file upload, Stripe payouts, seller dashboard, and admin review"

## Clarifications

### Session 2026-02-14

- Q: How is admin role determined for prompt review access? → A: Clerk `publicMetadata.role = "admin"`, managed via Clerk dashboard, verified server-side
- Q: What type of Stripe Connect account for seller payouts? → A: Express accounts — Stripe-hosted onboarding, platform controls payouts, minimal seller friction

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Submit a Prompt for Sale (Priority: P1)

An authenticated user wants to sell an AI prompt on the marketplace. They navigate to a "بيع برومبت" (Sell a Prompt) page and complete a multi-step form to submit their prompt for review.

**Step 1/4 — Prompt Details**: The seller provides basic information about their prompt:
- **Generation type**: What kind of content the prompt generates (e.g., نصوص/Text, صور/Images, كود/Code, تسويق/Marketing, تصميم/Design)
- **AI Model**: Which AI model the prompt is designed for (e.g., ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion)
- **Name**: A title for the prompt (max 60 characters, Arabic or English)
- **Description**: What the prompt does for potential buyers (max 500 characters)
- **Price**: The selling price in USD ($1.99–$99.99 range)
- **Category**: Selects from existing marketplace categories

**Step 2/4 — Prompt File**: The seller provides the actual prompt content and examples:
- **Prompt template**: The full prompt text with variables in [square brackets] (max 8,192 tokens)
- **Model version**: Specific version of the AI model (e.g., "Claude 4.6 Opus", "GPT-4o")
- **Recommended settings**: Max tokens and temperature values
- **Example outputs**: 4 example outputs demonstrating prompt results (text, pasted content)
- **Example prompts**: The variable values used to generate each example output
- **Buyer instructions**: Tips and guidance for the buyer on how to use the prompt effectively

**Step 3/4 — Enable Payouts**: The seller connects their Stripe account for receiving payments:
- **Payout method**: Monthly bank transfer via Stripe Connect
- **Country of residence**: Required for Stripe compliance
- The seller creates or connects a Stripe Connect account
- If already connected from a previous submission, this step is pre-filled/skipped

**Step 4/4 — Confirmation**: The seller sees a success screen confirming their prompt has been submitted for review. They are told the review typically takes 15 minutes to 36 hours and they will receive a notification when complete.

**Why this priority**: This is the foundational flow — without prompt submission, no selling can occur. Everything else depends on prompts being submitted to the marketplace.

**Independent Test**: Can be fully tested by an authenticated user completing the 4-step form and seeing the prompt appear in the database with "pending" status. Delivers the core value of enabling sellers to list prompts.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the sell page, **When** they complete Step 1 with valid prompt details, **Then** they advance to Step 2 with their data preserved
2. **Given** a seller on Step 2, **When** they enter a prompt template without any [variable] placeholders, **Then** they see a validation error requiring at least one variable
3. **Given** a seller on Step 2, **When** they provide fewer than 4 example outputs, **Then** they cannot advance to Step 3
4. **Given** a seller on Step 3 who has not connected Stripe, **When** they click "تفعيل المدفوعات" (Enable Payouts), **Then** they are redirected to Stripe Connect onboarding
5. **Given** a seller on Step 3 who has already connected Stripe, **When** they reach this step, **Then** Stripe status shows as connected and they can proceed
6. **Given** a seller completing Step 4, **When** submission succeeds, **Then** the prompt is saved with status "pending" and seller sees a confirmation message
7. **Given** a seller on any step, **When** they click "رجوع" (Back), **Then** they return to the previous step with all entered data preserved
8. **Given** an unauthenticated user, **When** they try to access the sell page, **Then** they are redirected to sign in

---

### User Story 2 - Seller Dashboard: View My Prompts (Priority: P2)

A seller wants to see all prompts they have submitted, along with each prompt's review status. They navigate to a seller dashboard where they can view, search, and filter their listings.

The seller dashboard displays:
- A list of all submitted prompts with: title, AI model, status badge, creation date, and thumbnail
- Status badges: "قيد المراجعة" (Pending), "مقبول" (Approved), "مرفوض" (Rejected)
- Search bar to filter prompts by name
- Sort by creation date (newest/oldest)
- Filter by status (all, pending, approved, rejected)
- Quick stats: total prompts, approved count, pending count, total sales, total earnings

**Why this priority**: Sellers need visibility into their submissions. Without this, they cannot track prompt status or manage their catalog.

**Independent Test**: Can be tested by submitting prompts and verifying they appear in the dashboard with correct statuses. Delivers the value of seller self-service management.

**Acceptance Scenarios**:

1. **Given** a seller with 3 submitted prompts (1 pending, 1 approved, 1 rejected), **When** they visit the seller dashboard, **Then** they see all 3 prompts with correct status badges
2. **Given** a seller viewing their dashboard, **When** they filter by "مقبول" (Approved), **Then** only approved prompts are shown
3. **Given** a seller viewing their dashboard, **When** they search for a prompt name, **Then** results are filtered to matching prompts
4. **Given** a seller with no prompts, **When** they visit the dashboard, **Then** they see an empty state with a CTA to submit their first prompt

---

### User Story 3 - Admin Reviews Submitted Prompts (Priority: P3)

An admin user can review prompts submitted by sellers. They access an admin review queue where they can see all pending prompts, inspect the prompt details (template, examples, instructions), and approve or reject each submission.

When a prompt is approved:
- Its status changes to "approved" and it becomes visible in the public marketplace
- The seller is notified (in-app or via future email integration)

When a prompt is rejected:
- Its status changes to "rejected" with an optional rejection reason
- The prompt remains hidden from the marketplace
- The seller sees the rejection reason on their dashboard

**Why this priority**: Without admin review, submitted prompts cannot go live. This is the gatekeeper for marketplace quality.

**Independent Test**: Can be tested by an admin viewing pending prompts and approving/rejecting them, then verifying the status change reflects on both marketplace visibility and seller dashboard.

**Acceptance Scenarios**:

1. **Given** an admin user on the review page, **When** there are pending prompts, **Then** they see a list of prompts sorted by submission date (oldest first)
2. **Given** an admin reviewing a prompt, **When** they click on a pending prompt, **Then** they see the full prompt details: template, variables, examples, instructions, seller info, and pricing
3. **Given** an admin viewing prompt details, **When** they click "قبول" (Approve), **Then** the prompt status changes to "approved" and it appears in the marketplace
4. **Given** an admin viewing prompt details, **When** they click "رفض" (Reject) and provide a reason, **Then** the prompt status changes to "rejected" with the reason stored
5. **Given** an admin, **When** they try to access the review page without admin privileges, **Then** they are denied access

---

### User Story 4 - Seller Earnings & Commission Model (Priority: P4)

Sales commission is tracked per prompt sale:
- **0% commission** when a buyer purchases via the seller's direct share link (the seller earns 100%)
- **20% commission** when a buyer discovers and purchases via the marketplace (the seller earns 80%)

The seller dashboard shows:
- Total earnings across all prompts
- Per-prompt sales count and revenue
- Commission breakdown (marketplace vs. direct link sales)
- Payout history (processed via Stripe Connect)

**Why this priority**: Earnings visibility motivates sellers but requires the purchase flow and commission tracking to be in place. Can be deferred until core submission and review are working.

**Independent Test**: Can be tested by simulating sales through both direct links and marketplace, then verifying commission calculations and earnings display.

**Acceptance Scenarios**:

1. **Given** a prompt sold via marketplace, **When** the sale completes, **Then** 20% commission is deducted and 80% credited to the seller
2. **Given** a prompt sold via direct seller link, **When** the sale completes, **Then** 0% commission is taken and 100% credited to the seller
3. **Given** a seller with completed sales, **When** they view earnings on the dashboard, **Then** they see accurate totals broken down by prompt and source

---

### Edge Cases

- What happens when a seller submits a prompt with content that exceeds the 8,192 token limit? System validates on the client and prevents submission.
- What happens when a seller tries to set a price outside the $1.99–$99.99 range? Validation prevents it with an Arabic error message.
- What happens when Stripe Connect onboarding fails or is abandoned mid-flow? The seller can retry from Step 3; their prompt details from Steps 1–2 are preserved.
- What happens when an admin approves a prompt whose seller has since been deactivated? The prompt is approved but hidden until the seller account is active.
- What happens when a seller edits an approved prompt? The prompt returns to "pending" status for re-review. The previous approved version remains live until the edit is approved.
- What happens when two admins try to review the same prompt simultaneously? The first action (approve/reject) wins; the second admin sees the updated status.
- What happens when the prompt template contains no [variable] placeholders? Step 2 validation requires at least one variable; form cannot proceed.
- What happens when the seller's Stripe Connect account is later disconnected? Sales are paused for that seller's prompts until reconnected; prompts remain visible but checkout is blocked.

## Requirements *(mandatory)*

### Functional Requirements

**Prompt Submission Flow**

- **FR-001**: System MUST provide a multi-step form (4 steps) for authenticated users to submit a prompt for sale
- **FR-002**: System MUST validate each step independently before allowing progression to the next step
- **FR-003**: System MUST preserve user-entered data when navigating between steps (back/forward)
- **FR-004**: System MUST require the prompt template to contain at least one [variable] placeholder (detected via bracket pattern)
- **FR-005**: System MUST require exactly 4 example outputs before allowing submission
- **FR-006**: System MUST enforce price range of $1.99–$99.99
- **FR-007**: System MUST enforce prompt name maximum of 60 characters
- **FR-008**: System MUST enforce description maximum of 500 characters
- **FR-009**: System MUST enforce prompt template maximum of 8,192 tokens (approximated by character count)
- **FR-010**: System MUST save the submitted prompt with status "pending" upon completion of all 4 steps
- **FR-011**: System MUST associate each submitted prompt with the authenticated seller's user ID
- **FR-012**: System MUST display all form labels, placeholders, validation errors, and help text in Arabic

**Stripe Connect & Payouts**

- **FR-013**: System MUST integrate with Stripe Connect to allow sellers to create or link a payout account
- **FR-014**: System MUST redirect sellers to Stripe Connect Express onboarding (Stripe-hosted flow) if they have no connected account
- **FR-015**: System MUST skip/pre-fill Step 3 if the seller already has a connected Stripe account
- **FR-016**: System MUST store the seller's Stripe Connect account ID for payout processing

**Seller Dashboard**

- **FR-017**: System MUST provide a seller dashboard page showing all prompts submitted by the authenticated user
- **FR-018**: System MUST display prompt status as a visible badge (pending/approved/rejected)
- **FR-019**: System MUST allow filtering prompts by status
- **FR-020**: System MUST allow searching prompts by title
- **FR-021**: System MUST allow sorting prompts by creation date
- **FR-022**: System MUST show summary stats: total prompts, approved count, pending count

**Admin Review**

- **FR-023**: System MUST provide an admin-only review page listing all pending prompt submissions
- **FR-024**: System MUST allow admin to view full prompt details (template, examples, instructions, pricing, seller info)
- **FR-025**: System MUST allow admin to approve a prompt, changing its status to "approved" and making it visible in the marketplace
- **FR-026**: System MUST allow admin to reject a prompt with an optional reason, changing its status to "rejected"
- **FR-027**: System MUST restrict admin review functionality to users whose Clerk account has `publicMetadata.role = "admin"`, set via the Clerk dashboard and verified server-side on every admin request

**Commission & Sales Tracking**

- **FR-028**: System MUST track whether a sale originated from a direct seller link or marketplace discovery
- **FR-029**: System MUST apply 0% commission for direct link sales and 20% commission for marketplace sales
- **FR-030**: System MUST record seller earnings per sale and display aggregated earnings on the seller dashboard

**Marketplace Integration**

- **FR-031**: Only prompts with "approved" status MUST appear in public marketplace listings and search results
- **FR-032**: System MUST generate a unique shareable link for each approved prompt that the seller can distribute
- **FR-033**: System MUST attribute sales from the seller's share link as "direct" (0% commission)

### Key Entities

- **Prompt (Extended)**: Extends the existing prompt with seller-specific fields: seller user ID (FK to Clerk), submission status (pending/approved/rejected), prompt template with variables, model version, recommended settings (max tokens, temperature), example outputs (4 entries), example prompts (variable values per example), buyer instructions, rejection reason (if rejected), review timestamps
- **Seller Profile**: Linked to a Clerk user account. Contains: Stripe Connect account ID, country of residence, onboarding status (not started/pending/active), total earnings, total sales count
- **Prompt Review**: Tracks admin review actions: prompt ID, admin user ID, action (approve/reject), rejection reason, timestamp
- **Sale Attribution**: Extends the existing order/order item with: referral source (marketplace/direct), commission rate applied, seller payout amount, payout status

### Assumptions

- Admin role is determined via Clerk `publicMetadata.role = "admin"`, managed through the Clerk dashboard. No database role table needed.
- Token counting for the prompt template will use an approximate character-based calculation (1 token ≈ 4 characters for English, ≈ 2 characters for Arabic) rather than an exact tokenizer.
- Example outputs are text-only (no image uploads) in the initial version. Future iterations may support image examples for image-generation prompts.
- Stripe Connect uses Express accounts for seller onboarding. Stripe handles identity verification, tax forms, and compliance. PromptSouq retains control over payout timing and scheduling.
- The payout cycle follows Stripe's default schedule (rolling basis). Custom payout schedules (weekly/monthly) are out of scope for the initial version.
- Prompt editing after submission is out of scope for the initial version — sellers must contact admin to request changes.
- Email notifications for status changes are out of scope — sellers check status via the dashboard.
- The auto-pricer feature mentioned in the reference is out of scope.
- The "Create app" feature mentioned in the reference is out of scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sellers can complete the 4-step prompt submission flow in under 10 minutes
- **SC-002**: 90% of sellers successfully submit a prompt on their first attempt without encountering unrecoverable errors
- **SC-003**: Admin can review and approve/reject a prompt in under 2 minutes
- **SC-004**: Approved prompts appear in the marketplace within 30 seconds of admin approval
- **SC-005**: Seller dashboard loads prompt listing within 2 seconds for sellers with up to 100 prompts
- **SC-006**: All form validation errors display in Arabic with clear guidance on how to fix the issue
- **SC-007**: Stripe Connect onboarding completes successfully for sellers in supported countries
- **SC-008**: Commission tracking accurately calculates 0% for direct sales and 20% for marketplace sales with no discrepancies

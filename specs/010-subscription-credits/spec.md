# Feature Specification: Subscription & Credit System for AI Generation

**Feature Branch**: `010-subscription-credits`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "Subscription with credit system, 3 packages, credits for text/image generation, in-app prompt execution with model switching, Stripe payments, mock generation initially"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Subscribe to a Credit Plan (Priority: P1)

A user browsing the platform wants to unlock AI generation capabilities. They visit the subscription page, compare three tiered plans (Standard, Pro, Legendary), select a billing cycle (monthly, 6-month, yearly), and complete payment. Upon successful payment, their account is credited with the plan's allotted credits and their subscription status is active.

**Why this priority**: Without subscriptions, no user can acquire credits. This is the foundation of the entire feature — revenue generation and credit distribution.

**Independent Test**: Can be fully tested by navigating to the subscription page, selecting a plan, completing checkout, and verifying credits appear on the user's account. Delivers value as the core monetization mechanism.

**Acceptance Scenarios**:

1. **Given** a signed-in user with no active subscription, **When** they visit the subscription page, **Then** they see three plans (Standard, Pro, Legendary) with pricing for each billing cycle (monthly, 6-month, yearly).
2. **Given** a user viewing the subscription page, **When** they toggle between billing cycles, **Then** the displayed prices update accordingly for all three plans.
3. **Given** a user who selects a plan and completes payment, **When** payment succeeds, **Then** their account receives the plan's credits and their subscription status shows as active.
4. **Given** a user who abandons or fails payment, **When** they return to the subscription page, **Then** they still see the plans and can retry without losing state.
5. **Given** a user who already has an active subscription, **When** they visit the subscription page, **Then** they see their current plan highlighted and an option to upgrade/downgrade.

---

### User Story 2 - Generate Content Using a Purchased Prompt (Priority: P1)

A user who has purchased a prompt and has credits wants to generate content directly within the app. They open the purchased prompt, see a "Generate" button, choose a generation type (text or image), optionally select a model, and submit. The system deducts credits and returns the generated result inline.

**Why this priority**: This is the core value proposition — users buy prompts and use them immediately without leaving the platform. Equal priority with subscriptions because one is useless without the other.

**Independent Test**: Can be tested by a user with credits and a purchased prompt clicking "Generate", selecting options, and seeing a result. Delivers the primary user value of in-app generation.

**Acceptance Scenarios**:

1. **Given** a user who owns a prompt and has credits, **When** they view the prompt detail page, **Then** they see a "Generate" button (توليد).
2. **Given** a user clicking "Generate" on a purchased prompt, **When** the generation interface opens, **Then** they see the prompt text in an editable field with predefined variables highlighted, and can choose between text generation and image generation.
3. **Given** a prompt with predefined variables (e.g., `[product name]`), **When** the generation interface opens, **Then** the variables are visually highlighted and the user can fill them in via dedicated inputs or edit the prompt text directly.
4. **Given** a user who selects image generation and submits, **When** generation completes, **Then** 1 credit is deducted from their balance and the result is displayed inline.
5. **Given** a user who selects text generation and submits, **When** generation completes, **Then** 1 credit is deducted from their balance and the result is displayed inline.
6. **Given** a user who edits the prompt text freely before generating, **When** they submit, **Then** the modified text is used for generation (not the original).
7. **Given** a user with 0 credits who clicks "Generate", **When** the generation interface opens, **Then** they see a message that they need credits and a link to the subscription page.
8. **Given** a user who has NOT purchased a prompt, **When** they view the prompt detail page, **Then** they do NOT see the "Generate" button — only the purchase option.

---

### User Story 3 - Switch Models Before Generating (Priority: P2)

A user preparing to generate content wants to choose which AI model to use. They see a model selector dropdown in the generation interface, pick their preferred model, and generate. The selected model is used for the generation request.

**Why this priority**: Model switching enhances the experience but is not essential for a functional MVP. A single default model works for launch.

**Independent Test**: Can be tested by opening the generation interface, switching models, and verifying the selected model name appears in the generation result metadata. Delivers flexibility and choice to power users.

**Acceptance Scenarios**:

1. **Given** a user in the generation interface, **When** they view model options, **Then** they see a list of available models with their names.
2. **Given** a user who selects a model and generates, **When** the result appears, **Then** it indicates which model was used.
3. **Given** a user who does not select a model, **When** they generate, **Then** a sensible default model is used.

---

### User Story 4 - View Credit Balance and Usage History (Priority: P2)

A user wants to understand how many credits they have remaining and how they've been spent. They navigate to their dashboard where they see their current credit balance, subscription plan, and a history of credit transactions (purchases, generations, refunds).

**Why this priority**: Transparency about credit balance and usage builds trust and reduces support inquiries, but the core generate flow works without it.

**Independent Test**: Can be tested by checking the dashboard after subscribing and generating content — balance and transaction history should reflect all activity accurately.

**Acceptance Scenarios**:

1. **Given** a subscribed user, **When** they visit their dashboard, **Then** they see their current credit balance and active plan name.
2. **Given** a user who has generated content, **When** they view their usage history, **Then** each generation shows the date, type (text/image), credits spent, and prompt used.
3. **Given** a user whose subscription renews, **When** they check their balance after renewal, **Then** credits are replenished according to their plan.
4. **Given** a user who has generated content previously, **When** they visit their generation history, **Then** they can view all past generated results (text and images) with metadata.

---

### User Story 5 - Manage Subscription (Priority: P3)

A user wants to upgrade, downgrade, or cancel their subscription. They access subscription management from their dashboard, make changes, and see the effects on their next billing cycle and credit allocation.

**Why this priority**: Subscription management is necessary for long-term retention but the platform can launch with basic subscribe-only flow initially.

**Independent Test**: Can be tested by subscribing, then navigating to management and performing an upgrade/cancel, verifying the change reflects in billing and plan status.

**Acceptance Scenarios**:

1. **Given** a subscribed user, **When** they request to cancel, **Then** their subscription remains active until the current billing period ends, then downgrades to no plan.
2. **Given** a Standard subscriber, **When** they upgrade to Pro, **Then** they are charged the prorated difference and receive additional credits immediately.
3. **Given** a subscribed user, **When** they downgrade, **Then** the change takes effect at the next billing cycle and existing credits remain usable.

---

### User Story 6 - Purchase Credit Top-Up Pack (Priority: P2)

A user who has run out of credits mid-cycle (or wants more without upgrading) purchases a one-time credit pack. They see a "Buy Credits" option on the subscription page or when prompted at 0-credit generation, select a pack size, complete payment, and credits are added to their balance immediately.

**Why this priority**: Reduces churn from users who hit their limit and adds an additional revenue stream. Not blocking for MVP but high value for retention.

**Independent Test**: Can be tested by a user with 0 credits navigating to the credit top-up option, purchasing a pack, and verifying credits are added to their balance.

**Acceptance Scenarios**:

1. **Given** a signed-in user, **When** they visit the subscription page, **Then** they see available credit top-up packs alongside subscription plans.
2. **Given** a user with 0 credits who attempts to generate, **When** the "no credits" message appears, **Then** it includes an option to buy a credit top-up pack in addition to subscribing.
3. **Given** a user who selects a credit pack and completes payment, **When** payment succeeds, **Then** the purchased credits are added to their existing balance immediately.
4. **Given** a user with an active subscription who buys a top-up, **When** their subscription renews, **Then** only subscription credits are reset — top-up credits that remain are preserved.

---

### Edge Cases

- What happens when a user's subscription expires while they still have credits? Credits remain usable until depleted — subscription status only affects renewal/replenishment.
- What happens if generation fails mid-process? Credits are NOT deducted for failed generations. The user sees an error message with a retry option.
- What happens if a user subscribes, uses some credits, then requests a refund? Refund policy is handled outside the system scope — Stripe manages refund processing. Unused credits may be forfeited upon cancellation per business policy.
- What if two generations are triggered simultaneously? Each generation request validates sufficient credits before deducting. Concurrent requests are handled sequentially to prevent overdraft.
- What if a user's payment method fails at renewal? The system retries per the payment provider's policy. The user receives a notification to update their payment method. Existing credits remain usable.
- What if a free prompt is viewed — does the generate button appear? Yes, if the prompt is free (price = 0) and the user has credits, the generate button appears since no purchase is needed.
- What happens to top-up credits on subscription renewal? Top-up credits are preserved — only subscription-granted credits are reset on renewal. The system tracks credit source (subscription vs. top-up) to differentiate.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST offer three subscription tiers: Standard, Pro, and Legendary, each with a defined monthly credit allocation.
- **FR-002**: System MUST support three billing cycles: monthly, 6-month, and yearly, with pricing that scales by the billing multiplier.
- **FR-003**: System MUST process subscription payments securely and credit the user's account upon successful payment confirmation (via webhook).
- **FR-004**: System MUST display a "Generate" (توليد) button on prompt detail pages only for users who own that prompt (purchased or free) AND have an active credit balance > 0.
- **FR-005**: System MUST support two generation types: text and image. Each generation deducts 1 credit from the user's balance.
- **FR-006**: System MUST allow users to select from available AI models before generating. A default model MUST be pre-selected.
- **FR-007**: System MUST display generation results inline on the prompt page — text results as formatted content, image results as a rendered image.
- **FR-008**: System MUST NOT deduct credits for failed or errored generations. Only successful completions consume credits.
- **FR-009**: System MUST prevent generation when credit balance is 0 and display a clear message directing the user to subscribe.
- **FR-010**: System MUST show the user's current credit balance in the navigation header and on their dashboard.
- **FR-011**: System MUST maintain a transaction log of all credit changes (subscription grants, generation deductions).
- **FR-012**: System MUST handle subscription lifecycle events: creation, renewal (credit replenishment), upgrade (prorated), downgrade (next cycle), and cancellation (end of period).
- **FR-013**: System MUST mock AI generation responses initially — returning placeholder text for text generation and a placeholder image for image generation.
- **FR-014**: System MUST validate that concurrent generation requests do not overdraft the credit balance.
- **FR-015**: System MUST persistently store all successful generation results (text content and image URLs) and make them accessible from the user's generation history on their dashboard.
- **FR-016**: System MUST display the purchased prompt text in an editable field in the generation interface. Users can fill predefined variables (e.g., `[product name]`) via highlighted inputs AND freely edit the full prompt text before generating.
- **FR-017**: System MUST use the user's modified prompt text (not the original) when submitting the generation request.
- **FR-018**: System MUST offer one-time credit top-up packs for purchase (e.g., 10 credits for $3, 50 credits for $12, 100 credits for $20).
- **FR-019**: System MUST add top-up credits to the user's existing balance immediately upon successful payment.
- **FR-020**: System MUST distinguish between subscription-granted credits and top-up credits. On subscription renewal, only subscription credits are reset; top-up credits are preserved.

### Subscription Tier Details

| Tier      | Monthly Credits | Monthly Price | 6-Month Price | Yearly Price |
|-----------|-----------------|---------------|---------------|--------------|
| Standard  | 50 credits      | $10           | $60           | $120         |
| Pro       | 150 credits     | $20           | $120          | $240         |
| Legendary | 500 credits     | $30           | $180          | $360         |

### Credit Cost Schedule

| Generation Type  | Credit Cost |
|------------------|-------------|
| Text generation  | 1 credit    |
| Image generation | 1 credit    |

### Key Entities

- **Subscription Plan**: Represents the three available tiers (Standard, Pro, Legendary) with their pricing, credit allocations, and feature descriptions. Each plan has multiple billing cycle options.
- **User Subscription**: Links a user to their active plan, tracks billing cycle, start/end dates, payment status, and renewal schedule. One active subscription per user.
- **Credit Balance**: The user's current spendable credit count. Composed of subscription credits (reset on renewal) and top-up credits (persistent until used). Increases on subscription purchase/renewal or top-up purchase, decreases on successful generation. Cannot go below zero. System deducts subscription credits first, then top-up credits.
- **Credit Top-Up Pack**: A one-time purchasable bundle of credits (e.g., 10, 50, 100 credits) at fixed prices. Not tied to any subscription cycle.
- **Credit Transaction**: An immutable log entry recording every credit change — type (grant, deduction, refund), amount, timestamp, related entity (subscription or generation).
- **Generation Record**: Captures each generation request — user, prompt used, generation type (text/image), model selected, result content, status (success/failure), credits consumed. Results are persistently stored and accessible from the user's dashboard generation history.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse subscription plans, select a tier and billing cycle, and complete payment in under 3 minutes.
- **SC-002**: After successful payment, credits appear in the user's account within 10 seconds.
- **SC-003**: Users can generate text or image content from a purchased prompt in under 5 seconds (using mocked generation).
- **SC-004**: Credit balance is always accurate — no overdrafts, no phantom deductions from failed generations.
- **SC-005**: 100% of subscription lifecycle events (create, renew, upgrade, downgrade, cancel) correctly update the user's plan status and credit balance.
- **SC-006**: The subscription page displays correctly on both mobile (< 640px) and desktop viewports with all three tiers visible and selectable.
- **SC-007**: All user-facing text on subscription and generation interfaces is in Arabic.
- **SC-008**: Users with 0 credits are prevented from generating and see a clear call-to-action to subscribe.

## Clarifications

### Session 2026-02-16

- Q: Are generation results persistent or ephemeral? → A: Persistent — results are saved and accessible from the user's dashboard/history.
- Q: Can users customize the prompt before generating? → A: Both — users can fill predefined variables AND freely edit the full prompt text before generating.
- Q: Can users buy additional credits beyond their subscription? → A: Yes — one-time credit top-up packs are available for purchase.

## Assumptions

- Credit cost is uniform (1 credit per generation) for both text and image in this initial version. Differentiated pricing may be introduced later.
- AI generation is mocked with placeholder responses. Real model integration will be a future feature.
- Available models shown in the selector are predefined (e.g., "Gemini", "ChatGPT", "Claude") but all route to the same mock backend initially.
- Subscription credit allocation is per billing cycle — credits granted at purchase and at each renewal.
- Unused subscription-granted credits do NOT roll over between billing cycles (they expire at renewal, replaced by the new allocation). Top-up credits are persistent and never expire.
- A user can only have one active subscription at a time.
- The pricing structure ($10/$20/$30 per month) follows the reference component design provided.

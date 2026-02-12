# Feature Specification: Cart, Toasts, UUID Prompts & Stripe Checkout

**Feature Branch**: `003-cart-stripe-checkout`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "Improve cart with toasts for success/errors, header cart badge with item count, UUID-based prompt IDs and routing, improved prompt details page with cart functionality, and Stripe checkout integration testable with test credit card"

## Clarifications

### Session 2026-02-12

- Q: After successful payment, how does the buyer access purchased prompt content? → A: Reveal `fullContent` inline on the prompt details page for buyers (show a "Purchased" badge, unlock content)
- Q: What currency should Stripe charge in? → A: USD (US Dollars)
- Q: Stripe checkout approach — hosted redirect or embedded on-site? → A: Stripe Checkout (hosted) — redirect to Stripe's payment page, return to success/cancel URL

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Prompt to Cart with Feedback (Priority: P1)

A user browsing the marketplace sees a prompt they want. They click "Add to Cart" on the prompt details page and immediately receive a toast notification confirming the item was added. If something goes wrong (e.g., the item is already in the cart or a network error occurs), they see an error toast instead. The cart persists across page navigations so they can continue browsing without losing their selection.

**Why this priority**: The add-to-cart flow is the core shopping interaction. Without reliable feedback and persistence, users cannot build a cart — blocking all downstream purchasing.

**Independent Test**: Can be fully tested by navigating to any prompt detail page, clicking "Add to Cart", and verifying a success toast appears and the item persists in the cart across page reloads.

**Acceptance Scenarios**:

1. **Given** a user is on a prompt details page, **When** they click "Add to Cart", **Then** a success toast appears confirming the prompt was added
2. **Given** a user has added an item to the cart, **When** they navigate to another page and return, **Then** the cart still contains the previously added item
3. **Given** a user tries to add a prompt already in the cart, **When** they click "Add to Cart", **Then** an informational toast notifies them the item is already in the cart
4. **Given** a network or system error occurs during add-to-cart, **When** the action fails, **Then** an error toast appears with a user-friendly message

---

### User Story 2 - View Cart Count in Header (Priority: P1)

A user who has added items to their cart can see the number of items displayed as a badge on the cart icon in the site header. This badge updates in real time as items are added or removed, giving the user constant visibility into their cart state without navigating away.

**Why this priority**: The cart badge is a fundamental e-commerce affordance. Users expect to see their cart count at all times — it drives engagement and conversion.

**Independent Test**: Can be tested by adding items to the cart and verifying the header badge count updates immediately without page refresh.

**Acceptance Scenarios**:

1. **Given** a user has no items in the cart, **When** viewing any page, **Then** no badge is displayed (or badge shows 0)
2. **Given** a user adds a prompt to the cart, **When** the action completes, **Then** the header cart badge increments to reflect the new count
3. **Given** a user removes an item from the cart page, **When** the removal completes, **Then** the header badge decrements accordingly
4. **Given** a user has items in cart, **When** they reload the page, **Then** the badge still shows the correct count

---

### User Story 3 - Browse Prompts via UUID URLs (Priority: P1)

Prompt detail pages are accessed via UUID-based URLs (e.g., `/prompt/550e8400-e29b-41d4-a716-446655440000`) instead of sequential numeric IDs. This prevents competitors from scraping the catalog by incrementing IDs and provides more professional, non-guessable URLs.

**Why this priority**: UUID migration is a foundational data model change that all other features (cart references, checkout line items) depend on. Must be done early to avoid rework.

**Independent Test**: Can be tested by navigating to a prompt using its UUID URL and verifying the correct prompt details load, while numeric ID URLs return a 404.

**Acceptance Scenarios**:

1. **Given** a prompt exists with a UUID, **When** a user navigates to `/prompt/{uuid}`, **Then** the correct prompt details page loads
2. **Given** a user visits `/prompt/{invalid-uuid}`, **When** the UUID format is invalid or no prompt exists, **Then** a 404 page is displayed
3. **Given** prompt cards on the marketplace, **When** a user clicks a prompt card, **Then** they are navigated to the UUID-based URL
4. **Given** any API response containing prompts, **When** the response is returned, **Then** prompt IDs are UUIDs

---

### User Story 4 - Complete Purchase with Stripe (Priority: P2)

A user with items in their cart proceeds to checkout and is redirected to Stripe's hosted payment page. They enter their payment details (testable with Stripe test card `4242 4242 4242 4242`), submit payment, and are redirected back to a success confirmation page. Stripe's hosted checkout handles all card input and PCI compliance.

**Why this priority**: Payment is the revenue-generating action. It depends on a working cart (P1) but is the ultimate goal of the feature set.

**Independent Test**: Can be tested by adding items to cart, proceeding to checkout, entering Stripe test card details, and verifying the payment succeeds with a confirmation message.

**Acceptance Scenarios**:

1. **Given** a user has items in their cart and clicks "Checkout", **When** the checkout initiates, **Then** the user is redirected to Stripe's hosted payment page with their cart items as line items
2. **Given** a user is on the Stripe payment page, **When** they enter valid test card details (`4242 4242 4242 4242`, any future expiry, any CVC) and submit, **Then** the payment processes successfully and the user is redirected back to a success confirmation page
3. **Given** a user enters an invalid or declined card, **When** they submit payment, **Then** a clear error message is displayed and they can retry
4. **Given** a successful payment, **When** the confirmation displays, **Then** the cart is cleared and the header badge resets to 0
5. **Given** a user is not authenticated, **When** they attempt to checkout, **Then** they are redirected to sign in first

---

### User Story 5 - Improved Prompt Details Page (Priority: P2)

The prompt details page provides a polished shopping experience. The "Add to Cart" and "Buy Now" buttons are fully functional. "Add to Cart" adds the prompt and shows a toast. "Buy Now" adds the item to cart and navigates directly to checkout. The page clearly displays price, seller info, ratings, and samples.

**Why this priority**: A well-functioning product page is essential for conversion but depends on the cart and toast infrastructure from P1 stories.

**Independent Test**: Can be tested by visiting a prompt detail page, using both "Add to Cart" and "Buy Now" buttons, and verifying correct behavior for each.

**Acceptance Scenarios**:

1. **Given** a user is on a prompt details page, **When** they click "Add to Cart", **Then** the prompt is added to cart and a success toast appears
2. **Given** a user is on a prompt details page, **When** they click "Buy Now", **Then** the prompt is added to cart and the user is navigated to the checkout page
3. **Given** a user clicks "Add to Cart" for a prompt already in their cart, **When** the action completes, **Then** an informational toast indicates the item is already in the cart (no duplicate added)

---

### User Story 6 - Access Purchased Prompt Content (Priority: P2)

After completing a purchase, a buyer revisits the prompt details page and sees the full prompt content (`fullContent`) unlocked inline. A "Purchased" badge is displayed on the page, and the "Add to Cart" / "Buy Now" buttons are replaced with a clear indication that the prompt has already been bought.

**Why this priority**: Delivering the purchased content is essential for the transaction to have value. Depends on the checkout flow (P2) being complete.

**Independent Test**: Can be tested by completing a purchase, then navigating to the prompt details page and verifying the full content is visible and a "Purchased" badge is shown.

**Acceptance Scenarios**:

1. **Given** a user has purchased a prompt, **When** they visit that prompt's details page, **Then** the full prompt content is displayed and a "Purchased" badge is visible
2. **Given** a user has purchased a prompt, **When** they visit that prompt's details page, **Then** the "Add to Cart" and "Buy Now" buttons are hidden or replaced with a "Purchased" indicator
3. **Given** a user has NOT purchased a prompt, **When** they visit that prompt's details page, **Then** `fullContent` remains hidden and the normal purchase buttons are shown

---

### Edge Cases

- What happens when a user adds an item to the cart and the prompt is later deleted from the marketplace? The cart should gracefully handle missing prompts by showing a notice and allowing removal.
- How does the cart behave when the user is not authenticated? Cart works for anonymous users via local storage. Cart contents carry over after sign-in.
- What happens if Stripe checkout is interrupted (user closes tab mid-payment)? The payment is not captured, and cart items remain intact for retry.
- What happens when a user has items in cart and clears their browser data? Cart is reset; no error is shown — the user sees an empty cart.
- How does the system handle concurrent add-to-cart actions (rapid clicking)? Duplicate additions are prevented; only one instance of each prompt is allowed in the cart.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide toast notifications for all cart actions (add, remove, errors) with distinct visual styles for success, error, and informational messages
- **FR-002**: System MUST display a cart item count badge on the header cart icon that updates immediately when items are added or removed
- **FR-003**: System MUST use UUIDs as the primary identifier for prompts in URLs, API responses, and database records
- **FR-004**: System MUST persist cart contents across page navigations and page reloads using client-side storage
- **FR-005**: System MUST integrate with Stripe for payment processing in USD currency, supporting test mode with standard test card numbers
- **FR-006**: System MUST redirect the user to Stripe's hosted Checkout page during checkout, passing cart items as line items, and handle return to success/cancel URLs
- **FR-007**: System MUST validate the checkout flow end-to-end: cart items are sent to the payment processor, payment is confirmed, and cart is cleared on success
- **FR-008**: System MUST prevent duplicate prompts in the cart (each prompt can only appear once)
- **FR-009**: System MUST require user authentication before processing payment (redirect to sign-in if not authenticated)
- **FR-010**: System MUST display appropriate error messages when payment fails (declined card, network error, etc.)
- **FR-011**: The "Buy Now" button on the prompt details page MUST add the item to cart and navigate to checkout in a single action
- **FR-012**: System MUST migrate all existing prompt IDs from sequential integers to UUIDs without breaking existing data relationships (reviews, related prompts)
- **FR-013**: System MUST reveal the full prompt content (`fullContent`) on the prompt details page for authenticated users who have purchased that prompt
- **FR-014**: System MUST display a "Purchased" badge on prompt details pages for prompts the current user has bought, replacing the purchase buttons

### Key Entities

- **Cart**: A client-side collection of prompts a user intends to purchase. Contains prompt references (UUID), associated price, and display metadata (title, thumbnail). Limited to one quantity per prompt.
- **Cart Item**: A single prompt reference within the cart. Stores the prompt UUID, price at time of addition, title, and thumbnail for display.
- **Prompt (updated)**: An AI prompt listing in the marketplace. Primary identifier changes from sequential integer to UUID. The `fullContent` field is gated — only visible to buyers who have completed purchase. All other attributes remain unchanged.
- **Checkout Session**: A server-initiated payment session with Stripe. Links cart items to a payment intent, tracks payment status, and records the outcome.
- **Order**: A completed purchase record. Created after successful payment. Links the buyer, purchased prompt UUIDs, payment reference, and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users receive visual feedback (toast notification) within 1 second of any cart action (add, remove, error)
- **SC-002**: Cart item count in the header badge is accurate and updates within 1 second of cart changes, without requiring page reload
- **SC-003**: All prompt URLs use UUID format; no sequential numeric IDs are exposed in URLs or API responses
- **SC-004**: Users can complete a full purchase flow (browse → add to cart → checkout → payment → confirmation) in under 3 minutes using a test credit card
- **SC-005**: Cart contents persist across at least 5 consecutive page navigations without data loss
- **SC-006**: Failed payments display a clear, user-friendly error message and allow the user to retry without re-entering cart items
- **SC-007**: 100% of cart actions (add, remove, duplicate prevention) produce appropriate toast notifications with no silent failures

## Assumptions

- Cart is stored client-side (local storage) — no server-side cart persistence in this phase. This keeps the implementation simple and avoids requiring authentication for browsing/carting.
- Stripe Checkout (hosted payment page) will be used. Users are redirected to Stripe's hosted page for payment and returned to success/cancel URLs. This handles PCI compliance entirely on Stripe's side and supports test mode with `4242 4242 4242 4242`.
- One quantity per prompt — prompts are digital goods, so buying multiples of the same prompt is not applicable.
- Anonymous users can browse and add to cart. Authentication is required only at checkout.
- Price is captured at time of addition to cart for display, but the authoritative price is verified server-side at checkout to prevent tampering. All prices are in USD.
- Order records will be stored in the database for purchase history, but a full order management UI is out of scope for this feature.
- The UUID migration applies to prompts only. Categories, reviews, and testimonials retain their current ID schemes.

# Feature Specification: Free Prompts with Login-Gated Content

**Feature Branch**: `009-free-prompts`
**Created**: 2026-02-15
**Status**: Draft
**Input**: User description: "plan a free prompts feature consider it in selling prompts and filter, the user must login or register to see the prompt and the example make a full example it should be locked if the user not logged in"

## Clarifications

### Session 2026-02-15

- Q: How does the seller indicate a prompt is free during creation? → A: Dedicated "مجاني" (Free) toggle/checkbox — when active, hides the price field and sets price to 0.
- Q: Can authenticated users leave reviews on free prompts? → A: Yes — any authenticated user who viewed the free prompt can leave a review.
- Q: Should the system track when authenticated users access free prompt content? → A: Yes — record access in a new table and show free prompts in user's dashboard under "My Free Prompts".

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Seller Publishes a Free Prompt (Priority: P1)

A seller who wants to build their reputation or attract buyers can create a prompt and mark it as free. When a prompt is free, the seller does not need to set up payment details (Stripe Connect). The free prompt goes through the same approval workflow as paid prompts.

**Why this priority**: Without the ability to create free prompts, the entire feature has no content to display. This is the foundational capability.

**Independent Test**: Can be tested by a logged-in seller navigating to the sell page, toggling the "free" option, and submitting a prompt without configuring payout settings. The prompt appears in admin review queue.

**Acceptance Scenarios**:

1. **Given** a logged-in seller on the sell prompt page, **When** they activate the "مجاني" (Free) toggle, **Then** the price field is hidden, price is set to 0, and the payout setup step is skipped entirely.
2. **Given** a seller creating a free prompt, **When** they fill in title, description, content, and examples, **Then** the prompt is submitted with price = 0 and enters the standard approval queue.
3. **Given** a seller with no Stripe Connect account, **When** they create a free prompt, **Then** the submission succeeds without requiring Stripe onboarding.

---

### User Story 2 - Visitor Sees Locked Free Prompt (Priority: P1)

An unauthenticated visitor browsing the marketplace sees free prompts listed with a "Free" badge. When they click on a free prompt, they see the title, description, seller info, and metadata — but the full prompt content and example outputs are locked behind a blurred overlay with a call-to-action to sign in or register.

**Why this priority**: This is the core content-gating mechanic that drives user registration. Equal priority to Story 1 because together they form the minimum viable feature.

**Independent Test**: Can be tested by visiting a free prompt detail page while logged out. The full content and examples sections display a lock overlay with login/register buttons.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on a free prompt detail page, **When** the page loads, **Then** the full prompt content area shows a blurred/locked overlay with a "سجل دخولك لرؤية المحتوى" (Sign in to see content) call-to-action.
2. **Given** an unauthenticated visitor viewing a free prompt, **When** they see the example outputs section, **Then** examples are blurred/locked with the same sign-in prompt.
3. **Given** an unauthenticated visitor on a free prompt page, **When** they click the sign-in button on the lock overlay, **Then** they are redirected to the sign-in page with a return URL back to the prompt.
4. **Given** an unauthenticated visitor on the marketplace listing, **When** free prompts appear in results, **Then** each free prompt card shows a "مجاني" (Free) badge instead of a price.

---

### User Story 3 - Logged-in User Accesses Free Prompt Content (Priority: P1)

A logged-in user viewing a free prompt detail page sees the full prompt content and example outputs immediately — no purchase or cart flow required. The content is directly accessible. The system records the access so the user can find the prompt again in their dashboard under "My Free Prompts."

**Why this priority**: This completes the core user journey. Without unlocked content for authenticated users, the login gate has no payoff.

**Independent Test**: Can be tested by logging in and visiting a free prompt detail page. Full content and examples are visible without any purchase step.

**Acceptance Scenarios**:

1. **Given** a logged-in user on a free prompt detail page, **When** the page loads, **Then** the full prompt content and example outputs are displayed without any lock overlay.
2. **Given** a logged-in user viewing a free prompt, **When** they see the prompt actions area, **Then** no "Buy" or "Add to Cart" buttons appear; the content is directly accessible.
3. **Given** a logged-in user who just signed in via the lock overlay redirect, **When** they return to the free prompt page, **Then** they immediately see the unlocked content.
4. **Given** a logged-in user viewing a free prompt, **When** they scroll to the reviews section, **Then** they can leave a review without needing a purchase record.
5. **Given** a logged-in user who views a free prompt for the first time, **When** the full content loads, **Then** the system records their access and the prompt appears in their dashboard under "My Free Prompts."
6. **Given** a logged-in user who previously accessed a free prompt, **When** they visit their dashboard, **Then** they see the prompt listed under "My Free Prompts" with the access date.

---

### User Story 4 - User Filters by Free Prompts (Priority: P2)

A user browsing the marketplace can filter results to show only free prompts. This filter integrates with existing category, AI model, and search filters.

**Why this priority**: Filtering enhances discoverability but is not required for the core free-prompt experience. Users can still find free prompts via badges and browsing without a dedicated filter.

**Independent Test**: Can be tested by visiting the market page, selecting the "Free" price filter, and verifying only prompts with price = 0 appear in results.

**Acceptance Scenarios**:

1. **Given** a user on the marketplace page, **When** they look at the filter options, **Then** they see a price type filter with options: "الكل" (All), "مجاني" (Free), "مدفوع" (Paid).
2. **Given** a user who selects the "Free" filter, **When** results load, **Then** only prompts with price = 0 are displayed.
3. **Given** a user who selects the "Free" filter and also a category filter, **When** results load, **Then** both filters are applied together (AND logic).
4. **Given** a user who selects the "Free" filter, **When** they switch sort to "newest", **Then** the sort applies within the free-only results.

---

### User Story 5 - Free Prompt in Search Results (Priority: P2)

When users search for prompts, free prompts appear in results with a visible "Free" badge. Search ranking treats free and paid prompts equally.

**Why this priority**: Search integration ensures free prompts are discoverable through the primary discovery mechanism, but the marketplace listing (Story 4) already provides basic discovery.

**Independent Test**: Can be tested by searching for a term that matches a free prompt's title or tags. The result appears with a "Free" badge.

**Acceptance Scenarios**:

1. **Given** a user searching for a keyword, **When** results include free prompts, **Then** free prompts display a "مجاني" badge on their cards.
2. **Given** a user on the search results page, **When** they sort by "price low to high", **Then** free prompts appear first.

---

### Edge Cases

- What happens when a seller tries to change an approved paid prompt to free? The price change is not allowed after approval — requires creating a new prompt or admin intervention.
- What happens when a free prompt has no example outputs? The examples section is hidden entirely rather than showing an empty locked area.
- What happens when a logged-in user has previously purchased a prompt that later became free? Their existing purchase record remains valid; they see the same unlocked content.
- What happens when an unauthenticated user bookmarks a free prompt URL and returns later while logged in? The content unlocks automatically based on auth state — no additional action needed.
- What happens if a seller tries to submit without using the free toggle and enters $0 manually? The price field enforces the $1.99 minimum when the free toggle is inactive, so $0 is only possible via the toggle.
- What happens when a user tries to add a free prompt to the cart via direct API call? The system rejects the request — free prompts cannot enter the cart or checkout flow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a dedicated "مجاني" (Free) toggle on the sell form. When active, the price field is hidden and price is automatically set to zero.
- **FR-002**: When a prompt is marked as free, the system MUST skip the payment/payout setup step in the sell flow.
- **FR-003**: Free prompts MUST go through the same approval workflow as paid prompts (pending → approved → visible).
- **FR-004**: The marketplace listing MUST display a "مجاني" (Free) badge on free prompt cards instead of a price.
- **FR-005**: The marketplace MUST provide a price type filter with options: All, Free, Paid.
- **FR-006**: For unauthenticated visitors viewing a free prompt detail page, the system MUST hide the full prompt content and example outputs behind a visually locked overlay (blur effect).
- **FR-007**: The locked overlay MUST display a clear call-to-action in Arabic directing the user to sign in or register, with functional links to the authentication pages.
- **FR-008**: The sign-in/register links on the lock overlay MUST include a return URL parameter so the user is redirected back to the prompt after authentication.
- **FR-009**: For authenticated users viewing a free prompt detail page, the system MUST display the full prompt content and example outputs immediately without any purchase or cart step.
- **FR-010**: The system MUST NOT show "Buy" or "Add to Cart" buttons on free prompt detail pages.
- **FR-011**: The system MUST NOT allow free prompts to be added to the shopping cart.
- **FR-012**: Free prompts MUST appear in search results with the same ranking logic as paid prompts, displaying the "Free" badge.
- **FR-013**: The "price low to high" sort MUST place free prompts (price = 0) before paid prompts.
- **FR-014**: The system MUST NOT send full prompt content or example outputs to unauthenticated clients — content is fetched only after authentication is confirmed.
- **FR-015**: Any authenticated user MUST be able to leave a review on a free prompt (no purchase requirement). The review form and display behave identically to paid prompt reviews.
- **FR-016**: The system MUST record when an authenticated user first accesses a free prompt's full content, storing the user ID, prompt ID, and access timestamp.
- **FR-017**: The system MUST NOT create duplicate access records if the same user views the same free prompt multiple times.
- **FR-018**: The user dashboard MUST include a "My Free Prompts" section that lists all free prompts the user has accessed, ordered by most recently accessed.

### Key Entities

- **Prompt (modified)**: Existing entity gains a price = 0 state representing a free prompt. A prompt with price = 0 is free — no new boolean column needed.
- **Free Prompt Badge**: Visual indicator ("مجاني") shown on prompt cards and detail pages for prompts with price = 0.
- **Content Lock Overlay**: UI element shown to unauthenticated users on free prompt detail pages, obscuring full content and examples with a blur effect and sign-in CTA.
- **Free Prompt Access (new)**: Record linking a user to a free prompt they accessed. Attributes: user ID, prompt ID, first accessed timestamp. One record per user-prompt pair (no duplicates).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Sellers can create and publish a free prompt in under 3 minutes (faster than paid prompts due to skipped payout step).
- **SC-002**: 100% of unauthenticated visitors see locked content on free prompt detail pages — no content leaks via the browser.
- **SC-003**: Authenticated users see full free prompt content within 1 second of page load with no additional clicks required.
- **SC-004**: The "Free" filter returns only zero-price prompts with zero false positives.
- **SC-005**: Free prompts display the "مجاني" badge consistently across marketplace cards, search results, and detail page header.

## Assumptions

- A free prompt is defined solely by having price = 0. No separate boolean flag is needed.
- Free prompts do not generate order records or require Stripe sessions. Access is tracked in a separate lightweight table (not via the orders system).
- Sellers do not need Stripe Connect to publish free prompts.
- The content lock overlay is backed by server-side protection: the API does not return full content or examples to unauthenticated requests.
- Free prompts count toward seller statistics (total prompts, profile visibility) but not toward earnings metrics.
- The existing price range filter (priceMin/priceMax) can coexist with the new price type filter. Selecting "Free" effectively sets both to 0.
- There is no limit on how many free prompts a seller can publish.
- The sell form validation minimum price ($1.99) is bypassed when the "free" toggle is active, but remains enforced for paid prompts.

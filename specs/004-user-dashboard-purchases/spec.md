# Feature Specification: User Dashboard & Purchases

**Feature Branch**: `004-user-dashboard-purchases`
**Created**: 2026-02-12
**Status**: Draft
**Input**: User description: "If the user buys prompts they see them in a purchases page. Clicking a purchased prompt opens a detail page with prompt template, examples, instructions, and the ability to rate it. Authenticated users have a sidebar with Profile, Purchases, Favorites, and Settings."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Purchased Prompts (Priority: P1)

An authenticated user who has previously purchased prompts navigates to their Purchases page. They see a grid of all prompts they've bought, each showing the prompt thumbnail, title, AI model badge, and purchase date. They can search through their purchases and filter by AI model. Clicking any purchased prompt takes them to a dedicated purchase detail page.

**Why this priority**: This is the core value proposition — users need to access what they've paid for. Without this, there is no post-purchase experience.

**Independent Test**: Can be fully tested by completing a purchase and verifying the prompt appears in the Purchases page with correct details. Delivers immediate value by giving users a dedicated space to find their bought prompts.

**Acceptance Scenarios**:

1. **Given** a user has purchased 3 prompts, **When** they navigate to Purchases, **Then** they see all 3 prompts displayed as cards with thumbnail, title, AI model badge, and purchase date
2. **Given** a user has purchases, **When** they type in the search bar, **Then** the results filter in real-time by prompt title
3. **Given** a user has purchases across different AI models, **When** they select an AI model filter, **Then** only purchases matching that model are shown
4. **Given** a user has no purchases, **When** they navigate to Purchases, **Then** they see a friendly empty state with a call-to-action to browse the marketplace

---

### User Story 2 - View Purchase Detail Page (Priority: P1)

After clicking a purchased prompt, the user sees a dedicated purchase detail page that reveals the full prompt content they paid for. This page displays: the prompt template (the actual prompt text with variable placeholders highlighted), example outputs showing the prompt in use, and instructions on how to use the prompt effectively. The user can copy the prompt text with one click.

**Why this priority**: Equal to P1 because viewing purchased content is inseparable from the purchases list — users buy prompts specifically to use them.

**Independent Test**: Can be tested by navigating to a purchase detail URL and verifying all content sections (template, examples, instructions) render correctly with a copy button.

**Acceptance Scenarios**:

1. **Given** a user owns a prompt, **When** they open its purchase detail page, **Then** they see the full prompt template with variable placeholders visually distinguished
2. **Given** a user is on the purchase detail page, **When** they click "Copy prompt", **Then** the full prompt text is copied to their clipboard and a confirmation appears
3. **Given** a prompt has example outputs, **When** the user views the purchase detail, **Then** example prompts with their output images/text are displayed in a scrollable section
4. **Given** a prompt has usage instructions, **When** the user views the purchase detail, **Then** the instructions are shown in a clearly formatted section
5. **Given** a user is NOT the owner of a prompt, **When** they try to access the purchase detail URL directly, **Then** they are redirected or shown an access-denied message
6. **Given** a user views the purchase detail, **Then** the prompt title, AI model badge, seller info, and a thumbnail/cover image are displayed in a sidebar or header area (similar to PromptBase reference layout)

---

### User Story 3 - Rate and Review a Purchased Prompt (Priority: P2)

A user who has purchased a prompt can submit a star rating (1-5 stars) and an optional written review from the purchase detail page. The review form appears on the purchase detail page. After submitting, their review is visible on the public prompt page. Each user can only submit one review per purchased prompt.

**Why this priority**: Rating drives marketplace quality and trust, but the core purchase viewing experience must work first.

**Independent Test**: Can be tested by submitting a rating on a purchased prompt and verifying it appears on the public prompt page with the correct star count and comment.

**Acceptance Scenarios**:

1. **Given** a user owns a prompt and has not reviewed it, **When** they visit the purchase detail page, **Then** they see a review form with star rating and text input
2. **Given** a user clicks 4 stars and writes a comment, **When** they submit the review, **Then** the review is saved and a success confirmation appears
3. **Given** a user has already reviewed a prompt, **When** they visit the purchase detail page, **Then** they see their existing review displayed (not the form) with an option to edit
4. **Given** a user tries to submit a review without selecting a star rating, **Then** a validation message prompts them to select at least 1 star
5. **Given** a user submits a review, **Then** the prompt's average rating and review count update accordingly on the public prompt page

---

### User Story 4 - Authenticated User Dashboard Sidebar (Priority: P2)

When an authenticated user navigates to any dashboard page (Profile, Purchases, Favorites, or Settings), they see a persistent sidebar on the right (RTL layout) with navigation links to all four sections. The sidebar shows the user's avatar and name at the top. The current page is highlighted in the sidebar. On mobile, the sidebar collapses into a top navigation bar or a hamburger menu.

**Why this priority**: The sidebar improves navigation but is not blocking — individual pages can work standalone via direct URLs.

**Independent Test**: Can be tested by navigating between dashboard sections and verifying the sidebar is present, the current section is highlighted, and all links work correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user visits any dashboard page, **Then** they see a sidebar with links: الملف الشخصي (Profile), المشتريات (Purchases), المفضلة (Favorites), الإعدادات (Settings)
2. **Given** the user is on the Purchases page, **Then** the "المشتريات" link is visually highlighted as active
3. **Given** the user clicks a sidebar link, **Then** they navigate to the corresponding dashboard section without a full page reload
4. **Given** a mobile viewport, **Then** the sidebar adapts to a compact navigation (e.g., top bar with icons or collapsible menu)
5. **Given** an unauthenticated user tries to access a dashboard URL, **Then** they are redirected to the sign-in page

---

### User Story 5 - Favorites / Bookmarks (Priority: P3)

Users can mark prompts as favorites from the marketplace or prompt detail pages. Favorited prompts appear in the Favorites section of the dashboard. Users can remove prompts from favorites. Favorites persist across sessions.

**Why this priority**: Enhances user experience but is not core to the purchase flow. Can be deferred without impacting primary functionality.

**Independent Test**: Can be tested by favoriting a prompt, navigating to the Favorites page, and verifying it appears there. Removing it and confirming it disappears.

**Acceptance Scenarios**:

1. **Given** an authenticated user views a prompt card or detail page, **Then** they see a heart/bookmark icon to add it to favorites
2. **Given** a user clicks the favorite icon on an unfavorited prompt, **Then** the icon toggles to filled/active state and the prompt is saved to their favorites
3. **Given** a user visits the Favorites dashboard page, **Then** they see all their favorited prompts displayed as cards
4. **Given** a user clicks the favorite icon on an already-favorited prompt, **Then** the prompt is removed from favorites
5. **Given** an unauthenticated user clicks the favorite icon, **Then** they are prompted to sign in

---

### User Story 6 - Profile and Settings Pages (Priority: P3)

The Profile page displays the user's public information (name, avatar, email, join date). The Settings page allows the user to manage basic preferences such as display name and notification preferences.

**Why this priority**: These are standard dashboard scaffolding pages. They provide completeness but are not critical to the purchase experience.

**Independent Test**: Can be tested by viewing the Profile page and verifying user info displays correctly, and updating a setting and confirming it persists.

**Acceptance Scenarios**:

1. **Given** an authenticated user visits the Profile page, **Then** they see their avatar, display name, email, and account creation date
2. **Given** a user visits the Settings page, **Then** they can view and update their display name
3. **Given** a user updates a setting and refreshes the page, **Then** the updated value persists

---

### Edge Cases

- What happens when a user's purchased prompt is removed from the marketplace by the seller? The purchase remains accessible — purchased content is permanently available to the buyer.
- What happens when a user tries to access a purchase detail page for a prompt they don't own? They are shown an access-denied message or redirected to the public prompt page.
- What happens when a user has hundreds of purchases? The purchases page paginates or uses infinite scroll to maintain performance.
- What happens when a user submits a review and immediately navigates away? The review submission completes in the background, and the review appears on their next visit.
- What happens when a user favorites a prompt and then that prompt is deleted? The favorite entry is silently removed or shows a "no longer available" state.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an authenticated Purchases page that lists all prompts the current user has bought, sorted by purchase date (newest first)
- **FR-002**: System MUST provide a purchase detail page at `/purchase/[id]` that displays the full prompt template, example outputs, and usage instructions for a purchased prompt
- **FR-003**: System MUST protect purchase detail pages so only the prompt's buyer can view the full content
- **FR-004**: System MUST allow users to copy the full prompt text to clipboard from the purchase detail page
- **FR-005**: System MUST allow authenticated users who purchased a prompt to submit a star rating (1-5) and optional text review
- **FR-006**: System MUST enforce one review per user per prompt — subsequent visits show the existing review with the ability to edit both star rating and comment text. Reviews cannot be deleted once submitted.
- **FR-007**: System MUST update the prompt's aggregate rating and review count when a new review is submitted or edited
- **FR-008**: System MUST provide a persistent sidebar navigation on dashboard pages (`/dashboard`, `/dashboard/purchases`, `/dashboard/favorites`, `/dashboard/settings`) with links to Profile, Purchases, Favorites, and Settings. The existing `/profile` page is replaced by this dashboard.
- **FR-009**: System MUST highlight the currently active section in the sidebar
- **FR-010**: System MUST provide a responsive sidebar that adapts for mobile viewports
- **FR-011**: System MUST allow authenticated users to favorite/unfavorite prompts from marketplace and prompt detail pages
- **FR-012**: System MUST provide a Favorites dashboard page displaying all favorited prompts
- **FR-013**: System MUST persist favorites across browser sessions for authenticated users
- **FR-014**: System MUST provide a Profile page showing user avatar, name, email, and join date
- **FR-015**: System MUST provide a Settings page with at minimum display name editing
- **FR-016**: System MUST redirect unauthenticated users to sign-in when accessing any dashboard page
- **FR-017**: The Purchases page MUST support search filtering by prompt title and filtering by AI model
- **FR-018**: All dashboard pages MUST use Arabic as the primary language with RTL layout

### Key Entities

- **Purchase**: A record linking a user to a prompt they've bought, including the purchase date and price paid. Derived from orders and order line items.
- **Favorite**: A record linking a user to a prompt they've bookmarked for later reference. Contains user identifier and prompt reference.
- **Review**: A user's rating (1-5 stars) and optional text comment on a purchased prompt. Linked to both user and prompt. One review per user per prompt.
- **User Profile**: The user's public-facing information sourced from the authentication provider — avatar, display name, email, join date.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can navigate from the Purchases page to a purchased prompt's full content in under 2 clicks
- **SC-002**: The purchase detail page loads and displays the full prompt template within 2 seconds
- **SC-003**: Users can copy a prompt to clipboard in a single click from the purchase detail page
- **SC-004**: 100% of purchased prompts are accessible to their buyers at all times, regardless of marketplace listing status
- **SC-005**: Users can submit a review in under 30 seconds (select stars, optionally type comment, submit)
- **SC-006**: Sidebar navigation allows switching between all 4 dashboard sections without full page reloads
- **SC-007**: All dashboard pages render correctly on both desktop (≥1024px) and mobile (≤768px) viewports
- **SC-008**: Users can favorite a prompt and see it in their Favorites page within the same session
- **SC-009**: The Purchases page correctly reflects all completed orders, with zero missed purchases

## Clarifications

### Session 2026-02-12

- Q: How should prompt template, examples, and instructions be stored for the purchase detail page? → A: Separate fields — `fullContent` holds the prompt template, `samples` holds example outputs, and a new `instructions` field is added to the prompt entity.
- Q: Should the new dashboard replace the existing `/profile` page or coexist alongside it? → A: Replace — remove the existing `/profile` page entirely. The new dashboard lives at `/dashboard/` with sub-pages (`/dashboard/purchases`, `/dashboard/favorites`, `/dashboard/settings`, and `/dashboard` as the profile page).
- Q: Can users delete reviews, and can they edit both stars and comment? → A: Users can edit both star rating and comment text, but cannot delete a review once submitted. Reviews are permanent.
- Q: What URL pattern should the purchase detail page use? → A: `/purchase/[id]` — a standalone route, separate from both the dashboard and the public prompt page at `/prompt/[id]`.

## Assumptions

- **Authentication data**: User avatar, display name, and email are sourced from the authentication provider (Clerk) — no separate user profile table is needed for basic information.
- **Prompt content model**: The prompt entity uses three separate fields for purchase detail content: `fullContent` holds the prompt template text, `samples` holds example outputs, and a new `instructions` field stores usage instructions. No structured JSON or single-field approach is used.
- **Favorites storage**: Favorites are stored server-side (not just in the browser) to persist across devices.
- **Review authorship**: Reviews are tied to the authenticated user's identity from the auth provider. The reviewer's display name and avatar come from the auth provider.
- **Existing orders as purchases**: The existing orders and order items data represents the purchase history — no new purchase tracking is needed beyond what the checkout flow already creates.
- **Settings scope**: The initial Settings page is minimal (display name only). More settings (notifications, payment methods, etc.) can be added in future iterations.
- **Sidebar position**: In RTL layout, the sidebar appears on the right side of the page (following RTL conventions and matching the PromptBase reference).

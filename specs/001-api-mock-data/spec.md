# Feature Specification: API Layer with Mock Data

**Feature Branch**: `001-api-mock-data`
**Created**: 2026-02-11
**Status**: Draft
**Input**: User description: "This application is only UI — start with the APIs with mock data. The mock data comes from the API, not src/data/mockData.ts"

## Clarifications

### Session 2026-02-11

- Q: Where should filtering and sorting happen — server-side in the data endpoints or client-side in components? → A: Server-side — endpoints accept filter/sort query parameters and return filtered results.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse and Discover Prompts (Priority: P1)

A visitor opens the marketplace and sees prompt listings, categories, and featured content. All displayed data is fetched from the system's data endpoints rather than embedded in the page code. The visitor can filter by category, AI model, and price range. Sorting by bestselling, rating, or price works correctly.

**Why this priority**: Browsing is the core user journey — without it, no other marketplace interaction is possible. This covers the homepage, marketplace listing, and category display.

**Independent Test**: Can be fully tested by loading the homepage and marketplace page, verifying that prompts and categories appear correctly, and confirming that filtering and sorting return expected results.

**Acceptance Scenarios**:

1. **Given** the homepage is loaded, **When** the page renders, **Then** categories with correct counts and a selection of prompts are displayed
2. **Given** the marketplace page is loaded, **When** a user selects a category filter, **Then** only prompts in that category are shown
3. **Given** the marketplace page is loaded, **When** a user sorts by "highest rated", **Then** prompts are reordered by rating descending
4. **Given** the marketplace page is loaded, **When** a user sets a price range, **Then** only prompts within that range appear
5. **Given** the data endpoint is unavailable, **When** a page attempts to load, **Then** the user sees a meaningful error message in Arabic

---

### User Story 2 - View Prompt Details (Priority: P2)

A visitor selects a prompt from the listing and is taken to a detailed view showing the prompt's full description, samples, reviews, seller information, and related prompts from the same category.

**Why this priority**: Prompt detail is the conversion point — users decide to purchase here. It depends on the browse infrastructure from US1 but is independently testable with a single prompt ID.

**Independent Test**: Can be fully tested by navigating to a prompt detail page with a known ID, verifying all sections (description, samples, reviews, related prompts) render correctly.

**Acceptance Scenarios**:

1. **Given** a valid prompt ID, **When** the detail page loads, **Then** the prompt's title, description, price, AI model, difficulty, tags, samples, and seller info are displayed
2. **Given** a valid prompt ID, **When** the detail page loads, **Then** reviews for that prompt are listed with user name, rating, date, and comment
3. **Given** a valid prompt ID, **When** the detail page loads, **Then** up to 3 related prompts from the same category are shown
4. **Given** an invalid prompt ID, **When** the detail page loads, **Then** the user sees a 404 not-found page in Arabic

---

### User Story 3 - Search for Prompts (Priority: P3)

A visitor types a search query and sees matching prompts. The search covers prompt titles (Arabic and English), descriptions, and tags.

**Why this priority**: Search is a key discovery mechanism but is secondary to browsing. It reuses the prompt data infrastructure from US1.

**Independent Test**: Can be fully tested by entering a known search term and verifying that matching prompts appear, then entering a nonsense term and verifying an empty-results message is shown.

**Acceptance Scenarios**:

1. **Given** a search query matching a prompt title, **When** results are displayed, **Then** the matching prompt appears in the results
2. **Given** a search query matching a tag, **When** results are displayed, **Then** prompts with that tag appear
3. **Given** a search query with no matches, **When** results are displayed, **Then** the user sees an Arabic "no results found" message
4. **Given** an empty search query, **When** the user submits, **Then** no request is made and the current view is preserved

---

### User Story 4 - View Cart, Checkout, Profile, and Seller Pages (Priority: P4)

The remaining pages (cart, checkout, profile, seller dashboard) display prompt data sourced from data endpoints rather than hardcoded imports. Cart shows selected items with pricing. Checkout shows an order summary. Profile shows purchase history and saved prompts. Seller dashboard shows product listings and performance metrics.

**Why this priority**: These pages complete the marketplace experience but are lower priority because they currently use mock slices of prompt data (e.g., first 3 prompts as cart items). The data structure is simpler — mostly prompt lookups by ID or array slices.

**Independent Test**: Can be tested by navigating to each page and verifying that prompt data (titles, prices, images) is displayed correctly from the data layer.

**Acceptance Scenarios**:

1. **Given** the cart page is loaded, **When** items are displayed, **Then** each item shows its title, price, AI model, and thumbnail from the data layer
2. **Given** the checkout page is loaded, **When** the order summary renders, **Then** item prices, subtotal, tax, and total are calculated correctly
3. **Given** the profile page is loaded, **When** purchases and saved prompts are displayed, **Then** prompt data appears correctly
4. **Given** the seller dashboard is loaded, **When** product listings render, **Then** seller's prompts with sales and revenue metrics are shown
5. **Given** the seller dashboard is loaded, **When** the category dropdown renders, **Then** all categories are listed from the data layer

---

### Edge Cases

- What happens when a prompt referenced by ID does not exist? System MUST display a 404 page.
- What happens when the data endpoint returns an empty array? Pages MUST show an appropriate "no data" state in Arabic.
- What happens when a search query contains special characters or very long strings? System MUST handle gracefully without errors.
- What happens when category or AI model filter values don't match any prompts? The filtered list MUST show an empty state, not an error.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide data endpoints for retrieving prompt listings with server-side support for filtering (category, AI model, price range) and sorting (bestselling, rating, price ascending/descending, newest) via query parameters
- **FR-002**: System MUST provide a data endpoint for retrieving a single prompt by its unique identifier, including seller information and samples
- **FR-003**: System MUST provide a data endpoint for retrieving reviews associated with a specific prompt
- **FR-004**: System MUST provide a data endpoint for retrieving all categories with their prompt counts
- **FR-005**: System MUST provide a data endpoint for searching prompts across titles (Arabic and English), descriptions, and tags
- **FR-006**: System MUST provide a data endpoint for retrieving related prompts by category, excluding the current prompt
- **FR-007**: System MUST provide a data endpoint for retrieving testimonials
- **FR-008**: All pages that currently import from the static mock data file MUST be updated to consume data from the new data endpoints instead
- **FR-009**: The existing mock data (prompts, categories, reviews, testimonials) MUST be preserved as the data source within the endpoints, maintaining all bilingual content and field structure
- **FR-010**: All data responses MUST maintain the same data shape (field names, types, nesting) so that existing UI rendering logic continues to work without modification
- **FR-011**: When a requested resource does not exist, the system MUST return a structured not-found response
- **FR-012**: When invalid parameters are provided (e.g., non-numeric price range), the system MUST return a structured validation error response

### Key Entities

- **Prompt**: A marketplace product containing bilingual title/description, price, category, AI model, rating, reviews count, sales count, thumbnail image, seller object (name, avatar, rating), tags, difficulty level (beginner/advanced), sample outputs, and optional full content
- **Category**: A classification grouping for prompts, containing bilingual name, icon identifier, and prompt count
- **Review**: User feedback on a prompt, containing user name, avatar, rating (1-5), date, and comment text
- **Testimonial**: Site-wide user endorsement with name, role, content, avatar, and rating

## Assumptions

- The existing mock data arrays (8 prompts, 8 categories, 3 reviews, 3 testimonials) remain the data source for this phase. No database integration is expected.
- Cart state, checkout flow, and profile data remain client-side with mock slices — the endpoints serve the underlying prompt/category data, not cart or user state.
- Pagination is not required for this phase given the small mock dataset (8 prompts). Endpoints return full result sets.
- The existing UI rendering logic and component structure remain unchanged — only the data sourcing mechanism changes.
- Filtering, sorting, and search MUST happen server-side within the data endpoints. Endpoints accept query parameters for filter criteria and sort order, returning only matching results.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero pages import data directly from the static mock data file — all data flows through data endpoints
- **SC-002**: All 8 existing pages (home, market, prompt detail, search, cart, checkout, profile, seller) render identically to their current appearance after the migration
- **SC-003**: Users can filter and sort the marketplace with results appearing in under 1 second
- **SC-004**: Users searching for prompts see results instantly with no perceived delay
- **SC-005**: Invalid prompt IDs result in a user-friendly 404 page rather than a blank screen or error
- **SC-006**: The application builds and passes linting with zero errors after the migration

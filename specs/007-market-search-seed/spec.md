# Feature Specification: Market Search, Seed Data & Enhanced Filters

**Feature Branch**: `007-market-search-seed`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "Seed the database with 100 prompts for the market, use mock images and data and sellers. Implement a search feature where the user types a keyword and gets suggested prompts. The marketplace background should be darker (dark theme). Market filters like PromptBase: trending, most relevant, most popular, newest. Filters should include Type, Price, and Model sidebar."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Database Seeding with Realistic Prompts (Priority: P1)

The marketplace needs a populated catalog to be usable. An operator seeds the database with 100 diverse, realistic AI prompts spanning multiple categories, AI models, price points, difficulty levels, and seller personas. Each prompt includes a thumbnail image (from a public placeholder service), descriptive title/description in Arabic, tags, example outputs, and seller information. This data makes the marketplace feel alive and enables testing of all other features.

**Why this priority**: Without data in the marketplace, search, filters, and browsing are all empty. This is the foundation for every other user story.

**Independent Test**: Run the seed script and verify the marketplace page displays 100 prompts with images, prices, seller names, ratings, and categories distributed across all available options.

**Acceptance Scenarios**:

1. **Given** an empty or existing database, **When** the seed script is executed, **Then** 100 prompts are inserted with realistic Arabic titles, descriptions, prices ($1.99-$29.99), thumbnails, tags, ratings (3.0-5.0), sales counts, and example outputs.
2. **Given** the seeded database, **When** a user visits the marketplace, **Then** prompts are displayed with thumbnails, titles, prices, seller names, AI model badges, and rating stars.
3. **Given** the seeded data, **When** inspecting the distribution, **Then** prompts are spread across all categories (text, image, code, marketing, design), all AI models (ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion, Gemini, Copilot), and multiple fictional seller personas (at least 10 distinct sellers).

---

### User Story 2 - Search with Autocomplete Suggestions (Priority: P1)

A visitor types a keyword into the search bar on the marketplace/hero and sees a dropdown of suggested prompts matching the query. The suggestions appear in real-time as the user types (debounced). Each suggestion shows the prompt title and optionally the AI model. Clicking a suggestion navigates to that prompt's detail page. Pressing Enter or clicking the search icon navigates to the marketplace with the search query applied as a filter.

**Why this priority**: Search is the primary discovery mechanism for a marketplace. Users need to quickly find prompts relevant to their needs.

**Independent Test**: Type a keyword (e.g., "شعار") into the search bar, verify dropdown shows matching prompts within 1 second, click a suggestion and confirm navigation to the prompt detail page.

**Acceptance Scenarios**:

1. **Given** a user on the homepage or marketplace, **When** they type at least 2 characters in the search bar, **Then** a dropdown appears showing up to 6 matching prompt suggestions with title and AI model badge.
2. **Given** the suggestion dropdown is visible, **When** the user clicks a suggestion, **Then** they are navigated to that prompt's detail page.
3. **Given** the suggestion dropdown is visible, **When** the user presses Enter or clicks the search icon, **Then** they are navigated to the marketplace page with the search query applied, showing filtered results.
4. **Given** the user types a query with no matches, **When** the suggestions load, **Then** the dropdown shows a "لا توجد نتائج" (no results) message.
5. **Given** the search bar has text, **When** the user clicks the clear (X) button, **Then** the input is cleared and suggestions disappear.

---

### User Story 3 - Dark Marketplace UI (Priority: P2)

The marketplace page has a dark-themed hero section with a prominent search bar, similar to PromptBase's dark aesthetic. The hero background is dark/near-black with subtle styling. The search bar is centered and visually prominent with a colored search button. Below the hero, the marketplace grid displays prompt cards on a dark background.

**Why this priority**: The visual presentation significantly impacts user trust and engagement. A polished dark marketplace theme differentiates the platform and matches industry standards.

**Independent Test**: Visit the marketplace page and verify the hero section has a dark background, the search bar is prominent with a clear/search button, and the overall page uses the dark color palette.

**Acceptance Scenarios**:

1. **Given** a user navigates to the marketplace page, **When** the page loads, **Then** the hero section displays a dark background with the marketplace title, subtitle, and a centered search bar with search icon button.
2. **Given** the dark marketplace page, **When** viewing on mobile (< 768px), **Then** the layout adapts responsively with the search bar taking full width and filters accessible via a toggle/drawer.

---

### User Story 4 - Advanced Marketplace Filters & Sorting (Priority: P2)

The marketplace provides a sidebar (desktop) or drawer (mobile) with filter options and a sorting dropdown. Filters include: **Type** (All, Image, Text, Code, Marketing, Design), **Price** (Free only toggle, price range), **Model** (All, ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion, Gemini, Copilot). Sorting options include: Most relevant (when search query exists), Trending, Most popular (by sales count), Newest, Price low-to-high, Price high-to-low. Active filters are shown as removable chips/badges above the results grid. A "Reset" button clears all filters.

**Why this priority**: Filters are essential for a marketplace with 100+ items. Users need to narrow down results quickly by their preferred AI model, content type, and budget.

**Independent Test**: Apply a filter (e.g., Model: Claude), verify only Claude prompts appear. Change sort to "Newest", verify order changes. Click the filter chip X to remove it, verify results reset.

**Acceptance Scenarios**:

1. **Given** a user on the marketplace, **When** they select "Claude" under Model filter, **Then** only prompts using Claude are displayed, and a "Claude" chip appears above the results.
2. **Given** active filters, **When** the user clicks the X on a filter chip, **Then** that filter is removed and results update.
3. **Given** the user has a search query, **When** they open the sort dropdown, **Then** "Most relevant" is available and selected by default. Without a search query, "Trending" is the default sort.
4. **Given** the user selects "Price: Low to High" sorting, **When** results load, **Then** prompts are ordered by ascending price.
5. **Given** multiple active filters, **When** the user clicks "Reset", **Then** all filters and sorting return to defaults.
6. **Given** a mobile viewport, **When** the user taps the filter button, **Then** a slide-out drawer opens with all filter options.

---

### Edge Cases

- What happens when a search query returns zero results? Display a friendly empty state with "لا توجد نتائج" message and suggest clearing filters.
- What happens when the user types very quickly in the search bar? Debounce requests (300ms) to avoid excessive queries.
- What happens when filters are combined (e.g., Model: Claude + Type: Image) and no prompts match? Show the empty state with active filter chips, allowing users to remove individual filters.
- What happens when the seed script is run multiple times? It should be idempotent — either clear existing seed data first or skip if already seeded.
- What happens when the user navigates to the marketplace with URL query parameters (e.g., `?search=logo&model=claude`)? Filters should initialize from URL state, enabling shareable filtered views.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a seed script that populates the database with exactly 100 prompts using realistic Arabic content, varied categories, AI models, prices, sellers, and placeholder thumbnail images.
- **FR-002**: System MUST provide search functionality that queries prompts by title, description, and tags, returning results ranked by relevance.
- **FR-003**: System MUST display autocomplete suggestions (up to 6) in a dropdown as the user types, with a minimum of 2 characters typed and a 300ms debounce.
- **FR-004**: System MUST provide a search suggestions endpoint that returns matching prompts efficiently.
- **FR-005**: System MUST provide filtering by generation type (text, image, code, marketing, design) with radio-button selection and an "All" default.
- **FR-006**: System MUST provide filtering by AI model (ChatGPT, Claude, Midjourney, DALL-E, Stable Diffusion, Gemini, Copilot) with radio-button selection and an "All" default.
- **FR-007**: System MUST provide sorting options: Trending (by a combination of sales and recency), Most popular (by sales count), Newest (by creation date), Price low-to-high, Price high-to-low, and Most relevant (when a search query is active).
- **FR-008**: System MUST display active filters as removable chips/badges above the results grid.
- **FR-009**: System MUST persist filter and sort state in URL query parameters to enable shareable links.
- **FR-010**: System MUST render the entire marketplace page (hero, filters, results grid, cards) with a forced dark theme regardless of the user's app theme toggle.
- **FR-011**: System MUST render the filter sidebar on desktop viewports and a slide-out drawer on mobile viewports.
- **FR-012**: System MUST show an empty state message when search/filter combinations return zero results, with guidance to adjust filters.
- **FR-013**: System MUST display prompt cards in a responsive grid (4 columns desktop, 2 columns tablet, 1 column mobile) showing thumbnail, title, price, AI model badge, and rating.
- **FR-014**: System MUST load 20 prompts initially and provide a "Load more" button that fetches the next 20 results per click, until all matching results are displayed.

### Key Entities

- **Prompt**: The primary marketplace item — title, description, price, category, AI model, generation type, tags, thumbnail, rating, sales count, difficulty, seller info. Already exists in the database schema.
- **Seller Persona** (seed-only): Fictional seller profiles used in seeded data — name, avatar URL. Not a new database entity; seller data is embedded in prompt rows.
- **Search Query**: The text entered by the user — matched against prompt title, description, and tags to produce ranked results.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Marketplace displays at least 100 prompts with images, prices, and seller information after seeding.
- **SC-002**: Search suggestions appear within 1 second of the user pausing after typing at least 2 characters.
- **SC-003**: Users can filter the marketplace by type and model, with results updating within 1 second.
- **SC-004**: All filter and sort selections are reflected in the URL, enabling users to share or bookmark filtered views.
- **SC-005**: The marketplace is fully usable on mobile devices with filters accessible via a drawer and cards in a single-column layout.
- **SC-006**: Zero-result states provide clear guidance, and no blank/broken screens appear for any filter combination.

## Clarifications

### Session 2026-02-14

- Q: Should the dark theme apply to the entire marketplace page or only the hero section? → A: Entire marketplace page is dark (hero, filters, results grid, cards) — forced dark regardless of app theme toggle.
- Q: How should marketplace results be paginated? → A: "Load more" button — loads 20 prompts initially, then 20 more per click.

## Assumptions

- Placeholder images will use a public image service (e.g., picsum.photos or similar) that does not require authentication or API keys.
- The existing `prompts` database table schema supports all fields needed for seeding (title, titleEn, description, descriptionEn, price, category, aiModel, generationType, tags, thumbnail, rating, sales, difficulty, sellerName, sellerAvatar, sellerRating, samples, exampleOutputs, examplePrompts, fullContent, instructions, status).
- Seeded prompts will have `status: "approved"` so they appear in the marketplace immediately.
- The dark theme applies to the entire marketplace page (hero, sidebar, results grid, prompt cards) — forced dark regardless of the user's app theme toggle setting. The rest of the application is unaffected.
- "Trending" sort uses a weighted combination of sales count and recency (newer prompts with sales rank higher).
- Arabic content in seed data can use realistic but not necessarily grammatically perfect text, as the purpose is visual population.
- The 10 fictional seller personas reuse across the 100 prompts (each seller has ~10 prompts on average).

## Out of Scope

- Full-text search engine integration (e.g., Elasticsearch, Algolia) — basic database text search is sufficient for 100 prompts.
- Saved searches or search history.
- Price range slider filter (simple "Free only" toggle is sufficient for MVP).
- Faceted search with result counts per filter option.
- Seller profile pages (seller info is display-only on prompt cards).

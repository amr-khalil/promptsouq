# Feature Specification: Seller Leaderboard & Public Storefront

**Feature Branch**: `008-seller-leaderboard-storefront`
**Created**: 2026-02-14
**Status**: Draft
**Input**: User description: "in the landing page the featured seller i want to get them from the database and rank them like a leaderboard and make the seller store front to see the prompts, total review and stats, how many sales and favorites, country, etc. add mock data and connect it with the prompts and seller tables to be a real data and real automatic ranking"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Featured Sellers Leaderboard on Landing Page (Priority: P1)

A visitor lands on the homepage and sees the "Featured Sellers" section populated with real seller data ranked by a composite score (total sales, average rating, total reviews). The leaderboard updates automatically as sellers accumulate more sales, reviews, and ratings — no manual curation needed.

**Why this priority**: This replaces hardcoded mock data with real dynamic data, which is the core ask. The landing page is the highest-traffic page, and showing real ranked sellers adds credibility and incentivizes sellers to perform better.

**Independent Test**: Can be fully tested by seeding seller profiles with varying stats, loading the homepage, and verifying sellers appear in the correct ranked order with accurate stats pulled from the database.

**Acceptance Scenarios**:

1. **Given** the database has seller profiles with linked prompts, **When** a visitor loads the homepage, **Then** the Featured Sellers section displays the top 8 sellers sorted by rating (default tab "الأعلى تقييماً").
2. **Given** the user clicks the "الأكثر مبيعاً" tab, **When** the tab activates, **Then** the sellers re-sort by total sales descending.
3. **Given** a seller's prompt accumulates more sales, **When** the homepage is loaded, **Then** the seller's ranking updates automatically without manual intervention.
4. **Given** the database has fewer than 8 active sellers, **When** the homepage loads, **Then** only the available sellers are displayed without empty cards or errors.
5. **Given** the Featured Sellers section is loading, **When** the API call is in progress, **Then** skeleton placeholders are shown.

---

### User Story 2 - Public Seller Storefront Page (Priority: P2)

A buyer clicks on a seller card (from the leaderboard or from a prompt detail page) and lands on a public storefront page (`/seller/[sellerId]`) that shows the seller's profile, aggregate stats (total prompts, total sales, total reviews, total favorites, average rating, country), and a browsable grid of their approved prompts.

**Why this priority**: The storefront is the natural next step after discovering a seller — it converts interest into browsing and purchasing. It completes the seller-buyer discovery loop.

**Independent Test**: Can be tested by navigating to `/seller/[sellerId]`, verifying profile info displays correctly, stats are accurate aggregates from the database, and the prompt grid shows only that seller's approved prompts.

**Acceptance Scenarios**:

1. **Given** a valid seller ID, **When** a visitor navigates to `/seller/[sellerId]`, **Then** the page displays the seller's name, avatar, country, bio, and aggregate stats.
2. **Given** a seller has 15 approved prompts, **When** the storefront loads, **Then** all 15 prompts are displayed in a grid using the existing prompt card component.
3. **Given** the seller stats include total sales across all prompts (e.g. 1,240), total reviews (e.g. 89), average rating (e.g. 4.7), and total favorites, **When** the storefront loads, **Then** these aggregated numbers are displayed accurately.
4. **Given** an invalid seller ID, **When** a visitor navigates to `/seller/[invalidId]`, **Then** a 404 page is shown.
5. **Given** a seller card on the homepage leaderboard, **When** clicked, **Then** the user is navigated to that seller's storefront page.

---

### User Story 3 - Seed Data with Realistic Seller Profiles (Priority: P3)

The seed script creates seller profile records in the `seller_profiles` table linked to the prompts via `sellerId`, with realistic data (names, avatars, countries, bios). This ensures the leaderboard and storefront work with real relational data from day one.

**Why this priority**: Without seed data, the leaderboard and storefront pages have nothing to display. This is an enabler for P1 and P2 but is lower priority because it's a one-time data setup task.

**Independent Test**: Can be tested by running the seed script and verifying that `seller_profiles` records exist, each prompt's `sellerId` references a valid seller profile, and querying the leaderboard API returns correctly ranked results.

**Acceptance Scenarios**:

1. **Given** the seed script is executed, **When** querying `seller_profiles`, **Then** 10 seller profiles exist with unique user IDs, names, avatars, countries, and bios.
2. **Given** the seed script is executed, **When** querying prompts, **Then** each prompt's `sellerId` references a valid `seller_profiles.userId`.
3. **Given** the seed script is executed, **When** querying the leaderboard API, **Then** sellers are ranked based on their aggregated prompt stats (sales, reviews, rating).

---

### Edge Cases

- What happens when a seller has zero approved prompts? They should not appear on the leaderboard.
- What happens when two sellers have identical composite scores? They should be ordered by most recent prompt creation date (newer first).
- What happens when the seller profile exists but has no bio or country? The storefront should display gracefully with placeholders or omit those sections.
- What happens when `sellerId` on prompts is null (seed prompts from before this feature)? The seed script must backfill `sellerId` on existing prompts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST compute a composite seller ranking score from: total sales (across all approved prompts), average rating, and total reviews count. The ranking updates automatically based on current data.
- **FR-002**: System MUST expose an API endpoint that returns the top N sellers ranked by a `sortBy` parameter supporting two modes: "rating" (average rating, default) and "sales" (total sales). The endpoint returns seller profile info and aggregated stats.
- **FR-003**: The homepage Featured Sellers section MUST fetch seller data from the API (replacing the current hardcoded mock array) and display sellers in ranked order.
- **FR-004**: System MUST provide a public seller storefront page at `/seller/[sellerId]` showing: seller profile (name, avatar, country, bio), aggregate stats (total prompts, total sales, total reviews, total favorites, average rating), and a grid of their approved prompts.
- **FR-005**: The `seller_profiles` table MUST be extended with display fields: `displayName`, `avatar`, and `bio` to support public storefront rendering.
- **FR-006**: The seed script MUST create `seller_profiles` records for all 10 seller personas and link each prompt to a seller via `sellerId`.
- **FR-007**: Seller cards on the homepage MUST link to the corresponding seller's storefront page.
- **FR-008**: The storefront page MUST aggregate favorites count across all of a seller's prompts by querying the `favorites` table.
- **FR-009**: The leaderboard API MUST exclude sellers with zero approved prompts.
- **FR-010**: The storefront page MUST show a 404 when the seller ID does not exist.
- **FR-011**: System MUST auto-compute a seller tier (Bronze / Silver / Gold) based on total sales thresholds. The tier is derived at query time and displayed as a badge on seller cards (leaderboard and storefront). Thresholds: Bronze (< 100 sales), Silver (100–499 sales), Gold (500+ sales).

### Key Entities

- **Seller Profile** (extended): Represents a seller's public identity — userId (PK), displayName, avatar, bio, country, Stripe account info, totalEarnings, totalSales. The display fields are new additions to the existing `seller_profiles` table.
- **Seller Leaderboard Entry**: A computed view combining seller profile data with aggregated prompt stats (total sales, avg rating, review count, prompt count) and an auto-computed tier (Bronze/Silver/Gold). Not a stored entity — derived at query time.
- **Seller Storefront**: A public page combining a seller's profile with their approved prompts and aggregated stats. Not a stored entity — assembled from seller profile + prompts + reviews + favorites queries.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The homepage Featured Sellers section displays real ranked sellers from the database with no hardcoded data remaining.
- **SC-002**: Seller ranking on the homepage updates automatically when a seller's prompt stats change (no manual curation step).
- **SC-003**: The seller storefront page loads with accurate stats for any seller with approved prompts.
- **SC-004**: The seed script successfully creates 10 seller profiles linked to 100 prompts, all queryable via the leaderboard API.
- **SC-005**: All pages (homepage leaderboard, storefront) display loading states while data is being fetched.

## Clarifications

### Session 2026-02-14

- Q: Should the leaderboard sort tabs ("الأعلى تقييماً" / "الأكثر مبيعاً") be functional? → A: Yes — tabs toggle between "by rating" and "by sales" sort order (Option A).
- Q: Should seller cards show a tier badge (Bronze/Silver/Gold)? → A: Yes — auto-computed tiers based on total sales thresholds (e.g. Bronze < 100, Silver < 500, Gold 500+). No manual assignment.

## Assumptions

- The composite ranking formula weights total sales most heavily, followed by average rating, then review count. Exact weights will be defined during planning.
- Seller `userId` values in the seed are synthetic IDs (e.g. `seed-seller-1` through `seed-seller-10`) since real Clerk user IDs don't exist for mock sellers.
- The storefront page is publicly accessible (no authentication required) since it's a discovery feature.
- Country data in the seed will use ISO country codes mapped to Arabic display names.
- The existing `FeaturedSellers.tsx` component structure will be preserved but refactored to consume API data instead of the hardcoded array.

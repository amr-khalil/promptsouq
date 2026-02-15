# Research: Seller Leaderboard & Public Storefront

## Decision 1: Schema Extension Strategy

**Decision**: Add `display_name`, `avatar`, and `bio` columns to the existing `seller_profiles` table via Drizzle schema modification + drizzle-kit migration.

**Rationale**: The `seller_profiles` table currently only stores Stripe onboarding data (no display fields). Seller display data (name, avatar, rating) is denormalized in `prompts` table columns. Adding display fields to `seller_profiles` creates a canonical source for public profile rendering while keeping the denormalized prompt columns intact for backward compatibility.

**Alternatives considered**:
- Separate `seller_display_profiles` table — rejected (unnecessary complexity, single entity)
- Only use denormalized prompt data — rejected (no bio, no canonical profile source, inconsistent if seller changes name)

## Decision 2: Leaderboard Aggregation Strategy

**Decision**: Compute leaderboard rankings at query time using a single SQL aggregation query (SUM sales, AVG rating, COUNT reviews, COUNT prompts) grouped by `sellerId`, joined with `seller_profiles`. No materialized views or caching.

**Rationale**: With 10 sellers and 100 prompts, real-time aggregation is negligible cost. The existing codebase uses inline `sql` template literals for complex ORDER BY and WHERE clauses (see `/api/prompts/route.ts` trending sort pattern). This fits naturally.

**Alternatives considered**:
- Materialized view / denormalized stats table — rejected (premature optimization, adds sync complexity)
- Cache in Redis/memory — rejected (no Redis in stack, adds dependency)

## Decision 3: Tier Computation

**Decision**: Compute tier in the API response mapper (not stored). Use total sales thresholds: Bronze (< 100), Silver (100–499), Gold (500+). Tier label returned in Arabic: "برونزي", "فضي", "ذهبي".

**Rationale**: Derived data should not be stored when it's a simple threshold check. Computing in the mapper keeps the DB schema clean and thresholds easy to adjust.

## Decision 4: API Endpoint Design

**Decision**: Two new endpoints:
- `GET /api/sellers?sortBy=rating|sales&limit=8` — Leaderboard (public)
- `GET /api/sellers/[sellerId]` — Single seller profile + aggregated stats (public)

**Rationale**: Follows existing patterns (`/api/prompts` with query params, `/api/prompts/[id]` for single resource). The storefront page fetches seller data from `/api/sellers/[sellerId]` and prompts from `/api/prompts?sellerId=...`.

**Alternatives considered**:
- Single `/api/sellers/[sellerId]` returning prompts embedded — rejected (large payload, can't paginate prompts separately)
- GraphQL — rejected (not in tech stack)

## Decision 5: Storefront Prompt Fetching

**Decision**: Reuse the existing `/api/prompts` endpoint by adding a `sellerId` filter parameter. The storefront page makes two parallel fetches: one for seller profile, one for seller's prompts.

**Rationale**: Avoids duplicating prompt query logic. The existing endpoint already handles filtering, sorting, and pagination. Just needs a `sellerId` condition added to the WHERE clause.

## Decision 6: Seed Data Architecture

**Decision**: Update seed script to:
1. Create 10 `seller_profiles` records with synthetic IDs (`seed-seller-1` through `seed-seller-10`)
2. Set `sellerId` on all 100 prompts to reference the corresponding seller profile
3. Populate `displayName`, `avatar`, `bio`, `country` on seller profiles
4. Vary sales data across sellers so leaderboard ranking is non-trivial

**Rationale**: Synthetic IDs avoid conflicting with real Clerk user IDs. The seed must backfill `sellerId` on prompts since the current seed leaves it null.

## Decision 7: Favorites Aggregation for Storefront

**Decision**: Query favorites count per seller using `COUNT(*)` on `favorites` table joined through `prompts` where `prompts.sellerId = sellerId`. Run as a separate lightweight query in the storefront API endpoint.

**Rationale**: The `favorites` table only has (userId, promptId). To get total favorites for a seller, must join through prompts. Keeping it as a separate query avoids complicating the main aggregation.

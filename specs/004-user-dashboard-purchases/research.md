# Research: User Dashboard & Purchases

**Feature**: 004-user-dashboard-purchases
**Date**: 2026-02-12

## R1: Reviews Schema — Adding User Identity

**Decision**: Add a `userId` (text, not null) column to the `reviews` table and a unique composite constraint on `(userId, promptId)` to enforce one review per user per prompt.

**Rationale**: The current reviews table stores `userName` and `userAvatar` as plain text with no link to authenticated users. To support:
- One review per user per prompt (FR-006)
- Showing existing review to the author for editing
- Preventing unauthenticated reviews

We need the Clerk `userId` stored alongside each review. The `userName` and `userAvatar` fields remain for display (populated from Clerk at submission time) — this avoids a runtime lookup to Clerk on every page load.

**Alternatives considered**:
- *Remove userName/userAvatar, always fetch from Clerk*: Rejected — adds latency to every review render and couples display to Clerk availability.
- *Store only userId, join with a users table*: Rejected — no users table exists (Clerk is the auth provider), and creating one is unnecessary overhead for this feature.

## R2: Prompts Schema — Adding Instructions Field

**Decision**: Add an `instructions` (text, nullable) column to the `prompts` table.

**Rationale**: The spec requires the purchase detail page to show three distinct content sections: prompt template (`fullContent`), example outputs (`samples`), and usage instructions. The first two fields already exist. Adding a single nullable text column for instructions is the minimal change needed. Nullable because existing prompts don't have instructions yet — they can be populated incrementally.

**Alternatives considered**:
- *Structured JSON in fullContent*: Rejected — breaks the existing contract where `fullContent` is a plain text template displayed on the prompt detail page.
- *Separate content table*: Rejected — over-engineered for a single new text field.

## R3: Favorites Table Design

**Decision**: New `favorites` table with columns: `id` (serial PK), `userId` (text, not null), `promptId` (uuid FK → prompts.id), `createdAt` (timestamp), and a unique constraint on `(userId, promptId)`.

**Rationale**: Favorites must persist server-side across sessions and devices (FR-013). A dedicated junction table is the simplest and most standard approach. The unique constraint prevents duplicate favorites. `userId` stores the Clerk user ID (text format, same as orders.userId).

**Alternatives considered**:
- *localStorage only*: Rejected — spec requires cross-device persistence.
- *JSON array column on a users table*: Rejected — no users table exists; array columns are harder to query for prompt-level stats.

## R4: Dashboard Layout Pattern

**Decision**: Use a Next.js route group at `src/app/dashboard/` with a shared `layout.tsx` that renders the sidebar. The layout is a Server Component that wraps child pages. The sidebar itself is a Client Component (needs `usePathname()` for active link highlighting and `useUser()` from Clerk for avatar/name).

**Rationale**: Next.js App Router layouts persist across sub-route navigations, giving us the "no full page reload" behavior required by SC-006. The sidebar component is pushed to the client boundary because it needs hooks, while the layout shell remains a Server Component for optimal performance.

**Alternatives considered**:
- *Sidebar as a separate component in each page*: Rejected — duplicates code and loses layout persistence.
- *Entire layout as Client Component*: Rejected — violates constitution III (Server Components by default).

## R5: Route Protection Updates

**Decision**: Update `src/proxy.ts` to ensure `/dashboard` and `/purchase` routes are protected (not in the public route matcher). Currently, public routes include `/prompt(.*)` — this does NOT match `/purchase(.*)` since they're distinct path prefixes. No regex conflict.

**Rationale**: The current `isPublicRoute` matcher includes `/`, `/market(.*)`, `/search(.*)`, `/prompt(.*)`, `/sign-in(.*)`, `/sign-up(.*)`, and `/api(.*)`. Since `/dashboard` and `/purchase` are not listed, Clerk middleware will automatically call `auth.protect()` for them, which is the desired behavior.

**Alternatives considered**:
- *Explicitly adding `/dashboard` and `/purchase` to a deny list*: Unnecessary — they're already denied by default (not in the public list).

## R6: User Purchases API Enhancement

**Decision**: Enhance `GET /api/user/purchases` to support two modes:
1. **Check mode** (existing): `?promptId={id}` → returns `{ purchased: boolean }`
2. **List mode** (enhanced): no `promptId` param → returns full purchase details with prompt info and purchase dates

**Rationale**: The current list mode returns only `{ purchases: string[] }` (array of promptIds). The Purchases page needs full prompt details + purchase dates. Rather than making N+1 requests, the API joins orders → order_items → prompts and returns enriched data.

**Alternatives considered**:
- *Separate endpoint for full listing*: Rejected — the existing endpoint already handles both modes; extending the list mode is simpler than creating a new route.
- *Client-side joining (fetch promptIds, then fetch each prompt)*: Rejected — N+1 problem, poor performance.

## R7: Aggregate Rating Recalculation

**Decision**: When a review is created or updated, recalculate the prompt's `rating` and `reviewsCount` by averaging all reviews for that prompt and update the prompt row in the same transaction.

**Rationale**: The prompts table stores denormalized `rating` and `reviewsCount` fields used across the marketplace. These must stay in sync with the reviews table. Recalculating from source (all reviews for the prompt) on each write is safe for the current scale and avoids drift.

**Alternatives considered**:
- *Incremental calculation (add/subtract difference)*: Rejected — fragile with edits; full recalculation is simpler and equally performant at current scale.
- *Trigger/function in Postgres*: Rejected — constitution requires schema changes via Drizzle, and Supabase triggers add hidden complexity.

## R8: Purchase Detail Ownership Verification

**Decision**: The `GET /api/purchase/[id]` endpoint verifies ownership by checking if an `order_items` row exists with the given `promptId` linked to an order with the current user's `userId`. If not, return 403.

**Rationale**: This follows the same pattern as the existing `/api/user/purchases?promptId={id}` check mode. The purchase detail API returns the full prompt (including `fullContent`, `samples`, `instructions`) only after verifying the user paid for it.

**Alternatives considered**:
- *Client-side check (fetch purchase status, then fetch prompt)*: Rejected — exposes full prompt data in the regular prompt API, which is a security risk.
- *Signed URLs / tokens*: Over-engineered for the current auth model where Clerk userId is always available server-side.

## R9: Existing Profile Page Migration

**Decision**: Delete `src/app/profile/` entirely. Create `src/app/dashboard/` as the replacement. Update any links pointing to `/profile` to point to `/dashboard` (header nav, checkout success page, etc.). No redirect from `/profile` → `/dashboard` needed since this is an internal application change during development.

**Rationale**: The existing profile page has mock data and tab-based navigation. The new dashboard replaces it entirely with a sidebar layout and separate sub-pages backed by real data. There is no user-facing deployment where old bookmarks need to be preserved.

**Alternatives considered**:
- *Keep /profile as a redirect*: Unnecessary at this stage — no public users have bookmarked it.
- *Gradually migrate tabs to sub-pages*: More complex; clean replacement is simpler.

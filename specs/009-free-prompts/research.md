# Research: Free Prompts with Login-Gated Content

**Feature**: 009-free-prompts | **Date**: 2026-02-15

## R-001: Free Prompt Data Representation

**Decision**: Use `price = 0` to define free prompts. No new boolean column.

**Rationale**: The prompts table already has a `price: real("price").notNull()` column. A prompt with price = 0 is semantically free. Adding an `isFree` boolean would create a dual source of truth (price = 0 vs isFree = true) that can become inconsistent. The existing price range filter already supports `priceMin=0&priceMax=0`.

**Alternatives considered**:
- `isFree: boolean` column — rejected because it duplicates information derivable from price and adds sync risk.
- `priceTier: enum("free", "paid", "premium")` — over-engineering for current needs; only "free" vs "paid" is required.

## R-002: Sell Form Validation Strategy

**Decision**: Use Zod `superRefine` on the submission schema to conditionally enforce price minimum based on a new `isFree` boolean field in the form (not stored in DB).

**Rationale**: The current schema has `price: z.number().min(1.99).max(99.99)`. We need price = 0 when `isFree` is true, but keep the $1.99 minimum when false. A `superRefine` check on the parent object can access both fields. The `isFree` field exists only in the form submission schema — it is not persisted to the DB. The API handler sets `price: data.isFree ? 0 : data.price`.

**Alternatives considered**:
- Discriminated union (`z.discriminatedUnion`) — cleaner but requires restructuring the entire form schema which has 15+ fields; high blast radius.
- Remove min constraint entirely — dangerous; sellers could accidentally list paid prompts at $0.01.

## R-003: Server-Side Content Gating for Free Prompts

**Decision**: Modify the GET `/api/prompts/[id]` handler to check authentication. For free prompts (price = 0) when the user is unauthenticated, strip `fullContent`, `samples`, `exampleOutputs`, and `examplePrompts` from the response.

**Rationale**: FR-014 requires that content is not sent to unauthenticated clients. Currently, the single-prompt endpoint returns ALL fields including `fullContent` regardless of auth status (content gating is purely client-side via the `purchased` state). For free prompts, the server must enforce the gate. For paid prompts, the existing behavior is acceptable since content is still gated behind purchase (the client checks `purchased` before rendering).

**Alternatives considered**:
- Separate endpoint (`/api/prompts/[id]/content`) that requires auth — adds unnecessary endpoint; simpler to gate in existing handler.
- Middleware-level auth check — too broad; only free prompt detail needs this behavior.

## R-004: Content Lock Overlay UX Pattern

**Decision**: A client component (`ContentLockOverlay`) that renders a decorative blur effect over a placeholder area with centered sign-in/register CTA buttons. The overlay does NOT blur real content — since the API withholds content from unauthenticated users, there is nothing to blur. The blur is purely visual (gradient + backdrop-blur on a placeholder div).

**Rationale**: Consistent with FR-014 (no content sent to unauthenticated clients). The visual blur creates a teaser effect suggesting valuable content exists behind the gate, driving registration intent. Sign-in link includes `?redirect_url=/prompt/{id}` to return the user after auth.

**Alternatives considered**:
- Show truncated content preview — requires sending partial content, increasing complexity and potential for scraping.
- Simple "Login to view" text without blur — less visually compelling; doesn't communicate the value behind the gate.

## R-005: Free Prompt Access Tracking

**Decision**: New `free_prompt_access` table with columns: `id` (serial PK), `user_id` (text, not null), `prompt_id` (uuid FK to prompts, not null), `accessed_at` (timestamp with timezone). Unique constraint on `(user_id, prompt_id)`. Recorded via POST `/api/free-access` from the client after the prompt detail page loads for an authenticated user.

**Rationale**: FR-016/FR-017 require recording first access with no duplicates. The unique constraint enforces FR-017 at the DB level. Using a separate API call (not embedded in the GET prompt response) keeps the read path simple and fast. The client fires a POST after successfully loading content.

**Alternatives considered**:
- Reuse the `orders` + `order_items` tables with `amountTotal = 0` — rejected because orders require `stripeSessionId` (NOT NULL, UNIQUE), and creating fake Stripe sessions pollutes the payment data.
- Record in the GET handler itself — mixing reads and writes violates separation of concerns and makes the GET endpoint non-idempotent.

## R-006: Price Type Filter Implementation

**Decision**: Add a `priceType` query parameter to GET `/api/prompts` with values: `"all"` (default), `"free"`, `"paid"`. In the DB query, `"free"` maps to `eq(prompts.price, 0)` and `"paid"` maps to `gt(prompts.price, 0)`. This coexists with existing `priceMin`/`priceMax` filters.

**Rationale**: Simpler than modifying the existing price range filter. The UI shows three toggle buttons ("الكل" / "مجاني" / "مدفوع"). The `priceType` parameter is validated via Zod enum in the query schema.

**Alternatives considered**:
- Reuse `priceMin=0&priceMax=0` — works technically but the UI would need to manage hidden parameters; less explicit.
- Boolean `isFree` query param — doesn't support the "paid only" filter option cleanly.

## R-007: Review Permission for Free Prompts

**Decision**: Modify POST `/api/prompts/[id]/reviews` to check: if the prompt is free (price = 0), allow any authenticated user to review. If paid, keep the existing purchase ownership check.

**Rationale**: FR-015 states any authenticated user can review free prompts. The existing review endpoint (lines 109-121 of reviews/route.ts) checks purchase ownership via `orderItems`. For free prompts, this check is bypassed — the user only needs to be authenticated.

**Alternatives considered**:
- Require free prompt access record before allowing review — over-restricts; if the user is authenticated and the prompt is free, they inherently have access.
- No change; use the existing purchase check — would block all reviews on free prompts since there are no purchase records.

## R-008: Sell Form Step Skipping

**Decision**: In the sell page's step progression logic, when `isFree` is true, skip from Step 2 (file upload) directly to Step 4 (confirmation), bypassing Step 3 (payout). The `StepIndicator` component shows 3 steps instead of 4 when `isFree` is active. The form submission happens at the end of Step 2 for free prompts.

**Rationale**: FR-002 requires skipping payout setup for free prompts. Sellers without Stripe Connect must be able to submit free prompts. Changing the step count dynamically keeps the UX clean — no confusing "skip" buttons or grayed-out steps.

**Alternatives considered**:
- Show Step 3 with a "Skip — free prompt" message — wastes a click and confuses the flow.
- Always show 4 steps but auto-advance past Step 3 — jarring animation; user might not understand what happened.

## R-009: Dashboard "My Free Prompts" Section

**Decision**: Add a tab to the existing purchases dashboard page. Two tabs: "مشترياتي" (My Purchases) and "برومبتات مجانية" (Free Prompts). The free prompts tab fetches from GET `/api/free-access` which returns the list of accessed free prompts with prompt details.

**Rationale**: FR-018 requires a dashboard section. Using tabs within the existing purchases page keeps navigation simple. The free access API returns prompt metadata (title, thumbnail, AI model, category, seller, access date) in the same shape as purchase list items for UI consistency.

**Alternatives considered**:
- Separate dashboard page (`/dashboard/free-prompts`) — adds a new nav item and page; overkill for a simple list.
- Merge free and paid into one list with a badge — confuses the "purchases" concept since free prompts weren't purchased.

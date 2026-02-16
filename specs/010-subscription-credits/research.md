# Research: Subscription & Credit System

**Feature Branch**: `010-subscription-credits`
**Date**: 2026-02-16

## Decision 1: Stripe Subscription Model

**Decision**: Use Stripe Billing with pre-created Products and Prices for recurring subscriptions. Use Stripe Customer Portal for subscription management (upgrade/downgrade/cancel).

**Rationale**: The existing codebase uses dynamic `price_data` for one-time prompt purchases. However, for recurring subscriptions, Stripe Billing requires pre-created Products and Prices with recurring intervals. This is the standard approach and enables Stripe to handle billing lifecycle (renewals, prorations, cancellations) automatically.

**Alternatives considered**:
- Dynamic `price_data` with custom renewal logic — rejected because it reimplements what Stripe Billing already provides, increases complexity, and is error-prone for edge cases like prorations.
- Stripe Payment Links — rejected because they offer less control over the checkout flow and metadata.

## Decision 2: Credit Balance Architecture

**Decision**: Maintain two separate credit counters per user: `subscription_credits` and `topup_credits`. On generation, deduct from `subscription_credits` first, then `topup_credits`. On subscription renewal, reset only `subscription_credits` to the plan's allocation.

**Rationale**: The spec requires distinguishing credit sources so that top-up credits persist across billing cycles while subscription credits reset. Two counters make the deduction logic explicit and auditable, and the transaction log records which source was debited.

**Alternatives considered**:
- Single balance with FIFO queue tracking credit expiry — rejected because it adds unnecessary complexity for only two credit sources.
- Tag each credit individually — rejected because granular tracking is overkill when there are only two categories.

## Decision 3: Credit Deduction Atomicity

**Decision**: Use a database transaction with a conditional UPDATE (WHERE balance >= cost) to atomically check and deduct credits. If the UPDATE affects 0 rows, reject the generation.

**Rationale**: FR-014 requires preventing concurrent overdrafts. A single atomic UPDATE statement leverages Postgres row-level locking to ensure two concurrent requests cannot both see sufficient balance and both deduct.

**Alternatives considered**:
- Application-level mutex/lock — rejected because it doesn't work across multiple server instances.
- Optimistic locking with version column — viable but adds unnecessary complexity when a conditional UPDATE achieves the same result.

## Decision 4: Generation Mock Strategy

**Decision**: Implement a generation service module (`src/lib/generation.ts`) with a mock implementation that returns placeholder text (lorem ipsum in Arabic) for text generation and a static placeholder image URL for image generation. The service interface will accept model and prompt parameters so real implementations can be swapped in later.

**Rationale**: FR-013 requires mocked generation initially. A clean service interface makes future integration with real AI APIs (Gemini, OpenAI, Anthropic) a drop-in replacement without changing the API route or credit logic.

**Alternatives considered**:
- Inline mock in the API route — rejected because it couples mock logic with business logic and makes future replacement harder.
- External mock service — rejected as over-engineering for placeholder responses.

## Decision 5: Subscription Plans Storage

**Decision**: Store subscription plans in a database table (`subscription_plans`) seeded with the three tiers. Store Stripe Price IDs as columns for each billing cycle. Top-up packs stored in a separate table (`credit_topup_packs`).

**Rationale**: DB storage allows the subscription page to be rendered as a Server Component fetching plans directly, consistent with existing patterns (categories, prompts). Stripe Price IDs must be stored somewhere accessible to the checkout API route.

**Alternatives considered**:
- Hardcoded in a constants file — rejected because Stripe Price IDs are environment-specific (test vs production) and shouldn't be in source code.
- Environment variables — rejected because 9 subscription prices + 3 top-up prices = 12 env vars is unwieldy.

## Decision 6: Stripe Customer Management

**Decision**: Create a Stripe Customer on first subscription attempt. Store `stripe_customer_id` on the `credit_balances` table (which acts as a user-level record). Reuse the customer for top-up purchases and Customer Portal access.

**Rationale**: Stripe Billing requires a Customer object for subscriptions. Storing it alongside the credit balance avoids a separate table and ensures one-to-one mapping with users.

**Alternatives considered**:
- Separate `stripe_customers` table — rejected as unnecessary given the 1:1 relationship with users.
- Create customer on sign-up — rejected because not all users will subscribe; lazy creation avoids unnecessary Stripe API calls.

## Decision 7: Webhook Event Handling

**Decision**: Extend the existing Stripe webhook handler (`src/app/api/webhooks/stripe/route.ts`) to also handle subscription events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_succeeded` (for renewal credit grants). Add a separate handler for top-up checkout completions via `checkout.session.completed` with metadata flag `type: "topup"`.

**Rationale**: Consolidating webhook handlers reduces operational complexity. The existing webhook already handles `checkout.session.completed` for prompt purchases — extending it with a metadata-based router keeps things organized.

**Alternatives considered**:
- Separate webhook endpoint for subscriptions — rejected because it requires managing an additional webhook secret and endpoint in Stripe dashboard.

## Decision 8: Prompt Variable Detection

**Decision**: Detect prompt variables using a regex pattern matching `[text inside brackets]`. Display them as highlighted chips in the generation interface with dedicated input fields. The editable prompt textarea also allows free-form editing.

**Rationale**: Many prompts use `[placeholder]` syntax (e.g., `[product name]`, `[target audience]`). A regex-based approach is simple, requires no special markup from sellers, and works with existing prompt content.

**Alternatives considered**:
- Structured variable schema defined by sellers — rejected because it requires seller-side changes and migration of existing prompts.
- No variable detection, just free-text editing — rejected because it misses the opportunity to guide users on what to customize.

## Decision 9: Generation Result Storage

**Decision**: Store text generation results in a `text` column on the `generations` table. For image generation (mocked), store the image URL in a separate `result_image_url` column. When real image generation is implemented, images will be stored in Supabase Storage with URLs persisted in the DB.

**Rationale**: Text results are small and fit in a text column. Image URLs decouple storage from the generations table. Supabase Storage is the natural choice given the existing infrastructure.

**Alternatives considered**:
- Store images as base64 in the DB — rejected because it bloats the database and is slow to query.
- External CDN (Cloudflare R2, S3) — rejected because Supabase Storage is already available and integrated.

## Decision 10: Credit Balance Display in Header

**Decision**: Add a credit balance indicator to the existing Header component, visible only to authenticated users. Show the total balance (subscription + topup) as a badge next to a coins/credits icon. Fetch from a lightweight `/api/credits/balance` endpoint.

**Rationale**: FR-010 requires the balance in the header. A lightweight endpoint returning just the balance number minimizes payload size. The header already conditionally renders based on auth state (Clerk `SignedIn`/`SignedOut`).

**Alternatives considered**:
- Include balance in Clerk session claims — rejected because Clerk session is not the right place for volatile data that changes on every generation.
- Client-side cache with SWR — this is an enhancement, not an alternative. SWR/polling can be added on top.

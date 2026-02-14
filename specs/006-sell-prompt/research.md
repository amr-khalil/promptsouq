# Research: 006-sell-prompt

**Date**: 2026-02-14
**Branch**: `006-sell-prompt`

## R1: Stripe Connect Express Integration

**Decision**: Use Stripe Connect Express accounts with destination charges for marketplace payments.

**Rationale**:
- Express accounts provide Stripe-hosted onboarding — minimal integration effort, Stripe handles identity verification, tax forms, and compliance
- Destination charges are the recommended pattern for marketplaces: buyer pays the platform, Stripe automatically transfers the seller's portion minus application fee
- The existing Stripe integration (lazy Proxy in `src/lib/stripe.ts`) already handles build-time safety; Connect extends this pattern
- Express gives the platform control over payout timing and scheduling

**Alternatives considered**:
- Standard accounts: More seller autonomy but heavier onboarding, sellers manage their own Stripe dashboard — too complex for PromptSouq's audience
- Custom accounts: Maximum control but requires the platform to build the entire dashboard — way too much effort
- Separate charges + transfers: More flexible for multi-seller carts but adds complexity; destination charges suffice since prompts are digital goods with single-seller purchases

**Key implementation notes**:
- Need two webhook endpoints: existing platform webhook + new Connect webhook (`account.updated`)
- Account Links API for onboarding: URLs are single-use and short-lived; must regenerate on refresh
- Check `charges_enabled` AND `payouts_enabled` to confirm full onboarding (not just `details_submitted`)
- Multi-seller carts require separate Checkout Sessions per seller (destination charges only support one connected account per PaymentIntent)
- New env vars needed: `STRIPE_CONNECT_WEBHOOK_SECRET`

## R2: Admin Role via Clerk publicMetadata

**Decision**: Use Clerk `publicMetadata.role = "admin"` for admin authorization.

**Rationale**:
- Clerk's `publicMetadata` is readable server-side via `auth()` and `currentUser()` — no additional DB query needed
- Manageable via Clerk dashboard without code changes
- Already the established auth pattern in the codebase (Clerk middleware in `proxy.ts`)

**Alternatives considered**:
- Database role column: Requires new table/migration and DB lookup on every admin request
- Hardcoded user IDs: Simplest but least flexible; requires redeployment to change admins

**Key implementation notes**:
- Server-side: `const { sessionClaims } = await auth(); const isAdmin = sessionClaims?.metadata?.role === "admin";`
- Add `/admin(.*)` to protected routes in `proxy.ts` (already protected by default since not in public matcher)
- Clerk SDK types may need augmentation for custom metadata (`types/clerk.d.ts`)

## R3: Multi-Step Form State Management

**Decision**: Single React Hook Form instance with step-scoped validation via Zod discriminated schemas.

**Rationale**:
- Constitution mandates React Hook Form for all forms (Principle IX)
- A single `useForm()` instance preserves all data across steps without external state management
- Step-specific validation achieved by validating only the fields relevant to the current step using `trigger(fieldNames)`
- Avoids Zustand dependency for form state (cart already uses Zustand, but form data is transient)

**Alternatives considered**:
- Separate form per step with Zustand to hold cross-step data: Adds state synchronization complexity
- URL/searchParams state: Not suitable for sensitive prompt template content
- FormData + sessionStorage: Non-reactive, doesn't integrate with RHF

**Key implementation notes**:
- Define one master Zod schema for the full submission
- Per-step: call `form.trigger(["fieldA", "fieldB"])` to validate only current step's fields
- On final step: submit the complete form data to the API
- Steps 1–2 are form data; Step 3 is Stripe Connect (separate flow); Step 4 is confirmation (read-only)

## R4: Extending the Prompts Table vs. Separate Submissions Table

**Decision**: Extend the existing `prompts` table with new columns for seller submission data.

**Rationale**:
- The existing `prompts` table already has most buyer-facing fields (title, description, price, category, aiModel, etc.)
- Adding seller-specific columns (seller_id, status, prompt_template, example_outputs, etc.) is simpler than duplicating data across two tables
- Marketplace queries just add `WHERE status = 'approved'` — minimal change to existing API
- Existing seeded prompts get `status = 'approved'` and `seller_id = NULL` via migration defaults

**Alternatives considered**:
- Separate `prompt_submissions` table with copy-to-prompts on approval: Clean separation but doubles storage, requires complex approval logic, two sources of truth
- Versioned prompts table (current + history): Over-engineered for the initial version where editing is out of scope

**Key implementation notes**:
- New columns on `prompts`: `seller_id`, `status`, `generation_type`, `model_version`, `max_tokens`, `temperature`, `example_outputs`, `example_prompts`, `rejection_reason`, `reviewed_at`, `reviewed_by`
- Existing `fullContent` column serves as the prompt template (the content revealed to buyers after purchase)
- Existing `instructions` column serves as buyer instructions (already present in schema)
- Existing denormalized seller columns (`seller_name`, `seller_avatar`, `seller_rating`) remain populated from Clerk user profile at submission time for API backward compatibility
- All new columns are nullable to maintain backward compatibility with existing rows
- Migration sets `status = 'approved'` for all existing prompts

## R5: Commission Tracking & Sale Attribution

**Decision**: Track referral source on `order_items` and compute commission at checkout time.

**Rationale**:
- The referral source (marketplace vs. direct link) is known at the moment of purchase
- Storing commission data on `order_items` keeps it co-located with the purchase record
- Destination charges handle the actual money split automatically via `application_fee_amount`

**Alternatives considered**:
- Separate `commissions` table: More normalized but adds unnecessary joins for a simple two-field addition
- Compute commission retroactively from analytics: Unreliable, doesn't integrate with Stripe's fee structure

**Key implementation notes**:
- Seller's share link: `/prompt/[id]?ref=[seller_id]` — stored in cookie/sessionStorage on visit
- At checkout, check for referral indicator to determine source
- `application_fee_amount` in destination charges: 0 for direct, 20% for marketplace
- New columns on `order_items`: `referral_source`, `commission_rate`, `seller_payout_amount`

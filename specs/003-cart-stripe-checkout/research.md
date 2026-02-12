# Research: Cart, Stripe Checkout & UUID Migration

**Feature**: 003-cart-stripe-checkout
**Date**: 2026-02-12

## 1. Stripe Checkout (Hosted) Integration

**Decision**: Use Stripe Checkout Sessions with `price_data` (inline pricing) in `payment` mode.

**Rationale**: The marketplace sells prompts with dynamic prices stored in the database. Rather than pre-creating Stripe Products/Prices for each prompt, we use `price_data` to define pricing inline when creating each Checkout Session. This avoids syncing a product catalog to Stripe and is the recommended approach for dynamic product catalogs per Stripe docs.

**Alternatives considered**:
- Pre-created Stripe Prices: Rejected — requires syncing every prompt to Stripe's product catalog. Unnecessary complexity for a marketplace.
- Stripe Elements (embedded): Rejected by spec clarification — hosted Checkout is simpler, handles PCI compliance, and sufficient for MVP.

**Implementation pattern**:
1. Client sends cart items (prompt UUIDs) to `POST /api/checkout`
2. Server validates cart, fetches current prices from DB, creates Checkout Session with `price_data` line items
3. Server returns `session.url` to client
4. Client redirects to Stripe hosted page
5. After payment, Stripe redirects to success/cancel URL
6. Webhook `checkout.session.completed` triggers order creation

**Key details**:
- `mode: "payment"` (one-time, not subscription)
- `line_items[].price_data.unit_amount` must be in cents (multiply DB price × 100)
- `line_items[].price_data.currency` = "usd"
- `success_url` includes `{CHECKOUT_SESSION_ID}` template variable
- `cancel_url` returns user to cart page
- `metadata` stores Clerk user ID for order association
- `client_reference_id` set to Clerk user ID

## 2. Stripe Webhook Handling (Next.js App Router)

**Decision**: Use `request.text()` to get raw body for signature verification in a Route Handler.

**Rationale**: Stripe webhook signature verification requires the raw, unmodified request body. Next.js App Router Route Handlers provide access via `request.text()` without body parsing middleware interference.

**Alternatives considered**:
- Express-style middleware: Not applicable — App Router uses Web Request API.
- Skipping signature verification: Rejected — constitution mandates it.

**Implementation pattern**:
```
POST /api/webhooks/stripe
1. const body = await request.text()
2. const sig = request.headers.get("stripe-signature")
3. stripe.webhooks.constructEvent(body, sig, webhookSecret)
4. Handle checkout.session.completed → create order in DB
5. Return 200 immediately, process async
```

**Events to handle**:
- `checkout.session.completed` — primary fulfillment trigger
- `checkout.session.async_payment_succeeded` — for delayed payment methods
- `checkout.session.async_payment_failed` — notify of failure

## 3. UUID Migration Strategy

**Decision**: Replace `serial("id")` with `uuid("id").defaultRandom()` in Drizzle schema and regenerate migration. Re-seed data.

**Rationale**: The project is pre-production with only seed data. There is no production data to preserve. A clean schema change + re-seed is the safest and simplest approach. Postgres has `gen_random_uuid()` built-in and Supabase has `uuid-ossp` enabled by default.

**Alternatives considered**:
- Add UUID column alongside serial (dual-ID): Rejected — unnecessary complexity for pre-production project.
- Use CUID2 or nanoid instead of UUID: Rejected — UUID is the Postgres-native type with built-in generation. No external dependency needed.
- Keep serial, add UUID as secondary column: Rejected — the spec requires UUID as the primary identifier.

**Migration steps**:
1. Update `prompts` schema: `serial("id")` → `uuid("id").defaultRandom().primaryKey()`
2. Update `reviews` schema: `promptId` type from `integer` → `uuid`, FK reference updated
3. Run `npx drizzle-kit generate` to produce migration SQL
4. Run `npx drizzle-kit migrate` to apply
5. Re-run seed script with UUID-aware data
6. Update all API routes to remove `parseInt()` calls
7. Update mappers — `id` is already a string (UUID), no `.toString()` needed

**Scope**: Prompts and reviews only. Categories keep `slug` as public ID. Testimonials keep serial.

## 4. Cart State Management

**Decision**: Zustand with `persist` middleware for localStorage-backed cart state.

**Rationale**: Zustand is the simplest, most performant approach for cross-component client-side state in Next.js App Router. It requires no provider in layout.tsx (unlike React Context), handles localStorage persistence via built-in middleware, and supports selector-based subscriptions to prevent unnecessary re-renders. ~1KB gzipped.

**Alternatives considered**:
- React Context + useReducer + manual localStorage: Rejected — more boilerplate (~100+ lines vs ~30), requires CartProvider in layout, re-renders all consumers on any change.
- useSyncExternalStore: Rejected — similar boilerplate to Context, no built-in persist middleware, manual subscription management.

**Hydration strategy**: Use a small hook that returns `0` during SSR and syncs from store after hydration via `useEffect`. This prevents hydration mismatches between server (no localStorage) and client.

## 5. Price Handling

**Decision**: Convert display prices to cents at Checkout Session creation time. Do not change DB schema.

**Rationale**: Constitution requires "smallest currency unit" for stored prices, but this is a pre-existing deviation accepted in the 002-supabase-db-migration feature. Changing price storage now would affect all existing API consumers. Instead, the Stripe integration layer converts: `Math.round(price * 100)` when creating Checkout Sessions.

**Risk**: Floating-point arithmetic could introduce rounding errors. Using `Math.round()` mitigates this for the 2-decimal-place prices in the current dataset ($24.99–$49.99 range).

## 6. Dependencies to Install

| Package | Purpose | Type |
|---------|---------|------|
| `stripe` | Stripe Node.js SDK (server-side) | production |
| `zustand` | Client-side cart state management | production |

No `@stripe/stripe-js` or `@stripe/react-stripe-js` needed — hosted Checkout uses a simple URL redirect, not an embedded component.

## 7. Environment Variables Required

| Variable | Location | Purpose |
|----------|----------|---------|
| `STRIPE_SECRET_KEY` | `.env.local` (server-only) | Stripe API authentication |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.local` (public) | Not needed for hosted Checkout, but good to have for future |
| `STRIPE_WEBHOOK_SECRET` | `.env.local` (server-only) | Webhook signature verification |

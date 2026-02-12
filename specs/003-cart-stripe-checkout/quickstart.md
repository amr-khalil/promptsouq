# Quickstart: Cart, Stripe Checkout & UUID Migration

**Feature**: 003-cart-stripe-checkout
**Date**: 2026-02-12

## Prerequisites

1. Stripe account in test mode (https://dashboard.stripe.com/test)
2. Supabase project `dyaflmsawxpqgmyojtbc` running
3. Clerk authentication configured
4. Node.js 18+, npm

## Environment Setup

Add to `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Get these from:
- `STRIPE_SECRET_KEY`: Stripe Dashboard → Developers → API keys
- `STRIPE_WEBHOOK_SECRET`: Stripe CLI `stripe listen` output, or Dashboard → Webhooks

## Install Dependencies

```bash
npm install stripe zustand
```

## Development Workflow

### 1. UUID Migration (Schema First)

```bash
# After updating Drizzle schema files:
npx drizzle-kit generate
npx drizzle-kit migrate

# Re-seed with UUID data:
npx tsx src/db/seed.ts
```

### 2. Stripe Webhook Testing

```bash
# Install Stripe CLI (if not already):
brew install stripe/stripe-cli/stripe

# Login:
stripe login

# Forward webhooks to local dev server:
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

The CLI prints a webhook signing secret (`whsec_...`). Use this as `STRIPE_WEBHOOK_SECRET` in `.env.local` during development.

### 3. Test Payment Flow

1. Start dev server: `npm run dev`
2. Browse to a prompt, click "Add to Cart"
3. Click cart icon → proceed to checkout
4. On Stripe hosted page, use test card: `4242 4242 4242 4242`
   - Expiry: any future date (e.g., 12/34)
   - CVC: any 3 digits (e.g., 123)
5. Complete payment → redirected to success page
6. Verify order in Supabase: `SELECT * FROM orders;`

### 4. Test Declined Payment

Use test card `4000 0000 0000 9995` to simulate a declined payment.

## Verification Checklist

- [ ] Prompts have UUID IDs in API responses
- [ ] `/prompt/{uuid}` routes work, numeric IDs return 404
- [ ] Toast appears on "Add to Cart"
- [ ] Cart badge shows correct count in header
- [ ] Cart persists across page reload (localStorage)
- [ ] Checkout redirects to Stripe hosted page
- [ ] Test card payment succeeds
- [ ] Success page shown after payment
- [ ] Order record created in `orders` table
- [ ] Purchased prompt shows "Purchased" badge and reveals fullContent
- [ ] `npm run lint && npm run build` pass with zero errors

## Key Files

| File | Purpose |
|------|---------|
| `src/db/schema/prompts.ts` | UUID primary key |
| `src/db/schema/orders.ts` | Orders + order_items tables |
| `src/stores/cart-store.ts` | Zustand cart with persist |
| `src/app/api/checkout/route.ts` | Create Stripe Checkout Session |
| `src/app/api/webhooks/stripe/route.ts` | Handle Stripe webhooks |
| `src/app/api/user/purchases/route.ts` | Check user's purchases |
| `src/app/checkout/success/page.tsx` | Post-payment success page |
| `src/components/Header.tsx` | Cart badge |
| `src/app/prompt/[id]/page.tsx` | Add to cart, purchased state |

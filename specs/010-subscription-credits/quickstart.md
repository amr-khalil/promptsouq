# Quickstart: Subscription & Credit System

**Feature Branch**: `010-subscription-credits`
**Date**: 2026-02-16

## Prerequisites

1. Existing PromptSouq dev environment running (`npm run dev`)
2. Stripe account with test mode enabled
3. Supabase project `dyaflmsawxpqgmyojtbc` accessible
4. Clerk authentication configured

## Setup Steps

### 1. Create Stripe Products and Prices

In Stripe Dashboard (test mode) or via Stripe API, create:

**Subscription Products** (3 products, 9 prices):

| Product | Monthly Price | 6-Month Price | Yearly Price |
|---------|--------------|---------------|--------------|
| PromptSouq Standard | $10/month | $60/6 months | $120/year |
| PromptSouq Pro | $20/month | $120/6 months | $240/year |
| PromptSouq Legendary | $30/month | $180/6 months | $360/year |

For 6-month recurring: create as `recurring` with `interval: "month"`, `interval_count: 6`.
For yearly: `interval: "year"`, `interval_count: 1`.

**Top-Up Products** (3 products, 3 one-time prices):

| Product | Price |
|---------|-------|
| 10 Credits Pack | $3 (one-time) |
| 50 Credits Pack | $12 (one-time) |
| 100 Credits Pack | $20 (one-time) |

### 2. Drizzle Schema & Migration

```bash
# After adding schema files to src/db/schema/:
npx drizzle-kit generate
npx drizzle-kit migrate
```

### 3. Seed Subscription Plans

Run seed script to insert plan data with Stripe Price IDs:
```bash
source .env.local && npx tsx src/db/seed-subscriptions.ts
```

### 4. Configure Stripe Webhook

Add subscription events to existing Stripe webhook endpoint:
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`

The existing `checkout.session.completed` already fires — extend handler for top-up routing.

### 5. Configure Stripe Customer Portal

In Stripe Dashboard → Settings → Customer Portal:
- Enable subscription cancellation
- Enable plan switching (upgrade/downgrade)
- Set proration behavior to "always prorate"
- Customize branding (Arabic text where possible)

### 6. Environment Variables

Add to `.env.local`:
```bash
# Existing (already set):
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# No new env vars needed — Stripe Price IDs stored in DB
```

## Verification Checklist

- [ ] Subscription page renders with 3 tiers and billing cycle toggle
- [ ] Clicking "Subscribe" redirects to Stripe Checkout
- [ ] After payment, credits appear on user's account
- [ ] Generate button visible on purchased prompts
- [ ] Text generation returns mock placeholder text
- [ ] Image generation returns mock placeholder image
- [ ] Credit balance decrements after generation
- [ ] 0-credit state shows subscription CTA
- [ ] Credit top-up flow works
- [ ] Subscription management opens Stripe Customer Portal
- [ ] Dashboard shows credit balance and generation history
- [ ] Header shows credit balance badge

## Key Files to Create

```
src/db/schema/
├── subscription-plans.ts      # subscription_plans table
├── credit-topup-packs.ts      # credit_topup_packs table
├── user-subscriptions.ts      # user_subscriptions table
├── credit-balances.ts         # credit_balances table
├── credit-transactions.ts     # credit_transactions table
├── generations.ts             # generations table
└── index.ts                   # Add new exports

src/app/api/
├── subscription/
│   ├── plans/route.ts         # GET plans
│   ├── checkout/route.ts      # POST create checkout
│   ├── status/route.ts        # GET subscription + credits
│   └── manage/route.ts        # POST get portal URL
├── credits/
│   ├── balance/route.ts       # GET balance
│   ├── transactions/route.ts  # GET transaction history
│   └── topup/checkout/route.ts # POST create topup checkout
├── generate/route.ts          # POST generate content
├── generations/
│   ├── route.ts               # GET list generations
│   └── [id]/route.ts          # GET single generation
└── webhooks/stripe/route.ts   # EXTEND existing webhook

src/app/
├── subscription/page.tsx      # Subscription plans page
└── dashboard/
    ├── credits/page.tsx       # Credit balance + history
    └── generations/page.tsx   # Generation history

src/lib/
├── generation.ts              # Mock generation service
└── credits.ts                 # Credit deduction helpers

src/components/
├── subscription/
│   └── PricingCard.tsx        # Plan card component
├── generation/
│   ├── GenerateButton.tsx     # Generate CTA on prompt page
│   ├── GenerationDialog.tsx   # Generation interface modal
│   ├── ModelSelector.tsx      # AI model dropdown
│   ├── PromptEditor.tsx       # Editable prompt with variables
│   └── GenerationResult.tsx   # Display generated content
└── credits/
    └── CreditBadge.tsx        # Header credit balance badge
```

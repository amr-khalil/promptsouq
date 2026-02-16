# Data Model: Subscription & Credit System

**Feature Branch**: `010-subscription-credits`
**Date**: 2026-02-16

## New Tables

### subscription_plans

Static lookup table seeded with three tiers. Stores Stripe Price IDs for each billing cycle.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | text | PK | Slug identifier: "standard", "pro", "legendary" |
| `name` | text | NOT NULL | English name |
| `name_ar` | text | NOT NULL | Arabic name |
| `monthly_credits` | integer | NOT NULL | Credits granted per billing cycle |
| `monthly_price` | integer | NOT NULL | Price in cents (monthly) |
| `six_month_price` | integer | NOT NULL | Price in cents (6-month) |
| `yearly_price` | integer | NOT NULL | Price in cents (yearly) |
| `stripe_price_id_monthly` | text | NOT NULL | Stripe Price ID for monthly interval |
| `stripe_price_id_six_month` | text | NOT NULL | Stripe Price ID for 6-month interval |
| `stripe_price_id_yearly` | text | NOT NULL | Stripe Price ID for yearly interval |
| `features` | jsonb | NOT NULL, DEFAULT '[]' | Feature list for display |
| `theme` | text | NOT NULL | Color theme: "blue", "green", "purple" |
| `icon` | text | NOT NULL | Lucide icon name |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Display ordering |
| `created_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |

**Seed data**:
- standard: 50 credits, $10/mo, $60/6mo, $120/yr, blue, Sword
- pro: 150 credits, $20/mo, $120/6mo, $240/yr, green, Zap
- legendary: 500 credits, $30/mo, $180/6mo, $360/yr, purple, Crown

---

### credit_topup_packs

Static lookup table for one-time credit purchases.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | text | PK | Slug identifier: "pack-10", "pack-50", "pack-100" |
| `credits` | integer | NOT NULL | Number of credits in pack |
| `price` | integer | NOT NULL | Price in cents |
| `stripe_price_id` | text | NOT NULL | Stripe Price ID (one-time) |
| `sort_order` | integer | NOT NULL, DEFAULT 0 | Display ordering |
| `created_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |

**Seed data**:
- pack-10: 10 credits, $3 (300 cents)
- pack-50: 50 credits, $12 (1200 cents)
- pack-100: 100 credits, $20 (2000 cents)

---

### user_subscriptions

Tracks active subscription per user. One active subscription per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, DEFAULT random | |
| `user_id` | text | NOT NULL, UNIQUE | Clerk user ID. Unique ensures one subscription per user |
| `plan_id` | text | NOT NULL, FK → subscription_plans.id | Current plan tier |
| `stripe_subscription_id` | text | NOT NULL, UNIQUE | Stripe Subscription object ID |
| `stripe_customer_id` | text | NOT NULL | Stripe Customer object ID |
| `status` | text | NOT NULL, DEFAULT 'active' | Stripe status: active, canceled, past_due, unpaid, trialing |
| `billing_cycle` | text | NOT NULL | "monthly", "six_month", "yearly" |
| `current_period_start` | timestamp(tz) | NOT NULL | Billing period start |
| `current_period_end` | timestamp(tz) | NOT NULL | Billing period end |
| `cancel_at_period_end` | boolean | NOT NULL, DEFAULT false | User requested cancellation |
| `created_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |
| `updated_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |

**Indexes**:
- `idx_user_subscriptions_user_id` on `user_id` (unique)
- `idx_user_subscriptions_stripe_sub_id` on `stripe_subscription_id` (unique)

**State transitions**:
- `active` → `canceled` (user cancels, stays active until period end)
- `active` → `past_due` (payment fails at renewal)
- `past_due` → `active` (payment retried successfully)
- `past_due` → `canceled` (payment exhausted retries)
- `canceled` → `active` (user resubscribes)

---

### credit_balances

User-level credit state. Created on first subscription or top-up purchase.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `user_id` | text | PK | Clerk user ID |
| `subscription_credits` | integer | NOT NULL, DEFAULT 0 | Credits from current subscription period (reset on renewal) |
| `topup_credits` | integer | NOT NULL, DEFAULT 0 | Credits from top-up purchases (never expire) |
| `stripe_customer_id` | text | UNIQUE | Stripe Customer ID (created lazily) |
| `updated_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |

**Computed**: `total_credits = subscription_credits + topup_credits`

**Deduction order**: subscription_credits first, then topup_credits.

---

### credit_transactions

Immutable audit log of all credit changes.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | serial | PK | Auto-increment |
| `user_id` | text | NOT NULL | Clerk user ID |
| `type` | text | NOT NULL | "subscription_grant", "topup_grant", "generation_deduction", "subscription_reset" |
| `amount` | integer | NOT NULL | Positive for grants, negative for deductions |
| `credit_source` | text | NOT NULL | "subscription" or "topup" |
| `reference_type` | text | | "subscription", "topup_purchase", "generation" |
| `reference_id` | text | | UUID of related entity |
| `balance_after` | integer | NOT NULL | Total balance after this transaction |
| `created_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |

**Indexes**:
- `idx_credit_transactions_user_id` on `user_id`
- `idx_credit_transactions_created_at` on `created_at`

---

### generations

Records every generation request and its result. Results are persistent.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | uuid | PK, DEFAULT random | |
| `user_id` | text | NOT NULL | Clerk user ID |
| `prompt_id` | uuid | NOT NULL, FK → prompts.id | Source prompt |
| `generation_type` | text | NOT NULL | "text" or "image" |
| `model` | text | NOT NULL | Model name used (e.g., "gemini", "chatgpt", "claude") |
| `input_prompt` | text | NOT NULL | The actual prompt text sent (may be user-edited) |
| `result_text` | text | | Generated text content (for text generation) |
| `result_image_url` | text | | Generated image URL (for image generation) |
| `status` | text | NOT NULL, DEFAULT 'pending' | "pending", "completed", "failed" |
| `credits_consumed` | integer | NOT NULL, DEFAULT 0 | Credits charged (0 if failed) |
| `credit_source` | text | | "subscription", "topup", or "mixed" |
| `error_message` | text | | Error details if failed |
| `created_at` | timestamp(tz) | NOT NULL, DEFAULT now() | |
| `completed_at` | timestamp(tz) | | When generation finished |

**Indexes**:
- `idx_generations_user_id` on `user_id`
- `idx_generations_prompt_id` on `prompt_id`
- `idx_generations_created_at` on `created_at`

---

## Modified Tables

### No existing tables are modified.

All new functionality uses new tables. The existing `prompts`, `orders`, `order_items`, and `free_prompt_access` tables remain unchanged. Prompt ownership is still determined via existing `orderItems` + `orders` join and `freePromptAccess` table.

---

## Entity Relationships

```
subscription_plans 1──∞ user_subscriptions
credit_balances 1──1 users (Clerk, external)
credit_transactions ∞──1 credit_balances (via user_id)
generations ∞──1 prompts
generations ∞──1 credit_balances (via user_id)
credit_topup_packs (standalone, referenced by Stripe Price ID)
```

---

## RLS Policies (to apply via Supabase MCP)

| Table | Role | Policy |
|-------|------|--------|
| subscription_plans | anon | SELECT (read-only, public pricing) |
| credit_topup_packs | anon | SELECT (read-only, public pricing) |
| user_subscriptions | authenticated | SELECT WHERE auth.uid()::text = user_id |
| credit_balances | authenticated | SELECT WHERE auth.uid()::text = user_id |
| credit_transactions | authenticated | SELECT WHERE auth.uid()::text = user_id |
| generations | authenticated | SELECT WHERE auth.uid()::text = user_id |

Note: Drizzle client uses service role (bypasses RLS). RLS protects direct Supabase client access.

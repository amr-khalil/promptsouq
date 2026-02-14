# Data Model: 006-sell-prompt

**Date**: 2026-02-14
**Branch**: `006-sell-prompt`

## Entity Relationship Overview

```
seller_profiles (1) ──── (N) prompts
                              │
                              ├── status: pending → approved → (visible in marketplace)
                              │            └─→ rejected
                              │
                              └── (N) order_items ──── (1) orders
                                       │
                                       └── referral_source, commission_rate
```

## Table: `prompts` (Extended)

Existing columns remain unchanged. New columns added for seller submission flow.

### New Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `seller_id` | text | YES | NULL | Clerk user ID of the prompt seller. NULL for pre-existing seeded prompts. |
| `status` | text | NO | `'approved'` | Submission status: `pending`, `approved`, `rejected`. Default ensures existing rows are marketplace-visible. |
| `generation_type` | text | YES | NULL | Content type the prompt generates (e.g., "text", "image", "code", "marketing", "design") |
| `model_version` | text | YES | NULL | Specific AI model version (e.g., "Claude 4.6 Opus", "GPT-4o") |
| `max_tokens` | integer | YES | NULL | Recommended max tokens setting |
| `temperature` | real | YES | NULL | Recommended temperature setting (0.0–2.0) |
| `example_outputs` | text[] | YES | NULL | Array of 4 example output texts |
| `example_prompts` | jsonb | YES | NULL | Array of 4 objects mapping variable names to values for each example |
| `rejection_reason` | text | YES | NULL | Admin-provided reason if status = "rejected" |
| `reviewed_at` | timestamp with tz | YES | NULL | When the prompt was reviewed by admin |
| `reviewed_by` | text | YES | NULL | Clerk user ID of the admin who reviewed |

### State Transitions

```
[New Submission] → pending → approved (admin approves → visible in marketplace)
                          → rejected (admin rejects → hidden, reason stored)
```

### Validation Rules

- `seller_id` MUST be set for all new submissions (NOT NULL in application logic, nullable in DB for backward compat)
- `status` MUST be one of: `pending`, `approved`, `rejected`
- `generation_type` MUST be one of: `text`, `image`, `code`, `marketing`, `design`
- `example_outputs` MUST contain exactly 4 entries when present
- `example_prompts` MUST contain exactly 4 entries when present, each mapping variable names to string values
- `fullContent` (existing column) serves as the prompt template — MUST contain at least one `[variable]` pattern for new submissions
- `price` (existing column) MUST be between 1.99 and 99.99 for new submissions
- `title` (existing column) MUST be max 60 characters for new submissions
- `description` (existing column) MUST be max 500 characters for new submissions

### Indexes

- `idx_prompts_seller_id` on `seller_id` — for seller dashboard queries
- `idx_prompts_status` on `status` — for admin review queue and marketplace filtering
- `idx_prompts_seller_status` on `(seller_id, status)` — for seller dashboard filtered views

---

## Table: `seller_profiles` (New)

Stores Stripe Connect account information and seller metadata. One row per seller.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | text | NO (PK) | — | Clerk user ID (primary key) |
| `stripe_account_id` | text | YES | NULL | Stripe Connect Express account ID (acct_xxx) |
| `country` | text | YES | NULL | Country of residence (ISO 3166-1 alpha-2) |
| `charges_enabled` | boolean | NO | false | Whether Stripe account can accept charges |
| `payouts_enabled` | boolean | NO | false | Whether Stripe account can receive payouts |
| `details_submitted` | boolean | NO | false | Whether seller completed Stripe onboarding form |
| `total_earnings` | integer | NO | 0 | Lifetime earnings in cents (USD) |
| `total_sales` | integer | NO | 0 | Lifetime number of sales |
| `created_at` | timestamp with tz | NO | now() | Profile creation timestamp |
| `updated_at` | timestamp with tz | NO | now() | Last update timestamp |

### Validation Rules

- `user_id` is unique (PK) — one seller profile per Clerk user
- `stripe_account_id` is unique when NOT NULL — one Stripe account per seller
- `country` should be a valid ISO 3166-1 alpha-2 code when present

### Indexes

- Primary key on `user_id`
- `idx_seller_profiles_stripe_account` on `stripe_account_id` (unique, nullable) — for webhook lookups

---

## Table: `order_items` (Extended)

Existing columns remain. New columns for commission tracking.

### New Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `referral_source` | text | YES | NULL | `'marketplace'` or `'direct'` — how the buyer found the prompt |
| `commission_rate` | real | YES | NULL | Commission rate applied (0.0 for direct, 0.20 for marketplace) |
| `seller_payout_amount` | integer | YES | NULL | Amount credited to seller in cents after commission |
| `seller_stripe_account_id` | text | YES | NULL | Stripe Connect account ID for the seller receiving payout |

### Validation Rules

- `referral_source` MUST be one of: `marketplace`, `direct` (when present)
- `commission_rate` MUST be 0.0 or 0.20 (when present)
- `seller_payout_amount` MUST equal `price_at_purchase * (1 - commission_rate)` (application logic)

---

## Migration Strategy

### Migration 1: Add seller columns to prompts

```sql
ALTER TABLE prompts ADD COLUMN seller_id TEXT;
ALTER TABLE prompts ADD COLUMN status TEXT NOT NULL DEFAULT 'approved';
ALTER TABLE prompts ADD COLUMN generation_type TEXT;
ALTER TABLE prompts ADD COLUMN model_version TEXT;
ALTER TABLE prompts ADD COLUMN max_tokens INTEGER;
ALTER TABLE prompts ADD COLUMN temperature REAL;
ALTER TABLE prompts ADD COLUMN example_outputs TEXT[];
ALTER TABLE prompts ADD COLUMN example_prompts JSONB;
ALTER TABLE prompts ADD COLUMN rejection_reason TEXT;
ALTER TABLE prompts ADD COLUMN reviewed_at TIMESTAMPTZ;
ALTER TABLE prompts ADD COLUMN reviewed_by TEXT;

CREATE INDEX idx_prompts_seller_id ON prompts(seller_id);
CREATE INDEX idx_prompts_status ON prompts(status);
CREATE INDEX idx_prompts_seller_status ON prompts(seller_id, status);
```

### Migration 2: Create seller_profiles table

```sql
CREATE TABLE seller_profiles (
  user_id TEXT PRIMARY KEY,
  stripe_account_id TEXT UNIQUE,
  country TEXT,
  charges_enabled BOOLEAN NOT NULL DEFAULT false,
  payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  details_submitted BOOLEAN NOT NULL DEFAULT false,
  total_earnings INTEGER NOT NULL DEFAULT 0,
  total_sales INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_seller_profiles_stripe_account ON seller_profiles(stripe_account_id) WHERE stripe_account_id IS NOT NULL;
```

### Migration 3: Extend order_items for commission tracking

```sql
ALTER TABLE order_items ADD COLUMN referral_source TEXT;
ALTER TABLE order_items ADD COLUMN commission_rate REAL;
ALTER TABLE order_items ADD COLUMN seller_payout_amount INTEGER;
ALTER TABLE order_items ADD COLUMN seller_stripe_account_id TEXT;
```

### RLS Policies (via Supabase MCP)

**seller_profiles:**
- anon: No access
- authenticated: SELECT own profile (`auth.uid()::text = user_id`)
- authenticated: INSERT own profile (`auth.uid()::text = user_id`)
- authenticated: UPDATE own profile (`auth.uid()::text = user_id`)

**prompts (updated):**
- Existing anon SELECT remains but adds `WHERE status = 'approved'`
- authenticated: INSERT with `seller_id = auth.uid()::text`
- Admin operations bypass RLS via service role (Drizzle client)

**order_items (extended):**
- Existing policies remain unchanged; new columns are populated server-side

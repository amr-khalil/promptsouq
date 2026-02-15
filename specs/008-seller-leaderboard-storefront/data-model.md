# Data Model: Seller Leaderboard & Public Storefront

## Entity: Seller Profile (Extended)

**Table**: `seller_profiles` (existing — 3 new columns)

| Column | Type | Constraint | Status | Notes |
|--------|------|-----------|--------|-------|
| `user_id` | text | PK | existing | Clerk user ID or synthetic seed ID |
| `stripe_account_id` | text | unique, nullable | existing | |
| `country` | text | nullable | existing | ISO code (e.g. "SA", "EG") |
| `charges_enabled` | boolean | not null, default false | existing | |
| `payouts_enabled` | boolean | not null, default false | existing | |
| `details_submitted` | boolean | not null, default false | existing | |
| `total_earnings` | integer | not null, default 0 | existing | In cents |
| `total_sales` | integer | not null, default 0 | existing | |
| `created_at` | timestamptz | not null, default now() | existing | |
| `updated_at` | timestamptz | not null, default now() | existing | |
| **`display_name`** | text | not null | **NEW** | Public-facing name |
| **`avatar`** | text | not null | **NEW** | Avatar URL |
| **`bio`** | text | nullable | **NEW** | Short seller bio |

### Validation Rules
- `display_name`: Required, 2–100 characters
- `avatar`: Required, valid URL
- `bio`: Optional, max 500 characters
- `country`: Optional, ISO 3166-1 alpha-2 code

---

## Entity: Prompt (Existing — No Schema Changes)

**Table**: `prompts`

Relevant columns for seller linkage:
- `seller_id` (text, nullable, indexed) — references `seller_profiles.user_id` implicitly
- `seller_name`, `seller_avatar`, `seller_rating` — denormalized (kept for backward compat)
- `sales` (integer) — used in leaderboard aggregation
- `rating` (real) — used in leaderboard aggregation
- `reviews_count` (integer) — used in leaderboard aggregation
- `status` (text) — only "approved" prompts count in aggregation

---

## Computed View: Seller Leaderboard Entry

Not stored — derived at query time via aggregation.

| Field | Derivation |
|-------|-----------|
| `userId` | `seller_profiles.user_id` |
| `displayName` | `seller_profiles.display_name` |
| `avatar` | `seller_profiles.avatar` |
| `bio` | `seller_profiles.bio` |
| `country` | `seller_profiles.country` |
| `totalSales` | `SUM(prompts.sales) WHERE seller_id = userId AND status = 'approved'` |
| `totalReviews` | `SUM(prompts.reviews_count) WHERE seller_id = userId AND status = 'approved'` |
| `avgRating` | `AVG(prompts.rating) WHERE seller_id = userId AND status = 'approved'` |
| `promptCount` | `COUNT(prompts) WHERE seller_id = userId AND status = 'approved'` |
| `tier` | Computed from `totalSales`: Bronze (< 100), Silver (100–499), Gold (500+) |
| `topCategories` | `prompts.category GROUP BY category ORDER BY SUM(sales) DESC LIMIT 3` |

---

## Computed View: Seller Storefront Stats

Extends leaderboard entry with:

| Field | Derivation |
|-------|-----------|
| `totalFavorites` | `COUNT(favorites) WHERE favorites.prompt_id IN (seller's prompts)` |

---

## Relationships

```
seller_profiles (1) ←── (N) prompts     [via prompts.seller_id = seller_profiles.user_id]
prompts         (1) ←── (N) reviews     [via reviews.prompt_id = prompts.id]
prompts         (1) ←── (N) favorites   [via favorites.prompt_id = prompts.id]
```

---

## Tier Thresholds

| Tier | Arabic Label | Total Sales Range | Badge Color |
|------|-------------|-------------------|-------------|
| Bronze | برونزي | 0–99 | Amber/brown |
| Silver | فضي | 100–499 | Silver/gray |
| Gold | ذهبي | 500+ | Gold/yellow |

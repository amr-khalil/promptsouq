# Data Model: Seller & Admin Dashboards

**Feature**: 014-seller-admin-dashboards
**Date**: 2026-02-18

## New Entities

### marketplace_settings

Single-row configuration table for marketplace-wide settings.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | integer | PK, default 1 | Always 1 (single-row pattern) |
| commissionRate | real | NOT NULL, default 0.20 | Marketplace commission (0.01–0.50) |
| updatedAt | timestamp(tz) | NOT NULL, defaultNow | Last modification time |
| updatedBy | text | nullable | Clerk userId of admin who last changed |

**State transitions**: None (static config row).
**Validation**: `commissionRate` must be between 0.01 and 0.50 (1%–50%).

---

## Modified Entities

### prompts (add column)

| New Field | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| deletedAt | timestamp(tz) | nullable, default NULL | Soft-delete timestamp. NULL = active, non-NULL = deleted |

**Impact on existing queries**:
- Public prompt listing (`GET /api/prompts`): Add `WHERE deleted_at IS NULL` condition.
- Seller prompt listing (`GET /api/seller/prompts`): Include deleted prompts with a flag for the seller to see.
- Admin prompt listing (`GET /api/admin/prompts`): Exclude deleted prompts from moderation queue.
- Buyer purchase access: `orderItems → prompts` joins must NOT filter on `deletedAt` — buyers retain access.

**State transitions for soft-delete**:
```
Active (deletedAt = NULL) → Deleted (deletedAt = timestamp)
```
- Only the prompt owner (seller) can trigger soft-delete.
- Admins can also delete via existing admin DELETE endpoint (already exists as hard delete — should be updated to soft-delete).

---

### Existing Entities (Reference Only — No Changes)

### sellerProfiles (existing)

| Field | Type | Description |
|-------|------|-------------|
| userId | text | PK (Clerk user ID) |
| displayName | text | Public display name |
| avatar | text | Avatar URL |
| bio | text | Nullable, seller bio |
| stripeAccountId | text | Unique, Stripe Connect account |
| country | text | Nullable, country code |
| chargesEnabled | boolean | Stripe charges enabled |
| payoutsEnabled | boolean | Stripe payouts enabled |
| detailsSubmitted | boolean | Stripe onboarding complete |
| totalEarnings | integer | Lifetime earnings in cents |
| totalSales | integer | Lifetime sale count |
| createdAt | timestamp(tz) | Profile creation date |
| updatedAt | timestamp(tz) | Last update |

**Used by**: Seller profile edit (FR-018), seller status check (FR-019, FR-020), analytics active seller count.

### orders (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | uuid | PK |
| userId | text | Buyer Clerk ID |
| stripeSessionId | text | Unique, Stripe Checkout session |
| stripePaymentIntentId | text | Nullable |
| amountTotal | integer | Total in cents |
| currency | text | Default "usd" |
| status | text | Default "completed" |
| createdAt | timestamp(tz) | Order date |
| updatedAt | timestamp(tz) | Last update |

**Used by**: Admin orders list (FR-007, FR-008), admin analytics (FR-005).

### orderItems (existing)

| Field | Type | Description |
|-------|------|-------------|
| id | serial | PK |
| orderId | uuid | FK → orders.id |
| promptId | uuid | FK → prompts.id |
| priceAtPurchase | integer | Price in cents at purchase time |
| commissionRate | real | Nullable, commission rate applied |
| sellerPayoutAmount | integer | Nullable, seller's share in cents |
| sellerStripeAccountId | text | Nullable, seller's Stripe account |
| referralSource | text | Nullable |
| createdAt | timestamp(tz) | Item creation date |

**Used by**: Seller earnings (FR-015, FR-016), admin order detail, admin analytics revenue/commission.

---

## Entity Relationships

```
marketplace_settings (1 row, standalone)

sellerProfiles.userId ←→ prompts.sellerId (1:many)
prompts.id ←→ orderItems.promptId (1:many)
orders.id ←→ orderItems.orderId (1:many)
orders.userId = buyer (Clerk ID)
prompts.sellerId = seller (Clerk ID)
```

## Key Queries

### Admin Analytics (FR-005, FR-006)
```
Total sales: COUNT(orders)
Total revenue: SUM(orders.amountTotal)
Total commission: SUM(orderItems.priceAtPurchase - orderItems.sellerPayoutAmount)
Active sellers: COUNT(DISTINCT prompts.sellerId) WHERE status = 'approved' AND deletedAt IS NULL
Active prompts: COUNT(prompts) WHERE status = 'approved' AND deletedAt IS NULL
Top 5 prompts: prompts ORDER BY sales DESC LIMIT 5 WHERE status = 'approved' AND deletedAt IS NULL
```

### Seller Earnings (FR-015, FR-016)
```
JOIN orderItems ON prompts.id = orderItems.promptId
WHERE prompts.sellerId = :userId
GROUP totals: SUM(priceAtPurchase), SUM(sellerPayoutAmount)
Detail: list with orders.createdAt, prompts.title, priceAtPurchase, commissionRate, sellerPayoutAmount
```

### Seller Prompt Management (FR-011)
```
SELECT * FROM prompts WHERE sellerId = :userId
-- Include soft-deleted for history, with deletedAt flag
-- Filter by status optional
```

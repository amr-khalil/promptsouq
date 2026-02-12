# Data Model: Cart, Stripe Checkout & UUID Migration

**Feature**: 003-cart-stripe-checkout
**Date**: 2026-02-12

## Schema Changes

### 1. `prompts` table (MODIFIED)

**Change**: Primary key from `serial("id")` → `uuid("id").defaultRandom()`

```
prompts
├── id: uuid (PK, default: gen_random_uuid())  ← CHANGED from serial
├── title: text (not null)
├── title_en: text (not null)
├── description: text (not null)
├── description_en: text (not null)
├── price: real (not null)
├── category: text (FK → categories.slug, not null)
├── ai_model: text (not null)
├── rating: real (default: 0, not null)
├── reviews_count: integer (default: 0, not null)
├── sales: integer (default: 0, not null)
├── thumbnail: text (not null)
├── seller_name: text (not null)
├── seller_avatar: text (not null)
├── seller_rating: real (not null)
├── tags: text[] (default: [], not null)
├── difficulty: text (not null)
├── samples: text[] (default: [], not null)
├── full_content: text (nullable)
├── created_at: timestamp (default: now(), not null)
└── updated_at: timestamp (default: now(), not null)
```

### 2. `reviews` table (MODIFIED)

**Change**: `prompt_id` from `integer` → `uuid` to match new prompts PK

```
reviews
├── id: serial (PK)  ← UNCHANGED (reviews don't need UUIDs)
├── prompt_id: uuid (FK → prompts.id, not null)  ← CHANGED from integer
├── user_name: text (not null)
├── user_avatar: text (not null)
├── rating: real (not null)
├── date: text (not null)
├── comment: text (not null)
└── created_at: timestamp (default: now(), not null)
```

### 3. `orders` table (NEW)

Stores completed purchase records linked to Clerk user IDs.

```
orders
├── id: uuid (PK, default: gen_random_uuid())
├── user_id: text (not null)  ← Clerk user ID (e.g., "user_2abc...")
├── stripe_session_id: text (not null, unique)
├── stripe_payment_intent_id: text (nullable)
├── amount_total: integer (not null)  ← Total in cents (USD)
├── currency: text (default: "usd", not null)
├── status: text (default: "completed", not null)  ← "completed" | "failed" | "refunded"
├── created_at: timestamp (default: now(), not null)
└── updated_at: timestamp (default: now(), not null)
```

### 4. `order_items` table (NEW)

Line items for each order, linking orders to purchased prompts.

```
order_items
├── id: serial (PK)
├── order_id: uuid (FK → orders.id, not null, cascade delete)
├── prompt_id: uuid (FK → prompts.id, not null)
├── price_at_purchase: integer (not null)  ← Price in cents at time of purchase
└── created_at: timestamp (default: now(), not null)
```

## Entity Relationships

```
categories (1) ←── (N) prompts (1) ←── (N) reviews
                          │
                          ├──── (N) order_items (N) ────→ (1) orders
                          │                                     │
                          └─────────────────────────────────────┘
                                      (via user_id → Clerk)
```

- `prompts.category` → `categories.slug` (FK, unchanged)
- `reviews.prompt_id` → `prompts.id` (FK, type changed to UUID)
- `order_items.order_id` → `orders.id` (FK, new, cascade delete)
- `order_items.prompt_id` → `prompts.id` (FK, new)
- `orders.user_id` → Clerk user ID (external reference, not DB FK)

## Cart Entity (Client-Side Only)

Not stored in database. Managed via Zustand + localStorage.

```typescript
interface CartItem {
  promptId: string;   // UUID
  title: string;      // Display title (Arabic)
  price: number;      // Display price (USD, e.g., 49.99)
  thumbnail: string;  // Image URL
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (promptId: string) => void;
  clearCart: () => void;
  isInCart: (promptId: string) => boolean;
  totalPrice: () => number;
  itemCount: () => number;
}
```

localStorage key: `promptsouq-cart`

## RLS Policies (New Tables)

### `orders` table
- **anon**: No access
- **authenticated**: SELECT own orders (`auth.uid()::text = user_id`)
- **service role**: Full access (used by webhook handler via Drizzle)

### `order_items` table
- **anon**: No access
- **authenticated**: SELECT own order items (via join to orders)
- **service role**: Full access

Note: The Drizzle client uses the postgres (service) role and bypasses RLS. RLS policies protect against direct Supabase client access.

## Indexes

- `orders.user_id` — B-tree index for user purchase lookups
- `orders.stripe_session_id` — unique index (already via unique constraint)
- `order_items.order_id` — B-tree index for order line item queries
- `order_items.prompt_id` — B-tree index for "has user purchased this prompt" queries

## Migration Strategy

Since this is a pre-production project with seed data only:

1. **Schema changes**: Modify Drizzle schema files directly
2. **Generate**: `npx drizzle-kit generate`
3. **Apply**: `npx drizzle-kit migrate`
4. **Re-seed**: Update and re-run `src/db/seed.ts` with UUID-compatible data
5. **RLS**: Apply via Supabase MCP `apply_migration` for new tables
6. **Verify**: Run `get_advisors(type: "security")` to check for RLS gaps

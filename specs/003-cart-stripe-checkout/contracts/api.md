# API Contracts: Cart, Stripe Checkout & UUID Migration

**Feature**: 003-cart-stripe-checkout
**Date**: 2026-02-12

## Modified Endpoints

### GET /api/prompts

**Change**: Response `id` field now returns UUID string instead of numeric string.

**Response** (unchanged shape, new ID format):
```json
{
  "prompts": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "...",
      "...": "..."
    }
  ]
}
```

### GET /api/prompts/[id]

**Change**: `[id]` parameter now accepts UUID format. Numeric IDs return 404.

**Request**: `GET /api/prompts/550e8400-e29b-41d4-a716-446655440000`

**Validation**: UUID format regex `/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i`

**Response** (unchanged shape):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "...",
  "fullContent": null
}
```

**Error** (invalid UUID):
```json
{ "error": "معرّف غير صالح" }
```
Status: 400

### GET /api/prompts/[id]/reviews

**Change**: `[id]` accepts UUID. Same validation as above.

### GET /api/prompts/[id]/related

**Change**: `[id]` accepts UUID. Same validation as above.

### GET /api/prompts/search

**No change** to the endpoint. Response IDs are now UUIDs.

---

## New Endpoints

### POST /api/checkout

Creates a Stripe Checkout Session and returns the redirect URL.

**Authentication**: Required (Clerk). Returns 401 if not authenticated.

**Request body**:
```json
{
  "items": [
    {
      "promptId": "550e8400-e29b-41d4-a716-446655440000"
    }
  ]
}
```

**Validation schema**:
```
items: array (min 1, max 50)
  promptId: string (UUID format)
```

**Success response** (200):
```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_..."
}
```

**Error responses**:
- 401: `{ "error": "يجب تسجيل الدخول أولاً" }` (Not authenticated)
- 400: `{ "error": "السلة فارغة" }` (Empty cart / validation error)
- 404: `{ "error": "بعض المنتجات غير متوفرة" }` (Prompt not found)
- 500: `{ "error": "حدث خطأ في إنشاء جلسة الدفع" }` (Stripe error)

**Server-side logic**:
1. Verify Clerk authentication
2. Validate request body with Zod
3. Fetch all prompt details from DB by UUIDs
4. Verify all prompts exist (404 if any missing)
5. Create Stripe Checkout Session with:
   - `mode: "payment"`
   - `line_items` with `price_data` (unit_amount = price × 100)
   - `success_url: {origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
   - `cancel_url: {origin}/cart`
   - `client_reference_id: userId`
   - `metadata: { userId, promptIds: JSON.stringify(promptIds) }`
6. Return session URL

### POST /api/webhooks/stripe

Handles Stripe webhook events. No authentication (verified via signature).

**Request**: Raw body (Stripe event JSON)

**Headers**: `stripe-signature: t=...,v1=...`

**Response**: 200 (always, to acknowledge receipt)

**Events handled**:

#### `checkout.session.completed`
1. Extract `client_reference_id` (userId) and `metadata.promptIds`
2. Create `orders` row with stripe_session_id, payment_intent, amount_total
3. Create `order_items` rows for each prompt
4. Return 200

#### `checkout.session.async_payment_failed`
1. Log failure for monitoring
2. Return 200

### GET /api/user/purchases

Returns list of prompt IDs the current user has purchased. Used by prompt details page to check purchase status.

**Authentication**: Required (Clerk). Returns 401 if not authenticated.

**Query params**:
- `promptId` (optional, UUID) — check a specific prompt

**Response** (200):
```json
{
  "purchases": ["550e8400-e29b-41d4-a716-446655440000", "..."]
}
```

With `?promptId=...`:
```json
{
  "purchased": true
}
```

**Error responses**:
- 401: `{ "error": "يجب تسجيل الدخول أولاً" }`

**Server-side logic**:
1. Verify Clerk authentication
2. Query order_items joined with orders where `orders.user_id = userId`
3. If `promptId` param provided, return boolean
4. Otherwise return array of purchased prompt IDs

---

## Zod Schemas

### Checkout Request Schema
```typescript
const checkoutRequestSchema = z.object({
  items: z.array(
    z.object({
      promptId: z.string().uuid("معرّف غير صالح"),
    })
  ).min(1, "السلة فارغة").max(50),
});
```

### UUID Param Schema
```typescript
const uuidParamSchema = z.string().uuid("معرّف غير صالح");
```

### Purchase Query Schema
```typescript
const purchaseQuerySchema = z.object({
  promptId: z.string().uuid().optional(),
});
```

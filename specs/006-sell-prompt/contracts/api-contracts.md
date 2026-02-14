# API Contracts: 006-sell-prompt

**Date**: 2026-02-14
**Branch**: `006-sell-prompt`

All endpoints follow existing patterns: Zod validation, `apiErrorResponse()` for errors, Arabic error messages.

---

## 1. Prompt Submission

### POST `/api/prompts`

Creates a new prompt submission (status: "pending").

**Auth**: Required (Clerk session)

**Request Body**:
```json
{
  "title": "شعارات ناشئة نابضة",
  "titleEn": "Vibrant Startup Logos",
  "description": "يولد شعارات بجمالية ملونة...",
  "descriptionEn": "Generates logos with a colorful aesthetic...",
  "price": 6.99,
  "category": "design",
  "aiModel": "midjourney",
  "generationType": "image",
  "modelVersion": "Midjourney v6",
  "maxTokens": null,
  "temperature": null,
  "difficulty": "مبتدئ",
  "tags": ["شعارات", "تصميم", "ناشئة"],
  "thumbnail": "https://example.com/thumb.jpg",
  "fullContent": "Create a vibrant logo for [company_name] in [style] style...",
  "instructions": "استخدم أسماء شركات واقعية للحصول على أفضل النتائج",
  "exampleOutputs": [
    "Output for example 1...",
    "Output for example 2...",
    "Output for example 3...",
    "Output for example 4..."
  ],
  "examplePrompts": [
    { "company_name": "تكنو", "style": "عصري" },
    { "company_name": "مطعم زيتون", "style": "كلاسيكي" },
    { "company_name": "تطبيق سريع", "style": "بسيط" },
    { "company_name": "متجر نور", "style": "ملون" }
  ]
}
```

**Validation (Zod)**:
- `title`: string, max 60 chars, required
- `titleEn`: string, max 60 chars, required
- `description`: string, max 500 chars, required
- `descriptionEn`: string, max 500 chars, required
- `price`: number, min 1.99, max 99.99, required
- `category`: string, must exist in categories table, required
- `aiModel`: string, required
- `generationType`: enum `["text", "image", "code", "marketing", "design"]`, required
- `modelVersion`: string, optional
- `maxTokens`: integer, min 1, max 128000, optional
- `temperature`: number, min 0, max 2, optional
- `difficulty`: enum `["مبتدئ", "متقدم"]`, required
- `tags`: array of strings, max 10, required
- `thumbnail`: url string, required
- `fullContent`: string, max 32768 chars, must contain `[variable]` pattern, required
- `instructions`: string, max 2000 chars, optional
- `exampleOutputs`: array of exactly 4 strings, required
- `examplePrompts`: array of exactly 4 objects (string key-value maps), required

**Response 201**:
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "title": "شعارات ناشئة نابضة",
    "createdAt": "2026-02-14T12:00:00Z"
  }
}
```

**Errors**:
- 401: Not authenticated
- 400: Validation error (Zod flattened)
- 500: Server error

---

## 2. Seller Dashboard

### GET `/api/seller/prompts`

Lists all prompts submitted by the authenticated seller.

**Auth**: Required (Clerk session)

**Query Parameters**:
- `status`: optional, enum `["pending", "approved", "rejected"]`
- `search`: optional, string (title search)
- `sortBy`: optional, enum `["newest", "oldest"]`, default `"newest"`

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "شعارات ناشئة نابضة",
      "titleEn": "Vibrant Startup Logos",
      "aiModel": "midjourney",
      "generationType": "image",
      "status": "pending",
      "price": 6.99,
      "sales": 0,
      "thumbnail": "https://...",
      "rejectionReason": null,
      "createdAt": "2026-02-14T12:00:00Z"
    }
  ]
}
```

### GET `/api/seller/stats`

Returns summary statistics for the authenticated seller.

**Auth**: Required (Clerk session)

**Response 200**:
```json
{
  "data": {
    "totalPrompts": 5,
    "approvedCount": 3,
    "pendingCount": 1,
    "rejectedCount": 1,
    "totalSales": 42,
    "totalEarnings": 15000
  }
}
```

---

## 3. Stripe Connect

### POST `/api/connect/create-account`

Creates a Stripe Connect Express account for the seller.

**Auth**: Required (Clerk session)

**Request Body**:
```json
{
  "country": "SA"
}
```

**Validation**:
- `country`: ISO 3166-1 alpha-2 code, required

**Response 201**:
```json
{
  "data": {
    "accountId": "acct_xxx",
    "onboardingUrl": "https://connect.stripe.com/setup/..."
  }
}
```

**Flow**: Creates Express account → generates Account Link → returns onboarding URL.

**Errors**:
- 401: Not authenticated
- 409: Seller already has a Stripe account
- 500: Stripe API error

### GET `/api/connect/status`

Checks the seller's Stripe Connect onboarding status.

**Auth**: Required (Clerk session)

**Response 200**:
```json
{
  "data": {
    "hasAccount": true,
    "chargesEnabled": true,
    "payoutsEnabled": true,
    "detailsSubmitted": true,
    "isFullyOnboarded": true
  }
}
```

**Response 200 (no account)**:
```json
{
  "data": {
    "hasAccount": false,
    "chargesEnabled": false,
    "payoutsEnabled": false,
    "detailsSubmitted": false,
    "isFullyOnboarded": false
  }
}
```

### POST `/api/connect/onboarding-link`

Generates a new Stripe onboarding link (for refresh/retry scenarios).

**Auth**: Required (Clerk session)

**Response 200**:
```json
{
  "data": {
    "url": "https://connect.stripe.com/setup/..."
  }
}
```

**Errors**:
- 401: Not authenticated
- 404: No Stripe account found for this seller

---

## 4. Admin Review

### GET `/api/admin/prompts`

Lists prompts pending review (admin only).

**Auth**: Required (Clerk session + `publicMetadata.role = "admin"`)

**Query Parameters**:
- `status`: optional, enum `["pending", "approved", "rejected"]`, default `"pending"`
- `limit`: optional, integer, default 20

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "شعارات ناشئة نابضة",
      "titleEn": "Vibrant Startup Logos",
      "aiModel": "midjourney",
      "generationType": "image",
      "price": 6.99,
      "sellerName": "أحمد محمد",
      "sellerId": "user_xxx",
      "status": "pending",
      "createdAt": "2026-02-14T12:00:00Z"
    }
  ]
}
```

### GET `/api/admin/prompts/[id]`

Gets full prompt details for admin review.

**Auth**: Required (Clerk session + admin role)

**Response 200**:
```json
{
  "data": {
    "id": "uuid",
    "title": "شعارات ناشئة نابضة",
    "titleEn": "Vibrant Startup Logos",
    "description": "...",
    "descriptionEn": "...",
    "price": 6.99,
    "category": "design",
    "aiModel": "midjourney",
    "generationType": "image",
    "modelVersion": "Midjourney v6",
    "maxTokens": null,
    "temperature": null,
    "difficulty": "مبتدئ",
    "tags": ["شعارات"],
    "thumbnail": "https://...",
    "fullContent": "Create a vibrant logo for [company_name]...",
    "instructions": "...",
    "exampleOutputs": ["...", "...", "...", "..."],
    "examplePrompts": [{"company_name": "تكنو"}, ...],
    "seller": {
      "id": "user_xxx",
      "name": "أحمد محمد",
      "avatar": "https://..."
    },
    "status": "pending",
    "createdAt": "2026-02-14T12:00:00Z"
  }
}
```

### POST `/api/admin/prompts/[id]/review`

Approves or rejects a prompt.

**Auth**: Required (Clerk session + admin role)

**Request Body**:
```json
{
  "action": "approve"
}
```

or

```json
{
  "action": "reject",
  "reason": "محتوى البرومبت لا يتوافق مع إرشادات التقديم"
}
```

**Validation**:
- `action`: enum `["approve", "reject"]`, required
- `reason`: string, max 500 chars, required when action = "reject"

**Response 200**:
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "reviewedAt": "2026-02-14T14:00:00Z"
  }
}
```

**Errors**:
- 401: Not authenticated
- 403: Not admin
- 404: Prompt not found
- 409: Prompt already reviewed (not in pending status)

---

## 5. Existing Endpoints Modified

### GET `/api/prompts` (Modified)

**Change**: Add `WHERE status = 'approved'` filter to all public marketplace queries. No API contract change — consumers see the same response shape but only get approved prompts.

### POST `/api/checkout` (Modified)

**Change**: For prompts with a `seller_id`, use destination charges:
- Add `payment_intent_data.application_fee_amount` based on referral source
- Add `payment_intent_data.transfer_data.destination` with seller's Stripe account ID
- Store `referral_source` in session metadata

### POST `/api/webhooks/stripe` (Modified)

**Change**: When creating `order_items`, also store `referral_source`, `commission_rate`, `seller_payout_amount`, `seller_stripe_account_id` from the session/payment metadata.

---

## 6. Webhook: Stripe Connect

### POST `/api/webhooks/stripe-connect`

Handles Connect-specific events.

**Auth**: Stripe signature verification (separate `STRIPE_CONNECT_WEBHOOK_SECRET`)

**Events handled**:
- `account.updated`: Update `seller_profiles` with `charges_enabled`, `payouts_enabled`, `details_submitted`

**Response**: `{ "received": true }` (always 200)

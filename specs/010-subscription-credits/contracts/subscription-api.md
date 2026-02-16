# API Contracts: Subscription & Credits

**Feature Branch**: `010-subscription-credits`
**Date**: 2026-02-16

## Subscription Endpoints

### GET /api/subscription/plans

List all subscription plans with pricing. Public endpoint (no auth required).

**Response 200**:
```json
{
  "data": [
    {
      "id": "standard",
      "name": "Standard",
      "nameAr": "أساسي",
      "monthlyCredits": 50,
      "monthlyPrice": 1000,
      "sixMonthPrice": 6000,
      "yearlyPrice": 12000,
      "features": ["..."],
      "theme": "blue",
      "icon": "Sword",
      "sortOrder": 0
    }
  ]
}
```

---

### POST /api/subscription/checkout

Create a Stripe Checkout Session for a subscription. Requires authentication.

**Request body**:
```json
{
  "planId": "pro",
  "billingCycle": "monthly"
}
```

**Validation (Zod)**:
- `planId`: enum("standard", "pro", "legendary")
- `billingCycle`: enum("monthly", "six_month", "yearly")

**Response 200**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Error 400**: Invalid plan or billing cycle
**Error 401**: Not authenticated
**Error 409**: User already has an active subscription (redirect to manage)

**Logic**:
1. Check auth (Clerk)
2. Validate request body
3. Check if user already has active subscription → 409
4. Get or create Stripe Customer (store in credit_balances)
5. Look up Stripe Price ID from subscription_plans table
6. Create Stripe Checkout Session (mode: "subscription", customer, price, metadata)
7. Return checkout URL

---

### GET /api/subscription/status

Get current user's subscription status and credit balance. Requires authentication.

**Response 200 (subscribed)**:
```json
{
  "subscription": {
    "planId": "pro",
    "planName": "Pro",
    "planNameAr": "احترافي",
    "status": "active",
    "billingCycle": "monthly",
    "currentPeriodEnd": "2026-03-16T00:00:00Z",
    "cancelAtPeriodEnd": false
  },
  "credits": {
    "subscription": 120,
    "topup": 15,
    "total": 135
  }
}
```

**Response 200 (no subscription)**:
```json
{
  "subscription": null,
  "credits": {
    "subscription": 0,
    "topup": 5,
    "total": 5
  }
}
```

**Error 401**: Not authenticated

---

### POST /api/subscription/manage

Get a Stripe Customer Portal URL for managing subscription. Requires authentication.

**Response 200**:
```json
{
  "url": "https://billing.stripe.com/..."
}
```

**Error 401**: Not authenticated
**Error 404**: No Stripe customer found (user never subscribed)

**Logic**:
1. Check auth
2. Look up Stripe Customer ID from credit_balances
3. Create Stripe Billing Portal session
4. Return portal URL

---

## Credit Endpoints

### GET /api/credits/balance

Get current user's credit balance. Lightweight endpoint for header display. Requires authentication.

**Response 200**:
```json
{
  "subscription": 120,
  "topup": 15,
  "total": 135
}
```

**Error 401**: Not authenticated

---

### GET /api/credits/transactions

Get credit transaction history. Requires authentication. Supports pagination.

**Query params**:
- `limit` (optional, default 20, max 100)
- `offset` (optional, default 0)

**Response 200**:
```json
{
  "data": [
    {
      "id": 1,
      "type": "generation_deduction",
      "amount": -1,
      "creditSource": "subscription",
      "referenceType": "generation",
      "referenceId": "uuid-here",
      "balanceAfter": 119,
      "createdAt": "2026-02-16T12:00:00Z"
    }
  ],
  "total": 45
}
```

**Error 401**: Not authenticated

---

### POST /api/credits/topup/checkout

Create a Stripe Checkout Session for a one-time credit top-up. Requires authentication.

**Request body**:
```json
{
  "packId": "pack-50"
}
```

**Validation (Zod)**:
- `packId`: enum("pack-10", "pack-50", "pack-100")

**Response 200**:
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

**Error 400**: Invalid pack ID
**Error 401**: Not authenticated

**Logic**:
1. Check auth
2. Validate request body
3. Get or create Stripe Customer
4. Look up Stripe Price ID from credit_topup_packs table
5. Create Stripe Checkout Session (mode: "payment", customer, price, metadata: { type: "topup", packId, userId })
6. Return checkout URL

---

## Generation Endpoints

### POST /api/generate

Submit a generation request. Deducts credits atomically. Requires authentication.

**Request body**:
```json
{
  "promptId": "uuid-here",
  "generationType": "text",
  "model": "gemini",
  "inputPrompt": "The actual prompt text to generate from..."
}
```

**Validation (Zod)**:
- `promptId`: uuid string
- `generationType`: enum("text", "image")
- `model`: enum("gemini", "chatgpt", "claude")
- `inputPrompt`: string, min 1, max 10000

**Response 200**:
```json
{
  "generation": {
    "id": "uuid-here",
    "generationType": "text",
    "model": "gemini",
    "resultText": "Generated content here...",
    "resultImageUrl": null,
    "status": "completed",
    "creditsConsumed": 1,
    "createdAt": "2026-02-16T12:00:00Z"
  },
  "credits": {
    "subscription": 119,
    "topup": 15,
    "total": 134
  }
}
```

**Error 400**: Validation error
**Error 401**: Not authenticated
**Error 402**: Insufficient credits (balance is 0)
**Error 403**: User does not own this prompt
**Error 500**: Generation failed (credits NOT deducted)

**Logic**:
1. Check auth
2. Validate request body
3. Verify user owns the prompt (via orders/orderItems or freePromptAccess)
4. Atomically deduct 1 credit (subscription first, then topup)
   - If insufficient → return 402
5. Call mock generation service
6. If generation succeeds → save result, return generation record + updated balance
7. If generation fails → refund credit, save failed record, return error

---

### GET /api/generations

List user's past generations. Requires authentication. Supports pagination.

**Query params**:
- `limit` (optional, default 20, max 100)
- `offset` (optional, default 0)
- `promptId` (optional, filter by prompt)

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid-here",
      "promptId": "uuid-here",
      "promptTitle": "Prompt title here",
      "generationType": "text",
      "model": "gemini",
      "resultText": "Generated content...",
      "resultImageUrl": null,
      "status": "completed",
      "creditsConsumed": 1,
      "createdAt": "2026-02-16T12:00:00Z"
    }
  ],
  "total": 12
}
```

**Error 401**: Not authenticated

---

### GET /api/generations/[id]

Get a single generation result. Requires authentication. User must own the generation.

**Response 200**:
```json
{
  "generation": {
    "id": "uuid-here",
    "promptId": "uuid-here",
    "promptTitle": "Prompt title",
    "generationType": "image",
    "model": "chatgpt",
    "inputPrompt": "The prompt text used...",
    "resultText": null,
    "resultImageUrl": "https://placeholder.com/image.png",
    "status": "completed",
    "creditsConsumed": 1,
    "createdAt": "2026-02-16T12:00:00Z",
    "completedAt": "2026-02-16T12:00:02Z"
  }
}
```

**Error 401**: Not authenticated
**Error 403**: User does not own this generation
**Error 404**: Generation not found

---

## Webhook Events (Extended)

### POST /api/webhooks/stripe (extended)

Existing webhook handler extended with new event types.

**New events handled**:

| Event | Action |
|-------|--------|
| `customer.subscription.created` | Create user_subscriptions record, grant subscription credits to credit_balances, log transaction |
| `customer.subscription.updated` | Update user_subscriptions (status, period dates, cancel flag). On plan change: adjust credits |
| `customer.subscription.deleted` | Set user_subscriptions status to "canceled" |
| `invoice.payment_succeeded` (renewal) | Reset subscription_credits to plan allocation, log "subscription_reset" + "subscription_grant" transactions |
| `checkout.session.completed` (metadata.type === "topup") | Add topup credits to credit_balances, log "topup_grant" transaction |

**Metadata routing**:
- Existing prompt purchases: no `type` metadata → existing handler
- Top-up purchases: `metadata.type === "topup"` → credit top-up handler
- Subscription events: handled by dedicated subscription event handlers

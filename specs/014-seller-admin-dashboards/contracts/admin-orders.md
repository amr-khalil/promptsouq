# API Contract: Admin Orders Management

## GET /api/admin/orders

Returns paginated list of all marketplace orders. Admin-only.

### Auth
- Requires Clerk auth + `publicMetadata.role === "admin"`

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| status | enum: "completed", "refunded" | all | Filter by order status |
| sellerId | string | — | Filter by seller Clerk ID |
| dateFrom | string (ISO date) | — | Filter orders from this date |
| dateTo | string (ISO date) | — | Filter orders up to this date |
| limit | integer (1-100) | 20 | Page size |
| offset | integer (>=0) | 0 | Pagination offset |

### Zod Schema (query)
```typescript
export const adminOrdersQuerySchema = z.object({
  status: z.enum(["completed", "refunded"]).optional(),
  sellerId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
```

### Response 200
```json
{
  "data": [
    {
      "id": "uuid",
      "buyerId": "clerk_user_id",
      "amountTotal": 1500,
      "currency": "usd",
      "status": "completed",
      "itemCount": 2,
      "createdAt": "2026-02-15T10:30:00.000Z"
    }
  ],
  "total": 142
}
```

---

## GET /api/admin/orders/[id]

Returns detailed order with items, buyer, and seller info. Admin-only.

### Response 200
```json
{
  "data": {
    "id": "uuid",
    "buyerId": "clerk_user_id",
    "stripePaymentIntentId": "pi_xxx",
    "amountTotal": 1500,
    "currency": "usd",
    "status": "completed",
    "createdAt": "2026-02-15T10:30:00.000Z",
    "items": [
      {
        "id": 1,
        "promptId": "uuid",
        "promptTitle": "...",
        "sellerId": "clerk_user_id",
        "sellerName": "...",
        "priceAtPurchase": 800,
        "commissionRate": 0.20,
        "sellerPayoutAmount": 640,
        "sellerStripeAccountId": "acct_xxx"
      }
    ]
  }
}
```

# API Contract: Seller Earnings

## GET /api/seller/earnings

Returns seller's sales history and earnings breakdown. Authenticated seller only.

### Auth
- Requires Clerk auth. Returns data for the authenticated user only.

### Query Parameters
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| limit | integer (1-100) | 20 | Page size |
| offset | integer (>=0) | 0 | Pagination offset |

### Zod Schema (query)
```typescript
export const sellerEarningsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});
```

### Response 200
```json
{
  "data": {
    "summary": {
      "totalSales": 45,
      "grossRevenue": 22500,
      "totalCommission": 4500,
      "netEarnings": 18000,
      "payoutsEnabled": true
    },
    "sales": [
      {
        "orderId": "uuid",
        "promptId": "uuid",
        "promptTitle": "...",
        "saleDate": "2026-02-15T10:30:00.000Z",
        "priceAtPurchase": 500,
        "commissionRate": 0.20,
        "commissionAmount": 100,
        "netAmount": 400,
        "payoutStatus": "paid"
      }
    ],
    "total": 45
  }
}
```

### Field Details
| Field | Type | Description |
|-------|------|-------------|
| summary.totalSales | integer | Total sale count |
| summary.grossRevenue | integer | SUM of priceAtPurchase (cents) |
| summary.totalCommission | integer | SUM of (priceAtPurchase - sellerPayoutAmount) (cents) |
| summary.netEarnings | integer | SUM of sellerPayoutAmount (cents) |
| summary.payoutsEnabled | boolean | Whether seller's Stripe Connect account has payouts enabled |
| sales[].payoutStatus | string | "paid" if payoutsEnabled, "pending" otherwise |

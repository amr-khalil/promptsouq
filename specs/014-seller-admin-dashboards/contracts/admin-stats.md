# API Contract: Admin Marketplace Statistics

## GET /api/admin/stats

Returns marketplace-wide analytics. Admin-only.

### Auth
- Requires Clerk auth + `publicMetadata.role === "admin"`
- 401 if not authenticated, 403 if not admin

### Response 200
```json
{
  "data": {
    "totalSales": 142,
    "totalRevenue": 85400,
    "totalCommission": 17080,
    "activeSellers": 23,
    "activePrompts": 67,
    "pendingPrompts": 5,
    "topPrompts": [
      {
        "id": "uuid",
        "title": "...",
        "titleEn": "...",
        "sales": 45,
        "revenue": 22500,
        "thumbnail": "..."
      }
    ]
  }
}
```

### Field Details
| Field | Type | Description |
|-------|------|-------------|
| totalSales | integer | COUNT of all orders |
| totalRevenue | integer | SUM of orders.amountTotal (cents) |
| totalCommission | integer | SUM of (priceAtPurchase - sellerPayoutAmount) from orderItems (cents) |
| activeSellers | integer | COUNT DISTINCT sellers with at least one approved prompt |
| activePrompts | integer | COUNT of approved, non-deleted prompts |
| pendingPrompts | integer | COUNT of pending prompts |
| topPrompts | array | Top 5 prompts by sales count |

### Zod Schema
```typescript
export const adminStatsResponseSchema = z.object({
  totalSales: z.number().int(),
  totalRevenue: z.number().int(),
  totalCommission: z.number().int(),
  activeSellers: z.number().int(),
  activePrompts: z.number().int(),
  pendingPrompts: z.number().int(),
  topPrompts: z.array(z.object({
    id: z.string().uuid(),
    title: z.string(),
    titleEn: z.string(),
    sales: z.number().int(),
    revenue: z.number().int(),
    thumbnail: z.string(),
  })),
});
```

# API Contract: Sellers

## GET /api/sellers

Returns top sellers ranked by the specified sort order.

### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `sortBy` | `"rating" \| "sales"` | `"rating"` | Sort order |
| `limit` | `number (1–20)` | `8` | Number of sellers to return |

### Response 200

```json
{
  "data": [
    {
      "userId": "seed-seller-1",
      "displayName": "أحمد الخالدي",
      "avatar": "https://api.dicebear.com/...",
      "bio": "مطور برومبتات محترف...",
      "country": "SA",
      "totalSales": 1240,
      "totalReviews": 89,
      "avgRating": 4.9,
      "promptCount": 12,
      "tier": "ذهبي",
      "topCategories": ["marketing", "business", "gpt"]
    }
  ]
}
```

### Response 400 (Validation Error)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "معاملات غير صالحة",
    "details": { "sortBy": ["القيمة غير مدعومة"] }
  }
}
```

---

## GET /api/sellers/[sellerId]

Returns a single seller's full profile with aggregated stats.

### Path Parameters

| Param | Type | Description |
|-------|------|-------------|
| `sellerId` | `string` | Seller user ID |

### Response 200

```json
{
  "data": {
    "userId": "seed-seller-1",
    "displayName": "أحمد الخالدي",
    "avatar": "https://api.dicebear.com/...",
    "bio": "مطور برومبتات محترف متخصص في التسويق والأعمال",
    "country": "SA",
    "totalSales": 1240,
    "totalReviews": 89,
    "avgRating": 4.9,
    "promptCount": 12,
    "totalFavorites": 45,
    "tier": "ذهبي",
    "topCategories": ["marketing", "business", "gpt"],
    "joinedAt": "2026-01-15T00:00:00.000Z"
  }
}
```

### Response 404

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "لم يتم العثور على البائع"
  }
}
```

---

## GET /api/prompts (Extended — existing endpoint)

### New Query Parameter

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `sellerId` | `string` | — | Filter prompts by seller ID |

This parameter is added to the existing `promptsQuerySchema`. When provided, only approved prompts from the specified seller are returned. All existing filters (category, search, sortBy, pagination) continue to work.
